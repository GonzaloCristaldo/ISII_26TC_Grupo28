import { Medicion, TipoEstadoMedicion } from '../modelos/tipos';

/**
 * Motor de Evaluación de Alertas
 * 
 * Lógica clínica para determinar si un
 * parámetro vital se encuentra normal, 
 * en advertencia o en estado crítico.
 */

// Simulado hasta copnectar pg4admin. 
const UMBRALES_SIMULADOS = {
  PresionArterial: {
    minimo: 90,
    maximo_normal: 120,
    critico: 180
  },
  Glucosa: {
    minimo: 70,
    maximo_normal: 100,
    critico: 140
  }
};

export function evaluarMedicion(medicion: Medicion): TipoEstadoMedicion {
  const umbral = UMBRALES_SIMULADOS[medicion.tipo_medicion];
  
  if (!umbral) {
    return 'Normal';
  }

  const { valor } = medicion;

  if (valor >= umbral.critico) {
    return 'Critico';
  } else if (valor > umbral.maximo_normal) {
    return 'Advertencia';
  } else if (valor < umbral.minimo) {
    return 'Advertencia'; // Podría ser crítico hacia abajo!!!!!!!
  }

  return 'Normal';
}
