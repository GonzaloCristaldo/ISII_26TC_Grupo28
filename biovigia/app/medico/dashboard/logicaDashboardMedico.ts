import type { TipoEstadoMedicion, TipoMedicionNombre } from '@/modelos/tipos';
import type {
  AlertaDashboard,
  FiltroEstadoDashboard,
  MedicionDashboard,
  ResumenCriticidad,
  TipoMedicionDashboard,
} from './tiposDashboardMedico';

export function obtenerUnidadMedicion(
  tipo: TipoMedicionNombre,
  tiposMedicion: TipoMedicionDashboard[],
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

export function obtenerTiempoRelativo(fecha: string) {
  const diferenciaMinutos = Math.max(
    0,
    Math.round((Date.now() - new Date(fecha).getTime()) / 60000),
  );

  if (diferenciaMinutos < 1) return 'ahora';
  if (diferenciaMinutos < 60) return `hace ${diferenciaMinutos} min`;

  const diferenciaHoras = Math.round(diferenciaMinutos / 60);
  if (diferenciaHoras < 24) return `hace ${diferenciaHoras} h`;

  return `hace ${Math.round(diferenciaHoras / 24)} d`;
}

export function obtenerPesoEstado(estado: TipoEstadoMedicion) {
  if (estado === 'Critico') return 0;
  if (estado === 'Advertencia') return 1;
  return 2;
}

export function obtenerClasesEstado(estado: TipoEstadoMedicion) {
  if (estado === 'Critico') {
    return {
      texto: 'text-rose-800',
      fondo: 'bg-rose-700',
      seleccionado: 'border-rose-700 bg-rose-50',
    };
  }

  if (estado === 'Advertencia') {
    return {
      texto: 'text-amber-800',
      fondo: 'bg-amber-600',
      seleccionado: 'border-amber-600 bg-amber-50',
    };
  }

  return {
    texto: 'text-emerald-800',
    fondo: 'bg-emerald-700',
    seleccionado: 'border-emerald-700 bg-emerald-50',
  };
}

export function ordenarAlertasPorPrioridad(alertas: AlertaDashboard[]) {
  return [...alertas].sort((a, b) => {
    const prioridadEstado = obtenerPesoEstado(a.estado_alerta) - obtenerPesoEstado(b.estado_alerta);
    if (prioridadEstado !== 0) return prioridadEstado;

    return new Date(b.medicion_fecha).getTime() - new Date(a.medicion_fecha).getTime();
  });
}

export function filtrarAlertasDashboard(
  alertas: AlertaDashboard[],
  filtroEstado: FiltroEstadoDashboard,
  busqueda: string,
) {
  const textoBusqueda = busqueda.trim().toLowerCase();

  return alertas.filter((alerta) => {
    const coincideEstado = filtroEstado === 'Todos' || alerta.estado_alerta === filtroEstado;
    const coincideBusqueda =
      textoBusqueda.length === 0 ||
      alerta.paciente_nombre.toLowerCase().includes(textoBusqueda) ||
      obtenerNombreMedicion(alerta.medicion_tipo).toLowerCase().includes(textoBusqueda);

    return coincideEstado && coincideBusqueda;
  });
}

export function ordenarMedicionesPorFecha(
  mediciones: MedicionDashboard[],
  direccion: 'asc' | 'desc',
) {
  return [...mediciones].sort((a, b) => {
    const diferencia = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
    return direccion === 'asc' ? diferencia : -diferencia;
  });
}

export function obtenerHistorialPaciente(
  alertaSeleccionada: AlertaDashboard | undefined,
  historialPorPaciente: Record<string, MedicionDashboard[]>,
) {
  return alertaSeleccionada ? historialPorPaciente[alertaSeleccionada.paciente_id] ?? [] : [];
}

export function obtenerTiposPaciente(
  alertaSeleccionada: AlertaDashboard | undefined,
  historialPaciente: MedicionDashboard[],
) {
  return Array.from(
    new Set([
      ...(alertaSeleccionada ? [alertaSeleccionada.medicion_tipo] : []),
      ...historialPaciente.map((medicion) => medicion.tipo_medicion),
    ]),
  );
}

export function obtenerTipoActivo(
  tiposPaciente: TipoMedicionNombre[],
  tipoSeleccionado: TipoMedicionNombre,
  alertaSeleccionada: AlertaDashboard | undefined,
) {
  return tiposPaciente.includes(tipoSeleccionado)
    ? tipoSeleccionado
    : alertaSeleccionada?.medicion_tipo ?? tipoSeleccionado;
}

export function calcularResumenCriticidad(alertas: AlertaDashboard[]): ResumenCriticidad {
  return {
    totalCriticas: alertas.filter((alerta) => alerta.estado_alerta === 'Critico').length,
    totalAdvertencias: alertas.filter((alerta) => alerta.estado_alerta === 'Advertencia').length,
  };
}

export function calcularPacientesAfectados(alertas: AlertaDashboard[]) {
  return new Set(alertas.map((alerta) => alerta.paciente_id)).size;
}

export function obtenerPuntosGrafico(
  mediciones: MedicionDashboard[],
  minimo: number,
  maximo: number,
) {
  const margenHorizontal = 8;
  const margenSuperior = 8;
  const altoDisponible = 34;
  const anchoDisponible = 100 - margenHorizontal * 2;
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
