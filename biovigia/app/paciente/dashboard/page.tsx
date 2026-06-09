import Link from 'next/link';
import { cerrarSesionAccion } from '@/app/auth/accionesAutenticacion';
import { crearGestorDashboardPaciente } from '@/app/lib/crearDependencias';
import { requerirPaciente } from '@/app/lib/session';
import type { Medicion, PacienteConMedicoResponsable, Umbral } from '@/modelos/tipos';
import PanelDashboardPaciente from './PanelDashboardPaciente';
import type {
  MedicionDashboardPaciente,
  PerfilDashboardPaciente,
  TipoMedicionDashboardPaciente,
} from './tiposDashboardPaciente';

function serializarPerfil(paciente: PacienteConMedicoResponsable): PerfilDashboardPaciente {
  return {
    paciente_id: paciente.paciente_id,
    nombreCompleto: [paciente.nombre, paciente.apellido].filter(Boolean).join(' '),
    email: paciente.email,
    telefono: paciente.telefono,
    fechaNacimiento: paciente.fecha_nacimiento?.toISOString().slice(0, 10) ?? null,
    grupoSanguineo: paciente.grupo_sanguineo,
    medicoResponsable: {
      nombreCompleto: [
        paciente.medico_responsable.nombre,
        paciente.medico_responsable.apellido,
      ]
        .filter(Boolean)
        .join(' '),
      especialidad: paciente.medico_responsable.especialidad,
      numeroLicencia: paciente.medico_responsable.numero_licencia,
    },
  };
}

function serializarMedicion(medicion: Medicion): MedicionDashboardPaciente {
  return {
    medicion_id: medicion.medicion_id,
    paciente_id: medicion.paciente_id,
    tipo_medicion: medicion.tipo_medicion,
    valor: medicion.valor,
    fecha: medicion.fecha.toISOString(),
  };
}

function serializarTipoMedicion(umbral: Umbral): TipoMedicionDashboardPaciente {
  return {
    tipo_medicion: umbral.tipo_medicion,
    unidad: umbral.unidad,
  };
}

export default async function DashboardPacientePage() {
  const sesion = await requerirPaciente();
  let perfil: PerfilDashboardPaciente | null = null;
  let historial: MedicionDashboardPaciente[] = [];
  let tiposMedicion: TipoMedicionDashboardPaciente[] = [];
  let mensajeError: string | null = null;

  try {
    const gestor = crearGestorDashboardPaciente();
    const datos = await gestor.consultarDashboard(sesion.pacienteId!);
    perfil = serializarPerfil(datos.paciente);
    historial = datos.historial.map(serializarMedicion);
    tiposMedicion = datos.umbrales.map(serializarTipoMedicion);
  } catch (error) {
    mensajeError =
      error instanceof Error ? error.message : 'No se pudo cargar el seguimiento del paciente.';
    console.error('Fallo obteniendo el dashboard del paciente:', error);
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ecfeff_0%,#f8fafc_55%,#f0fdfa_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-teal-700">
              Panel paciente
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">
              {perfil?.nombreCompleto ?? sesion.nombreCompleto}
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Consulta tu historial de mediciones y la evolucion de tus registros.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/paciente/nueva-medicion"
              className="rounded-lg bg-teal-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-900"
            >
              Registrar medicion
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
            >
              Volver al inicio
            </Link>
            <form action={cerrarSesionAccion}>
              <button
                type="submit"
                className="rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Cerrar sesion
              </button>
            </form>
          </div>
        </header>

        {mensajeError || !perfil ? (
          <div className="rounded-lg border border-rose-300 bg-rose-50 px-6 py-5 text-rose-900">
            <h2 className="text-lg font-semibold">No se pudo cargar el panel del paciente</h2>
            <p className="mt-2 text-sm">{mensajeError}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="grid gap-4 rounded-lg border border-slate-300 bg-white p-5 md:grid-cols-[minmax(0,1fr)_repeat(2,minmax(0,220px))]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Medico responsable
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  {perfil.medicoResponsable.nombreCompleto}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {perfil.medicoResponsable.especialidad}
                </p>
              </div>
              <div className="border-t border-slate-200 pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Numero de licencia
                </p>
                <p className="mt-2 font-mono text-sm font-semibold text-slate-950">
                  {perfil.medicoResponsable.numeroLicencia}
                </p>
              </div>
              <div className="border-t border-slate-200 pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Datos del paciente
                </p>
                <p className="mt-2 break-words text-sm font-semibold text-slate-950">
                  {perfil.email ?? perfil.telefono ?? 'Sin email o telefono'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {perfil.grupoSanguineo ? `Grupo ${perfil.grupoSanguineo}` : 'Grupo no informado'}
                  {perfil.fechaNacimiento
                    ? ` - Nacimiento ${new Intl.DateTimeFormat('es-AR').format(
                        new Date(`${perfil.fechaNacimiento}T00:00:00`),
                      )}`
                    : ''}
                </p>
              </div>
            </section>

            <PanelDashboardPaciente historial={historial} tiposMedicion={tiposMedicion} />
          </div>
        )}
      </div>
    </main>
  );
}
