import type { RepositorioPacientes } from '@/modelos/repositorios/RepositorioPacientes';
import type { Paciente } from '@/modelos/tipos';

/**
 * Gestiona las consultas de pacientes asignados al medico autenticado.
 */
export class GestorPacientesMedico {
  constructor(private repoPacientes: RepositorioPacientes) { }

  async listarPacientesAsignados(medicoId: string): Promise<Paciente[]> {
    return this.repoPacientes.obtenerAsignadosPorMedico(medicoId);
  }
}
