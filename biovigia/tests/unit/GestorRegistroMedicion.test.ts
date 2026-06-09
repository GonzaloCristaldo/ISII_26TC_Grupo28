import { describe, expect, it, vi } from 'vitest';
import { GestorRegistroMedicion } from '../../logica/servicios/GestorRegistroMedicion';
import type { Medicion, Umbral } from '../../modelos/tipos';

const umbralGlucosa: Umbral = {
  tipo_medicion_id: 'tipo-glucosa',
  tipo_medicion: 'Glucosa',
  unidad: 'mg/dL',
  valor_minimo_normal: 70,
  valor_maximo_normal: 110,
  valor_critico: 200,
};

const medicionBase: Medicion = {
  paciente_id: 'paciente-1',
  tipo_medicion: 'Glucosa',
  valor: 95,
  fecha: new Date('2026-06-09T10:00:00.000Z'),
};

function crearRepositorios(valorGuardado: Medicion = { ...medicionBase, medicion_id: 'medicion-1' }) {
  return {
    repoMediciones: {
      guardar: vi.fn().mockResolvedValue(valorGuardado),
      obtenerPorPaciente: vi.fn(),
    },
    repoAlertas: {
      guardar: vi.fn().mockResolvedValue({ alerta_id: 'alerta-1' }),
      obtenerPendientesPorMedico: vi.fn(),
      marcarComoLeida: vi.fn(),
    },
    repoUmbrales: {
      listar: vi.fn(),
      obtenerPorTipo: vi.fn().mockResolvedValue(umbralGlucosa),
    },
  };
}

describe('GestorRegistroMedicion', () => {
  it('guarda una medicion normal sin generar alerta', async () => {
    const repos = crearRepositorios();
    const gestor = new GestorRegistroMedicion(
      repos.repoMediciones,
      repos.repoAlertas,
      repos.repoUmbrales,
    );

    const resultado = await gestor.registrarNuevaMedicion(medicionBase);

    expect(resultado.alertaGenerada).toBe(false);
    expect(repos.repoMediciones.guardar).toHaveBeenCalledWith(medicionBase);
    expect(repos.repoAlertas.guardar).not.toHaveBeenCalled();
  });

  it('genera alerta cuando la medicion queda en advertencia', async () => {
    const repos = crearRepositorios({ ...medicionBase, medicion_id: 'medicion-1', valor: 150 });
    const gestor = new GestorRegistroMedicion(
      repos.repoMediciones,
      repos.repoAlertas,
      repos.repoUmbrales,
    );

    const resultado = await gestor.registrarNuevaMedicion({ ...medicionBase, valor: 150 });

    expect(resultado.alertaGenerada).toBe(true);
    expect(repos.repoAlertas.guardar).toHaveBeenCalledWith(
      expect.objectContaining({
        medicion_id: 'medicion-1',
        estado_alerta: 'Advertencia',
        leido_por_medico: false,
      }),
    );
  });

  it('lanza error si no existe umbral configurado', async () => {
    const repos = crearRepositorios();
    repos.repoUmbrales.obtenerPorTipo.mockResolvedValue(null);
    const gestor = new GestorRegistroMedicion(
      repos.repoMediciones,
      repos.repoAlertas,
      repos.repoUmbrales,
    );

    await expect(gestor.registrarNuevaMedicion(medicionBase))
      .rejects.toThrow('No existe un umbral configurado');
    expect(repos.repoMediciones.guardar).not.toHaveBeenCalled();
  });

  it('usa registro atomico si el repositorio lo soporta', async () => {
    const repoMedicionesAtomico = {
      guardar: vi.fn(),
      obtenerPorPaciente: vi.fn(),
      registrarMedicionConResultado: vi.fn().mockResolvedValue({
        medicion: { ...medicionBase, medicion_id: 'medicion-atomica', valor: 210 },
        alertaGenerada: true,
      }),
    };
    const repos = crearRepositorios();
    const gestor = new GestorRegistroMedicion(
      repoMedicionesAtomico,
      repos.repoAlertas,
      repos.repoUmbrales,
    );

    const resultado = await gestor.registrarNuevaMedicion({ ...medicionBase, valor: 210 });

    expect(resultado.alertaGenerada).toBe(true);
    expect(repoMedicionesAtomico.registrarMedicionConResultado)
      .toHaveBeenCalledWith(expect.objectContaining({ valor: 210 }), 'Critico');
    expect(repos.repoAlertas.guardar).not.toHaveBeenCalled();
  });
});
