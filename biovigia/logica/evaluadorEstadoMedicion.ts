import { Medicion, TipoEstadoMedicion, Umbral } from '../modelos/tipos';

/**
 * Evaluacion del estado de una medicion segun reglas medicas.
 *
 * Logica clinica para determinar si un
 * parametro vital se encuentra normal,
 * en advertencia o en estado critico.
 */
export function evaluarMedicion(
  medicion: Medicion,
  umbral: Umbral,
): TipoEstadoMedicion {
  const umbralEvaluacion = {
    minimo: umbral.valor_minimo_normal,
    maximo_normal: umbral.valor_maximo_normal,
    critico: umbral.valor_critico,
  };

  const { valor } = medicion;
  const criticoAlto = umbralEvaluacion.critico > umbralEvaluacion.maximo_normal;
  const criticoBajo = umbralEvaluacion.critico < umbralEvaluacion.minimo;

  if (criticoAlto && valor >= umbralEvaluacion.critico) {
    return 'Critico';
  } else if (criticoBajo && valor <= umbralEvaluacion.critico) {
    return 'Critico';
  } else if (valor > umbralEvaluacion.maximo_normal) {
    return 'Advertencia';
  } else if (valor < umbralEvaluacion.minimo) {
    return 'Advertencia';
  }

  return 'Normal';
}
