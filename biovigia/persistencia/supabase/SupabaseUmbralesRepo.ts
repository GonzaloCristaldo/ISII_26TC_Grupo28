import { RepositorioUmbrales } from '@/modelos/repositorios/RepositorioUmbrales';
import { Medicion, Umbral } from '@/modelos/tipos';
import { supabase } from './SupabaseCliente';

export class SupabaseUmbralesRepo implements RepositorioUmbrales {
  async listar(): Promise<Umbral[]> {
    const { data, error } = await supabase
      .from('umbrales')
      .select<Umbral>(
        'tipo_medicion_id, tipo_medicion, unidad, valor_minimo_normal, valor_maximo_normal, valor_critico',
      );

    if (error) {
      throw new Error(`Error listando umbrales: ${error.message}`);
    }

    return data;
  }

  async obtenerPorTipo(tipoMedicion: Medicion['tipo_medicion']): Promise<Umbral | null> {
    const umbrales = await this.listar();
    return umbrales.find((umbral) => umbral.tipo_medicion === tipoMedicion) ?? null;
  }
}
