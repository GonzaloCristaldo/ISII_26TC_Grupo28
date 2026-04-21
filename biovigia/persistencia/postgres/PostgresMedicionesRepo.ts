import { RepositorioMediciones } from '../../modelos/repositorios/RepositorioMediciones';
import { Medicion } from '../../modelos/tipos';
import { pool } from './PostgresCliente';

type MedicionRow = {
  id: string;
  paciente_id: string;
  tipo_medicion: Medicion['tipo_medicion'];
  valor: string;
  fecha: string;
};
/**
 * Repositorio de Mediciones para PostgreSQL en local (puede cambiarse a supabase?).
 * Siguiendo la teoria, de que no debe conocer nada sobre React ni variables globales.
 */
export class PostgresMedicionesRepo implements RepositorioMediciones {
  async guardar(m: Medicion): Promise<Medicion> {
    const query = `
      INSERT INTO mediciones (paciente_id, tipo_medicion_id, valor, fecha)
      SELECT $1, tm.id, $2, $3
      FROM tipos_medicion tm
      WHERE tm.nombre = $4
      RETURNING (
        SELECT json_build_object(
          'id', mediciones.id,
          'paciente_id', mediciones.paciente_id,
          'tipo_medicion', tm2.nombre,
          'valor', mediciones.valor,
          'fecha', mediciones.fecha
        )
        FROM tipos_medicion tm2
        WHERE tm2.id = mediciones.tipo_medicion_id
      ) AS medicion
    `;

    // valores para prevenir inyección SQL
    const valores = [m.paciente_id, m.valor, m.fecha.toISOString(), m.tipo_medicion];

    try {
      const dbResponse = await pool.query<{ medicion: MedicionRow }>(query, valores);
      const nuevaEntrada = dbResponse.rows[0]?.medicion;

      if (!nuevaEntrada) {
        throw new Error('No existe el tipo de medicion indicado.');
      }

      return {
        id: nuevaEntrada.id,
        paciente_id: nuevaEntrada.paciente_id,
        tipo_medicion: nuevaEntrada.tipo_medicion,
        valor: parseFloat(nuevaEntrada.valor), // Convertimos numeric de pg
        fecha: new Date(nuevaEntrada.fecha),
      };
    } catch (error: unknown) {
      console.error('Postgres error detallado:', error);
      const message =
        error instanceof Error ? error.message : 'Error desconocido insertando en PostgreSQL';
      throw new Error(`Error insertando en Postgres: ${message}`);
    }
  }

  async obtenerPorPaciente(pacienteId: string): Promise<Medicion[]> {
    const query = `
      SELECT
        m.id,
        m.paciente_id,
        tm.nombre AS tipo_medicion,
        m.valor,
        m.fecha
      FROM mediciones m
      JOIN tipos_medicion tm ON tm.id = m.tipo_medicion_id
      WHERE m.paciente_id = $1
      ORDER BY m.fecha DESC
    `;

    const dbResponse = await pool.query<MedicionRow>(query, [pacienteId]);

    return dbResponse.rows.map((row) => ({
      id: row.id,
      paciente_id: row.paciente_id,
      tipo_medicion: row.tipo_medicion,
      valor: parseFloat(row.valor),
      fecha: new Date(row.fecha),
    }));
  }
}
