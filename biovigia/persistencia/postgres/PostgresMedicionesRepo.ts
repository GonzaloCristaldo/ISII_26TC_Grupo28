import { RepositorioMediciones } from '../../modelos/repositorios/RepositorioMediciones';
import { Medicion } from '../../modelos/tipos';
import { pool } from './PostgresCliente';

/**
 * Repositorio de Mediciones para PostgreSQL en local (puede cambiarse a supabase?).
 * Siguiendo la teoria, de que no debe conocer nada sobre React ni variables globales.
 */
export class PostgresMedicionesRepo implements RepositorioMediciones {
  
  async guardar(m: Medicion): Promise<Medicion> {
    const query = `
      INSERT INTO mediciones (paciente_id, tipo_medicion, valor, fecha)
      VALUES ($1, $2, $3, $4)
      RETURNING id, paciente_id, tipo_medicion, valor, fecha
    `;
    
    // valores para prevenir inyección SQL
    const valores = [
      m.paciente_id,
      m.tipo_medicion,
      m.valor,
      m.fecha.toISOString() // PG timestamp
    ];

    try {
      const dbResponse = await pool.query(query, valores);
      const nuevaEntrada = dbResponse.rows[0];

      return {
        id: nuevaEntrada.id,
        paciente_id: nuevaEntrada.paciente_id,
        tipo_medicion: nuevaEntrada.tipo_medicion,
        valor: parseFloat(nuevaEntrada.valor), // Convertimos numeric de pg
        fecha: new Date(nuevaEntrada.fecha)
      };
    } catch (error: unknown) {
      console.error('Postgres error detallado:', error);
      const message =
        error instanceof Error ? error.message : 'Error desconocido insertando en PostgreSQL';
      throw new Error(`Error insertando en Postgres: ${message}`);
    }
  }

  async obtenerPorPaciente(pacienteId: string): Promise<Medicion[]> {
    const query = 'SELECT * FROM mediciones WHERE paciente_id = $1 ORDER BY fecha DESC';
    const dbResponse = await pool.query(query, [pacienteId]);
    
    return dbResponse.rows.map(row => ({
      id: row.id,
      paciente_id: row.paciente_id,
      tipo_medicion: row.tipo_medicion,
      valor: parseFloat(row.valor),
      fecha: new Date(row.fecha)
    }));
  }
}
