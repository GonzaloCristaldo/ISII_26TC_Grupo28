export type TipoEstadoMedicion = 'Normal' | 'Advertencia' | 'Critico';

export interface Paciente {
  id: string; // UUID
  nombre_completo: string;
  contacto: string;
  medico_responsable_id: string; // ID del Médico responsable
}

export interface Medico {
  id: string; // UUID
  especialidad: string;
  numero_licencia: string;
}

export interface Medicion {
  id?: string; // UUID (Opcional porque al crear no lo tenemos)
  paciente_id: string; // UUID
  tipo_medicion: 'PresionArterial' | 'Glucosa';
  valor: number;
  fecha: Date;
}

export interface Alerta {
  id?: string; // UUID
  medicion_id: string; // UUID de la medición que generó la alerta
  estado_alerta: TipoEstadoMedicion;
  leido_por_medico: boolean;
  fecha?: Date;
}

/**
 * Alerta con datos del Paciente y de la Medición
 * va a Vista del Médico)
 */
export interface AlertaExtendida extends Alerta {
  paciente_nombre: string;
  medicion_tipo: 'PresionArterial' | 'Glucosa';
  medicion_valor: number;
  medicion_fecha: Date;
}


export interface Umbral {
  id: string; // UUID
  tipo_medicion: 'PresionArterial' | 'Glucosa';
  valor_minimo_normal: number;
  valor_maximo_normal: number;
  valor_critico: number;
}