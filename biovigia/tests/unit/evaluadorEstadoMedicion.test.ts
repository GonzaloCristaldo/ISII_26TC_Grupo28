import { describe, expect, it } from 'vitest';
import { evaluarMedicion } from '../../logica/evaluadorEstadoMedicion';
import type { Medicion, Umbral } from '../../modelos/tipos';

const umbralGlucosa: Umbral = {
  tipo_medicion_id: 'tipo-glucosa',
  tipo_medicion: 'Glucosa',
  unidad: 'mg/dL',
  valor_minimo_normal: 70,
  valor_maximo_normal: 110,
  valor_critico: 200,
};

function medicion(valor: number): Medicion {
  return {
    paciente_id: 'paciente-1',
    tipo_medicion: 'Glucosa',
    valor,
    fecha: new Date('2026-06-09T10:00:00.000Z'),
  };
}

describe('evaluarMedicion', () => {
  it('devuelve Normal si el valor esta dentro del rango normal', () => {
    expect(evaluarMedicion(medicion(95), umbralGlucosa)).toBe('Normal');
  });

  it('devuelve Advertencia si el valor supera el maximo normal sin llegar a critico', () => {
    expect(evaluarMedicion(medicion(150), umbralGlucosa)).toBe('Advertencia');
  });

  it('devuelve Critico si el valor alcanza el umbral critico alto', () => {
    expect(evaluarMedicion(medicion(200), umbralGlucosa)).toBe('Critico');
  });

  it('devuelve Critico si el valor alcanza el umbral critico bajo', () => {
    const umbralOxigeno: Umbral = {
      tipo_medicion_id: 'tipo-oxigeno',
      tipo_medicion: 'Oxigeno en sangre',
      unidad: '%',
      valor_minimo_normal: 95,
      valor_maximo_normal: 100,
      valor_critico: 90,
    };

    expect(evaluarMedicion({ ...medicion(90), tipo_medicion: 'Oxigeno en sangre' }, umbralOxigeno))
      .toBe('Critico');
  });
});
