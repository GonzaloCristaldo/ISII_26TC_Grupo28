import { Medicion, Umbral } from '../tipos';

/**
 * Aca se definen las operaciones que puede realizar la capa
 * lógica sobre los umbrales, y asi no conoce detalles de persistencia.
 */
export interface RepositorioUmbrales {
  obtenerPorTipo(tipoMedicion: Medicion['tipo_medicion']): Promise<Umbral | null>;
}
