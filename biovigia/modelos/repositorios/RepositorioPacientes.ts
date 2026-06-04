import type { Paciente } from '../tipos';

/**
 * Contrato de consulta de pacientes asociados a un medico.
 */
export interface RepositorioPacientes {
  obtenerAsignadosPorMedico(medicoId: string): Promise<Paciente[]>;
}
