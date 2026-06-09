import { GestorAlertasMedico } from '../logica/servicios/GestorAlertasMedico';
import { GestorRegistroMedicion } from '../logica/servicios/GestorRegistroMedicion';
import {
  calcularPacientesAfectados,
  calcularResumenCriticidad,
  ordenarAlertasPorPrioridad,
} from '../app/medico/dashboard/logicaDashboardMedico';
import {
  filtrarMedicionesPorTipo,
  obtenerTipoActivo,
  obtenerTiposRegistrados,
} from '../app/paciente/dashboard/logicaDashboardPaciente';
import type { RepositorioAlertas } from '../modelos/repositorios/RepositorioAlertas';
import type { RepositorioMediciones } from '../modelos/repositorios/RepositorioMediciones';
import type { RepositorioUmbrales } from '../modelos/repositorios/RepositorioUmbrales';
import type { Alerta, AlertaExtendida, Medicion, Umbral } from '../modelos/tipos';

type ResultadoEscenario = {
  id: string;
  tipo: 'consulta' | 'actualizacion' | 'dato erroneo';
  descripcion: string;
  esperado: string;
  obtenido: string;
  ok: boolean;
};

const medicoId = 'medico-1';
const pacienteId = 'paciente-1';

const umbrales: Umbral[] = [
  {
    tipo_medicion_id: 'tipo-glucosa',
    tipo_medicion: 'Glucosa',
    unidad: 'mg/dL',
    valor_minimo_normal: 70,
    valor_maximo_normal: 110,
    valor_critico: 200,
  },
  {
    tipo_medicion_id: 'tipo-oxigeno',
    tipo_medicion: 'Oxigeno en sangre',
    unidad: '%',
    valor_minimo_normal: 95,
    valor_maximo_normal: 100,
    valor_critico: 90,
  },
];

class RepoUmbralesMemoria implements RepositorioUmbrales {
  async listar() {
    return umbrales;
  }

  async obtenerPorTipo(tipoMedicion: Medicion['tipo_medicion']) {
    return umbrales.find((umbral) => umbral.tipo_medicion === tipoMedicion) ?? null;
  }
}

class RepoMedicionesMemoria implements RepositorioMediciones {
  private secuencia = 1;
  private mediciones: Medicion[] = [];

  async guardar(medicion: Medicion): Promise<Medicion> {
    const guardada = {
      ...medicion,
      medicion_id: `medicion-${this.secuencia++}`,
    };
    this.mediciones.push(guardada);
    return guardada;
  }

  async obtenerPorPaciente(idPaciente: string): Promise<Medicion[]> {
    return this.mediciones.filter((medicion) => medicion.paciente_id === idPaciente);
  }
}

class RepoAlertasMemoria implements RepositorioAlertas {
  private secuencia = 1;
  private alertas: AlertaExtendida[] = [];

  async guardar(alerta: Alerta): Promise<Alerta> {
    const alertaGuardada: AlertaExtendida = {
      ...alerta,
      alerta_id: `alerta-${this.secuencia++}`,
      fecha: alerta.fecha ?? new Date(),
      paciente_id: pacienteId,
      paciente_nombre: 'Paciente Demo',
      medicion_tipo: alerta.estado_alerta === 'Critico' ? 'Glucosa' : 'Glucosa',
      medicion_unidad: 'mg/dL',
      medicion_valor: alerta.estado_alerta === 'Critico' ? 220 : 150,
      medicion_fecha: new Date(),
    };

    this.alertas.push(alertaGuardada);
    return alertaGuardada;
  }

  async obtenerPendientesPorMedico(idMedico: string): Promise<AlertaExtendida[]> {
    if (idMedico !== medicoId) return [];
    return this.alertas.filter((alerta) => !alerta.leido_por_medico);
  }

