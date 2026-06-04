import type { TipoMedicionNombre } from '@/modelos/tipos';
import type { MedicionDashboardPaciente } from './tiposDashboardPaciente';

export function obtenerTiposRegistrados(historial: MedicionDashboardPaciente[]) {
  return Array.from(new Set(historial.map((medicion) => medicion.tipo_medicion)));
}

export function obtenerTipoActivo(
  tiposRegistrados: TipoMedicionNombre[],
  tipoSeleccionado: TipoMedicionNombre,
) {
  return tiposRegistrados.includes(tipoSeleccionado)
    ? tipoSeleccionado
    : tiposRegistrados[0] ?? '';
}

export function filtrarMedicionesPorTipo(
  historial: MedicionDashboardPaciente[],
  tipo: TipoMedicionNombre,
) {
  return historial.filter((medicion) => medicion.tipo_medicion === tipo);
}
