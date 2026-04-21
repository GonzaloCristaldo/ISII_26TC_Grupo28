import { RepositorioAlertas } from '../../modelos/repositorios/RepositorioAlertas';
import { AlertaExtendida } from '../../modelos/tipos';

/**
 * Servicio del flujo del Médico.
 * Lista alertas y se puede poner como como leídas/atendidas.
 */

export class ServicioMedico {
  constructor(private repoAlertas: RepositorioAlertas) { }

  /**
   * Bandeja de entrada del médico con alertas crìticas y advertencias.
   */
  async revisarAlertasPendientes(medicoId: string): Promise<AlertaExtendida[]> {
    return this.repoAlertas.obtenerPendientesPorMedico(medicoId);
  }

  /**
   * Permite descartar o marcar como leída una alerta una vez atendida.
   */
  async descartarAlerta(alertaId: string, medicoId: string): Promise<void> {
    return this.repoAlertas.marcarComoLeida(alertaId, medicoId);
  }
}
