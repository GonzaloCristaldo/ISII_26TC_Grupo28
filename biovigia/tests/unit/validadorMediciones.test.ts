import { describe, expect, it } from 'vitest';
import { validarDatosFormularioMedicion } from '../../logica/validadores/validadorFormularioMedicion';
import { validarLimitesBiologicos } from '../../logica/validadorMediciones';

describe('validarDatosFormularioMedicion', () => {
  it('rechaza mediciones sin tipo o con valor invalido', () => {
    expect(validarDatosFormularioMedicion({ tipo_medicion: '', valor: 100 })).toMatchObject({
      ok: false,
      type: 'error',
    });
    expect(validarDatosFormularioMedicion({ tipo_medicion: 'Glucosa', valor: 0 })).toMatchObject({
      ok: false,
      type: 'error',
    });
  });

  it('normaliza el tipo recibido y conserva el valor', () => {
    expect(validarDatosFormularioMedicion({ tipo_medicion: '  Glucosa  ', valor: 120 }))
      .toEqual({ ok: true, tipo_medicion: 'Glucosa', valor: 120 });
  });
});

describe('validarLimitesBiologicos', () => {
  it('permite valores fisiologicamente posibles para tipos reconocidos', () => {
    expect(() => validarLimitesBiologicos('Glucosa', 120, { unidad: 'mg/dL' })).not.toThrow();
  });

  it('rechaza valores fisiologicamente imposibles', () => {
    expect(() => validarLimitesBiologicos('Oxigeno en sangre', 101, { unidad: '%' }))
      .toThrow('no es fisiologicamente posible');
  });

  it('usa la unidad como respaldo si el tipo no es reconocible', () => {
    expect(() => validarLimitesBiologicos('Valor personalizado', 98, { unidad: '%' }))
      .not.toThrow();
  });
});
