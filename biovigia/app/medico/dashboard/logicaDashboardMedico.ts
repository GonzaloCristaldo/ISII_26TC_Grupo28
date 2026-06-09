import type { TipoEstadoMedicion, TipoMedicionNombre } from '@/modelos/tipos';
import {
  obtenerFormatoFecha,
  obtenerNombreMedicion,
  obtenerPuntosGrafico,
  obtenerUnidadMedicion,
  ordenarMedicionesPorFecha,
} from '@/app/lib/logicaVisualizacionMediciones';
import type {
  AlertaDashboard,
  FiltroEstadoDashboard,
  FiltroPacientesDashboard,
  MedicionDashboard,
  PacienteDashboard,
  ResumenCriticidad,
} from './tiposDashboardMedico';

export {
  obtenerFormatoFecha,
  obtenerNombreMedicion,
  obtenerPuntosGrafico,
  obtenerUnidadMedicion,
  ordenarMedicionesPorFecha,
};

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

export function obtenerHistorialPaciente(
  pacienteId: string,
  historialPorPaciente: Record<string, MedicionDashboard[]>,
) {
  return pacienteId ? historialPorPaciente[pacienteId] ?? [] : [];
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

export function obtenerMedicionActual(
  alertaSeleccionada: AlertaDashboard | undefined,
  tipoActivo: TipoMedicionNombre,
  registrosRecientes: MedicionDashboard[],
): MedicionDashboard | undefined {
  if (alertaSeleccionada?.medicion_tipo === tipoActivo) {
    return {
      medicion_id: alertaSeleccionada.medicion_id,
      paciente_id: alertaSeleccionada.paciente_id,
      tipo_medicion: alertaSeleccionada.medicion_tipo,
      valor: alertaSeleccionada.medicion_valor,
      fecha: alertaSeleccionada.medicion_fecha,
    };
  }

  return registrosRecientes[0];
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

export function obtenerAlertasPaciente(alertas: AlertaDashboard[], pacienteId: string) {
  return alertas.filter((alerta) => alerta.paciente_id === pacienteId);
}

export function obtenerEstadoPrioritarioPaciente(
  alertas: AlertaDashboard[],
  pacienteId: string,
): TipoEstadoMedicion | null {
  return ordenarAlertasPorPrioridad(obtenerAlertasPaciente(alertas, pacienteId))[0]
    ?.estado_alerta ?? null;
}

export function filtrarPacientesDashboard(
  pacientes: PacienteDashboard[],
  alertas: AlertaDashboard[],
  filtro: FiltroPacientesDashboard,
  busqueda: string,
) {
  const textoBusqueda = busqueda.trim().toLowerCase();

  return pacientes.filter((paciente) => {
    const alertasPaciente = obtenerAlertasPaciente(alertas, paciente.paciente_id);
    const coincideBusqueda =
      textoBusqueda.length === 0 ||
      paciente.nombreCompleto.toLowerCase().includes(textoBusqueda) ||
      paciente.email?.toLowerCase().includes(textoBusqueda) ||
      paciente.telefono?.toLowerCase().includes(textoBusqueda) ||
      paciente.grupoSanguineo?.toLowerCase().includes(textoBusqueda);
    const coincideFiltro =
      filtro === 'Todos' ||
      (filtro === 'ConAlertas' && alertasPaciente.length > 0) ||
      (filtro === 'Criticos' &&
        alertasPaciente.some((alerta) => alerta.estado_alerta === 'Critico')) ||
      (filtro === 'SinAlertas' && alertasPaciente.length === 0);

    return Boolean(coincideBusqueda && coincideFiltro);
  });
}
