'use server';

import { revalidatePath } from 'next/cache';
import { crearGestorRegistroMedicion } from '@/app/lib/crearDependencias';
import { requerirPaciente } from '@/app/lib/session';
import { Medicion } from '@/modelos/tipos';
import { validarDatosFormularioMedicion } from '@/logica/validadores/validadorFormularioMedicion';

function parsearDatosFormularioMedicion(formData: FormData) {
  return {
    tipo_medicion: String(formData.get('tipo_medicion') ?? ''),
    valor: Number(formData.get('valor')),
  };
}

/**
 * Server Action para registrar una medicion p/ paciente con sesion iniciada.
 */
export async function guardarMedicionAccion(prevState: any, formData: FormData) {
  try {
    const sesion = await requerirPaciente();
    const datosFormularioEntrada = parsearDatosFormularioMedicion(formData);
    const datosFormulario = validarDatosFormularioMedicion(datosFormularioEntrada);

    if (!datosFormulario.ok) {
      return datosFormulario;
    }

    const nuevaMedicion: Medicion = {
      paciente_id: sesion.pacienteId!,
      tipo_medicion: datosFormulario.tipo_medicion,
      valor: datosFormulario.valor,
      fecha: new Date(),
    };

    const gestor = crearGestorRegistroMedicion();

    await gestor.registrarNuevaMedicion(nuevaMedicion);

    revalidatePath('/medico/dashboard');
    revalidatePath('/paciente/nueva-medicion');

    return { message: 'Medicion registrada correctamente.', type: 'success' };
  } catch (error) {
    console.error('Error al registrar medicion:', error);
    const mensaje = error instanceof Error ? error.message : 'Hubo un error al registrar la medicion.';
    return { message: mensaje, type: 'error' };
  }
}
