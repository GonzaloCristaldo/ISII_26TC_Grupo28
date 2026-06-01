import Link from 'next/link';
import { cerrarSesionAccion } from '@/app/auth/accionesAutenticacion';
import { crearGestorAlertasMedico } from '@/app/lib/crearDependencias';
import { requerirMedico } from '@/app/lib/session';
import type { AlertaExtendida } from '@/modelos/tipos';
import BotonLeido from '../dashboard/BotonLeido';

function obtenerUnidadMedicion(tipo: AlertaExtendida['medicion_tipo']) {
  switch (tipo) {
    case 'PresionArterial':
      return 'mmHg';
    case 'Glucosa':
      return 'mg/dL';
    default:
      return tipo;
  }
}

function obtenerNombreMedicion(tipo: AlertaExtendida['medicion_tipo']) {
  switch (tipo) {
    case 'PresionArterial':
      return 'Presion arterial';
    case 'Glucosa':
      return 'Glucosa';
    default:
      return tipo;
  }
}

/**
 * Capa de Presentacion: listado simple de alertas pendientes del medico.
 */
export default async function AlertasPendientesPage() {
  const sesion = await requerirMedico();

  let alertasPendientes: AlertaExtendida[] = [];
  let mensajeError: string | null = null;

  try {
    const gestorAlertasMedico = crearGestorAlertasMedico();
    alertasPendientes = await gestorAlertasMedico.revisarAlertasPendientes(sesion.medicoId!);
  } catch (error) {
    mensajeError =
      error instanceof Error
        ? error.message
        : 'No se pudieron obtener las alertas para el medico autenticado.';
    console.error('Fallo obteniendo las alertas:', error);
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#e0f2fe_0%,#f0f9ff_55%,#ecfeff_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
              Alertas pendientes
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">{sesion.nombreCompleto}</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Eventos pendientes de atencion de tus pacientes asignados.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-xl border border-slate-400 bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Volver al inicio
            </Link>
            <Link
              href="/medico/dashboard"
              className="rounded-xl border border-slate-400 bg-[#f8fafc] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Ver dashboard detallado
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {mensajeError ? (
            <div className="col-span-full rounded-2xl border border-rose-300 bg-[#fff4f2] px-6 py-5 text-rose-900">
              <h2 className="mb-2 text-lg font-semibold">No se pudo cargar el panel clinico</h2>
              <p className="text-sm">{mensajeError}</p>
            </div>
          ) : alertasPendientes.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-400 bg-[#f8fafc] py-16 text-center text-slate-500">
              No hay eventos pendientes para revisar.
            </div>
          ) : (
            alertasPendientes.map((alerta) => {
              const esCritico = alerta.estado_alerta === 'Critico';

              return (
                <article
                  key={alerta.id}
                  className="rounded-2xl border border-slate-300 bg-[#f8fafc] p-6"
                >
                  <div className="flex h-full flex-col">
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                          Paciente asignado
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                          {alerta.paciente_nombre}
                        </h2>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-xs font-semibold uppercase tracking-[0.28em] ${
                            esCritico ? 'text-rose-800' : 'text-amber-800'
                          }`}
                        >
                          {esCritico ? 'Critico' : 'Advertencia'}
                        </p>
                        <p className="mt-2 font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
                          {alerta.medicion_fecha.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-6 py-6 md:grid-cols-[minmax(0,1fr)_220px] md:items-stretch">
                      <div className="flex min-h-44 flex-col justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">
                            {obtenerNombreMedicion(alerta.medicion_tipo)}
                          </p>
                          <div className="mt-4 flex items-end gap-3">
                            <span className="text-5xl font-semibold tracking-[-0.05em] text-slate-950">
                              {alerta.medicion_valor}
                            </span>
                            <span className="pb-2 font-mono text-sm font-semibold tracking-[0.2em] text-slate-500">
                              {obtenerUnidadMedicion(alerta.medicion_tipo)}
                            </span>
                          </div>
                        </div>

                        <div className="pt-6 font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
                          Medicion ingresada por el paciente.
                        </div>
                      </div>

                      <div
                        className={`flex min-h-44 flex-col justify-between rounded-2xl p-5 text-white ${
                          esCritico ? 'bg-rose-700' : 'bg-amber-600'
                        }`}
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                          Estado actual
                        </p>
                        <div className="py-4">
                          <p className="text-2xl font-semibold">
                            {alerta.estado_alerta}
                          </p>
                        </div>
                        <div className="flex justify-start">
                          <BotonLeido alertaId={alerta.id!} />
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
