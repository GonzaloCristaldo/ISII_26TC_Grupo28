import React from 'react';
import { guardarMedicionAccion } from './acciones';

/**
 * Capa de Presentación: Página para Registrar Medición.
 */
export default function NuevaMedicionPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">BioVigía</h1>
          <p className="text-gray-500">Registrar nueva medición vital</p>
        </div>

        <form action={guardarMedicionAccion} className="space-y-6">
          {/* Campo: Tipo de Medición */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Medición
            </label>
            <select
              name="tipo_medicion"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            >
              <option value="PresionArterial">Presión Arterial (Sistólica)</option>
              <option value="Glucosa">Glucosa en Sangre</option>
            </select>
          </div>

          {/* Campo: Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor Registrado
            </label>
            <input
              type="number"
              name="valor"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Ej. 110"
              required
            />
          </div>

          {/* Botón de Envío */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition transform hover:-translate-y-0.5"
          >
            Registrar y Evaluar
          </button>
        </form>
      </div>
    </main>
  );
}
