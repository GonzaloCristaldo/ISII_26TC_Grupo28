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
  async listar(): Promise<Umbral[]> {
    const query = `
      SELECT *
      FROM fn_listar_umbrales()
    `;

    const respuesta = await pool.query<UmbralRow>(query);

    return respuesta.rows.map((fila) => ({
      tipo_medicion_id: fila.tipo_medicion_id,
      tipo_medicion: fila.tipo_medicion,
      unidad: fila.unidad,
      valor_minimo_normal: parseFloat(fila.valor_minimo_normal),
      valor_maximo_normal: parseFloat(fila.valor_maximo_normal),
      valor_critico: parseFloat(fila.valor_critico),
    }));
  }

  async obtenerPorTipo(tipoMedicion: Medicion['tipo_medicion']): Promise<Umbral | null> {
    const query = `
      SELECT *
      FROM fn_obtener_umbral_por_tipo($1)
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