  async marcarComoLeida(alertaId: string, idMedico: string): Promise<void> {
    if (idMedico !== medicoId) {
      throw new Error('El medico indicado no puede atender esta alerta.');
    }

    const alerta = this.alertas.find((item) => item.alerta_id === alertaId);

    if (!alerta) {
      throw new Error('No existe la alerta indicada.');
    }

    alerta.leido_por_medico = true;
  }
}

function registrarResultado(
  resultados: ResultadoEscenario[],
  resultado: ResultadoEscenario,
) {
  resultados.push(resultado);
  const estado = resultado.ok ? 'OK' : 'FALLO';
  console.log(`[${estado}] ${resultado.id} ${resultado.tipo}: ${resultado.descripcion}`);
  console.log(`  Esperado: ${resultado.esperado}`);
  console.log(`  Obtenido: ${resultado.obtenido}`);
}

async function main() {
  const resultados: ResultadoEscenario[] = [];
  const repoMediciones = new RepoMedicionesMemoria();
  const repoAlertas = new RepoAlertasMemoria();
  const repoUmbrales = new RepoUmbralesMemoria();
  const gestorRegistro = new GestorRegistroMedicion(repoMediciones, repoAlertas, repoUmbrales);
  const gestorAlertas = new GestorAlertasMedico(repoAlertas, repoMediciones);

  console.log('Escenarios operativos repetibles: consultas y actualizaciones centrales');
  console.log(`Fecha de ejecucion: ${new Date().toISOString()}`);
  console.log('');

  const medicionNormal = await gestorRegistro.registrarNuevaMedicion({
    paciente_id: pacienteId,
    tipo_medicion: 'Glucosa',
    valor: 95,
    fecha: new Date('2026-06-09T09:00:00.000Z'),
  });
  registrarResultado(resultados, {
    id: 'SC-01',
    tipo: 'actualizacion',
    descripcion: 'Registrar medicion normal de glucosa',
    esperado: 'medicion guardada sin alerta',
    obtenido: `alertaGenerada=${medicionNormal.alertaGenerada}`,
    ok: medicionNormal.alertaGenerada === false,
  });

  const medicionAdvertencia = await gestorRegistro.registrarNuevaMedicion({
    paciente_id: pacienteId,
    tipo_medicion: 'Glucosa',
    valor: 150,
    fecha: new Date('2026-06-09T10:00:00.000Z'),
  });
  registrarResultado(resultados, {
    id: 'SC-02',
    tipo: 'actualizacion',
    descripcion: 'Registrar medicion de advertencia',
    esperado: 'medicion guardada y alerta generada',
    obtenido: `alertaGenerada=${medicionAdvertencia.alertaGenerada}`,
    ok: medicionAdvertencia.alertaGenerada === true,
  });

  const medicionCritica = await gestorRegistro.registrarNuevaMedicion({
    paciente_id: pacienteId,
    tipo_medicion: 'Glucosa',
    valor: 220,
    fecha: new Date('2026-06-09T11:00:00.000Z'),
  });
  registrarResultado(resultados, {
    id: 'SC-03',
    tipo: 'actualizacion',
    descripcion: 'Registrar medicion critica',
    esperado: 'medicion guardada y alerta critica generada',
    obtenido: `alertaGenerada=${medicionCritica.alertaGenerada}`,
    ok: medicionCritica.alertaGenerada === true,
  });

  let errorDatoErroneo = '';
  try {
    await gestorRegistro.registrarNuevaMedicion({
      paciente_id: pacienteId,
      tipo_medicion: 'Oxigeno en sangre',
      valor: 101,
      fecha: new Date('2026-06-09T12:00:00.000Z'),
    });
  } catch (error) {
    errorDatoErroneo = error instanceof Error ? error.message : String(error);
  }
  registrarResultado(resultados, {
    id: 'SC-04',
    tipo: 'dato erroneo',
    descripcion: 'Intentar registrar oxigeno imposible',
    esperado: 'rechazo por limite biologico',
    obtenido: errorDatoErroneo || 'sin error',
    ok: errorDatoErroneo.includes('no es fisiologicamente posible'),
  });

  const alertasPendientes = await gestorAlertas.revisarAlertasPendientes(medicoId);
  registrarResultado(resultados, {
    id: 'SC-05',
    tipo: 'consulta',
    descripcion: 'Consultar alertas pendientes del medico',
    esperado: '2 alertas pendientes',
    obtenido: `${alertasPendientes.length} alertas pendientes`,
    ok: alertasPendientes.length === 2,
  });

  await gestorAlertas.descartarAlerta(alertasPendientes[0].alerta_id!, medicoId);
  const alertasLuegoDeAtender = await gestorAlertas.revisarAlertasPendientes(medicoId);
  registrarResultado(resultados, {
    id: 'SC-06',
    tipo: 'actualizacion',
    descripcion: 'Atender una alerta pendiente',
    esperado: 'queda 1 alerta pendiente',
    obtenido: `${alertasLuegoDeAtender.length} alertas pendientes`,
    ok: alertasLuegoDeAtender.length === 1,
  });

  const alertasDashboard = ordenarAlertasPorPrioridad(
    alertasLuegoDeAtender.map((alerta) => ({
      alerta_id: alerta.alerta_id!,
      medicion_id: alerta.medicion_id,
      estado_alerta: alerta.estado_alerta,
      leido_por_medico: alerta.leido_por_medico,
      fecha: alerta.fecha!.toISOString(),
      paciente_id: alerta.paciente_id,
      paciente_nombre: alerta.paciente_nombre,
      medicion_tipo: alerta.medicion_tipo,
      medicion_unidad: alerta.medicion_unidad,
      medicion_valor: alerta.medicion_valor,
      medicion_fecha: alerta.medicion_fecha.toISOString(),
    })),
  );
  const resumen = calcularResumenCriticidad(alertasDashboard);
  registrarResultado(resultados, {
    id: 'SC-07',
    tipo: 'consulta',
    descripcion: 'Consultar resumen del dashboard medico',
    esperado: 'alertas ordenadas, resumen calculado y pacientes afectados',
    obtenido: `criticas=${resumen.totalCriticas}, advertencias=${resumen.totalAdvertencias}, pacientes=${calcularPacientesAfectados(alertasDashboard)}`,
    ok: alertasDashboard.length === 1 && calcularPacientesAfectados(alertasDashboard) === 1,
  });

  const historial = (await gestorAlertas.revisarHistorialPaciente(pacienteId)).map((medicion) => ({
    medicion_id: medicion.medicion_id,
    paciente_id: medicion.paciente_id,
    tipo_medicion: medicion.tipo_medicion,
    valor: medicion.valor,
    fecha: medicion.fecha.toISOString(),
  }));
  const tiposRegistrados = obtenerTiposRegistrados(historial);
  const tipoActivo = obtenerTipoActivo(tiposRegistrados, 'Glucosa');
  const historialGlucosa = filtrarMedicionesPorTipo(historial, tipoActivo);
  registrarResultado(resultados, {
    id: 'SC-08',
    tipo: 'consulta',
    descripcion: 'Consultar datos del dashboard paciente',
    esperado: 'historial y tipos disponibles para Glucosa',
    obtenido: `tipos=${tiposRegistrados.join(', ')}, historialGlucosa=${historialGlucosa.length}`,
    ok: tipoActivo === 'Glucosa' && historialGlucosa.length === 3,
  });

  const aprobados = resultados.filter((resultado) => resultado.ok).length;
  const fallidos = resultados.length - aprobados;

  console.log('');
  console.log(`Resumen: ${aprobados}/${resultados.length} escenarios correctos.`);

  if (fallidos > 0) {
    console.error(`Fallaron ${fallidos} escenarios.`);
    process.exitCode = 1;
  }
}

void main();
