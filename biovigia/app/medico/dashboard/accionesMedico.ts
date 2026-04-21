'use server';

import { revalidatePath } from 'next/cache';
import { crearServicioMedico } from '@/app/lib/composition';
import { requerirMedico } from '@/app/lib/session';

/**
 * Server Action para marcar una alerta como atendida usando el
 * medico autenticado en la sesion actual.
 */
export async function descartarAlertaAccion(alertaId: string) {
  const sesion = await requerirMedico();
  const servicio = crearServicioMedico();

  await servicio.descartarAlerta(alertaId, sesion.medicoId!);

  revalidatePath('/medico/dashboard');
}
