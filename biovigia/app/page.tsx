import Link from 'next/link';
import { cerrarSesionAccion } from '@/app/auth/acciones';
import { obtenerSesionActual } from '@/app/lib/session';

export default async function Home() {
  const sesion = await obtenerSesionActual();
  const accesoPrincipal =
    sesion?.rol === 'medico' ? '/medico/dashboard' : '/paciente/nueva-medicion';

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#e0f2fe_45%,#ecfeff_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[85vh] max-w-6xl items-center">
        <section className="grid w-full gap-8 rounded-[2rem] bg-white/80 p-8 shadow-2xl backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-cyan-700">
              Telemonitoreo clinico
            </p>
            <h1 className="mt-4 max-w-2xl text-5xl font-semibold tracking-tight text-slate-900">
              BioVigia
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Organiza pacientes, mediciones y alertas por paciente.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {sesion ? (
                <>
                  <Link
                    href={accesoPrincipal}
                    className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
                  >
                    {sesion.rol === 'medico' ? 'Ver alertas pendientes' : 'Registrar nueva medicion'}
                  </Link>
                  <form action={cerrarSesionAccion}>
                    <button
                      type="submit"
                      className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Cerrar sesion
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
                >
                  Iniciar sesion
                </Link>
              )}
            </div>
          </div>

          <aside className="rounded-[1.75rem] bg-slate-950 p-8 text-slate-100">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Estado de acceso</p>
            {sesion ? (
              <>
                <h2 className="mt-5 text-3xl font-semibold">{sesion.nombreCompleto}</h2>
                <p className="mt-2 text-slate-300">Usuario: {sesion.username}</p>
                <p className="mt-1 text-slate-300">Rol: {sesion.rol}</p>
                <p className="mt-6 text-sm leading-7 text-slate-400">
                  Puede visualizar sus mediciones y alertas.
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-5 text-3xl font-semibold">Sesion no iniciada</h2>
                <p className="mt-4 text-sm leading-7 text-slate-400">
                  Ingresa desde la pagina de login para usar el panel de medico o el formulario de
                  paciente con autorizacion real.
                </p>
              </>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
