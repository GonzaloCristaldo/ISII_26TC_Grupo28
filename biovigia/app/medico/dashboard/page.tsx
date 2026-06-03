import Link from 'next/link';
import {
  crearGestorAlertasMedico,
  crearGestorConsultaTiposMedicion,
} from '@/app/lib/crearDependencias';
import { cerrarSesionAccion } from '@/app/auth/accionesAutenticacion';
import { requerirMedico } from '@/app/lib/session';
import type { AlertaExtendida, Medicion } from '@/modelos/tipos';
import PanelDashboardMedico from './PanelDashboardMedico';
import type {
  AlertaDashboard,
  MedicionDashboard,
  TipoMedicionDashboard,
} from './PanelDashboardMedico';

function serializarAlerta(alerta: AlertaExtendida): AlertaDashboard {
  return {
    id: alerta.id ?? alerta.medicion_id,
    medicion_id: alerta.medicion_id,
    estado_alerta: alerta.estado_alerta,
    leido_por_medico: alerta.leido_por_medico,
    fecha: alerta.fecha?.toISOString() ?? alerta.medicion_fecha.toISOString(),
    paciente_id: alerta.paciente_id,
    paciente_nombre: alerta.paciente_nombre,
    medicion_tipo: alerta.medicion_tipo,
    medicion_unidad: alerta.medicion_unidad,
    medicion_valor: alerta.medicion_valor,
    medicion_fecha: alerta.medicion_fecha.toISOString(),
  };
}

function serializarMedicion(medicion: Medicion): MedicionDashboard {
  return {
    id: medicion.id,
    paciente_id: medicion.paciente_id,
    tipo_medicion: medicion.tipo_medicion,
    valor: medicion.valor,
    fecha: medicion.fecha.toISOString(),
  };
}

/**
 * Capa de Presentacion: Dashboard del medico con sesion iniciada.
 */
export default async function MedicoDashboardPage() {
  const sesion = await requerirMedico();

  let alertasPendientes: AlertaExtendida[] = [];
  const historialPorPaciente: Record<string, MedicionDashboard[]> = {};
  let tiposMedicion: TipoMedicionDashboard[] = [];
  let mensajeError: string | null = null;

  try {
    const gestorAlertasMedico = crearGestorAlertasMedico();
    const gestorTiposMedicion = crearGestorConsultaTiposMedicion();
    alertasPendientes = await gestorAlertasMedico.revisarAlertasPendientes(sesion.medicoId!);
    tiposMedicion = (await gestorTiposMedicion.listarUmbrales()).map((umbral) => ({
      tipo_medicion: umbral.tipo_medicion,
      unidad: umbral.unidad,
    }));

    const pacientesConAlertas = Array.from(
      new Set(alertasPendientes.map((alerta) => alerta.paciente_id)),
    );

    await Promise.all(
      pacientesConAlertas.map(async (pacienteId) => {
        try {
          const historial = await gestorAlertasMedico.revisarHistorialPaciente(pacienteId);
          historialPorPaciente[pacienteId] = historial.map(serializarMedicion);
        } catch (errorHistorial) {
          console.error('Fallo obteniendo el historial del paciente:', errorHistorial);
          historialPorPaciente[pacienteId] = [];
        }
      }),
    );
  } catch (error) {
    mensajeError =
      error instanceof Error
        ? error.message
        : 'No se pudieron obtener las alertas para el medico autenticado.';
    console.error('Fallo obteniendo las alertas:', error);
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#e0f2fe_0%,#f0f9ff_55%,#ecfeff_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
              Panel medico
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">{sesion.nombreCompleto}</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Seguimiento activo de pacientes asignados y eventos pendientes de atencion.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-xl border border-slate-400 bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Volver al inicio
            </Link>
            <form action={cerrarSesionAccion}>
              <button
                type="submit"
                className="rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Cerrar sesion
              </button>
            </form>
          </div>
        </div>

        <div>
          {mensajeError ? (
            <div className="col-span-full rounded-2xl border border-rose-300 bg-[#fff4f2] px-6 py-5 text-rose-900">
              <h2 className="mb-2 text-lg font-semibold">No se pudo cargar el panel clinico</h2>
              <p className="text-sm">{mensajeError}</p>
            </div>
          ) : alertasPendientes.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-400 bg-[#f8f5ef] py-16 text-center text-slate-500">
              No hay eventos pendientes para revisar.
            </div>
          ) : (
            <PanelDashboardMedico
              alertasPendientes={alertasPendientes.map(serializarAlerta)}
              historialPorPaciente={historialPorPaciente}
              tiposMedicion={tiposMedicion}
            />
          )}
        </div>
      </div>
    </main>
  );
}
