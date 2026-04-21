import { RepositorioMediciones } from '../../modelos/repositorios/RepositorioMediciones';
import { Medicion } from '../../modelos/tipos';
import { supabase } from './SupabaseCliente';

/**
 * Repositorio de Mediciones usando Supabase.
 * (capa de persistencia).
 */
export class SupabaseMedicionesRepo implements RepositorioMediciones {

  async guardar(m: Medicion): Promise<Medicion> {
    // transformamos al formato de base de datos si fuera necesario
    const datosASubir = {
      paciente_id: m.paciente_id,
      tipo_medicion: m.tipo_medicion,
      valor: m.valor,
      fecha: m.fecha.toISOString()
    };

    // Ejecutamos la inserción en Supabase
    const { error } = await supabase
      .from('mediciones')
      .insert([datosASubir]);
    //  .select() para obtener el ID en caso real

    if (error) {
      throw new Error(`Error en persistencia (Supabase): ${error.message}`);
    }

    // Simulamos el objeto de vuelta con ID
    return {
      ...m,
      id: 'mock-uuid-generado'
    };
  }

  async obtenerPorPaciente(pacienteId: string): Promise<Medicion[]> {
    void pacienteId;

    const { data, error } = await supabase
      .from('mediciones')
      .select<{
        id?: string;
        paciente_id: string;
        tipo_medicion: 'PresionArterial' | 'Glucosa';
        valor: number;
        fecha: string;
      }>('*');
    if (error) throw new Error(error.message);

    return data.map((medicion) => ({
      id: medicion.id,
      paciente_id: medicion.paciente_id,
      tipo_medicion: medicion.tipo_medicion,
      valor: medicion.valor,
      fecha: new Date(medicion.fecha),
    }));
  }
}
