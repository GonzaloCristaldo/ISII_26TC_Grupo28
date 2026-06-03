'use client';

import { useState } from 'react';
import type { TipoEstadoMedicion, TipoMedicionNombre } from '@/modelos/tipos';
import BotonLeido from './BotonLeido';

export type AlertaDashboard = {
  id: string;
  medicion_id: string;
  estado_alerta: TipoEstadoMedicion;
  leido_por_medico: boolean;
  fecha: string;
  paciente_id: string;
  paciente_nombre: string;
  medicion_tipo: TipoMedicionNombre;
  medicion_unidad: string;
  medicion_valor: number;
  medicion_fecha: string;
};

export type MedicionDashboard = {
  id?: string;
  paciente_id: string;
  tipo_medicion: TipoMedicionNombre;
  valor: number;
  fecha: string;
};

export type TipoMedicionDashboard = {
  tipo_medicion: TipoMedicionNombre;
  unidad: string;
};

type Props = {
  alertasPendientes: AlertaDashboard[];
  historialPorPaciente: Record<string, MedicionDashboard[]>;
  tiposMedicion: TipoMedicionDashboard[];
};

type FiltroEstado = 'Todos' | TipoEstadoMedicion;

function obtenerUnidadMedicion(tipo: TipoMedicionNombre, tiposMedicion: TipoMedicionDashboard[]) {
  return tiposMedicion.find((tipoMedicion) => tipoMedicion.tipo_medicion === tipo)?.unidad ?? tipo;
}

function obtenerNombreMedicion(tipo: TipoMedicionNombre) {
  return tipo
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
}

function obtenerFormatoFecha(fecha: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fecha));
}

function obtenerTiempoRelativo(fecha: string) {
  const diferenciaMinutos = Math.max(
    0,
    Math.round((Date.now() - new Date(fecha).getTime()) / 60000),
  );

  if (diferenciaMinutos < 1) return 'ahora';
  if (diferenciaMinutos < 60) return `hace ${diferenciaMinutos} min`;

  const diferenciaHoras = Math.round(diferenciaMinutos / 60);
  if (diferenciaHoras < 24) return `hace ${diferenciaHoras} h`;

  return `hace ${Math.round(diferenciaHoras / 24)} d`;
}

function obtenerPesoEstado(estado: TipoEstadoMedicion) {
  if (estado === 'Critico') return 0;
  if (estado === 'Advertencia') return 1;
  return 2;
}

function obtenerClasesEstado(estado: TipoEstadoMedicion) {
  if (estado === 'Critico') {
    return {
      texto: 'text-rose-800',
      fondo: 'bg-rose-700',
      seleccionado: 'border-rose-700 bg-rose-50',
    };
  }

  if (estado === 'Advertencia') {
    return {
      texto: 'text-amber-800',
      fondo: 'bg-amber-600',
      seleccionado: 'border-amber-600 bg-amber-50',
    };
  }

  return {
    texto: 'text-emerald-800',
    fondo: 'bg-emerald-700',
    seleccionado: 'border-emerald-700 bg-emerald-50',
  };
}

function ordenarAlertasPorPrioridad(alertas: AlertaDashboard[]) {
  return [...alertas].sort((a, b) => {
    const prioridadEstado = obtenerPesoEstado(a.estado_alerta) - obtenerPesoEstado(b.estado_alerta);
    if (prioridadEstado !== 0) return prioridadEstado;

    return new Date(b.medicion_fecha).getTime() - new Date(a.medicion_fecha).getTime();
  });
}

function ordenarMedicionesPorFecha(mediciones: MedicionDashboard[], direccion: 'asc' | 'desc') {
  return [...mediciones].sort((a, b) => {
    const diferencia = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
    return direccion === 'asc' ? diferencia : -diferencia;
  });
}

