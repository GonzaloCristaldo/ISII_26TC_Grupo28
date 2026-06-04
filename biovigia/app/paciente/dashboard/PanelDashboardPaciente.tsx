'use client';

import { useState } from 'react';
import type { TipoMedicionNombre } from '@/modelos/tipos';
import {
  obtenerFormatoFecha,
  obtenerNombreMedicion,
  obtenerPuntosGrafico,
  obtenerUnidadMedicion,
  ordenarMedicionesPorFecha,
} from '@/app/lib/logicaVisualizacionMediciones';
import {
  filtrarMedicionesPorTipo,
  obtenerTipoActivo,
  obtenerTiposRegistrados,
} from './logicaDashboardPaciente';
import type {
  MedicionDashboardPaciente,
  TipoMedicionDashboardPaciente,
} from './tiposDashboardPaciente';

type Props = {
  historial: MedicionDashboardPaciente[];
  tiposMedicion: TipoMedicionDashboardPaciente[];
};

const ANCHO_GRAFICO = 1000;
const ALTO_GRAFICO = 260;
const MARGEN_HORIZONTAL_GRAFICO = 60;
const MARGEN_SUPERIOR_GRAFICO = 35;
const ALTO_DISPONIBLE_GRAFICO = 155;
const POSICION_FECHA_GRAFICO = 238;

export default function PanelDashboardPaciente({ historial, tiposMedicion }: Props) {
  const tiposRegistrados = obtenerTiposRegistrados(historial);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoMedicionNombre>(
    tiposRegistrados[0] ?? '',
  );
  const tipoActivo = obtenerTipoActivo(tiposRegistrados, tipoSeleccionado);
  const historialTipo = filtrarMedicionesPorTipo(historial, tipoActivo);
  const registrosRecientes = ordenarMedicionesPorFecha(historialTipo, 'desc').slice(0, 6);
  const medicionActual = registrosRecientes[0];
  const ultimaMedicion = ordenarMedicionesPorFecha(historial, 'desc')[0];
  const medicionesGrafico = ordenarMedicionesPorFecha(historialTipo, 'asc').slice(-8);
  const valoresGrafico = medicionesGrafico.map((medicion) => medicion.valor);
  const minimoGrafico = valoresGrafico.length > 0 ? Math.min(...valoresGrafico) : 0;
  const maximoGrafico = valoresGrafico.length > 0 ? Math.max(...valoresGrafico) : 0;
  const puntosGrafico = obtenerPuntosGrafico(medicionesGrafico, minimoGrafico, maximoGrafico, {
    ancho: ANCHO_GRAFICO,
    margenHorizontal: MARGEN_HORIZONTAL_GRAFICO,
    margenSuperior: MARGEN_SUPERIOR_GRAFICO,
    altoDisponible: ALTO_DISPONIBLE_GRAFICO,
  });
  const lineaGrafico = puntosGrafico.map((punto) => `${punto.x},${punto.y}`).join(' ');

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-slate-300 bg-white px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Mediciones registradas
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{historial.length}</p>
        </div>
        <div className="rounded-lg border border-slate-300 bg-white px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Tipos registrados
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{tiposRegistrados.length}</p>
        </div>
        <div className="rounded-lg border border-slate-300 bg-white px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Ultima actualizacion
          </p>
          <p className="mt-3 text-base font-semibold text-slate-950">
            {ultimaMedicion ? obtenerFormatoFecha(ultimaMedicion.fecha) : 'Sin mediciones'}
          </p>
        </div>
      </div>

      <section className="rounded-lg border border-slate-300 bg-white p-6">
        {historial.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-slate-950">Todavia no hay mediciones</h2>
            <p className="mt-2 text-sm text-slate-600">
              Cuando registres una medicion, su evolucion aparecera en este panel.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-5">
              {tiposRegistrados.map((tipo) => (
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

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Seguimiento personal
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  {obtenerNombreMedicion(tipoActivo)}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Historial y evolucion de tus registros para este tipo de medicion.
                </p>
              </div>

              <div className="rounded-lg bg-teal-950 p-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">
                  Medicion reciente
                </p>
                <p className="mt-3 text-3xl font-semibold">
                  {medicionActual.valor}{' '}
                  <span className="font-mono text-sm text-teal-100/80">
                    {obtenerUnidadMedicion(medicionActual.tipo_medicion, tiposMedicion)}
                  </span>
                </p>
                <p className="mt-2 text-xs text-teal-100/70">
                  {obtenerFormatoFecha(medicionActual.fecha)}
                </p>
              </div>
            </div>

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

              <div className="mt-6 border-b border-l border-slate-200 px-2 pb-3">
                <svg
                  viewBox={`0 0 ${ANCHO_GRAFICO} ${ALTO_GRAFICO}`}
                  className="h-64 w-full overflow-visible"
                  role="img"
                  aria-label={`Evolucion de ${obtenerNombreMedicion(tipoActivo)}`}
                  preserveAspectRatio="xMidYMid meet"
                >
                  <line x1="60" y1="35" x2="940" y2="35" stroke="#e2e8f0" strokeWidth="1.5" />
                  <line x1="60" y1="112.5" x2="940" y2="112.5" stroke="#e2e8f0" strokeWidth="1.5" />
                  <line x1="60" y1="190" x2="940" y2="190" stroke="#e2e8f0" strokeWidth="1.5" />

                  {puntosGrafico.length > 1 ? (
                    <polyline
                      points={lineaGrafico}
                      fill="none"
                      stroke="#0f766e"
                      strokeWidth="2.5"
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
                        r="8"
                        fill="#0f766e"
                        stroke="#ffffff"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                      <text
                        x={punto.x}
                        y={Math.max(18, punto.y - 15)}
                        textAnchor="middle"
                        className="fill-slate-600 font-mono text-[14px]"
                      >
                        {punto.medicion.valor}
                      </text>
                      <text
                        x={punto.x}
                        y={POSICION_FECHA_GRAFICO}
                        textAnchor="middle"
                        className="fill-slate-500 font-mono text-[12px]"
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
            </div>

            <div className="rounded-lg border border-slate-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Registros recientes
              </p>
              <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
                {registrosRecientes.map((medicion) => (
                  <div
                    key={medicion.id ?? `${medicion.fecha}-${medicion.valor}`}
                    className="border-b border-slate-100 pb-3"
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
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
