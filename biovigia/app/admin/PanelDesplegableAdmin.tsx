import type { ReactNode } from 'react';

type Props = {
  titulo: string;
  descripcion?: string;
  meta?: string;
  children: ReactNode;
  className?: string;
  contenidoClassName?: string;
};

export default function PanelDesplegableAdmin({
  titulo,
  descripcion,
  meta,
  children,
  className = '',
  contenidoClassName = '',
}: Props) {
  return (
    <details className={`group self-start rounded-lg border border-slate-300 bg-white ${className}`}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-slate-950">{titulo}</h3>
          {descripcion ? <p className="mt-1 text-sm text-slate-500">{descripcion}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {meta ? (
            <span className="font-mono text-sm text-slate-500">{meta}</span>
          ) : null}
          <span
            aria-hidden="true"
            className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-sm font-semibold text-slate-500 transition group-open:rotate-90"
          >
            &gt;
          </span>
        </div>
      </summary>
      <div className={`border-t border-slate-200 px-5 py-4 ${contenidoClassName}`}>
        {children}
      </div>
    </details>
  );
}
