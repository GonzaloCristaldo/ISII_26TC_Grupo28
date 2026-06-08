import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { crearGestorRegistroMedicion } from '@/app/lib/crearDependencias';
import { Medicion } from '@/modelos/tipos';
import { validarDatosFormularioMedicion } from '@/logica/validadores/validadorFormularioMedicion';
import {
  ErrorApi,
  requerirPacienteApi,
  responderErrorApi,
} from '../../_lib/respuestasApi';

type CuerpoMedicion = {
  tipo_medicion?: unknown;
  valor?: unknown;
  fecha?: unknown;
};

function esObjetoJson(valor: unknown): valor is CuerpoMedicion {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function obtenerFechaMedicion(fecha: unknown) {
  if (typeof fecha !== 'string' || fecha.trim() === '') {
    return new Date();
  }

  const fechaParseada = new Date(fecha);

  if (Number.isNaN(fechaParseada.getTime())) {
    throw new ErrorApi('La fecha indicada no es valida.', 400);
  }

  return fechaParseada;
}

async function leerCuerpoJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ErrorApi('El cuerpo de la solicitud debe ser JSON valido.', 400);
  }
}

export async function POST(request: Request) {
  try {
    const sesion = await requerirPacienteApi();
    const cuerpo = await leerCuerpoJson(request);

    if (!esObjetoJson(cuerpo)) {
      throw new ErrorApi('El cuerpo de la solicitud debe ser un objeto JSON.', 400);
    }

    const datosFormulario = validarDatosFormularioMedicion({
      tipo_medicion: String(cuerpo.tipo_medicion ?? ''),
      valor: Number(cuerpo.valor),
    });

    if (!datosFormulario.ok) {
      return NextResponse.json(datosFormulario, { status: 400 });
    }

    const nuevaMedicion: Medicion = {
      paciente_id: sesion.pacienteId,
      tipo_medicion: datosFormulario.tipo_medicion,
      valor: datosFormulario.valor,
      fecha: obtenerFechaMedicion(cuerpo.fecha),
    };

    const gestor = crearGestorRegistroMedicion();
    const resultado = await gestor.registrarNuevaMedicion(nuevaMedicion);

    revalidatePath('/medico/dashboard');
    revalidatePath('/paciente/nueva-medicion');
    revalidatePath('/paciente/dashboard');

    return NextResponse.json(
      {
        message: 'Medicion registrada correctamente.',
        type: 'success',
        medicion: {
          ...resultado.medicion,
          fecha: resultado.medicion.fecha.toISOString(),
        },
        alertaGenerada: resultado.alertaGenerada,
      },
      { status: 201 },
    );
  } catch (error) {
    return responderErrorApi(
      error,
      'Hubo un error al registrar la medicion.',
      'Error en POST /api/paciente/mediciones:',
    );
  }
}
