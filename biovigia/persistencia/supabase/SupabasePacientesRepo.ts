import type { RepositorioPacientes } from '@/modelos/repositorios/RepositorioPacientes';
import type { Paciente } from '@/modelos/tipos';

export class SupabasePacientesRepo implements RepositorioPacientes {
  async obtenerAsignadosPorMedico(medicoId: string): Promise<Paciente[]> {
    void medicoId;
    throw new Error('Metodo no implementado en mock Supabase');
  }
}
