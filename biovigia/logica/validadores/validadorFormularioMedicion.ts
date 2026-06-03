export type DatosFormularioMedicionEntrada = {
  tipo_medicion: string;
  valor: number;
};

export type DatosFormularioMedicion =
  | {
      ok: true;
      tipo_medicion: string;
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
  if (!datos.tipo_medicion.trim() || Number.isNaN(datos.valor) || datos.valor <= 0) {
    return {
      ok: false,
      message: 'La medicion recibida es invalida.',
      type: 'error',
    };
  }

  return {
    ok: true,
    tipo_medicion: datos.tipo_medicion.trim(),
    valor: datos.valor,
  };
}
