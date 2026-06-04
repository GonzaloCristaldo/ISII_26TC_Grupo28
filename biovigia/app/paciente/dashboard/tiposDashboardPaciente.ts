import type { TipoMedicionNombre } from '@/modelos/tipos';

export type MedicionDashboardPaciente = {
  id?: string;
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
  id: string;
  nombreCompleto: string;
  contacto: string | null;
  medicoResponsable: {
    nombreCompleto: string;
    especialidad: string;
    numeroLicencia: string;
  };
};
