import Link from 'next/link';
import { redirect } from 'next/navigation';
import { iniciarSesionAccion } from '@/app/auth/acciones';
import { obtenerSesionActual } from '@/app/lib/session';

type LoginPageProps = {
  searchParams?: Promise<{
    loginError?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sesion = await obtenerSesionActual();

  if (sesion) {
    redirect(sesion.rol === 'medico' ? '/medico/dashboard' : '/paciente/nueva-medicion');
  }

  const params = searchParams ? await searchParams : undefined;
  const loginError = params?.loginError;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
            BioVigia
          </p>
          <h1 className="mb-4 text-4xl font-semibold leading-tight">
            Ingreso a la plataforma
          </h1>
          <p className="max-w-xl text-base text-slate-300">
            <strong>Plataforma centralizada de monitoreo de salud.</strong>
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5">
              <p className="text-sm font-semibold text-cyan-300">Sr. medico</p>
              <p className="mt-3 text-sm text-slate-300">
                Revise las mediciones de sus pacientes con regularidad para brindar el mejor
                cuidado posible.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5">
              <p className="text-sm font-semibold text-emerald-300">Sr. paciente</p>
              <p className="mt-3 text-sm text-slate-300">
                Si obtiene un valor grave en su medicion, comuniquese directamente con el servicio
                de emergencias.{' '}
                <a href="tel:911" className="font-medium text-cyan-400 underline">
                  Llamar a emergencias
                </a>
                .
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-slate-900">Iniciar sesion</h2>
          <p className="mt-2 text-sm text-slate-500">
            Ingresa con tu usuario y clave para acceder a tu panel.
          </p>

          {loginError ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {loginError}
            </div>
          ) : null}

          <form action={iniciarSesionAccion} className="mt-8 space-y-5">
            <div>
              <label htmlFor="login-username" className="mb-2 block text-sm font-medium text-slate-700">
                Usuario
              </label>
              <input
                id="login-username"
                name="username"
                type="text"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500"
                placeholder="Tu usuario"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-slate-700">
                Clave
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Entrar al sistema
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6 text-center">
            <p className="text-sm text-slate-500">¿No tenes cuenta?</p>
            <Link
              href="/registro"
              className="mt-3 inline-flex rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Registrarse
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
