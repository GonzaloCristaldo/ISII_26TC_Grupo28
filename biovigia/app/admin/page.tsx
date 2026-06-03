import Link from 'next/link';
import { cerrarSesionAccion } from '@/app/auth/accionesAutenticacion';
import {
  crearGestorAdministracionUsuarios,
  crearGestorConfiguracionClinica,
} from '@/app/lib/crearDependencias';
import { requerirAdministrador } from '@/app/lib/session';
import {
  registrarMedicoAdminAccion,
  registrarPacienteAdminAccion,
} from './accionesAdmin';
import PanelConfiguracionClinicaAdmin from './PanelConfiguracionClinicaAdmin';
import PanelUsuariosAdmin from './PanelUsuariosAdmin';

function campoTexto(label: string, name: string, defaultValue: string, required = true) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-700"
      />
    </label>
  );
}

export default async function AdminPage() {
  const sesion = await requerirAdministrador();
  const gestorUsuarios = crearGestorAdministracionUsuarios();
  const gestorConfiguracion = crearGestorConfiguracionClinica();
  const [usuarios, medicos, tiposMedicion] = await Promise.all([
    gestorUsuarios.listarUsuarios(),
    gestorUsuarios.listarMedicosRegistrables(),
    gestorConfiguracion.listarTiposMedicionConUmbral(),
  ]);
  const medicosActivos = usuarios.filter(
    (usuario) => usuario.rol === 'medico' && usuario.activo,
  ).length;
  const pacientesActivos = usuarios.filter(
    (usuario) => usuario.rol === 'paciente' && usuario.activo,
  ).length;
  const cuentasInactivas = usuarios.filter((usuario) => !usuario.activo).length;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-300 pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">
              Administracion
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">{sesion.nombreCompleto}</h1>
            <p className="mt-2 text-sm text-slate-600">
              Gestion de cuentas, asignaciones y parametros clinicos.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Inicio
            </Link>
            <form action={cerrarSesionAccion}>
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Cerrar sesion
              </button>
            </form>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          {[
            ['Cuentas', usuarios.length],
            ['Medicos activos', medicosActivos],
            ['Pacientes activos', pacientesActivos],
            ['Tipos de medicion', tiposMedicion.length],
          ].map(([etiqueta, valor]) => (
            <div key={etiqueta} className="rounded-lg border border-slate-300 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {etiqueta}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{valor}</p>
            </div>
          ))}
          {cuentasInactivas > 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 md:col-span-4">
              <p className="text-sm font-semibold text-amber-900">
                Hay {cuentasInactivas} cuenta{cuentasInactivas === 1 ? '' : 's'} inactiva
                {cuentasInactivas === 1 ? '' : 's'}.
              </p>
            </div>
          ) : null}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-lg border border-slate-300 bg-white p-5">
            <h2 className="text-xl font-semibold text-slate-950">Registrar medico</h2>
            <form action={registrarMedicoAdminAccion} className="mt-4 grid gap-3 md:grid-cols-2">
              {campoTexto('Nombre completo', 'nombre_completo', '')}
              {campoTexto('Especialidad', 'especialidad', '')}
              {campoTexto('Numero licencia', 'numero_licencia', '')}
              {campoTexto('Usuario', 'username', '')}
              <label className="block md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Clave inicial
                </span>
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-700"
                />
              </label>
              <button
                type="submit"
                className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800 md:col-span-2"
              >
                Crear medico
              </button>
            </form>
          </article>

          <article className="rounded-lg border border-slate-300 bg-white p-5">
            <h2 className="text-xl font-semibold text-slate-950">Registrar paciente</h2>
            {medicos.length === 0 ? (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Debe existir al menos un medico activo para asignar pacientes.
              </p>
            ) : (
              <form action={registrarPacienteAdminAccion} className="mt-4 grid gap-3 md:grid-cols-2">
                {campoTexto('Nombre completo', 'nombre_completo', '')}
                {campoTexto('Contacto', 'contacto', '')}
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Medico responsable
                  </span>
                  <select
                    name="medico_responsable_id"
                    required
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-700"
                  >
                    {medicos.map((medico) => (
                      <option key={medico.id} value={medico.id}>
                        {medico.nombreCompleto} - {medico.especialidad}
                      </option>
                    ))}
                  </select>
                </label>
                {campoTexto('Usuario', 'username', '')}
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Clave inicial
                  </span>
                  <input
                    name="password"
                    type="password"
                    minLength={8}
                    required
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-700"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 md:col-span-2"
                >
                  Crear paciente
                </button>
              </form>
            )}
          </article>
        </section>

        <PanelUsuariosAdmin
          usuarios={usuarios.map((usuario) => ({
            ...usuario,
            creadoEn: usuario.creadoEn.toISOString(),
          }))}
          medicos={medicos}
        />

        <PanelConfiguracionClinicaAdmin tiposMedicion={tiposMedicion} />
      </div>
    </main>
  );
}
