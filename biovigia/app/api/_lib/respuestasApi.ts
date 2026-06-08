import { NextResponse } from 'next/server';
import { obtenerSesionActual } from '@/app/lib/session';
import type { UsuarioSesion } from '@/modelos/tipos';

type SesionMedico = UsuarioSesion & { medicoId: string };
type SesionPaciente = UsuarioSesion & { pacienteId: string };

export class ErrorApi extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export async function requerirMedicoApi(): Promise<SesionMedico> {
  const sesion = await obtenerSesionActual();

  if (!sesion) {
    throw new ErrorApi('Sesion requerida.', 401);
  }

  if (sesion.rol !== 'medico') {
    throw new ErrorApi('Se requiere rol medico.', 403);
  }

  if (!sesion.medicoId) {
    throw new ErrorApi('La sesion no tiene medico asociado.', 401);
  }

  return sesion as SesionMedico;
}

export async function requerirPacienteApi(): Promise<SesionPaciente> {
  const sesion = await obtenerSesionActual();

  if (!sesion) {
    throw new ErrorApi('Sesion requerida.', 401);
  }

  if (sesion.rol !== 'paciente') {
    throw new ErrorApi('Se requiere rol paciente.', 403);
  }

  if (!sesion.pacienteId) {
    throw new ErrorApi('La sesion no tiene paciente asociado.', 401);
  }

  return sesion as SesionPaciente;
}

export function responderErrorApi(
  error: unknown,
  mensajeFallback: string,
  contexto: string,
) {
  if (!(error instanceof ErrorApi)) {
    console.error(contexto, error);
  }

  const status = error instanceof ErrorApi ? error.status : 500;
  const message = error instanceof Error ? error.message : mensajeFallback;

  return NextResponse.json({ message, type: 'error' }, { status });
}
