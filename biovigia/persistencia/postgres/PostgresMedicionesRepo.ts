import {
  RepositorioMediciones,
  RepositorioRegistroMedicionAtomico,
  ResultadoRegistroMedicion,
} from '../../modelos/repositorios/RepositorioMediciones';
import { Medicion, TipoEstadoMedicion } from '../../modelos/tipos';
import { pool } from './PostgresCliente';

type MedicionRow = {
  medicion_id: string;
  paciente_id: string;
  tipo_medicion: Medicion['tipo_medicion'];
  valor: string;
  fecha: string;
};
/**
 * Repositorio de Mediciones para PostgreSQL en local (puede cambiarse a supabase?).
 * Siguiendo la teoria, de que no debe conocer nada sobre React ni variables globales.
 */
type ResultadoRegistroMedicionRow = MedicionRow & {
  alerta_generada: boolean;
};

export class PostgresMedicionesRepo
  implements RepositorioMediciones, RepositorioRegistroMedicionAtomico {
  async guardar(m: Medicion): Promise<Medicion> {
    const query = `
      INSERT INTO mediciones (paciente_id, tipo_medicion_id, valor, fecha)
      SELECT $1, tm.tipo_medicion_id, $2, $3
      FROM tipos_medicion tm
      WHERE tm.nombre = $4
      RETURNING (
        SELECT json_build_object(
          'medicion_id', mediciones.medicion_id,
          'paciente_id', mediciones.paciente_id,
          'tipo_medicion', tm2.nombre,
          'valor', mediciones.valor,
          'fecha', mediciones.fecha
        )
        FROM tipos_medicion tm2
        WHERE tm2.tipo_medicion_id = mediciones.tipo_medicion_id
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
        medicion_id: nuevaEntrada.medicion_id,
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

  async registrarMedicionConResultado(
    medicion: Medicion,
    estado: TipoEstadoMedicion,
  ): Promise<ResultadoRegistroMedicion> {
    const query = `
      SELECT *
      FROM fn_registrar_medicion_con_alerta($1, $2, $3, $4, $5)
    `;

    const valores = [
      medicion.paciente_id,
      medicion.tipo_medicion,
      medicion.valor,
      medicion.fecha.toISOString(),
      estado,
    ];

    try {
      const respuesta = await pool.query<ResultadoRegistroMedicionRow>(query, valores);
      const fila = respuesta.rows[0];

      if (!fila) {
        throw new Error('No se pudo registrar la medicion en PostgreSQL.');
      }

      return {
        medicion: {
          medicion_id: fila.medicion_id,
          paciente_id: fila.paciente_id,
          tipo_medicion: fila.tipo_medicion,
          valor: parseFloat(fila.valor),
          fecha: new Date(fila.fecha),
        },
        alertaGenerada: fila.alerta_generada,
      };
    } catch (error: unknown) {
      console.error('Postgres error registrando medicion con resultado:', error);
      const message =
        error instanceof Error ? error.message : 'Error desconocido registrando en PostgreSQL';
      throw new Error(`Error registrando medicion en Postgres: ${message}`);
    }
  }

  async obtenerPorPaciente(pacienteId: string): Promise<Medicion[]> {
    const query = `
      SELECT *
      FROM fn_historial_mediciones_paciente($1)
    `;

    const dbResponse = await pool.query<MedicionRow>(query, [pacienteId]);

    return dbResponse.rows.map((row) => ({
      medicion_id: row.medicion_id,
      paciente_id: row.paciente_id,
      tipo_medicion: row.tipo_medicion,
      valor: parseFloat(row.valor),
      fecha: new Date(row.fecha),
    }));
  }
}
