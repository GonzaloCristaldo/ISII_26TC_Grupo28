'use client';

import { useActionState, useRef, ElementRef } from 'react';
import { useFormStatus } from 'react-dom';
import { guardarMedicionAccion } from './guardarMedicionAccion';

const initialState = { message: '', type: '' };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full rounded-xl px-4 py-3 font-semibold text-white transition ${pending ? 'bg-teal-600/50 cursor-not-allowed' : 'bg-teal-700 hover:bg-teal-800'
        }`}
    >
      {pending ? 'Registrando...' : 'Registrar y evaluar'}
    </button>
  );
}

export default function FormularioMedicion() {
  const [state, formAction] = useActionState(guardarMedicionAccion, initialState);
  const formRef = useRef<ElementRef<'form'>>(null);


  if (state?.type === 'success') {

    if (formRef.current) {
      formRef.current.reset();
    }
  }

  return (
    <form ref={formRef} action={formAction} className="mt-8 space-y-6">
      {state?.message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${state.type === 'success' || state.type === ''
              ? 'bg-teal-50 text-teal-800 border border-teal-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
        >
          {state.type === 'error' ? '⚠ ' : '✓ '}
          {state.message}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Tipo de medicion
        </label>
        <select
          name="tipo_medicion"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-teal-600 focus:outline-none bg-white"
          required
        >
          <option value="PresionArterial">Presion arterial (sistolica)</option>
          <option value="Glucosa">Glucosa en sangre</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Valor registrado
        </label>
        <input
          type="number"
          name="valor"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-teal-600 focus:outline-none"
          placeholder="Ej. 110"
          required
        />
      </div>

      <SubmitButton />
    </form>
  );
}
