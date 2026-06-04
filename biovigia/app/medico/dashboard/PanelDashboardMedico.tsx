'use client';

import { useState } from 'react';
import type { TipoMedicionNombre } from '@/modelos/tipos';
import BotonLeido from './BotonLeido';
import {
  calcularPacientesAfectados,
  calcularResumenCriticidad,
  filtrarAlertasDashboard,
  filtrarPacientesDashboard,
  obtenerAlertasPaciente,
  obtenerClasesEstado,
  obtenerFormatoFecha,
  obtenerHistorialPaciente,
  obtenerMedicionActual,
  obtenerNombreMedicion,
  obtenerPuntosGrafico,
  obtenerEstadoPrioritarioPaciente,
  obtenerTiempoRelativo,
  obtenerTipoActivo,
  obtenerTiposPaciente,
  obtenerUnidadMedicion,
  ordenarAlertasPorPrioridad,
  ordenarMedicionesPorFecha,
} from './logicaDashboardMedico';
import type {
  AlertaDashboard,
  FiltroEstadoDashboard,
  FiltroPacientesDashboard,
  MedicionDashboard,
  PacienteDashboard,
  TipoMedicionDashboard,
} from './tiposDashboardMedico';

type Props = {
  alertasPendientes: AlertaDashboard[];
  historialPorPaciente: Record<string, MedicionDashboard[]>;
  pacientesAsignados: PacienteDashboard[];
  tiposMedicion: TipoMedicionDashboard[];
};

const PACIENTES_POR_PAGINA = 5;

