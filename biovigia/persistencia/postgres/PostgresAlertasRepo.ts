import { RepositorioAlertas } from '../../modelos/repositorios/RepositorioAlertas';
import { Alerta, AlertaExtendida } from '../../modelos/tipos';
import { pool } from './PostgresCliente';

type AlertaRow = {
  alerta_id: string;
  medicion_id: string;
  estado_alerta: Alerta['estado_alerta'];
  leido_por_medico: boolean;
  fecha: string;
};

type AlertaExtendidaRow = AlertaRow & {
  paciente_id: string;
  paciente_nombre: string;
  medicion_tipo: AlertaExtendida['medicion_tipo'];
  medicion_unidad: string;
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
      SELECT $1, ea.estado_alerta_id, $2, $3
      FROM estados_alerta ea
      WHERE ea.descripcion = $4
      RETURNING (
        SELECT json_build_object(
          'alerta_id', alertas.alerta_id,
          'medicion_id', alertas.medicion_id,
          'estado_alerta', ea2.descripcion,
          'leido_por_medico', alertas.leido_por_medico,
          'fecha', alertas.fecha
        )
        FROM estados_alerta ea2
        WHERE ea2.estado_alerta_id = alertas.estado_alerta_id
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
        alerta_id: insertada.alerta_id,
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
      SELECT *
      FROM fn_alertas_pendientes_medico($1)
    `;

    try {
      const resp = await pool.query<AlertaExtendidaRow>(query, [medicoId]);
      return resp.rows.map((row) => ({
        alerta_id: row.alerta_id,
        medicion_id: row.medicion_id,
        estado_alerta: row.estado_alerta,
        leido_por_medico: row.leido_por_medico,
        fecha: new Date(row.fecha),
        paciente_id: row.paciente_id,
        paciente_nombre: row.paciente_nombre,
        medicion_tipo: row.medicion_tipo,
        medicion_unidad: row.medicion_unidad,
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
      CALL sp_marcar_alerta_como_leida($1, $2)
    `;

    try {
      await pool.query(query, [alertaId, medicoId]);
    } catch (error: unknown) {
      console.error('Error marcando alerta como leida:', error);
      throw error;
    }
  }
}
