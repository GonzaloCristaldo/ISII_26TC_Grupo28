import { RepositorioConfiguracionClinica } from '@/modelos/repositorios/RepositorioConfiguracionClinica';
import {
  DatosActualizacionTipoMedicionConUmbral,
  DatosTipoMedicionConUmbral,
  TipoMedicionConUmbral,
} from '@/modelos/tipos';
import { pool } from './PostgresCliente';

type TipoMedicionConUmbralRow = {
  id: string;
  nombre: string;
  unidad: string;
  valor_minimo_normal: string;
  valor_maximo_normal: string;
  valor_critico: string;
};

function mapearTipoMedicion(row: TipoMedicionConUmbralRow): TipoMedicionConUmbral {
  return {
    id: row.id,
    nombre: row.nombre,
    unidad: row.unidad,
    valor_minimo_normal: parseFloat(row.valor_minimo_normal),
    valor_maximo_normal: parseFloat(row.valor_maximo_normal),
    valor_critico: parseFloat(row.valor_critico),
  };
}

async function obtenerTipoMedicionConUmbral(tipoMedicionId: string): Promise<TipoMedicionConUmbral> {
  const resultado = await pool.query<TipoMedicionConUmbralRow>(
    `
      SELECT
        tm.id,
        tm.nombre,
        tm.unidad,
        u.valor_minimo_normal,
        u.valor_maximo_normal,
        u.valor_critico
      FROM tipos_medicion tm
      JOIN umbrales u ON u.tipo_medicion_id = tm.id
      WHERE tm.id = $1
      LIMIT 1
    `,
    [tipoMedicionId],
  );
  const row = resultado.rows[0];

  if (!row) {
    throw new Error('No se pudo recuperar el tipo de medicion.');
  }

  return mapearTipoMedicion(row);
}

export class PostgresConfiguracionClinicaRepo implements RepositorioConfiguracionClinica {
  async crearTipoMedicionConUmbral(
    datos: DatosTipoMedicionConUmbral,
  ): Promise<TipoMedicionConUmbral> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const tipoResultado = await client.query<{ id: string }>(
        `
          INSERT INTO tipos_medicion (nombre, unidad)
          VALUES ($1, $2)
          RETURNING id
        `,
        [datos.nombre, datos.unidad],
      );
      const tipoMedicionId = tipoResultado.rows[0]?.id;

      if (!tipoMedicionId) {
        throw new Error('No se pudo crear el tipo de medicion.');
      }

      await client.query(
        `
          INSERT INTO umbrales (
            tipo_medicion_id,
            valor_minimo_normal,
            valor_maximo_normal,
            valor_critico
          )
          VALUES ($1, $2, $3, $4)
        `,
        [
          tipoMedicionId,
          datos.valor_minimo_normal,
          datos.valor_maximo_normal,
          datos.valor_critico,
        ],
      );

      await client.query('COMMIT');
      return obtenerTipoMedicionConUmbral(tipoMedicionId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async actualizarTipoMedicionConUmbral(
    datos: DatosActualizacionTipoMedicionConUmbral,
  ): Promise<TipoMedicionConUmbral> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const tipoResultado = await client.query(
        `
          UPDATE tipos_medicion
          SET nombre = $2,
              unidad = $3
          WHERE id = $1
        `,
        [datos.tipoMedicionId, datos.nombre, datos.unidad],
      );

      if (tipoResultado.rowCount === 0) {
        throw new Error('El tipo de medicion indicado no existe.');
      }

      const umbralResultado = await client.query(
        `
          UPDATE umbrales
          SET valor_minimo_normal = $2,
              valor_maximo_normal = $3,
              valor_critico = $4
          WHERE tipo_medicion_id = $1
        `,
        [
          datos.tipoMedicionId,
          datos.valor_minimo_normal,
          datos.valor_maximo_normal,
          datos.valor_critico,
        ],
      );

      if (umbralResultado.rowCount === 0) {
        throw new Error('El umbral del tipo de medicion no existe.');
      }

      await client.query('COMMIT');
      return obtenerTipoMedicionConUmbral(datos.tipoMedicionId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
