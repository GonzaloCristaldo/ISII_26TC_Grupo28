import { RepositorioUmbrales } from '@/modelos/repositorios/RepositorioUmbrales';
import { Medicion, Umbral } from '@/modelos/tipos';
import { supabase } from './SupabaseCliente';

export class SupabaseUmbralesRepo implements RepositorioUmbrales {
  async obtenerPorTipo(tipoMedicion: Medicion['tipo_medicion']): Promise<Umbral | null> {
    const { data, error } = await supabase
      .from('umbrales')
      .select<Umbral>(
        'tipo_medicion_id, tipo_medicion, unidad, valor_minimo_normal, valor_maximo_normal, valor_critico',
      );

    if (error) {
      throw new Error(`Error obteniendo umbral: ${error.message}`);
    }

    return data.find((umbral) => umbral.tipo_medicion === tipoMedicion) ?? null;
  }
}
