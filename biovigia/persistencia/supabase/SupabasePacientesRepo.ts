import type { RepositorioPacientes } from '@/modelos/repositorios/RepositorioPacientes';
import type { Paciente, PacienteConMedicoResponsable } from '@/modelos/tipos';

export class SupabasePacientesRepo implements RepositorioPacientes {
  async obtenerAsignadosPorMedico(medicoId: string): Promise<Paciente[]> {
    void medicoId;
    throw new Error('Metodo no implementado en mock Supabase');
  }

  async obtenerPorIdConMedico(pacienteId: string): Promise<PacienteConMedicoResponsable | null> {
    void pacienteId;
    throw new Error('Metodo no implementado en mock Supabase');
  }
}
