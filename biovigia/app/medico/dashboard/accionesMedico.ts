'use server';

import { revalidatePath } from 'next/cache';
import { crearGestorAlertasMedico } from '@/app/lib/crearDependencias';
import { requerirMedico } from '@/app/lib/session';

/**
 * Server Action para marcar una alerta como atendida usando el
 * medico autenticado en la sesion actual.
 * Se puede ampliar para permitir otras acciones como descartar
 * u otras interacciones con la alerta/paciente.
 */
export async function descartarAlertaAccion(alertaId: string) {
  const sesion = await requerirMedico();
  const servicio = crearGestorAlertasMedico();

  await servicio.descartarAlerta(alertaId, sesion.medicoId!);

  revalidatePath('/medico/dashboard');
}
