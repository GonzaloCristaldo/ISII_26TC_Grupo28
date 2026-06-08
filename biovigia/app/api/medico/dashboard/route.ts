import { NextResponse } from 'next/server';
import {
  crearGestorAlertasMedico,
  crearGestorConsultaTiposMedicion,
  crearGestorPacientesMedico,
} from '@/app/lib/crearDependencias';
import type { AlertaExtendida, Medicion, Paciente, Umbral } from '@/modelos/tipos';
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

function serializarMedicion(medicion: Medicion) {
  return {
    medicion_id: medicion.medicion_id,
    paciente_id: medicion.paciente_id,
    tipo_medicion: medicion.tipo_medicion,
    valor: medicion.valor,
    fecha: medicion.fecha.toISOString(),
  };
}

function serializarPaciente(paciente: Paciente) {
  return {
    paciente_id: paciente.paciente_id,
    nombre_completo: paciente.nombre_completo,
    contacto: paciente.contacto,
    medico_id: paciente.medico_id,
  };
}

function serializarTipoMedicion(umbral: Umbral) {
  return {
    tipo_medicion_id: umbral.tipo_medicion_id,
    tipo_medicion: umbral.tipo_medicion,
    unidad: umbral.unidad,
    valor_minimo_normal: umbral.valor_minimo_normal,
    valor_maximo_normal: umbral.valor_maximo_normal,
    valor_critico: umbral.valor_critico,
  };
}

export async function GET() {
  try {
    const sesion = await requerirMedicoApi();
    const gestorAlertasMedico = crearGestorAlertasMedico();
    const gestorTiposMedicion = crearGestorConsultaTiposMedicion();
    const gestorPacientesMedico = crearGestorPacientesMedico();

    const [alertasPendientes, umbrales, pacientesAsignados] = await Promise.all([
      gestorAlertasMedico.revisarAlertasPendientes(sesion.medicoId),
      gestorTiposMedicion.listarUmbrales(),
      gestorPacientesMedico.listarPacientesAsignados(sesion.medicoId),
    ]);

    const historialPorPaciente: Record<string, ReturnType<typeof serializarMedicion>[]> = {};

    await Promise.all(
      pacientesAsignados.map(async (paciente) => {
        const historial = await gestorAlertasMedico.revisarHistorialPaciente(paciente.paciente_id);
        historialPorPaciente[paciente.paciente_id] = historial.map(serializarMedicion);
      }),
    );

    return NextResponse.json({
      medico: {
        medicoId: sesion.medicoId,
        nombreCompleto: sesion.nombreCompleto,
      },
      alertasPendientes: alertasPendientes.map(serializarAlerta),
      tiposMedicion: umbrales.map(serializarTipoMedicion),
      pacientesAsignados: pacientesAsignados.map(serializarPaciente),
      historialPorPaciente,
    });
  } catch (error) {
    return responderErrorApi(
      error,
      'No se pudo obtener el dashboard medico.',
      'Error en GET /api/medico/dashboard:',
    );
  }
}
