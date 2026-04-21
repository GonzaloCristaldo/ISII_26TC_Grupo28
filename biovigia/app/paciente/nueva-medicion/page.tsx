import Link from 'next/link';
import { guardarMedicionAccion } from './acciones';
import { cerrarSesionAccion } from '@/app/auth/acciones';
import { requerirPaciente } from '@/app/lib/session';

/**
 * Capa de Presentación: Página para Registrar Medición.
 */
export default async function NuevaMedicionPage() {
  const sesion = await requerirPaciente();

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="rounded-[1.75rem] bg-teal-950 p-8 text-white shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-300">
            Portal paciente
          </p>
          <h1 className="mt-4 text-4xl font-semibold">{sesion.nombreCompleto}</h1>
          <p className="mt-4 text-sm leading-7 text-teal-100/80">
            Registrá una nueva medicion vital. Si el valor queda fuera del rango normal, el sistema
            generara una alerta visible para tu medico responsable.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Volver al inicio
            </Link>
            <form action={cerrarSesionAccion}>
              <button
                type="submit"
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-teal-950 transition hover:bg-slate-100"
              >
                Cerrar sesion
              </button>
            </form>
          </div>
        </aside>

        <section className="rounded-[1.75rem] bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-slate-900">Registrar nueva medicion</h2>
          <p className="mt-2 text-sm text-slate-500">
            La medicion se guarda asociada a usted.
          </p>

          <form action={guardarMedicionAccion} className="mt-8 space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Tipo de medicion
              </label>
              <select
                name="tipo_medicion"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-teal-600 focus:outline-none"
                required
              >
                <option value="PresionArterial">Presion arterial (sistolica)</option>
                <option value="Glucosa">Glucosa en sangre</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Valor registrado
              </label>
              <input
                type="number"
                name="valor"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-teal-600 focus:outline-none"
                placeholder="Ej. 110"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800"
            >
              Registrar y evaluar
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
