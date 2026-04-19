import React from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { crearServicioMedico } from '@/app/_lib/composition';
import BotonLeido from './BotonLeido';
import { AlertaExtendida } from '../../../modelos/tipos';
import { obtenerMedicoDemoId } from '../../../persistencia/postgres/contextoDemo';

/**
 * Capa de Presentación: Dashboard dinámico del médico. 
 */

export default async function MedicoDashboardPage() {
  await connection();

  let alertasPendientes: AlertaExtendida[] = [];
  let mensajeError: string | null = null;

  try {
    const medicoId = await obtenerMedicoDemoId();
    const servicioMedico = crearServicioMedico();

    alertasPendientes = await servicioMedico.revisarAlertasPendientes(medicoId);
  } catch (error) {
    mensajeError =
      error instanceof Error
        ? error.message
        : 'No se pudieron obtener las alertas para el médico.';
    console.error('Fallo obteniendo las alertas:', error);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col p-8">
      <div className="max-w-5xl mx-auto w-full">
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Panel Clínico</h1>
            <p className="text-gray-500">Alertas y Notificaciones Recientes</p>
          </div>
          <Link href="/" className="px-5 py-2text-sm text-gray-600 hover:text-blue-600 underline">
            Volver al Inicio
          </Link>
        </div>

        {/* Tarjetas de Alertas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mensajeError ? (
            <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-red-800">
              <h2 className="mb-2 text-lg font-semibold">No se pudo cargar el panel clínico</h2>
              <p className="text-sm">{mensajeError}</p>
            </div>
          ) : alertasPendientes.length === 0 ? (
            <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No hay alertas pendientes para revisar.
            </div>
          ) : (
            alertasPendientes.map((alerta) => (
              <div
                key={alerta.id}
                className={`bg-white rounded-2xl shadow-sm border-l-8 p-6 flex flex-col justify-between ${
                  alerta.estado_alerta === 'Critico' ? 'border-red-500 bg-red-50' : 'border-yellow-400'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{alerta.paciente_nombre}</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        alerta.estado_alerta === 'Critico' 
                          ? 'bg-red-200 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {alerta.estado_alerta}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">{alerta.medicion_tipo}:</span> {alerta.medicion_valor}
                  </p>
                  
                  <p className="text-xs text-gray-400 mt-4">
                    Registrado el {alerta.medicion_fecha.toLocaleString()}
                  </p>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4 flex justify-end">
                  <BotonLeido alertaId={alerta.id!} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
