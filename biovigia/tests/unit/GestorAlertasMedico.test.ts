import { describe, expect, it, vi } from 'vitest';
import { GestorAlertasMedico } from '../../logica/servicios/GestorAlertasMedico';

describe('GestorAlertasMedico', () => {
  it('consulta alertas pendientes usando el medico indicado', async () => {
    const alertas = [{ alerta_id: 'alerta-1', paciente_nombre: 'Paciente Uno' }];
    const repoAlertas = {
      guardar: vi.fn(),
      obtenerPendientesPorMedico: vi.fn().mockResolvedValue(alertas),
      marcarComoLeida: vi.fn(),
    };
    const gestor = new GestorAlertasMedico(repoAlertas);

    await expect(gestor.revisarAlertasPendientes('medico-1')).resolves.toBe(alertas);
    expect(repoAlertas.obtenerPendientesPorMedico).toHaveBeenCalledWith('medico-1');
  });

  it('marca una alerta como leida con alertaId y medicoId', async () => {
    const repoAlertas = {
      guardar: vi.fn(),
      obtenerPendientesPorMedico: vi.fn(),
      marcarComoLeida: vi.fn().mockResolvedValue(undefined),
    };
    const gestor = new GestorAlertasMedico(repoAlertas);

    await gestor.descartarAlerta('alerta-1', 'medico-1');

    expect(repoAlertas.marcarComoLeida).toHaveBeenCalledWith('alerta-1', 'medico-1');
  });

  it('lanza error al consultar historial si no tiene repositorio de mediciones', async () => {
    const repoAlertas = {
      guardar: vi.fn(),
      obtenerPendientesPorMedico: vi.fn(),
      marcarComoLeida: vi.fn(),
    };
    const gestor = new GestorAlertasMedico(repoAlertas);

    await expect(gestor.revisarHistorialPaciente('paciente-1'))
      .rejects.toThrow('Repositorio de mediciones no disponible');
  });
});
