import { describe, expect, it } from 'vitest';
import {
  obtenerNombreMedicion,
  obtenerPuntosGrafico,
  obtenerUnidadMedicion,
  ordenarMedicionesPorFecha,
} from '../../app/lib/logicaVisualizacionMediciones';

describe('logicaVisualizacionMediciones', () => {
  it('obtiene unidad configurada o devuelve el tipo como respaldo', () => {
    const tipos = [{ tipo_medicion: 'Glucosa', unidad: 'mg/dL' }];

    expect(obtenerUnidadMedicion('Glucosa', tipos)).toBe('mg/dL');
    expect(obtenerUnidadMedicion('Oxigeno', tipos)).toBe('Oxigeno');
  });

  it('normaliza nombres de medicion para visualizacion', () => {
    expect(obtenerNombreMedicion('PresionArterial')).toBe('Presion Arterial');
    expect(obtenerNombreMedicion('frecuencia_cardiaca')).toBe('frecuencia cardiaca');
  });

  it('ordena mediciones sin mutar el arreglo original', () => {
    const mediciones = [
      { fecha: '2026-06-09T10:00:00.000Z', valor: 1 },
      { fecha: '2026-06-08T10:00:00.000Z', valor: 2 },
    ];

    expect(ordenarMedicionesPorFecha(mediciones, 'asc').map((medicion) => medicion.valor))
      .toEqual([2, 1]);
    expect(mediciones.map((medicion) => medicion.valor)).toEqual([1, 2]);
  });

  it('calcula puntos de grafico y centra valores iguales', () => {
    const puntos = obtenerPuntosGrafico(
      [
        { fecha: '2026-06-08T10:00:00.000Z', valor: 100 },
        { fecha: '2026-06-09T10:00:00.000Z', valor: 100 },
      ],
      100,
      100,
      { ancho: 100, margenHorizontal: 10, margenSuperior: 10, altoDisponible: 40 },
    );

    expect(puntos.map((punto) => punto.x)).toEqual([10, 90]);
    expect(puntos.map((punto) => punto.y)).toEqual([30, 30]);
  });
});
