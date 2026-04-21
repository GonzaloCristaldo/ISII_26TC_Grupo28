import { RepositorioAlertas } from '../../modelos/repositorios/RepositorioAlertas';
import { Alerta, AlertaExtendida } from '../../modelos/tipos';
import { supabase } from './SupabaseCliente';

/**
 * repositorio de Alertas para Supabase.
 */
export class SupabaseAlertasRepo implements RepositorioAlertas {

  async guardar(a: Alerta): Promise<Alerta> {
    const datos = {
      medicion_id: a.medicion_id,
      estado_alerta: a.estado_alerta,
      leido_por_medico: a.leido_por_medico,
      fecha: new Date().toISOString()
    };

    const { error } = await supabase.from('alertas').insert([datos]);

    if (error) {
      throw new Error(`Error al guardar alerta: ${error.message}`);
    }

    return {
      ...a,
      id: 'alerta-uuid'
    };
  }

  async obtenerPendientesPorMedico(medicoId: string): Promise<AlertaExtendida[]> {
    void medicoId;
    throw new Error('Metodo no implementado en mock Supabase');
  }

  async marcarComoLeida(alertaId: string, medicoId: string): Promise<void> {
    void alertaId;
    void medicoId;
    throw new Error('Metodo no implementado en mock Supabase');
  }
}
