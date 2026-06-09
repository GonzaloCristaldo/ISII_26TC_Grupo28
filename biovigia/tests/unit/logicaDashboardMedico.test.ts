import { describe, expect, it } from 'vitest';
import {
  calcularPacientesAfectados,
  calcularResumenCriticidad,
  filtrarAlertasDashboard,
  filtrarPacientesDashboard,
  obtenerEstadoPrioritarioPaciente,
  ordenarAlertasPorPrioridad,
} from '../../app/medico/dashboard/logicaDashboardMedico';
import type {
  AlertaDashboard,
  PacienteDashboard,
} from '../../app/medico/dashboard/tiposDashboardMedico';

const alertas: AlertaDashboard[] = [
  {
    alerta_id: 'alerta-advertencia',
    medicion_id: 'medicion-1',
    estado_alerta: 'Advertencia',
    leido_por_medico: false,
    fecha: '2026-06-09T08:00:00.000Z',
    paciente_id: 'paciente-1',
    paciente_nombre: 'Ana Gomez',
    medicion_tipo: 'Glucosa',
    medicion_unidad: 'mg/dL',
    medicion_valor: 150,
    medicion_fecha: '2026-06-09T08:00:00.000Z',
  },
  {
    alerta_id: 'alerta-critica',
    medicion_id: 'medicion-2',
    estado_alerta: 'Critico',
    leido_por_medico: false,
    fecha: '2026-06-09T09:00:00.000Z',
    paciente_id: 'paciente-2',
    paciente_nombre: 'Luis Perez',
    medicion_tipo: 'PresionArterial',
    medicion_unidad: 'mmHg',
    medicion_valor: 220,
    medicion_fecha: '2026-06-09T09:00:00.000Z',
  },
];

const pacientes: PacienteDashboard[] = [
  {
    paciente_id: 'paciente-1',
    nombreCompleto: 'Ana Gomez',
    email: 'ana@example.com',
    telefono: null,
    fechaNacimiento: null,
    grupoSanguineo: 'A+',
  },
  {
    paciente_id: 'paciente-2',
    nombreCompleto: 'Luis Perez',
    email: null,
    telefono: '112233',
    fechaNacimiento: null,
    grupoSanguineo: 'O-',
  },
  {
    paciente_id: 'paciente-3',
    nombreCompleto: 'Maria Sin Alertas',
    email: null,
    telefono: null,
    fechaNacimiento: null,
    grupoSanguineo: null,
  },
];

describe('logicaDashboardMedico', () => {
  it('ordena las alertas colocando primero las criticas', () => {
    expect(ordenarAlertasPorPrioridad(alertas).map((alerta) => alerta.alerta_id))
      .toEqual(['alerta-critica', 'alerta-advertencia']);
  });

  it('filtra alertas por estado y busqueda', () => {
    expect(filtrarAlertasDashboard(alertas, 'Critico', 'presion')).toHaveLength(1);
    expect(filtrarAlertasDashboard(alertas, 'Todos', 'ana')[0].paciente_nombre).toBe('Ana Gomez');
  });

  it('calcula resumen de criticidad y pacientes afectados', () => {
    expect(calcularResumenCriticidad(alertas)).toEqual({
      totalCriticas: 1,
      totalAdvertencias: 1,
    });
    expect(calcularPacientesAfectados(alertas)).toBe(2);
  });

  it('obtiene el estado prioritario de un paciente', () => {
    expect(obtenerEstadoPrioritarioPaciente(alertas, 'paciente-2')).toBe('Critico');
    expect(obtenerEstadoPrioritarioPaciente(alertas, 'paciente-3')).toBeNull();
  });

  it('filtra pacientes por estado de alertas y busqueda', () => {
    expect(filtrarPacientesDashboard(pacientes, alertas, 'Criticos', '')).toHaveLength(1);
    expect(filtrarPacientesDashboard(pacientes, alertas, 'SinAlertas', '')[0].paciente_id)
      .toBe('paciente-3');
    expect(filtrarPacientesDashboard(pacientes, alertas, 'Todos', 'O-')[0].paciente_id)
      .toBe('paciente-2');
  });
});
