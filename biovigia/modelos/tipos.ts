export type TipoEstadoMedicion = 'Normal' | 'Advertencia' | 'Critico';
export type TipoMedicionNombre = string;
export type RolUsuario = 'medico' | 'paciente' | 'administrador';
export type GrupoSanguineo = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Especialidad {
  especialidad_id: string;
  nombre: string;
  activa: boolean;
  creado_en: Date;
}

export interface TipoMedicion {
  tipo_medicion_id: string;
  nombre: TipoMedicionNombre;
  unidad: string;
}

export interface Paciente {
  paciente_id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  medico_id: string;
  fecha_nacimiento: Date | null;
  grupo_sanguineo: GrupoSanguineo | null;
}

export interface Medico {
  medico_id: string;
  especialidad_id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  especialidad: string;
  numero_licencia: string;
}

export interface PacienteConMedicoResponsable extends Paciente {
  medico_responsable: Medico;
}

export interface Medicion {
  medicion_id?: string;
  paciente_id: string;
  tipo_medicion: TipoMedicionNombre;
  valor: number;
  fecha: Date;
}

export interface Alerta {
  alerta_id?: string;
  medicion_id: string;
  estado_alerta: TipoEstadoMedicion;
  leido_por_medico: boolean;
  fecha?: Date;
}

export interface AlertaExtendida extends Alerta {
  paciente_id: string;
  paciente_nombre: string;
  medicion_tipo: TipoMedicionNombre;
  medicion_unidad: string;
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
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  username: string;
  nombreCompleto: string;
  rol: RolUsuario;
  medicoId: string | null;
  pacienteId: string | null;
}

export interface UsuarioAutenticable extends UsuarioSesion {
  passwordHash: string;
}

export interface UsuarioAdministrable extends UsuarioSesion {
  activo: boolean;
  creadoEn: Date;
  especialidadId: string | null;
  especialidad: string | null;
  numeroLicencia: string | null;
  fechaNacimiento: Date | null;
  grupoSanguineo: GrupoSanguineo | null;
  medicoResponsableId: string | null;
  medicoResponsableNombre: string | null;
}

export interface MedicoRegistrable {
  medico_id: string;
  especialidad_id: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  email: string | null;
  telefono: string | null;
  especialidad: string;
}

export interface DatosCuentaMedico {
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  especialidadId: string;
  numeroLicencia: string;
  username: string;
  passwordHash: string;
}

export interface DatosCuentaPaciente {
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  fechaNacimiento: string | null;
  grupoSanguineo: GrupoSanguineo | null;
  medicoResponsableId: string;
  username: string;
  passwordHash: string;
}

export interface DatosEdicionMedico {
  medicoId: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  especialidadId: string;
  numeroLicencia: string;
}

export interface DatosEspecialidad {
  nombre: string;
}

export interface DatosEdicionPaciente {
  pacienteId: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  fechaNacimiento: string | null;
  grupoSanguineo: GrupoSanguineo | null;
  medicoResponsableId: string;
}

export interface TipoMedicionConUmbral extends TipoMedicion {
  valor_minimo_normal: number;
  valor_maximo_normal: number;
  valor_critico: number;
}

export interface DatosTipoMedicionConUmbral {
  nombre: string;
  unidad: string;
  valor_minimo_normal: number;
  valor_maximo_normal: number;
  valor_critico: number;
}

export interface DatosActualizacionTipoMedicionConUmbral extends DatosTipoMedicionConUmbral {
  tipoMedicionId: string;
}

export interface DatosDashboardPaciente {
  paciente: PacienteConMedicoResponsable;
  historial: Medicion[];
  umbrales: Umbral[];
}
