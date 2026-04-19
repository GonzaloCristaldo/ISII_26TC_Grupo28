'use server';

import { revalidatePath } from 'next/cache';
import { crearServicioPaciente } from '@/app/_lib/composition';
import { Medicion } from '../../../modelos/tipos';
import { obtenerPacienteDemoId } from '../../../persistencia/postgres/contextoDemo';

/**
 * Server Action para registrar una medición.
 */
export async function guardarMedicionAccion(formData: FormData) {
  const tipo_medicion = formData.get('tipo_medicion') as 'PresionArterial' | 'Glucosa';
  const valor = Number(formData.get('valor'));

  if (!tipo_medicion || Number.isNaN(valor)) {
    throw new Error('La medición recibida es inválida.');
  }

  const pacienteId = await obtenerPacienteDemoId();

  const nuevaMedicion: Medicion = {
    paciente_id: pacienteId,
    tipo_medicion,
    valor,
    fecha: new Date(),
  };

  const servicio = crearServicioPaciente();

  await servicio.registrarNuevaMedicion(nuevaMedicion);

  revalidatePath('/medico/dashboard');
  revalidatePath('/paciente/nueva-medicion');
}