export default function PanelDashboardMedico({
  alertasPendientes,
  historialPorPaciente,
  pacientesAsignados,
  tiposMedicion,
}: Props) {
  const alertasOrdenadas = ordenarAlertasPorPrioridad(alertasPendientes);
  const [alertaSeleccionadaId, setAlertaSeleccionadaId] = useState(alertasOrdenadas[0]?.id ?? '');
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState(
    alertasOrdenadas[0]?.paciente_id ?? pacientesAsignados[0]?.id ?? '',
  );
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoMedicionNombre>(
    alertasOrdenadas[0]?.medicion_tipo ?? tiposMedicion[0]?.tipo_medicion ?? '',
  );
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoDashboard>('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [filtroPacientes, setFiltroPacientes] = useState<FiltroPacientesDashboard>('Todos');
  const [busquedaPacientes, setBusquedaPacientes] = useState('');
  const [paginaPacientes, setPaginaPacientes] = useState(1);

  const alertasFiltradas = filtrarAlertasDashboard(alertasOrdenadas, filtroEstado, busqueda);
  const alertaSeleccionada =
    alertasOrdenadas.find(
      (alerta) =>
        alerta.id === alertaSeleccionadaId && alerta.paciente_id === pacienteSeleccionadoId,
    ) ?? alertasOrdenadas.find((alerta) => alerta.paciente_id === pacienteSeleccionadoId);
  const pacienteSeleccionado = pacientesAsignados.find(
    (paciente) => paciente.id === pacienteSeleccionadoId,
  );
  const historialPaciente = obtenerHistorialPaciente(
    pacienteSeleccionadoId,
    historialPorPaciente,
  );
  const tiposPaciente = obtenerTiposPaciente(alertaSeleccionada, historialPaciente);
  const tipoActivo = obtenerTipoActivo(tiposPaciente, tipoSeleccionado, alertaSeleccionada);
  const historialFiltrado = historialPaciente.filter(
    (medicion) => medicion.tipo_medicion === tipoActivo,
  );
  const registrosRecientes = ordenarMedicionesPorFecha(historialFiltrado, 'desc').slice(0, 5);
  const ultimaMedicion = ordenarMedicionesPorFecha(historialPaciente, 'desc')[0];
  const medicionActual = obtenerMedicionActual(
    alertaSeleccionada,
    tipoActivo,
    registrosRecientes,
  );
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
  const eventosPaciente = obtenerAlertasPaciente(alertasOrdenadas, pacienteSeleccionadoId);
  const resumenCriticidad = calcularResumenCriticidad(alertasOrdenadas);
  const pacientesAfectados = calcularPacientesAfectados(alertasOrdenadas);
  const pacientesFiltrados = filtrarPacientesDashboard(
    pacientesAsignados,
    alertasOrdenadas,
    filtroPacientes,
    busquedaPacientes,
  );
  const totalPaginasPacientes = Math.ceil(pacientesFiltrados.length / PACIENTES_POR_PAGINA);
  const paginaPacientesActual = Math.min(paginaPacientes, Math.max(totalPaginasPacientes, 1));
  const pacientesPaginados = pacientesFiltrados.slice(
    (paginaPacientesActual - 1) * PACIENTES_POR_PAGINA,
    paginaPacientesActual * PACIENTES_POR_PAGINA,
  );

  const seleccionarPaciente = (pacienteId: string) => {
    const alertaPrioritaria = alertasOrdenadas.find((alerta) => alerta.paciente_id === pacienteId);
    const historial = historialPorPaciente[pacienteId] ?? [];

    setPacienteSeleccionadoId(pacienteId);
    setAlertaSeleccionadaId(alertaPrioritaria?.id ?? '');
    setTipoSeleccionado(
      alertaPrioritaria?.medicion_tipo ?? historial[0]?.tipo_medicion ?? tiposMedicion[0]?.tipo_medicion ?? '',
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        {[
          ['Pendientes', alertasOrdenadas.length],
          ['Criticas', resumenCriticidad.totalCriticas],
          ['Advertencias', resumenCriticidad.totalAdvertencias],
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
          {(['Todos', 'Critico', 'Advertencia'] as FiltroEstadoDashboard[]).map((estado) => (
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

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_300px]">
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
                        setPacienteSeleccionadoId(alerta.paciente_id);
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
          {!pacienteSeleccionado ? (
            <div className="flex h-full items-center justify-center text-center text-slate-500">
              No hay pacientes asignados para revisar.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 border-b border-slate-200 pb-5 md:grid-cols-[minmax(0,1fr)_220px]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Paciente seleccionado
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                    {pacienteSeleccionado.nombreCompleto}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {ultimaMedicion
                      ? `Ultima medicion registrada el ${obtenerFormatoFecha(ultimaMedicion.fecha)}`
                      : 'Sin mediciones registradas.'}
                  </p>
                </div>

                <div
                  className={`rounded-lg p-4 text-white ${
                    alertaSeleccionada
                      ? obtenerClasesEstado(alertaSeleccionada.estado_alerta).fondo
                      : 'bg-emerald-700'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                    Estado actual
                  </p>
                  <p className="mt-3 text-2xl font-semibold">
                    {alertaSeleccionada?.estado_alerta ?? 'Sin alertas'}
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
                    {medicionActual ? (
                      <>
                        {medicionActual.valor}{' '}
                        <span className="font-mono text-base text-slate-500">
                          {obtenerUnidadMedicion(medicionActual.tipo_medicion, tiposMedicion)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xl text-slate-500">Sin registros</span>
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Tipo registrado
                  </p>
                  <p className="mt-3 text-xl font-semibold text-slate-950">
                    {medicionActual
                      ? obtenerNombreMedicion(medicionActual.tipo_medicion)
                      : 'Sin registros'}
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

              <div className="space-y-6">
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
                  <div className="mt-4 grid gap-x-6 gap-y-3 md:grid-cols-2">
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

        <aside className="self-start rounded-lg border border-slate-300 bg-white">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Pacientes asignados
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  {pacientesFiltrados.length} pacientes
                </h2>
              </div>
              <p className="font-mono text-xs text-slate-500">{pacientesAsignados.length} total</p>
            </div>

            <input
              type="search"
              value={busquedaPacientes}
              onChange={(event) => {
                setBusquedaPacientes(event.target.value);
                setPaginaPacientes(1);
              }}
              placeholder="Buscar paciente"
              className="mt-4 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-700"
            />

            <div className="mt-3 grid grid-cols-2 gap-2">
              {([
                ['Todos', 'Todos'],
                ['ConAlertas', 'Con alertas'],
                ['Criticos', 'Criticos'],
                ['SinAlertas', 'Sin alertas'],
              ] as const).map(([filtro, etiqueta]) => (
                <button
                  key={filtro}
                  type="button"
                  onClick={() => {
                    setFiltroPacientes(filtro);
                    setPaginaPacientes(1);
                  }}
                  className={`h-9 rounded-lg border px-2 text-xs font-semibold transition ${
                    filtroPacientes === filtro
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-slate-500'
                  }`}
                >
                  {etiqueta}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[520px] overflow-y-auto p-2">
            {pacientesPaginados.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 px-3 py-8 text-center text-sm text-slate-500">
                No hay pacientes que coincidan con los filtros.
              </p>
            ) : (
              pacientesPaginados.map((paciente) => {
                const alertasPaciente = obtenerAlertasPaciente(alertasOrdenadas, paciente.id);
                const estadoPrioritario = obtenerEstadoPrioritarioPaciente(
                  alertasOrdenadas,
                  paciente.id,
                );
                const seleccionado = paciente.id === pacienteSeleccionadoId;

                return (
                  <button
                    key={paciente.id}
                    type="button"
                    onClick={() => seleccionarPaciente(paciente.id)}
                    className={`mb-2 w-full rounded-lg border px-3 py-3 text-left transition last:mb-0 ${
                      seleccionado
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{paciente.nombreCompleto}</p>
                        <p
                          className={`mt-1 truncate text-xs ${
                            seleccionado ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {paciente.contacto ?? 'Sin contacto registrado'}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
                          seleccionado
                            ? 'bg-white/15 text-white'
                            : estadoPrioritario === 'Critico'
                              ? 'bg-rose-50 text-rose-800'
                              : estadoPrioritario === 'Advertencia'
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {alertasPaciente.length}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          seleccionado ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {estadoPrioritario ?? 'Sin alertas'}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          seleccionado ? 'text-white' : 'text-cyan-800'
                        }`}
                      >
                        Ver
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-slate-200 p-3">
            <button
              type="button"
              onClick={() => setPaginaPacientes((pagina) => Math.max(1, pagina - 1))}
              disabled={paginaPacientesActual <= 1}
              className="rounded-lg border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <p className="font-mono text-xs text-slate-500">
              {totalPaginasPacientes === 0 ? 0 : paginaPacientesActual} de {totalPaginasPacientes}
            </p>
            <button
              type="button"
              onClick={() =>
                setPaginaPacientes((pagina) => Math.min(totalPaginasPacientes, pagina + 1))
              }
              disabled={paginaPacientesActual >= totalPaginasPacientes}
              className="rounded-lg border border-slate-300 px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
