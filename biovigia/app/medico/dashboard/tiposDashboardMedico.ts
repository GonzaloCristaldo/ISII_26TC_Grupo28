import type { TipoEstadoMedicion, TipoMedicionNombre } from '@/modelos/tipos';

export type AlertaDashboard = {
  alerta_id: string;
  medicion_id: string;
  estado_alerta: TipoEstadoMedicion;
  leido_por_medico: boolean;
  fecha: string;
  paciente_id: string;
  paciente_nombre: string;
  medicion_tipo: TipoMedicionNombre;
  medicion_unidad: string;
  medicion_valor: number;
  medicion_fecha: string;
};

export type MedicionDashboard = {
  medicion_id?: string;
  paciente_id: string;
  tipo_medicion: TipoMedicionNombre;
  valor: number;
  fecha: string;
};

export type TipoMedicionDashboard = {
  tipo_medicion: TipoMedicionNombre;
  unidad: string;
};

export type PacienteDashboard = {
  paciente_id: string;
  nombreCompleto: string;
  contacto: string | null;
};

export type FiltroEstadoDashboard = 'Todos' | TipoEstadoMedicion;
export type FiltroPacientesDashboard = 'Todos' | 'ConAlertas' | 'Criticos' | 'SinAlertas';

export type ResumenCriticidad = {
  totalCriticas: number;
  totalAdvertencias: number;
};
