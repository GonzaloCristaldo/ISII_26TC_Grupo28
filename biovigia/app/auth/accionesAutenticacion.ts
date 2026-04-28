'use server';

import { redirect } from 'next/navigation';
import {
  buscarUsuarioPorUsername,
  registrarMedico,
  registrarPaciente,
} from '@/persistencia/postgres/usuariosAuth';
import { crearSesion, destruirSesion, obtenerSesionActual } from '@/app/lib/session';
import { generarPasswordHash, verificarPassword } from '@/app/lib/password';

function destinoPorRol(rol: 'medico' | 'paciente') {
  return rol === 'medico' ? '/medico/dashboard' : '/paciente/nueva-medicion';
}

function irAErrorLogin(mensaje: string): never {
  redirect(`/login?loginError=${encodeURIComponent(mensaje)}`);
}

function irAErrorRegistro(rol: 'medico' | 'paciente', mensaje: string): never {
  redirect(`/registro?registro=${rol}&registroError=${encodeURIComponent(mensaje)}`);
}

function validarUsername(username: string) {
  return /^[a-zA-Z0-9._-]{4,100}$/.test(username);
}

function validarPassword(password: string) {
  return password.length >= 8;
}

function esErrorUnico(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
}

export async function iniciarSesionAccion(formData: FormData) {
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!username || !password) {
    irAErrorLogin('Credenciales incompletas.');
  }

  const usuario = await buscarUsuarioPorUsername(username);

  if (!usuario || !verificarPassword(password, usuario.passwordHash)) {
    irAErrorLogin('Usuario o clave invalidos.');
  }

  await crearSesion({
    usuarioId: usuario.usuarioId,
    username: usuario.username,
    nombreCompleto: usuario.nombreCompleto,
    rol: usuario.rol,
    medicoId: usuario.medicoId,
    pacienteId: usuario.pacienteId,
  });

  redirect(destinoPorRol(usuario.rol));
}

export async function registrarMedicoAccion(formData: FormData) {
  const nombreCompleto = String(formData.get('nombre_completo') ?? '').trim();
  const especialidad = String(formData.get('especialidad') ?? '').trim();
  const numeroLicencia = String(formData.get('numero_licencia') ?? '').trim();
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!nombreCompleto || !especialidad || !numeroLicencia || !username || !password) {
    irAErrorRegistro('medico', 'Completa todos los campos obligatorios.');
  }

  if (!validarUsername(username)) {
    irAErrorRegistro('medico', 'El usuario debe tener al menos 4 caracteres y solo usar letras, numeros, punto, guion o guion bajo.');
  }

  if (!validarPassword(password)) {
    irAErrorRegistro('medico', 'La clave debe tener al menos 8 caracteres.');
  }

  try {
    const usuario = await registrarMedico({
      nombreCompleto,
      especialidad,
      numeroLicencia,
      username,
      passwordHash: generarPasswordHash(password),
    });

    await crearSesion({
      usuarioId: usuario.usuarioId,
      username: usuario.username,
      nombreCompleto: usuario.nombreCompleto,
      rol: usuario.rol,
      medicoId: usuario.medicoId,
      pacienteId: usuario.pacienteId,
    });
  } catch (error) {
    if (esErrorUnico(error)) {
      irAErrorRegistro('medico', 'El usuario o la licencia ya existen.');
    }

    irAErrorRegistro('medico', 'No se pudo crear la cuenta del medico.');
  }

  redirect('/medico/dashboard');
}

export async function registrarPacienteAccion(formData: FormData) {
  const nombreCompleto = String(formData.get('nombre_completo') ?? '').trim();
  const contacto = String(formData.get('contacto') ?? '').trim();
  const medicoResponsableId = String(formData.get('medico_responsable_id') ?? '').trim();
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!nombreCompleto || !contacto || !medicoResponsableId || !username || !password) {
    irAErrorRegistro('paciente', 'Completa todos los campos obligatorios.');
  }

  if (!validarUsername(username)) {
    irAErrorRegistro('paciente', 'El usuario debe tener al menos 4 caracteres y solo usar letras, numeros, punto, guion o guion bajo.');
  }

  if (!validarPassword(password)) {
    irAErrorRegistro('paciente', 'La clave debe tener al menos 8 caracteres.');
  }

  try {
    const usuario = await registrarPaciente({
      nombreCompleto,
      contacto,
      medicoResponsableId,
      username,
      passwordHash: generarPasswordHash(password),
    });

    await crearSesion({
      usuarioId: usuario.usuarioId,
      username: usuario.username,
      nombreCompleto: usuario.nombreCompleto,
      rol: usuario.rol,
      medicoId: usuario.medicoId,
      pacienteId: usuario.pacienteId,
    });
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
