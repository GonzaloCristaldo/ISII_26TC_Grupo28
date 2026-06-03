import { RepositorioMediciones } from '../../modelos/repositorios/RepositorioMediciones';
import { RepositorioAlertas } from '../../modelos/repositorios/RepositorioAlertas';
import { RepositorioUmbrales } from '../../modelos/repositorios/RepositorioUmbrales';
import { Medicion, Alerta } from '../../modelos/tipos';
import { evaluarMedicion } from '../evaluadorEstadoMedicion';
import { validarLimitesBiologicos } from '../validadorMediciones';

/**
 * Gestor del registro de mediciones del Paciente.
 */
export class GestorRegistroMedicion {
  constructor(
    private repoMediciones: RepositorioMediciones,
    private repoAlertas: RepositorioAlertas,
    private repoUmbrales?: RepositorioUmbrales,
  ) { }

  /**
   * Recibe datos de una medicion capturada en la Capa de Presentacion.
   */
  async registrarNuevaMedicion(datosMedicion: Medicion): Promise<{
    medicion: Medicion;
    alertaGenerada: boolean;
  }> {
    const umbral = this.repoUmbrales
      ? await this.repoUmbrales.obtenerPorTipo(datosMedicion.tipo_medicion)
      : null;

    if (!umbral) {
      throw new Error(
        `No existe un umbral configurado para el tipo de medicion ${datosMedicion.tipo_medicion}.`,
      );
    }

    // 1. Validar que la medicion sea fisicamente posible para un ser humano.
    validarLimitesBiologicos(datosMedicion.tipo_medicion, datosMedicion.valor, umbral);

    // 2. Guarda la medicion usando el contrato.
    const medicionGuardada = await this.repoMediciones.guardar(datosMedicion);

    if (!medicionGuardada.id) {
      throw new Error('No se pudo confirmar el ID de la medicion al guardar');
    }

    // 3. Evalua bajo reglas medicas.
    const estado = evaluarMedicion(medicionGuardada, umbral);

    let alertaGenerada = false;

    // 4. Crea alerta si es necesario.
    if (estado !== 'Normal') {
      const nuevaAlerta: Alerta = {
        medicion_id: medicionGuardada.id,
        estado_alerta: estado,
        leido_por_medico: false,
        fecha: new Date(),
      };

      await this.repoAlertas.guardar(nuevaAlerta);
      alertaGenerada = true;
    }

    return {
      medicion: medicionGuardada,
      alertaGenerada,
    };
  }
}
