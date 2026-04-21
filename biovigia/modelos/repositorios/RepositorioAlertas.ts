import { Alerta, AlertaExtendida } from '../tipos';

/**
 * Repositorio para Alerta. 
 * (contratos para persistencia)
 */
export interface RepositorioAlertas {
  /**
   * Guarda una nueva alerta generada por médico.
   * @param a Alerta con el estado evaluado
   */
  guardar(a: Alerta): Promise<Alerta>;

  /**
   * Trae lista de alertas pendientes de visualizar por un médico
   * @param medicoId ID del médico
   */
  obtenerPendientesPorMedico(medicoId: string): Promise<AlertaExtendida[]>;

  /**
   * Marca una alerta específica como ya atendida/leída 
   * @param alertaId ID de la alerta
   */
  marcarComoLeida(alertaId: string, medicoId: string): Promise<void>;
}
