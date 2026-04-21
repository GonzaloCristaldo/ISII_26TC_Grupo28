'use server';

import { revalidatePath } from 'next/cache';
import { crearServicioPaciente } from '@/app/lib/composition';
import { requerirPaciente } from '@/app/lib/session';
import { Medicion } from '@/modelos/tipos';

/**
 * Server Action para registrar una medicion p/ paciente con sesion iniciada.
 */
export async function guardarMedicionAccion(formData: FormData) {
  const sesion = await requerirPaciente();
  const tipo_medicion = formData.get('tipo_medicion') as 'PresionArterial' | 'Glucosa';
  const valor = Number(formData.get('valor'));

  if (!tipo_medicion || Number.isNaN(valor)) {
    throw new Error('La medicion recibida es invalida.');
  }

  const nuevaMedicion: Medicion = {
    paciente_id: sesion.pacienteId!,
    tipo_medicion,
    valor,
    fecha: new Date(),
  };

  const servicio = crearServicioPaciente();

  await servicio.registrarNuevaMedicion(nuevaMedicion);

  revalidatePath('/medico/dashboard');
  revalidatePath('/paciente/nueva-medicion');
}
