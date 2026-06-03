/**
 * Reglas de dominio para evitar mediciones fisiologicamente imposibles.
 *
 * Los tipos de medicion son administrables, por eso no se compara el nombre
 * exacto de la BD: se normaliza texto para tolerar acentos, espacios y variantes
 * como "PresionArterial", "Presion arterial" u "Oxigeno en sangre".
 */

type LimiteBiologico = {
  min: number;
  max: number;
  descripcion: string;
};

type ContextoLimiteBiologico = {
  unidad?: string;
  valor_minimo_normal?: number;
  valor_maximo_normal?: number;
  valor_critico?: number;
};

const LIMITES_POR_TIPO: Array<{
  patrones: string[];
  limite: LimiteBiologico;
}> = [
  {
    patrones: ['presionarterial', 'presionsistolica', 'tensionarterial'],
    limite: { min: 20, max: 300, descripcion: 'presion arterial' },
  },
  {
    patrones: ['glucosa', 'glucemia', 'azucarensangre'],
    limite: { min: 10, max: 1000, descripcion: 'glucosa en sangre' },
  },
  {
    patrones: [
      'oxigenoensangre',
      'saturaciondeoxigeno',
      'saturacionoxigeno',
      'saturaciono2',
      'saturacion',
      'sato2',
      'oxigeno',
      'spo2',
      'oximetria',
    ],
    limite: { min: 0, max: 100, descripcion: 'oxigeno en sangre' },
  },
  {
    patrones: ['temperatura', 'temperaturacorporal'],
    limite: { min: 25, max: 45, descripcion: 'temperatura corporal' },
  },
  {
    patrones: ['frecuenciacardiaca', 'pulso', 'ritmocardiaco'],
    limite: { min: 20, max: 250, descripcion: 'frecuencia cardiaca' },
  },
  {
    patrones: ['frecuenciarespiratoria', 'respiracionesporminuto'],
    limite: { min: 4, max: 80, descripcion: 'frecuencia respiratoria' },
  },
];

const LIMITES_POR_UNIDAD: Array<{
  unidades: string[];
  limite: LimiteBiologico;
}> = [
  {
    unidades: ['%', 'porcentaje'],
    limite: { min: 0, max: 100, descripcion: 'valor porcentual' },
  },
  {
    unidades: ['mmhg'],
    limite: { min: 20, max: 300, descripcion: 'presion en mmHg' },
  },
  {
    unidades: ['bpm', 'lpm', 'latidosporminuto'],
    limite: { min: 20, max: 250, descripcion: 'frecuencia cardiaca' },
  },
  {
    unidades: ['rpm', 'respmin', 'respiracionesporminuto'],
    limite: { min: 4, max: 80, descripcion: 'frecuencia respiratoria' },
  },
  {
    unidades: ['c', 'celsius', 'gradosc'],
    limite: { min: 25, max: 45, descripcion: 'temperatura corporal' },
  },
];

function normalizarTexto(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9%]+/g, '');
}

function obtenerLimitePorTipo(tipoMedicion: string) {
  const tipoNormalizado = normalizarTexto(tipoMedicion);

  return LIMITES_POR_TIPO.find(({ patrones }) =>
    patrones.some((patron) => tipoNormalizado.includes(patron)),
  )?.limite;
}

function obtenerLimitePorUnidad(unidad?: string) {
  if (!unidad) return null;

  const unidadNormalizada = normalizarTexto(unidad);

  return LIMITES_POR_UNIDAD.find(({ unidades }) =>
    unidades.some((unidadPermitida) => unidadNormalizada === normalizarTexto(unidadPermitida)),
  )?.limite;
}

function obtenerLimiteBiologico(
  tipoMedicion: string,
  contexto?: ContextoLimiteBiologico,
): LimiteBiologico | null {
  return obtenerLimitePorTipo(tipoMedicion) ?? obtenerLimitePorUnidad(contexto?.unidad) ?? null;
}

export function validarLimitesBiologicos(
  tipo_medicion: string,
  valor: number,
  contexto?: ContextoLimiteBiologico,
): void {
  const limite = obtenerLimiteBiologico(tipo_medicion, contexto);

  if (!limite) {
    throw new Error(
      `No hay limites biologicos configurados para ${tipo_medicion}. Configure el tipo con un nombre o unidad reconocible antes de registrar mediciones.`,
    );
  }

  if (valor < limite.min || valor > limite.max) {
    throw new Error(
      `El valor ${valor} no es fisiologicamente posible para ${limite.descripcion}. Debe estar entre ${limite.min} y ${limite.max}.`,
    );
  }
}
