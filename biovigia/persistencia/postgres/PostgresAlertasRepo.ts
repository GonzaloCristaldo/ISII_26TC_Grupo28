import { RepositorioAlertas } from '../../modelos/repositorios/RepositorioAlertas';
import { Alerta, AlertaExtendida } from '../../modelos/tipos';
import { pool } from './PostgresCliente';

type AlertaRow = {
  id: string;
  medicion_id: string;
  estado_alerta: Alerta['estado_alerta'];
  leido_por_medico: boolean;
  fecha: string;
};

type AlertaExtendidaRow = AlertaRow & {
  paciente_nombre: string;
  medicion_tipo: AlertaExtendida['medicion_tipo'];
  medicion_valor: string;
  medicion_fecha: string;
};
/**
 * Repositorio de Alertas para PostgreSQL local.
 */
export class PostgresAlertasRepo implements RepositorioAlertas {
  async guardar(a: Alerta): Promise<Alerta> {
    const query = `
      INSERT INTO alertas (medicion_id, estado_alerta_id, leido_por_medico, fecha)
      SELECT $1, ea.id, $2, $3
      FROM estados_alerta ea
      WHERE ea.descripcion = $4
      RETURNING (
        SELECT json_build_object(
          'id', alertas.id,
          'medicion_id', alertas.medicion_id,
          'estado_alerta', ea2.descripcion,
          'leido_por_medico', alertas.leido_por_medico,
          'fecha', alertas.fecha
        )
        FROM estados_alerta ea2
        WHERE ea2.id = alertas.estado_alerta_id
      ) AS alerta
    `;

    // Inyectamos variables preparadas
    const valores = [
      a.medicion_id,
      a.leido_por_medico,
      new Date().toISOString(),
      a.estado_alerta,
    ];

    try {
      const resp = await pool.query<{ alerta: AlertaRow }>(query, valores);
      const insertada = resp.rows[0]?.alerta;

      if (!insertada) {
        throw new Error('No existe el estado de alerta indicado.');
      }

      return {
        id: insertada.id,
        medicion_id: insertada.medicion_id,
        estado_alerta: insertada.estado_alerta,
        leido_por_medico: insertada.leido_por_medico,
        fecha: new Date(insertada.fecha),
      };
    } catch (error: unknown) {
      console.error('Error insertando en alertas postgres:', error);
      throw error;
    }
  }

  async obtenerPendientesPorMedico(medicoId: string): Promise<AlertaExtendida[]> {
    const query = `
      SELECT
        a.id,
        a.medicion_id,
        ea.descripcion AS estado_alerta,
        a.leido_por_medico,
        a.fecha,
        p.nombre_completo AS paciente_nombre,
        tm.nombre AS medicion_tipo,
        m.valor AS medicion_valor,
        m.fecha AS medicion_fecha
      FROM alertas a
      JOIN estados_alerta ea ON ea.id = a.estado_alerta_id
      JOIN mediciones m ON a.medicion_id = m.id
      JOIN tipos_medicion tm ON tm.id = m.tipo_medicion_id
      JOIN pacientes p ON m.paciente_id = p.id
      WHERE p.medico_responsable_id = $1
        AND a.leido_por_medico = false
      ORDER BY a.fecha DESC
    `;

    try {
      const resp = await pool.query<AlertaExtendidaRow>(query, [medicoId]);
      return resp.rows.map((row) => ({
        id: row.id,
        medicion_id: row.medicion_id,
        estado_alerta: row.estado_alerta,
        leido_por_medico: row.leido_por_medico,
        fecha: new Date(row.fecha),
        paciente_nombre: row.paciente_nombre,
        medicion_tipo: row.medicion_tipo,
        medicion_valor: parseFloat(row.medicion_valor),
        medicion_fecha: new Date(row.medicion_fecha),
      }));
    } catch (error: unknown) {
      console.error('Error obteniendo alertas pendientes:', error);
      throw error;
    }
  }

  async marcarComoLeida(alertaId: string, medicoId: string): Promise<void> {
    const query = `
      UPDATE alertas a
      SET leido_por_medico = true
      FROM mediciones m
      JOIN pacientes p ON p.id = m.paciente_id
      WHERE a.id = $1
        AND a.medicion_id = m.id
        AND p.medico_responsable_id = $2
    `;

    try {
      const resultado = await pool.query(query, [alertaId, medicoId]);

      if (resultado.rowCount === 0) {
        throw new Error('La alerta no existe o no pertenece al medico autenticado.');
      }
    } catch (error: unknown) {
      console.error('Error marcando alerta como leida:', error);
      throw error;
    }
  }
}
