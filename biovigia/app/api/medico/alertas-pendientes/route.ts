import { NextResponse } from 'next/server';
import { crearGestorAlertasMedico } from '@/app/lib/crearDependencias';
import type { AlertaExtendida } from '@/modelos/tipos';
import { requerirMedicoApi, responderErrorApi } from '../../_lib/respuestasApi';

function serializarAlerta(alerta: AlertaExtendida) {
  return {
    alerta_id: alerta.alerta_id,
    medicion_id: alerta.medicion_id,
    estado_alerta: alerta.estado_alerta,
    leido_por_medico: alerta.leido_por_medico,
    fecha: alerta.fecha?.toISOString(),
    paciente_id: alerta.paciente_id,
    paciente_nombre: alerta.paciente_nombre,
    medicion_tipo: alerta.medicion_tipo,
    medicion_unidad: alerta.medicion_unidad,
    medicion_valor: alerta.medicion_valor,
    medicion_fecha: alerta.medicion_fecha.toISOString(),
  };
}

export async function GET() {
  try {
    const sesion = await requerirMedicoApi();
    const gestor = crearGestorAlertasMedico();
    const alertasPendientes = await gestor.revisarAlertasPendientes(sesion.medicoId);

    return NextResponse.json({
      alertasPendientes: alertasPendientes.map(serializarAlerta),
    });
  } catch (error) {
    return responderErrorApi(
      error,
      'No se pudieron obtener las alertas pendientes.',
      'Error en GET /api/medico/alertas-pendientes:',
    );
  }
}