function obtenerPuntosGrafico(mediciones: MedicionDashboard[], minimo: number, maximo: number) {
  const margenHorizontal = 8;
  const margenSuperior = 8;
  const altoDisponible = 34;
  const anchoDisponible = 100 - margenHorizontal * 2;
  const divisorHorizontal = Math.max(mediciones.length - 1, 1);

  return mediciones.map((medicion, indice) => {
    const proporcionValor = maximo === minimo ? 0.5 : (medicion.valor - minimo) / (maximo - minimo);

    return {
      medicion,
      x: margenHorizontal + (indice / divisorHorizontal) * anchoDisponible,
      y: margenSuperior + (1 - proporcionValor) * altoDisponible,
    };
  });
}

export default function PanelDashboardMedico({
  alertasPendientes,
  historialPorPaciente,
  tiposMedicion,
}: Props) {
  const alertasOrdenadas = ordenarAlertasPorPrioridad(alertasPendientes);
  const [alertaSeleccionadaId, setAlertaSeleccionadaId] = useState(alertasOrdenadas[0]?.id ?? '');
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoMedicionNombre>(
    alertasOrdenadas[0]?.medicion_tipo ?? tiposMedicion[0]?.tipo_medicion ?? '',
  );
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('Todos');
  const [busqueda, setBusqueda] = useState('');

  const textoBusqueda = busqueda.trim().toLowerCase();
  const alertasFiltradas = alertasOrdenadas.filter((alerta) => {
    const coincideEstado = filtroEstado === 'Todos' || alerta.estado_alerta === filtroEstado;
    const coincideBusqueda =
      textoBusqueda.length === 0 ||
      alerta.paciente_nombre.toLowerCase().includes(textoBusqueda) ||
      obtenerNombreMedicion(alerta.medicion_tipo).toLowerCase().includes(textoBusqueda);

    return coincideEstado && coincideBusqueda;
  });

  const alertaSeleccionada =
    alertasOrdenadas.find((alerta) => alerta.id === alertaSeleccionadaId) ?? alertasOrdenadas[0];
  const historialPaciente = alertaSeleccionada
    ? historialPorPaciente[alertaSeleccionada.paciente_id] ?? []
    : [];
  const tiposPaciente = Array.from(
    new Set([
      ...(alertaSeleccionada ? [alertaSeleccionada.medicion_tipo] : []),
      ...historialPaciente.map((medicion) => medicion.tipo_medicion),
    ]),
  );
  const tipoActivo = tiposPaciente.includes(tipoSeleccionado)
    ? tipoSeleccionado
    : alertaSeleccionada?.medicion_tipo ?? tipoSeleccionado;
  const historialFiltrado = historialPaciente.filter(
    (medicion) => medicion.tipo_medicion === tipoActivo,
  );
  const registrosRecientes = ordenarMedicionesPorFecha(historialFiltrado, 'desc').slice(0, 5);
  const medicionesGrafico = ordenarMedicionesPorFecha(historialFiltrado, 'asc').slice(-6);
  const valoresGrafico = medicionesGrafico.map((medicion) => medicion.valor);
  const minimoGrafico = valoresGrafico.length > 0 ? Math.min(...valoresGrafico) : 0;
  const maximoGrafico = valoresGrafico.length > 0 ? Math.max(...valoresGrafico) : 0;
  const puntosGrafico = obtenerPuntosGrafico(
    medicionesGrafico,
    minimoGrafico,
    maximoGrafico,
  );
  const lineaGrafico = puntosGrafico.map((punto) => `${punto.x},${punto.y}`).join(' ');
  const eventosPaciente = alertasOrdenadas.filter(
    (alerta) => alerta.paciente_id === alertaSeleccionada?.paciente_id,
  );
  const totalCriticas = alertasOrdenadas.filter(
    (alerta) => alerta.estado_alerta === 'Critico',
  ).length;
  const totalAdvertencias = alertasOrdenadas.filter(
    (alerta) => alerta.estado_alerta === 'Advertencia',
  ).length;
  const pacientesAfectados = new Set(alertasOrdenadas.map((alerta) => alerta.paciente_id)).size;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        {[
          ['Pendientes', alertasOrdenadas.length],
          ['Criticas', totalCriticas],
          ['Advertencias', totalAdvertencias],
          ['Pacientes', pacientesAfectados],
        ].map(([etiqueta, valor]) => (
          <div key={etiqueta} className="rounded-lg border border-slate-300 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {etiqueta}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{valor}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <input
          type="search"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Buscar paciente o medicion"
          className="h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-700"
        />

        <div className="flex flex-wrap gap-2">
          {(['Todos', 'Critico', 'Advertencia'] as FiltroEstado[]).map((estado) => (
            <button
              key={estado}
              type="button"
              onClick={() => setFiltroEstado(estado)}
              className={`h-11 rounded-lg border px-4 text-sm font-semibold transition ${
                filtroEstado === estado
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-500'
              }`}
            >
              {estado}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="flex items-end justify-between border-b border-slate-300 pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Bandeja prioritaria
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                {alertasFiltradas.length} pendientes
              </h2>
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
              Critico primero
            </p>
          </div>

          <div className="max-h-[680px] space-y-3 overflow-y-auto pr-1">
            {alertasFiltradas.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 px-4 py-8 text-center text-sm text-slate-500">
                No hay eventos que coincidan con el filtro.
              </div>
            ) : (
              alertasFiltradas.map((alerta, indice) => {
                const clasesEstado = obtenerClasesEstado(alerta.estado_alerta);
                const estaSeleccionada = alerta.id === alertaSeleccionada?.id;

                return (
                  <article
                    key={alerta.id}
                    className={`rounded-lg border bg-white transition ${
                      estaSeleccionada
                        ? clasesEstado.seleccionado
                        : 'border-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setAlertaSeleccionadaId(alerta.id);
                        setTipoSeleccionado(alerta.medicion_tipo);
                      }}
                      className="w-full px-4 py-4 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`text-xs font-bold uppercase tracking-[0.24em] ${clasesEstado.texto}`}>
                            P{indice + 1} {alerta.estado_alerta}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-slate-950">
                            {alerta.paciente_nombre}
                          </h3>
                        </div>
                        <p className="shrink-0 font-mono text-xs text-slate-500">
                          {obtenerTiempoRelativo(alerta.medicion_fecha)}
                        </p>
                      </div>

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-sm text-slate-600">
                            {obtenerNombreMedicion(alerta.medicion_tipo)}
                          </p>
                          <p className="mt-1 text-3xl font-semibold text-slate-950">
                              {alerta.medicion_valor}{' '}
                            <span className="font-mono text-sm font-semibold text-slate-500">
                              {alerta.medicion_unidad}
                            </span>
                          </p>
                        </div>
                      </div>
                    </button>

                    <div className="border-t border-slate-200 px-4 py-3">
                      <BotonLeido alertaId={alerta.id} />
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </aside>

        <section className="min-h-[680px] rounded-lg border border-slate-300 bg-white p-6">
          {!alertaSeleccionada ? (
            <div className="flex h-full items-center justify-center text-center text-slate-500">
              No hay alertas pendientes para revisar.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 border-b border-slate-200 pb-5 md:grid-cols-[minmax(0,1fr)_220px]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Paciente seleccionado
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                    {alertaSeleccionada.paciente_nombre}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Ultima medicion registrada el {obtenerFormatoFecha(alertaSeleccionada.medicion_fecha)}
                  </p>
                </div>

                <div
                  className={`rounded-lg p-4 text-white ${
                    obtenerClasesEstado(alertaSeleccionada.estado_alerta).fondo
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                    Estado actual
                  </p>
                  <p className="mt-3 text-2xl font-semibold">
                    {alertaSeleccionada.estado_alerta}
                  </p>
                  <p className="mt-2 text-sm text-white/85">
                    {eventosPaciente.length} evento{eventosPaciente.length === 1 ? '' : 's'} pendiente
                    {eventosPaciente.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Medicion actual
                  </p>
                  <p className="mt-3 text-4xl font-semibold text-slate-950">
                    {alertaSeleccionada.medicion_valor}{' '}
                    <span className="font-mono text-base text-slate-500">
                      {alertaSeleccionada.medicion_unidad}
                    </span>
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Tipo registrado
                  </p>
                  <p className="mt-3 text-xl font-semibold text-slate-950">
                    {obtenerNombreMedicion(alertaSeleccionada.medicion_tipo)}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Historial cargado
                  </p>
                  <p className="mt-3 text-xl font-semibold text-slate-950">
                    {historialPaciente.length} mediciones
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
                {tiposPaciente.map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setTipoSeleccionado(tipo)}
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                      tipoActivo === tipo
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {obtenerNombreMedicion(tipo)}
                  </button>
                ))}
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-lg border border-slate-200 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Evolucion
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">
                        {obtenerNombreMedicion(tipoActivo)}
                      </h3>
                    </div>
                    <p className="font-mono text-sm text-slate-500">
                      {obtenerUnidadMedicion(tipoActivo, tiposMedicion)}
                    </p>
                  </div>

                  {medicionesGrafico.length === 0 ? (
                    <div className="mt-6 rounded-lg border border-dashed border-slate-300 py-14 text-center text-sm text-slate-500">
                      Sin historial para este tipo de medicion.
                    </div>
                  ) : (
                    <div className="mt-6 border-b border-l border-slate-200 px-2 pb-3">
                      <svg
                        viewBox="0 0 100 58"
                        className="h-52 w-full overflow-visible"
                        role="img"
                        aria-label={`Evolucion de ${obtenerNombreMedicion(tipoActivo)}`}
                        preserveAspectRatio="none"
                      >
                        <line x1="8" y1="8" x2="92" y2="8" stroke="#e2e8f0" strokeWidth="0.35" />
                        <line x1="8" y1="25" x2="92" y2="25" stroke="#e2e8f0" strokeWidth="0.35" />
                        <line x1="8" y1="42" x2="92" y2="42" stroke="#e2e8f0" strokeWidth="0.35" />

                        {puntosGrafico.length > 1 ? (
                          <polyline
                            points={lineaGrafico}
                            fill="none"
                            stroke="#0f172a"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                          />
                        ) : null}

                        {puntosGrafico.map((punto) => (
                          <g key={punto.medicion.id ?? `${punto.medicion.fecha}-${punto.medicion.valor}`}>
                            <circle
                              cx={punto.x}
                              cy={punto.y}
                              r="1.9"
                              fill="#0f172a"
                              stroke="#ffffff"
                              strokeWidth="0.9"
                              vectorEffect="non-scaling-stroke"
                            />
                            <text
                              x={punto.x}
                              y={Math.max(5, punto.y - 4)}
                              textAnchor="middle"
                              className="fill-slate-600 font-mono text-[3.2px]"
                            >
                              {punto.medicion.valor}
                            </text>
                            <text
                              x={punto.x}
                              y="55"
                              textAnchor="middle"
                              className="fill-slate-500 font-mono text-[3px]"
                            >
                              {new Intl.DateTimeFormat('es-AR', {
                                day: '2-digit',
                                month: '2-digit',
                              }).format(new Date(punto.medicion.fecha))}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-slate-200 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Registros recientes
                  </p>
                  <div className="mt-4 space-y-3">
                    {registrosRecientes.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No hay registros para el tipo seleccionado.
                      </p>
                    ) : (
                      registrosRecientes.map((medicion) => (
                        <div
                          key={medicion.id ?? `${medicion.fecha}-${medicion.valor}`}
                          className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
                        >
                          <p className="font-mono text-xs text-slate-500">
                            {obtenerFormatoFecha(medicion.fecha)}
                          </p>
                          <p className="mt-1 text-lg font-semibold text-slate-950">
                            {medicion.valor}{' '}
                            <span className="font-mono text-sm text-slate-500">
                              {obtenerUnidadMedicion(medicion.tipo_medicion, tiposMedicion)}
                            </span>
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
