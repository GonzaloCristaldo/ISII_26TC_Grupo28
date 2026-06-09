import type { GrupoSanguineo, TipoMedicionNombre } from '@/modelos/tipos';

export type MedicionDashboardPaciente = {
  medicion_id?: string;
  paciente_id: string;
  tipo_medicion: TipoMedicionNombre;
  valor: number;
  fecha: string;
};

export type TipoMedicionDashboardPaciente = {
  tipo_medicion: TipoMedicionNombre;
  unidad: string;
};

export type PerfilDashboardPaciente = {
  paciente_id: string;
  nombreCompleto: string;
  email: string | null;
  telefono: string | null;
  fechaNacimiento: string | null;
  grupoSanguineo: GrupoSanguineo | null;
  medicoResponsable: {
    nombreCompleto: string;
    especialidad: string;
    numeroLicencia: string;
  };
};
