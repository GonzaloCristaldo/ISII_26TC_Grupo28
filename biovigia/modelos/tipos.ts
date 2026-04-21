export type TipoEstadoMedicion = 'Normal' | 'Advertencia' | 'Critico';
export type TipoMedicionNombre = 'PresionArterial' | 'Glucosa';
export type RolUsuario = 'medico' | 'paciente';

export interface Paciente {
  id: string;
  nombre_completo: string;
  contacto: string | null;
  medico_responsable_id: string;
}

export interface Medico {
  id: string;
  nombre_completo: string;
  especialidad: string;
  numero_licencia: string;
}

export interface Medicion {
  id?: string;
  paciente_id: string;
  tipo_medicion: TipoMedicionNombre;
  valor: number;
  fecha: Date;
}

export interface Alerta {
  id?: string;
  medicion_id: string;
  estado_alerta: TipoEstadoMedicion;
  leido_por_medico: boolean;
  fecha?: Date;
}

export interface AlertaExtendida extends Alerta {
  paciente_nombre: string;
  medicion_tipo: TipoMedicionNombre;
  medicion_valor: number;
  medicion_fecha: Date;
}

export interface Umbral {
  tipo_medicion_id: string;
  tipo_medicion: TipoMedicionNombre;
  unidad: string;
  valor_minimo_normal: number;
  valor_maximo_normal: number;
  valor_critico: number;
}

export interface UsuarioSesion {
  usuarioId: string;
  username: string;
  nombreCompleto: string;
  rol: RolUsuario;
  medicoId: string | null;
  pacienteId: string | null;
}
