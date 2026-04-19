'use server';

import { revalidatePath } from 'next/cache';
import { crearServicioMedico } from '@/app/_lib/composition';

/**
 * Server Action que permite marcar una alerta como atendida.
 */
export async function descartarAlertaAccion(alertaId: string) {
  const servicio = crearServicioMedico();

  await servicio.descartarAlerta(alertaId);

  revalidatePath('/medico/dashboard');
}
