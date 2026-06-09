'use server';

import { redirect } from 'next/navigation';
import { crearGestorAutenticacion } from '@/app/lib/crearDependencias';
import { destinoPorRol } from '@/app/lib/destinos';
import { crearSesion, destruirSesion, obtenerSesionActual } from '@/app/lib/session';
import { esErrorUnico } from '@/logica/errores/erroresPersistencia';
import type { GrupoSanguineo } from '@/modelos/tipos';
import {
  validarDatosLogin,
  validarDatosRegistroMedico,
  validarDatosRegistroPaciente,
} from '@/logica/validadores/validadorAutenticacion';

function irAErrorLogin(mensaje: string): never {
  redirect(`/login?loginError=${encodeURIComponent(mensaje)}`);
}

function irAErrorRegistro(rol: 'medico' | 'paciente', mensaje: string): never {
  redirect(`/registro?registro=${rol}&registroError=${encodeURIComponent(mensaje)}`);
}

function parsearDatosLogin(formData: FormData) {
  return {
    username: String(formData.get('username') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
  };
}

function parsearDatosRegistroMedico(formData: FormData) {
  return {
    nombre: String(formData.get('nombre') ?? '').trim(),
    apellido: String(formData.get('apellido') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim() || null,
    telefono: String(formData.get('telefono') ?? '').trim() || null,
    especialidadId: String(formData.get('especialidad_id') ?? '').trim(),
    numeroLicencia: String(formData.get('numero_licencia') ?? '').trim(),
    username: String(formData.get('username') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
  };
}

function parsearDatosRegistroPaciente(formData: FormData) {
  return {
    nombre: String(formData.get('nombre') ?? '').trim(),
    apellido: String(formData.get('apellido') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim() || null,
    telefono: String(formData.get('telefono') ?? '').trim() || null,
    fechaNacimiento: String(formData.get('fecha_nacimiento') ?? '').trim() || null,
    grupoSanguineo: (String(formData.get('grupo_sanguineo') ?? '').trim() || null) as GrupoSanguineo | null,
    medicoResponsableId: String(formData.get('medico_id') ?? '').trim(),
    username: String(formData.get('username') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
  };
}

export async function iniciarSesionAccion(formData: FormData) {
  const datosLogin = parsearDatosLogin(formData);
  let destino: string;

  try {
    validarDatosLogin(datosLogin);
    const gestor = crearGestorAutenticacion();
    const usuario = await gestor.iniciarSesionConCredenciales(datosLogin);

    await crearSesion(usuario);
    destino = destinoPorRol(usuario.rol);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No fue posible iniciar sesion.';
    irAErrorLogin(mensaje);
  }

  redirect(destino);
}

export async function registrarMedicoAccion(formData: FormData) {
  const datosRegistro = parsearDatosRegistroMedico(formData);

  try {
    validarDatosRegistroMedico(datosRegistro);
    const gestor = crearGestorAutenticacion();
    const usuario = await gestor.registrarCuentaMedico(datosRegistro);

    await crearSesion(usuario);
  } catch (error) {
    if (esErrorUnico(error)) {
      irAErrorRegistro('medico', 'El usuario o la licencia ya existen.');
    }

    irAErrorRegistro('medico', 'No se pudo crear la cuenta del medico.');
  }

  redirect('/');
}

export async function registrarPacienteAccion(formData: FormData) {
  const datosRegistro = parsearDatosRegistroPaciente(formData);

  try {
    validarDatosRegistroPaciente(datosRegistro);
    const gestor = crearGestorAutenticacion();
    const usuario = await gestor.registrarCuentaPaciente(datosRegistro);

    await crearSesion(usuario);
  } catch (error) {
    if (esErrorUnico(error)) {
      irAErrorRegistro('paciente', 'El usuario ya existe.');
    }

    irAErrorRegistro('paciente', 'No se pudo crear la cuenta del paciente.');
  }

  redirect('/paciente/nueva-medicion');
}

export async function cerrarSesionAccion() {
  await destruirSesion();
  redirect('/login');
}

export async function redirigirSiHaySesion() {
  const sesion = await obtenerSesionActual();

  if (!sesion) {
    return;
  }

  redirect(destinoPorRol(sesion.rol));
}
