import type { GrupoSanguineo } from '@/modelos/tipos';

export type DatosLogin = {
  username: string;
  password: string;
};

export type DatosRegistroMedico = {
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  especialidadId: string;
  numeroLicencia: string;
  username: string;
  password: string;
};

export type DatosRegistroPaciente = {
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  fechaNacimiento: string | null;
  grupoSanguineo: GrupoSanguineo | null;
  medicoResponsableId: string;
  username: string;
  password: string;
};

const GRUPOS_SANGUINEOS: GrupoSanguineo[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function validarUsername(username: string) {
  return /^[a-zA-Z0-9._-]{4,100}$/.test(username);
}

function validarPassword(password: string) {
  return password.length >= 8;
}

function validarEmailOpcional(email: string | null) {
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarFechaOpcional(fecha: string | null) {
  return !fecha || !Number.isNaN(new Date(`${fecha}T00:00:00`).getTime());
}

function validarGrupoSanguineoOpcional(grupo: GrupoSanguineo | null) {
  return !grupo || GRUPOS_SANGUINEOS.includes(grupo);
}

export function validarDatosLogin(datos: DatosLogin) {
  if (!datos.username || !datos.password) {
    throw new Error('Credenciales incompletas.');
  }
}

export function validarDatosRegistroMedico(datos: DatosRegistroMedico) {
  if (
    !datos.nombre ||
    !datos.apellido ||
    !datos.especialidadId ||
    !datos.numeroLicencia ||
    !datos.username ||
    !datos.password
  ) {
    throw new Error('Completa todos los campos obligatorios.');
  }

  if (!validarUsername(datos.username)) {
    throw new Error(
      'El usuario debe tener al menos 4 caracteres y solo usar letras, numeros, punto, guion o guion bajo.',
    );
  }

  if (!validarPassword(datos.password)) {
    throw new Error('La clave debe tener al menos 8 caracteres.');
  }

  if (!validarEmailOpcional(datos.email)) {
    throw new Error('El email indicado no es valido.');
  }
}

export function validarDatosRegistroPaciente(datos: DatosRegistroPaciente) {
  if (
    !datos.nombre ||
    !datos.apellido ||
    !datos.medicoResponsableId ||
    !datos.username ||
    !datos.password
  ) {
    throw new Error('Completa todos los campos obligatorios.');
  }

  if (!validarUsername(datos.username)) {
    throw new Error(
      'El usuario debe tener al menos 4 caracteres y solo usar letras, numeros, punto, guion o guion bajo.',
    );
  }

  if (!validarPassword(datos.password)) {
    throw new Error('La clave debe tener al menos 8 caracteres.');
  }

  if (!validarEmailOpcional(datos.email)) {
    throw new Error('El email indicado no es valido.');
  }

  if (!validarFechaOpcional(datos.fechaNacimiento)) {
    throw new Error('La fecha de nacimiento indicada no es valida.');
  }

  if (!validarGrupoSanguineoOpcional(datos.grupoSanguineo)) {
    throw new Error('El grupo sanguineo indicado no es valido.');
  }
}
