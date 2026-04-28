'use server';

import { revalidatePath } from 'next/cache';
import { crearGestorRegistroMedicion } from '@/app/lib/crearDependencias';
import { requerirPaciente } from '@/app/lib/session';
import { Medicion } from '@/modelos/tipos';

type ResultadoFormularioMedicion =
  | {
      ok: true;
      tipo_medicion: 'PresionArterial' | 'Glucosa';
      valor: number;
    }
  | {
      ok: false;
      message: string;
      type: 'error';
    };

function validarDatosFormularioMedicion(formData: FormData): ResultadoFormularioMedicion {
  const tipo_medicion = formData.get('tipo_medicion');
  const valor = Number(formData.get('valor'));

  if (
    (tipo_medicion !== 'PresionArterial' && tipo_medicion !== 'Glucosa') ||
    Number.isNaN(valor)
  ) {
    return {
      ok: false,
      message: 'La medicion recibida es invalida.',
      type: 'error',
    };
  }

  return {
    ok: true,
    tipo_medicion,
    valor,
  };
}

/**
 * Server Action para registrar una medicion p/ paciente con sesion iniciada.
 */
export async function guardarMedicionAccion(prevState: any, formData: FormData) {
  try {
    const sesion = await requerirPaciente();
    const datosFormulario = validarDatosFormularioMedicion(formData);

    if (!datosFormulario.ok) {
      return datosFormulario;
    }

    const nuevaMedicion: Medicion = {
      paciente_id: sesion.pacienteId!,
      tipo_medicion: datosFormulario.tipo_medicion,
      valor: datosFormulario.valor,
      fecha: new Date(),
    };

    const servicio = crearGestorRegistroMedicion();

    await servicio.registrarNuevaMedicion(nuevaMedicion);

    revalidatePath('/medico/dashboard');
    revalidatePath('/paciente/nueva-medicion');

    return { message: 'Medicion registrada correctamente.', type: 'success' };
  } catch (error) {
    console.error('Error al registrar medicion:', error);
    const mensaje = error instanceof Error ? error.message : 'Hubo un error al registrar la medicion.';
    return { message: mensaje, type: 'error' };
  }
}
