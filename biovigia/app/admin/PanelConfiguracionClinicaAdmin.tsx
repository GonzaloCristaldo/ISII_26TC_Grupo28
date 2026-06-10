'use client';

import { useMemo, useState } from 'react';
import type { TipoMedicionConUmbral } from '@/modelos/tipos';
import {
  actualizarTipoMedicionAdminAccion,
  crearTipoMedicionAdminAccion,
} from './accionesAdmin';
import PanelDesplegableAdmin from './PanelDesplegableAdmin';

type ValoresUmbral = {
  nombre: string;
  unidad: string;
  valor_minimo_normal: string;
  valor_maximo_normal: string;
  valor_critico: string;
};

type EvaluacionUmbral = {
  valido: boolean;
  resumen: string;
  detalle: string;
};

function valoresDesdeTipo(tipo?: TipoMedicionConUmbral): ValoresUmbral {
  return {
    nombre: tipo?.nombre ?? '',
    unidad: tipo?.unidad ?? '',
    valor_minimo_normal: tipo ? String(tipo.valor_minimo_normal) : '',
    valor_maximo_normal: tipo ? String(tipo.valor_maximo_normal) : '',
    valor_critico: tipo ? String(tipo.valor_critico) : '',
  };
}

function numero(valor: string) {
  if (valor.trim() === '') return Number.NaN;
  return Number(valor);
}

function evaluarUmbral(valores: ValoresUmbral): EvaluacionUmbral {
  const minimo = numero(valores.valor_minimo_normal);
  const maximo = numero(valores.valor_maximo_normal);
  const critico = numero(valores.valor_critico);
  const unidad = valores.unidad.trim();

  if (!valores.nombre.trim() || !unidad) {
    return {
      valido: false,
      resumen: 'Faltan datos basicos.',
      detalle: 'Completa nombre y unidad para interpretar el rango.',
    };
  }

  if (![minimo, maximo, critico].every(Number.isFinite)) {
    return {
      valido: false,
      resumen: 'Faltan valores numericos.',
      detalle: 'Completa minimo, maximo y critico.',
    };
  }

  if (minimo < 0 || minimo >= maximo) {
    return {
      valido: false,
      resumen: 'Rango normal invalido.',
      detalle: 'El minimo normal debe ser mayor o igual a 0 y menor al maximo normal.',
    };
  }

  if (critico < minimo) {
    return {
      valido: true,
      resumen: `Normal: ${minimo} a ${maximo} ${unidad}.`,
      detalle: `Critico bajo: menor o igual a ${critico} ${unidad}.`,
    };
  }

  if (critico > maximo) {
    return {
      valido: true,
      resumen: `Normal: ${minimo} a ${maximo} ${unidad}.`,
      detalle: `Critico alto: mayor o igual a ${critico} ${unidad}.`,
    };
  }

  return {
    valido: false,
    resumen: 'Critico dentro del rango normal.',
    detalle: 'El valor critico debe quedar por debajo del minimo o por encima del maximo normal.',
  };
}

function CampoTexto({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: keyof ValoresUmbral;
  value: string;
  onChange: (name: keyof ValoresUmbral, value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      <input
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        required
        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-700"
      />
    </label>
  );
}

function CampoNumero({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: keyof ValoresUmbral;
  value: string;
  onChange: (name: keyof ValoresUmbral, value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      <input
        name={name}
        type="number"
        step="0.01"
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        required
        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-700"
      />
    </label>
  );
}

function VistaPreviaUmbral({ evaluacion }: { evaluacion: EvaluacionUmbral }) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${
        evaluacion.valido
          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
          : 'border-amber-200 bg-amber-50 text-amber-900'
      }`}
    >
      <p className="font-semibold">{evaluacion.resumen}</p>
      <p className="mt-1">{evaluacion.detalle}</p>
    </div>
  );
}

function FormularioTipoMedicion({
  tipo,
  modo,
}: {
  tipo?: TipoMedicionConUmbral;
  modo: 'crear' | 'editar';
}) {
  const [valores, setValores] = useState<ValoresUmbral>(() => valoresDesdeTipo(tipo));
  const evaluacion = useMemo(() => evaluarUmbral(valores), [valores]);

  const actualizarValor = (name: keyof ValoresUmbral, value: string) => {
    setValores((actuales) => ({ ...actuales, [name]: value }));
  };

  const esEdicion = modo === 'editar';

  return (
    <form
      action={esEdicion ? actualizarTipoMedicionAdminAccion : crearTipoMedicionAdminAccion}
      onSubmit={(event) => {
        if (!evaluacion.valido) {
          event.preventDefault();
          window.alert(evaluacion.detalle);
          return;
        }

        const accion = esEdicion ? 'guardar este umbral' : 'crear este tipo de medicion';
        if (!window.confirm(`Confirma ${accion}?`)) event.preventDefault();
      }}
      className={`grid gap-3 ${esEdicion ? 'md:grid-cols-2' : 'md:grid-cols-5'}`}
    >
      {tipo ? <input type="hidden" name="tipo_medicion_id" value={tipo.tipo_medicion_id} /> : null}
      <CampoTexto label="Nombre" name="nombre" value={valores.nombre} onChange={actualizarValor} />
      <CampoTexto label="Unidad" name="unidad" value={valores.unidad} onChange={actualizarValor} />
      <CampoNumero
        label="Minimo normal"
        name="valor_minimo_normal"
        value={valores.valor_minimo_normal}
        onChange={actualizarValor}
      />
      <CampoNumero
        label="Maximo normal"
        name="valor_maximo_normal"
        value={valores.valor_maximo_normal}
        onChange={actualizarValor}
      />
      <CampoNumero
        label="Critico"
        name="valor_critico"
        value={valores.valor_critico}
        onChange={actualizarValor}
      />
      <div className={esEdicion ? 'md:col-span-2' : 'md:col-span-5'}>
        <VistaPreviaUmbral evaluacion={evaluacion} />
      </div>
      <button
        type="submit"
        className={
          esEdicion
            ? 'self-end rounded-lg border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white'
            : 'rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 md:col-span-5'
        }
      >
        {esEdicion ? 'Guardar umbral' : 'Crear tipo de medicion'}
      </button>
    </form>
  );
}

export default function PanelConfiguracionClinicaAdmin({
  tiposMedicion,
}: {
  tiposMedicion: TipoMedicionConUmbral[];
}) {
  return (
    <section className="space-y-4">
      <div className="border-b border-slate-300 pb-3">
        <h2 className="text-2xl font-semibold text-slate-950">Configuracion clinica</h2>
        <p className="mt-1 text-sm text-slate-600">
          Tipos de medicion y umbrales usados para evaluar alertas.
        </p>
      </div>

      <PanelDesplegableAdmin titulo="Nuevo tipo de medicion">
        <FormularioTipoMedicion modo="crear" />
      </PanelDesplegableAdmin>

      <div className="grid gap-4 xl:grid-cols-2">
        {tiposMedicion.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500 xl:col-span-2">
            No hay tipos de medicion configurados.
          </p>
        ) : (
          tiposMedicion.map((tipo) => (
            <PanelDesplegableAdmin
              key={tipo.tipo_medicion_id}
              titulo={tipo.nombre}
              meta={tipo.unidad}
            >
              <FormularioTipoMedicion tipo={tipo} modo="editar" />
            </PanelDesplegableAdmin>
          ))
        )}
      </div>
    </section>
  );
}
