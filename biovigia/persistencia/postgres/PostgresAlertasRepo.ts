import { RepositorioAlertas } from '../../modelos/repositorios/RepositorioAlertas';
import { Alerta, AlertaExtendida } from '../../modelos/tipos';
import { pool } from './PostgresCliente';

/**
 * Implementación concreta de Repositorio de Alertas para PostgreSQL local.
 */
export class PostgresAlertasRepo implements RepositorioAlertas {
  
  async guardar(a: Alerta): Promise<Alerta> {
    const query = `
      INSERT INTO alertas (medicion_id, estado_alerta, leido_por_medico, fecha)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    // Inyectamos variables preparadas
    const valores = [
      a.medicion_id,
      a.estado_alerta,
      a.leido_por_medico,
      new Date().toISOString()
    ];

    try {
      const resp = await pool.query(query, valores);
      const insertada = resp.rows[0];

      return {
        id: insertada.id,
        medicion_id: insertada.medicion_id,
        estado_alerta: insertada.estado_alerta,
        leido_por_medico: insertada.leido_por_medico,
        fecha: new Date(insertada.fecha)
      };
    } catch (error: unknown) {
      console.error('Error insertando en alertas postgres: ', error);
      throw error;
    }
  }

  async obtenerPendientesPorMedico(medicoId: string): Promise<AlertaExtendida[]> {
    const query = `
      SELECT 
        a.id, a.medicion_id, a.estado_alerta, a.leido_por_medico, a.fecha,
        p.nombre_completo as paciente_nombre,
        m.tipo_medicion as medicion_tipo,
        m.valor as medicion_valor,
        m.fecha as medicion_fecha
      FROM alertas a
      JOIN mediciones m ON a.medicion_id = m.id
      JOIN pacientes p ON m.paciente_id = p.id
      WHERE p.medico_responsable_id = $1
        AND a.leido_por_medico = false
      ORDER BY a.fecha DESC;
    `;

    try {
      const resp = await pool.query(query, [medicoId]);
      return resp.rows.map(row => ({
        id: row.id,
        medicion_id: row.medicion_id,
        estado_alerta: row.estado_alerta,
        leido_por_medico: row.leido_por_medico,
        fecha: new Date(row.fecha),
        paciente_nombre: row.paciente_nombre,
        medicion_tipo: row.medicion_tipo,
        medicion_valor: parseFloat(row.medicion_valor),
        medicion_fecha: new Date(row.medicion_fecha)
      }));
    } catch (error: unknown) {
      console.error('Error obteniendo alertas pendientes: ', error);
      throw error;
    }
  }

  async marcarComoLeida(alertaId: string): Promise<void> {
    const query = `UPDATE alertas SET leido_por_medico = true WHERE id = $1`;
    try {
      await pool.query(query, [alertaId]);
    } catch (error: unknown) {
      console.error('Error marcando alerta como leída: ', error);
      throw error;
    }
  }
}
