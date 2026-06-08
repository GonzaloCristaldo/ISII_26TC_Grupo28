import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { crearGestorAlertasMedico } from '@/app/lib/crearDependencias';
import {
  ErrorApi,
  requerirMedicoApi,
  responderErrorApi,
} from '../../../../_lib/respuestasApi';

type ContextoRuta = {
  params: Promise<{
    alertaId: string;
  }>;
};

export async function PATCH(_request: Request, { params }: ContextoRuta) {
  try {
    const sesion = await requerirMedicoApi();
    const { alertaId } = await params;

    if (!alertaId) {
      throw new ErrorApi('Debe indicar la alerta a atender.', 400);
    }

    const gestor = crearGestorAlertasMedico();
    await gestor.descartarAlerta(alertaId, sesion.medicoId);

    revalidatePath('/medico/alertas');
    revalidatePath('/medico/dashboard');

    return NextResponse.json({
      message: 'Alerta atendida correctamente.',
      type: 'success',
    });
  } catch (error) {
    return responderErrorApi(
      error,
      'No se pudo atender la alerta.',
      'Error en PATCH /api/medico/alertas/[alertaId]/atender:',
    );
  }
}
