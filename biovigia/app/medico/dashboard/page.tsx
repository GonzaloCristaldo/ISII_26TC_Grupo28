import Link from 'next/link';
import { crearGestorAlertasMedico } from '@/app/lib/crearDependencias';
import { cerrarSesionAccion } from '@/app/auth/accionesAutenticacion';
import { requerirMedico } from '@/app/lib/session';
import BotonLeido from './BotonLeido';
import { AlertaExtendida } from '@/modelos/tipos';

/**
 * Capa de Presentación: Dashboard del medico con sesion iniciada.
 */
export default async function MedicoDashboardPage() {
  const sesion = await requerirMedico();

  let alertasPendientes: AlertaExtendida[] = [];
  let mensajeError: string | null = null;

  try {
    const GestorAlertasMedico = crearGestorAlertasMedico();
    alertasPendientes = await GestorAlertasMedico.revisarAlertasPendientes(sesion.medicoId!);
  } catch (error) {
    mensajeError =
      error instanceof Error
        ? error.message
        : 'No se pudieron obtener las alertas para el medico autenticado.';
    console.error('Fallo obteniendo las alertas:', error);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-700">
              Panel medico
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{sesion.nombreCompleto}</h1>
            <p className="mt-2 text-slate-500">Alertas pendientes de tus pacientes asignados.</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            >
              Volver al inicio
            </Link>
            <form action={cerrarSesionAccion}>
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Cerrar sesion
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {mensajeError ? (
            <div className="col-span-full rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-rose-800">
              <h2 className="mb-2 text-lg font-semibold">No se pudo cargar el panel clinico</h2>
              <p className="text-sm">{mensajeError}</p>
            </div>
          ) : alertasPendientes.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
              No hay alertas pendientes para revisar.
            </div>
          ) : (
            alertasPendientes.map((alerta) => (
              <article
                key={alerta.id}
                className={`rounded-3xl border-l-8 p-6 shadow-sm ${alerta.estado_alerta === 'Critico'
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-amber-400 bg-white'
                  }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{alerta.paciente_nombre}</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {alerta.medicion_tipo}: {alerta.medicion_valor}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${alerta.estado_alerta === 'Critico'
                      ? 'bg-rose-200 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                      }`}
                  >
                    {alerta.estado_alerta}
                  </span>
                </div>

                <p className="mt-5 text-xs text-slate-500">
                  Registrado el {alerta.medicion_fecha.toLocaleString()}
                </p>

                <div className="mt-6 border-t border-slate-200 pt-4 text-right">
                  <BotonLeido alertaId={alerta.id!} />
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
