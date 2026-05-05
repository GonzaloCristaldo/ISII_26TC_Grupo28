import { TipoMedicionNombre } from '@/modelos/tipos';

export type DatosFormularioMedicionEntrada = {
  tipo_medicion: string;
  valor: number;
};

export type DatosFormularioMedicion =
  | {
      ok: true;
      tipo_medicion: TipoMedicionNombre;
      valor: number;
    }
  | {
      ok: false;
      message: string;
      type: 'error';
    };

export function validarDatosFormularioMedicion(
  datos: DatosFormularioMedicionEntrada,
): DatosFormularioMedicion {
  if (
    (datos.tipo_medicion !== 'PresionArterial' && datos.tipo_medicion !== 'Glucosa') ||
    Number.isNaN(datos.valor)
  ) {
    return {
      ok: false,
      message: 'La medicion recibida es invalida.',
      type: 'error',
    };
  }

  return {
    ok: true,
    tipo_medicion: datos.tipo_medicion,
    valor: datos.valor,
  };
}
