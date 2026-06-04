import type { TipoMedicionNombre } from '@/modelos/tipos';

type MedicionVisualizable = {
  valor: number;
  fecha: string;
};

type TipoMedicionVisualizable = {
  tipo_medicion: TipoMedicionNombre;
  unidad: string;
};

type ConfiguracionGrafico = {
  ancho?: number;
  margenHorizontal?: number;
  margenSuperior?: number;
  altoDisponible?: number;
};

export function obtenerUnidadMedicion(
  tipo: TipoMedicionNombre,
  tiposMedicion: TipoMedicionVisualizable[],
) {
  return tiposMedicion.find((tipoMedicion) => tipoMedicion.tipo_medicion === tipo)?.unidad ?? tipo;
}

export function obtenerNombreMedicion(tipo: TipoMedicionNombre) {
  return tipo
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
}

export function obtenerFormatoFecha(fecha: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fecha));
}

export function ordenarMedicionesPorFecha<T extends { fecha: string }>(
  mediciones: T[],
  direccion: 'asc' | 'desc',
) {
  return [...mediciones].sort((a, b) => {
    const diferencia = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
    return direccion === 'asc' ? diferencia : -diferencia;
  });
}

export function obtenerPuntosGrafico<T extends MedicionVisualizable>(
  mediciones: T[],
  minimo: number,
  maximo: number,
  configuracion: ConfiguracionGrafico = {},
) {
  const ancho = configuracion.ancho ?? 100;
  const margenHorizontal = configuracion.margenHorizontal ?? 8;
  const margenSuperior = configuracion.margenSuperior ?? 8;
  const altoDisponible = configuracion.altoDisponible ?? 34;
  const anchoDisponible = ancho - margenHorizontal * 2;
  const divisorHorizontal = Math.max(mediciones.length - 1, 1);

  return mediciones.map((medicion, indice) => {
    const proporcionValor = maximo === minimo ? 0.5 : (medicion.valor - minimo) / (maximo - minimo);

    return {
      medicion,
      x: margenHorizontal + (indice / divisorHorizontal) * anchoDisponible,
      y: margenSuperior + (1 - proporcionValor) * altoDisponible,
    };
  });
}
