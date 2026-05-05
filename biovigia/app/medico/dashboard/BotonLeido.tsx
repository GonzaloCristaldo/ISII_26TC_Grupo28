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
  const [error, setError] = useState<string | null>(null);

  const handleDescartar = async () => {
    setLoading(true);
    setError(null);

    try {
      await descartarAlertaAccion(alertaId);
      setSuccess(true);
    } catch (e) {
      console.error(e);
      setError('No se pudo registrar la atencion de la alerta. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <button
        disabled
        className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition"
      >
        Atencion registrada
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleDescartar}
        disabled={loading}
        className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
          loading
            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
            : 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
        }`}
      >
        {loading ? 'Registrando...' : 'Atendido'}
      </button>

      {error ? (
        <p className="max-w-52 text-sm font-medium text-rose-100">
          {error}
        </p>
      ) : null}
    </div>
  );
}
