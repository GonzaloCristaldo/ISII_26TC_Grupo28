import Link from 'next/link';
import {
  crearGestorAlertasMedico,
  crearGestorConsultaTiposMedicion,
  crearGestorPacientesMedico,
} from '@/app/lib/crearDependencias';
import { cerrarSesionAccion } from '@/app/auth/accionesAutenticacion';
import { requerirMedico } from '@/app/lib/session';
import type { AlertaExtendida, Medicion, Paciente } from '@/modelos/tipos';
import PanelDashboardMedico from './PanelDashboardMedico';
import type {
  AlertaDashboard,
  MedicionDashboard,
  PacienteDashboard,
  TipoMedicionDashboard,
} from './tiposDashboardMedico';

function serializarAlerta(alerta: AlertaExtendida): AlertaDashboard {
  return {
    alerta_id: alerta.alerta_id ?? alerta.medicion_id,
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
    medicion_id: medicion.medicion_id,
    paciente_id: medicion.paciente_id,
    tipo_medicion: medicion.tipo_medicion,
    valor: medicion.valor,
    fecha: medicion.fecha.toISOString(),
  };
}

function serializarPaciente(paciente: Paciente): PacienteDashboard {
  return {
    paciente_id: paciente.paciente_id,
    nombreCompleto: paciente.nombre_completo,
    contacto: paciente.contacto,
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
  let pacientesAsignados: PacienteDashboard[] = [];
  let mensajeError: string | null = null;

  try {
    const gestorAlertasMedico = crearGestorAlertasMedico();
    const gestorTiposMedicion = crearGestorConsultaTiposMedicion();
    const gestorPacientesMedico = crearGestorPacientesMedico();
    const [alertas, umbrales, pacientes] = await Promise.all([
      gestorAlertasMedico.revisarAlertasPendientes(sesion.medicoId!),
      gestorTiposMedicion.listarUmbrales(),
      gestorPacientesMedico.listarPacientesAsignados(sesion.medicoId!),
    ]);

    alertasPendientes = alertas;
    tiposMedicion = umbrales.map((umbral) => ({
      tipo_medicion: umbral.tipo_medicion,
      unidad: umbral.unidad,
    }));
    pacientesAsignados = pacientes.map(serializarPaciente);

    await Promise.all(
      pacientesAsignados.map(async (paciente) => {
        try {
          const historial = await gestorAlertasMedico.revisarHistorialPaciente(paciente.paciente_id);
          historialPorPaciente[paciente.paciente_id] = historial.map(serializarMedicion);
        } catch (errorHistorial) {
          console.error('Fallo obteniendo el historial del paciente:', errorHistorial);
          historialPorPaciente[paciente.paciente_id] = [];
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
          ) : (
            <PanelDashboardMedico
              alertasPendientes={alertasPendientes.map(serializarAlerta)}
              historialPorPaciente={historialPorPaciente}
              pacientesAsignados={pacientesAsignados}
              tiposMedicion={tiposMedicion}
            />
          )}
        </div>
      </div>
    </main>
  );
}
