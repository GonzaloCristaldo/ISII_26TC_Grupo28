'use client';

import { useState } from 'react';
import { descartarAlertaAccion } from './accionesMedico';

/**
 * Client Component.
 * Llama a un proceso pero no revela el SQL (para respetar arquitectura de capas)
 */
export default function BotonLeido({ alertaId }: { alertaId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDescartar = async () => {
    setLoading(true);
    try {
      await descartarAlertaAccion(alertaId);
      setSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <button disabled className="px-4 py-2 text-sm font-semibold rounded-lg border transition bg-teal-50 text-teal-700 border-teal-200">
        Atendido ✓
      </button>
    );
  }

  return (
    <button
      onClick={handleDescartar}
      disabled={loading}
      className={`px-4 py-2 text-sm font-semibold rounded-lg border transition ${loading
        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
        }`}
    >
      {loading ? 'Procesando...' : 'Atendido'}
    </button>
  );
}
