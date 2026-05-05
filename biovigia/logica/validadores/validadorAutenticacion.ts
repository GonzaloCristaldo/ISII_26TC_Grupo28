export type DatosLogin = {
  username: string;
  password: string;
};

export type DatosRegistroMedico = {
  nombreCompleto: string;
  especialidad: string;
  numeroLicencia: string;
  username: string;
  password: string;
};

export type DatosRegistroPaciente = {
  nombreCompleto: string;
  contacto: string;
  medicoResponsableId: string;
  username: string;
  password: string;
};

function validarUsername(username: string) {
  return /^[a-zA-Z0-9._-]{4,100}$/.test(username);
}

function validarPassword(password: string) {
  return password.length >= 8;
}

export function validarDatosLogin(datos: DatosLogin) {
  if (!datos.username || !datos.password) {
    throw new Error('Credenciales incompletas.');
  }
}

export function validarDatosRegistroMedico(datos: DatosRegistroMedico) {
  if (
    !datos.nombreCompleto ||
    !datos.especialidad ||
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
}

export function validarDatosRegistroPaciente(datos: DatosRegistroPaciente) {
  if (
    !datos.nombreCompleto ||
    !datos.contacto ||
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
}
