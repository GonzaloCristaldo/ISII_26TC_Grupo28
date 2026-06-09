import { RepositorioEspecialidades } from '@/modelos/repositorios/RepositorioEspecialidades';
import { DatosEspecialidad, Especialidad } from '@/modelos/tipos';
import { pool } from './PostgresCliente';

type EspecialidadRow = {
  especialidad_id: string;
  nombre: string;
  activa: boolean;
  creado_en: string;
};

function mapearEspecialidad(row: EspecialidadRow): Especialidad {
  return {
    especialidad_id: row.especialidad_id,
    nombre: row.nombre,
    activa: row.activa,
    creado_en: new Date(row.creado_en),
  };
}

export class PostgresEspecialidadesRepo implements RepositorioEspecialidades {
  async listar(): Promise<Especialidad[]> {
    const resultado = await pool.query<EspecialidadRow>(
      `
        SELECT especialidad_id, nombre, activa, creado_en
        FROM especialidades
        ORDER BY nombre ASC
      `,
    );

    return resultado.rows.map(mapearEspecialidad);
  }

  async crear(datos: DatosEspecialidad): Promise<Especialidad> {
    const resultado = await pool.query<EspecialidadRow>(
      `
        INSERT INTO especialidades (nombre)
        VALUES ($1)
        RETURNING especialidad_id, nombre, activa, creado_en
      `,
      [datos.nombre],
    );
    const row = resultado.rows[0];

    if (!row) {
      throw new Error('No se pudo crear la especialidad.');
    }

    return mapearEspecialidad(row);
  }
}
