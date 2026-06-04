import type { RepositorioMediciones } from '@/modelos/repositorios/RepositorioMediciones';
import type { RepositorioPacientes } from '@/modelos/repositorios/RepositorioPacientes';
import type { RepositorioUmbrales } from '@/modelos/repositorios/RepositorioUmbrales';
import type { DatosDashboardPaciente } from '@/modelos/tipos';

/**
 * Coordina las consultas necesarias para que un paciente revise su seguimiento.
 */
export class GestorDashboardPaciente {
  constructor(
    private repoPacientes: RepositorioPacientes,
    private repoMediciones: RepositorioMediciones,
    private repoUmbrales: RepositorioUmbrales,
  ) { }

  async consultarDashboard(pacienteId: string): Promise<DatosDashboardPaciente> {
    const [paciente, historial, umbrales] = await Promise.all([
      this.repoPacientes.obtenerPorIdConMedico(pacienteId),
      this.repoMediciones.obtenerPorPaciente(pacienteId),
      this.repoUmbrales.listar(),
    ]);

    if (!paciente) {
      throw new Error('No se encontro el perfil del paciente autenticado.');
    }

    return {
      paciente,
      historial,
      umbrales,
    };
  }
}
