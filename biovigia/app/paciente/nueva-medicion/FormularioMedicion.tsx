'use client';

import { ElementRef, useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Umbral } from '@/modelos/tipos';
import { guardarMedicionAccion } from './guardarMedicionAccion';

const initialState = { message: '', type: '' };

function describirUmbral(umbral: Umbral) {
  const normal = `Normal esperado: ${umbral.valor_minimo_normal} a ${umbral.valor_maximo_normal} ${umbral.unidad}.`;

  if (umbral.valor_critico < umbral.valor_minimo_normal) {
    return {
      normal,
      critico: `Critico bajo: menor o igual a ${umbral.valor_critico} ${umbral.unidad}.`,
    };
  }

  return {
    normal,
    critico: `Critico alto: mayor o igual a ${umbral.valor_critico} ${umbral.unidad}.`,
  };
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full rounded-xl px-4 py-3 font-semibold text-white transition ${
        pending ? 'cursor-not-allowed bg-teal-600/50' : 'bg-teal-700 hover:bg-teal-800'
      }`}
    >
      {pending ? 'Registrando...' : 'Registrar y evaluar'}
    </button>
  );
}

export default function FormularioMedicion({ tiposMedicion }: { tiposMedicion: Umbral[] }) {
  const [state, formAction] = useActionState(guardarMedicionAccion, initialState);
  const formRef = useRef<ElementRef<'form'>>(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(tiposMedicion[0]?.tipo_medicion ?? '');
  const umbralSeleccionado = useMemo(
    () => tiposMedicion.find((tipo) => tipo.tipo_medicion === tipoSeleccionado),
    [tiposMedicion, tipoSeleccionado],
  );
  const detalleUmbral = umbralSeleccionado ? describirUmbral(umbralSeleccionado) : null;

  useEffect(() => {
    if (state?.type === 'success') {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-8 space-y-6">
      {state?.message && (
        <div
          className={`rounded-xl p-4 text-sm font-medium ${
            state.type === 'success' || state.type === ''
              ? 'border border-teal-200 bg-teal-50 text-teal-800'
              : 'border border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {state.type === 'error' ? 'Error: ' : 'OK: '}
          {state.message}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Tipo de medicion
        </label>
        <select
          name="tipo_medicion"
          value={tipoSeleccionado}
          onChange={(event) => setTipoSeleccionado(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition focus:border-teal-600 focus:outline-none"
          required
          disabled={tiposMedicion.length === 0}
        >
          {tiposMedicion.length === 0 ? (
            <option value="">No hay tipos de medicion configurados</option>
          ) : (
            tiposMedicion.map((tipo) => (
              <option key={tipo.tipo_medicion_id} value={tipo.tipo_medicion}>
                {tipo.tipo_medicion} ({tipo.unidad})
              </option>
            ))
          )}
        </select>

        {detalleUmbral ? (
          <div className="mt-3 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-900">
            <p className="font-semibold">{detalleUmbral.normal}</p>
            <p className="mt-1">{detalleUmbral.critico}</p>
          </div>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Valor registrado
        </label>
        <input
          type="number"
          name="valor"
          step="0.01"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 transition focus:border-teal-600 focus:outline-none"
          placeholder={umbralSeleccionado ? `Unidad: ${umbralSeleccionado.unidad}` : 'Ej. 110'}
          required
        />
      </div>

      {tiposMedicion.length === 0 ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Un administrador debe configurar al menos un tipo de medicion antes de registrar valores.
        </p>
      ) : (
        <SubmitButton />
      )}
    </form>
  );
}
