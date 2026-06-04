import type { Paciente, PacienteConMedicoResponsable } from '../tipos';

/**
 * Contrato de consulta de pacientes asociados a un medico.
 */
export interface RepositorioPacientes {
  obtenerAsignadosPorMedico(medicoId: string): Promise<Paciente[]>;
  obtenerPorIdConMedico(pacienteId: string): Promise<PacienteConMedicoResponsable | null>;
}
