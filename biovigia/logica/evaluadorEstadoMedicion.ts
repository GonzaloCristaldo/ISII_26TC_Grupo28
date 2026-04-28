import { Medicion, TipoEstadoMedicion, Umbral } from '../modelos/tipos';

/**
 * Evaluacion del estado de una medicion segun reglas medicas.
 *
 * Logica clinica para determinar si un
 * parametro vital se encuentra normal,
 * en advertencia o en estado critico.
 */


/* Los umbrales simulados no se utilizan, 
pero sirven para probar la logica de evaluacion sin depender de datos de la bdd, como fallback. 
*/
const UMBRALES_SIMULADOS = {
  PresionArterial: {
    minimo: 90,
    maximo_normal: 120,
    critico: 180,
  },
  Glucosa: {
    minimo: 70,
    maximo_normal: 100,
    critico: 140,
  },
};

export function evaluarMedicion(
  medicion: Medicion,
  umbral: Umbral | null = null,
): TipoEstadoMedicion {
  const umbralEvaluacion = umbral
    ? {
        minimo: umbral.valor_minimo_normal,
        maximo_normal: umbral.valor_maximo_normal,
        critico: umbral.valor_critico,
      }
    : UMBRALES_SIMULADOS[medicion.tipo_medicion];

  if (!umbralEvaluacion) {
    return 'Normal';
  }

  const { valor } = medicion;

  if (valor >= umbralEvaluacion.critico) {
    return 'Critico';
  } else if (valor > umbralEvaluacion.maximo_normal) {
    return 'Advertencia';
  } else if (valor < umbralEvaluacion.minimo) {
    return 'Advertencia';
  }

  return 'Normal';
}
