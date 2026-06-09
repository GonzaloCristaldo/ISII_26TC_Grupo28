import { describe, expect, it } from 'vitest';
import {
  filtrarMedicionesPorTipo,
  obtenerTipoActivo,
  obtenerTiposRegistrados,
} from '../../app/paciente/dashboard/logicaDashboardPaciente';
import type { MedicionDashboardPaciente } from '../../app/paciente/dashboard/tiposDashboardPaciente';

const historial: MedicionDashboardPaciente[] = [
  {
    medicion_id: 'medicion-1',
    paciente_id: 'paciente-1',
    tipo_medicion: 'Glucosa',
    valor: 100,
    fecha: '2026-06-08T10:00:00.000Z',
  },
  {
    medicion_id: 'medicion-2',
    paciente_id: 'paciente-1',
    tipo_medicion: 'PresionArterial',
    valor: 120,
    fecha: '2026-06-09T10:00:00.000Z',
  },
  {
    medicion_id: 'medicion-3',
    paciente_id: 'paciente-1',
    tipo_medicion: 'Glucosa',
    valor: 105,
    fecha: '2026-06-09T11:00:00.000Z',
  },
];

describe('logicaDashboardPaciente', () => {
  it('obtiene tipos registrados sin duplicados', () => {
    expect(obtenerTiposRegistrados(historial)).toEqual(['Glucosa', 'PresionArterial']);
  });

  it('mantiene el tipo activo si existe o toma el primero disponible', () => {
    expect(obtenerTipoActivo(['Glucosa', 'PresionArterial'], 'PresionArterial'))
      .toBe('PresionArterial');
    expect(obtenerTipoActivo(['Glucosa'], 'Oxigeno')).toBe('Glucosa');
    expect(obtenerTipoActivo([], 'Oxigeno')).toBe('');
  });

  it('filtra mediciones por tipo', () => {
    expect(filtrarMedicionesPorTipo(historial, 'Glucosa')).toHaveLength(2);
    expect(filtrarMedicionesPorTipo(historial, 'PresionArterial')).toHaveLength(1);
  });
});
