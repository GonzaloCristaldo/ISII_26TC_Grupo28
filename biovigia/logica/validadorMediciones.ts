/**
 * Validador de Mediciones
 * 
 * Reglas de dominio para validar que los datos registrados
 * sean físicamente y biológicamente posibles para una persona.
 * Sirve como protección contra errores de tipeo antes
 * de guardar los datos en la base de datos o evaluarlos clínicamente.
 * Con esto se aborda lo anotado en el plan de riesgos.
 */

const LIMITES_BIOLOGICOS = {
  // Valores en mmHG - Menor a 20 o mayor a 300 es considerado biológicamente imposible o un error del dispositivo
  PresionArterial: { min: 20, max: 300 },
  // Valores en mg/dL - Menor a 10 y mayor a 1000 excede lo posible para una persona.
  Glucosa: { min: 10, max: 1000 }
};

export function validarLimitesBiologicos(tipo_medicion: string, valor: number): void {
  const limites = LIMITES_BIOLOGICOS[tipo_medicion as keyof typeof LIMITES_BIOLOGICOS];

  if (!limites) {
    // Si se agrega un nuevo tipo de medicion en la BD que no este aca, 
    // lo dejamos pasar, o se puede bloquear. 
    // Para la primera entrega quedan solo estos 2 tipos de mediciones.
    return;
  }

  if (valor < limites.min || valor > limites.max) {
    throw new Error(`El valor ${valor} no es fisiológicamente posible para ${tipo_medicion}. Revise si hay un error de tipeo.`);
  }
}
