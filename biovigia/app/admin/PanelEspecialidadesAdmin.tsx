import type { Especialidad } from '@/modelos/tipos';
import { crearEspecialidadAdminAccion } from './accionesAdmin';

export default function PanelEspecialidadesAdmin({
  especialidades,
}: {
  especialidades: Especialidad[];
}) {
  return (
    <section className="space-y-4">
      <div className="border-b border-slate-300 pb-3">
        <h2 className="text-2xl font-semibold text-slate-950">Especialidades</h2>
        <p className="mt-1 text-sm text-slate-600">
          Catalogo usado para registrar y editar profesionales.
        </p>
      </div>

      <article className="rounded-lg border border-slate-300 bg-white p-5">
        <h3 className="text-xl font-semibold text-slate-950">Nueva especialidad</h3>
        <form action={crearEspecialidadAdminAccion} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Nombre
            </span>
            <input
              name="nombre"
              required
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-700"
            />
          </label>
          <button
            type="submit"
            className="self-end rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Crear especialidad
          </button>
        </form>
      </article>

      <div className="rounded-lg border border-slate-300 bg-white p-5">
        {especialidades.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
            No hay especialidades cargadas.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {especialidades.map((especialidad) => (
              <span
                key={especialidad.especialidad_id}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700"
              >
                {especialidad.nombre}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
