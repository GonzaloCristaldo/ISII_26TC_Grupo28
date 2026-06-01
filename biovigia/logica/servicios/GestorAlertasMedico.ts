import { RepositorioAlertas } from '../../modelos/repositorios/RepositorioAlertas';
import { RepositorioMediciones } from '../../modelos/repositorios/RepositorioMediciones';
import { AlertaExtendida, Medicion } from '../../modelos/tipos';

/**
 * Gestor del flujo del Médico.
 * Lista alertas y se puede poner como como leídas/atendidas.
 */

export class GestorAlertasMedico {
  constructor(
    private repoAlertas: RepositorioAlertas,
    private repoMediciones?: RepositorioMediciones,
  ) { }

  /**
   * Bandeja de entrada del médico con alertas crìticas y advertencias.
   */
  async revisarAlertasPendientes(medicoId: string): Promise<AlertaExtendida[]> {
    return this.repoAlertas.obtenerPendientesPorMedico(medicoId);
  }

  /**
   * Historial de mediciones del paciente seleccionado por el medico.
   */
  async revisarHistorialPaciente(pacienteId: string): Promise<Medicion[]> {
    if (!this.repoMediciones) {
      throw new Error('Repositorio de mediciones no disponible.');
    }

    return this.repoMediciones.obtenerPorPaciente(pacienteId);
  }

  /**
   * Permite descartar o marcar como leída una alerta una vez atendida.
   */
  async descartarAlerta(alertaId: string, medicoId: string): Promise<void> {
    return this.repoAlertas.marcarComoLeida(alertaId, medicoId);
  }
}
