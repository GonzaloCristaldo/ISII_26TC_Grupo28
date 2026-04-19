import { Medicion } from '../tipos';

/**
 * Aca se define las operaciones que puede realizar la capa
 * lógica sobre las mediciones, y asi no conoce detalles de persistencia.
 */
export interface RepositorioMediciones {
  /**
   * Guarda una nueva medición en la base de datos
   * @param m Objeto Medicion a almacenar
   * @returns La medición guardada con su ID generado
   */
  guardar(m: Medicion): Promise<Medicion>;

  /**
   * Obtiene el historial de mediciones de un paciente
   * @param pacienteId UUID del paciente
   */
  obtenerPorPaciente(pacienteId: string): Promise<Medicion[]>;
}
