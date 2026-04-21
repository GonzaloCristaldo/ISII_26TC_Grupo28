import { RepositorioUmbrales } from '@/modelos/repositorios/RepositorioUmbrales';
import { Medicion, Umbral } from '@/modelos/tipos';
import { pool } from './PostgresCliente';

type UmbralRow = {
  tipo_medicion_id: string;
  tipo_medicion: Medicion['tipo_medicion'];
  unidad: string;
  valor_minimo_normal: string;
  valor_maximo_normal: string;
  valor_critico: string;
};

export class PostgresUmbralesRepo implements RepositorioUmbrales {
  async obtenerPorTipo(tipoMedicion: Medicion['tipo_medicion']): Promise<Umbral | null> {
    const query = `
      SELECT
        u.tipo_medicion_id,
        tm.nombre AS tipo_medicion,
        tm.unidad,
        u.valor_minimo_normal,
        u.valor_maximo_normal,
        u.valor_critico
      FROM umbrales u
      JOIN tipos_medicion tm ON tm.id = u.tipo_medicion_id
      WHERE tm.nombre = $1
      LIMIT 1
    `;

    const respuesta = await pool.query<UmbralRow>(query, [tipoMedicion]);
    const fila = respuesta.rows[0];

    if (!fila) {
      return null;
    }

    return {
      tipo_medicion_id: fila.tipo_medicion_id,
      tipo_medicion: fila.tipo_medicion,
      unidad: fila.unidad,
      valor_minimo_normal: parseFloat(fila.valor_minimo_normal),
      valor_maximo_normal: parseFloat(fila.valor_maximo_normal),
      valor_critico: parseFloat(fila.valor_critico),
    };
  }
}
