import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  registrarMedicoAccion,
  registrarPacienteAccion,
} from '@/app/auth/accionesAutenticacion';
import { destinoPorRol } from '@/app/lib/destinos';
import { crearGestorAutenticacion, crearGestorEspecialidades } from '@/app/lib/crearDependencias';
import { obtenerSesionActual } from '@/app/lib/session';

type RegistroPageProps = {
  searchParams?: Promise<{
    registroError?: string;
    registro?: 'medico' | 'paciente';
  }>;
};

export default async function RegistroPage({ searchParams }: RegistroPageProps) {
  const sesion = await obtenerSesionActual();

  if (sesion) {
    redirect(destinoPorRol(sesion.rol));
  }

  const params = searchParams ? await searchParams : undefined;
  const registroError = params?.registroError;
  const registroAbierto = params?.registro;
  const gestorAutenticacion = crearGestorAutenticacion();
  const gestorEspecialidades = crearGestorEspecialidades();
  const [medicos, especialidades] = await Promise.all([
    gestorAutenticacion.listarMedicosRegistrables(),
    gestorEspecialidades.listar(),
  ]);
  const especialidadesActivas = especialidades.filter((especialidad) => especialidad.activa);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              BioVigia
            </p>
            <h1 className="mb-4 text-4xl font-semibold leading-tight">Crear una cuenta</h1>
            <p className="max-w-xl text-base text-slate-300">
              Registra un nuevo acceso para comenzar a operar en la plataforma como medico o
              paciente.
            </p>

            <div className="mt-8 space-y-4">
              <article className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5">
                <p className="text-sm font-semibold text-cyan-300">Cuenta medica</p>
                <p className="mt-3 text-sm text-slate-300">
                  Registrese como medico, para obtener las mediciones de sus pacientes.
                </p>
              </article>
              <article className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5">
                <p className="text-sm font-semibold text-emerald-300">Cuenta de paciente</p>
                <p className="mt-3 text-sm text-slate-300">
                  Registrese como paciente para cargar sus mediciones y que su medico las vea.
                </p>
              </article>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Registro</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Elige el tipo de cuenta y completa los datos necesarios.
                </p>
              </div>
              <Link
                href="/login"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Ya tengo cuenta
              </Link>
            </div>

            {registroError ? (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {registroError}
              </div>
            ) : null}

            <div className="mt-8 space-y-5">
              <details
                className="rounded-2xl border border-slate-200 p-5"
                open={registroAbierto !== 'paciente'}
              >
                <summary className="cursor-pointer list-none text-lg font-semibold text-slate-900">
                  Registrarse como medico
                </summary>

                {especialidadesActivas.length === 0 ? (
                  <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Primero debe existir al menos una especialidad cargada por administracion.
                  </p>
                ) : (
                <form action={registrarMedicoAccion} className="mt-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Nombre
                      </label>
                      <input
                        name="nombre"
                        type="text"
                        required
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Apellido
                      </label>
                      <input
                        name="apellido"
                        type="text"
                        required
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Email
                      </label>
                      <input
                        name="email"
                        type="email"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Telefono
                      </label>
                      <input
                        name="telefono"
                        type="tel"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Especialidad
                    </label>
                    <select
                      name="especialidad_id"
                      required
                      defaultValue=""
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500"
                    >
                      <option value="" disabled>
                        Selecciona una especialidad
                      </option>
                      {especialidadesActivas.map((especialidad) => (
                        <option
                          key={especialidad.especialidad_id}
                          value={especialidad.especialidad_id}
                        >
                          {especialidad.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Numero de licencia
                    </label>
                    <input
                      name="numero_licencia"
                      type="text"
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Usuario
                    </label>
                    <input
                      name="username"
                      type="text"
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Clave
                    </label>
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700"
                  >
                    Crear cuenta de medico
                  </button>
                </form>
                )}
              </details>

              <details
                className="rounded-2xl border border-slate-200 p-5"
                open={registroAbierto === 'paciente'}
              >
                <summary className="cursor-pointer list-none text-lg font-semibold text-slate-900">
                  Registrarse como paciente
                </summary>

                {medicos.length === 0 ? (
                  <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Primero debe existir al menos un medico para asignar como responsable.
                  </p>
                ) : (
                  <form action={registrarPacienteAccion} className="mt-5 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Nombre
                        </label>
                        <input
                          name="nombre"
                          type="text"
                          required
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Apellido
                        </label>
                        <input
                          name="apellido"
                          type="text"
                          required
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Email
                        </label>
                        <input
                          name="email"
                          type="email"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Telefono
                        </label>
                        <input
                          name="telefono"
                          type="tel"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Fecha de nacimiento
                        </label>
                        <input
                          name="fecha_nacimiento"
                          type="date"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Grupo sanguineo
                        </label>
                        <select
                          name="grupo_sanguineo"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                          defaultValue=""
                        >
                          <option value="">Sin informar</option>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((grupo) => (
                            <option key={grupo} value={grupo}>
                              {grupo}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Medico responsable
                      </label>
                      <select
                        name="medico_id"
                        required
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Selecciona un medico
                        </option>
                        {medicos.map((medico) => (
                          <option key={medico.medico_id} value={medico.medico_id}>
                            {medico.nombreCompleto} - {medico.especialidad}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Usuario
                      </label>
                      <input
                        name="username"
                        type="text"
                        required
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Clave
                      </label>
                      <input
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Crear cuenta de paciente
                    </button>
                  </form>
                )}
              </details>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
