import 'server-only';

import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { RolUsuario, UsuarioSesion } from '@/modelos/tipos';

const COOKIE_SESION = 'biovigia_session';
const DURACION_SESION_SEGUNDOS = 60 * 60 * 8;

type PayloadSesion = UsuarioSesion & {
  exp: number;
};

function obtenerSecretoSesion() {
  return process.env.SESSION_SECRET ?? 'biovigia-dev-secret';
}

function firmar(payloadCodificado: string) {
  return createHmac('sha256', obtenerSecretoSesion())
    .update(payloadCodificado)
    .digest('base64url');
}

function codificar(payload: PayloadSesion) {
  const json = JSON.stringify(payload);
  const payloadCodificado = Buffer.from(json).toString('base64url');
  const firma = firmar(payloadCodificado);

  return `${payloadCodificado}.${firma}`;
}

function decodificar(token: string): PayloadSesion | null {
  const [payloadCodificado, firmaRecibida] = token.split('.');

  if (!payloadCodificado || !firmaRecibida) {
    return null;
  }

  const firmaEsperada = firmar(payloadCodificado);
  const bufferEsperado = Buffer.from(firmaEsperada);
  const bufferRecibido = Buffer.from(firmaRecibida);

  if (
    bufferEsperado.length !== bufferRecibido.length ||
    !timingSafeEqual(bufferEsperado, bufferRecibido)
  ) {
    return null;
  }

  try {
    const json = Buffer.from(payloadCodificado, 'base64url').toString('utf-8');
    const payload = JSON.parse(json) as PayloadSesion;

    if (payload.exp <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function crearSesion(usuario: UsuarioSesion) {
  const payload: PayloadSesion = {
    ...usuario,
    exp: Date.now() + DURACION_SESION_SEGUNDOS * 1000,
  };

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_SESION, codificar(payload), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DURACION_SESION_SEGUNDOS,
  });
}

export async function destruirSesion() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_SESION);
}

export async function obtenerSesionActual(): Promise<UsuarioSesion | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESION)?.value;

  if (!token) {
    return null;
  }

  const payload = decodificar(token);

  if (!payload) {
    return null;
  }

  return {
    usuarioId: payload.usuarioId,
    username: payload.username,
    nombreCompleto: payload.nombreCompleto,
    rol: payload.rol,
    medicoId: payload.medicoId,
    pacienteId: payload.pacienteId,
  };
}

export async function requerirSesion() {
  const sesion = await obtenerSesionActual();

  if (!sesion) {
    redirect('/login');
  }

  return sesion;
}

export async function requerirRol(rol: RolUsuario) {
  const sesion = await requerirSesion();

  if (sesion.rol !== rol) {
    redirect('/');
  }

  return sesion;
}

export async function requerirPaciente() {
  const sesion = await requerirRol('paciente');

  if (!sesion.pacienteId) {
    redirect('/login');
  }

  return sesion;
}

export async function requerirMedico() {
  const sesion = await requerirRol('medico');

  if (!sesion.medicoId) {
    redirect('/login');
  }

  return sesion;
}
