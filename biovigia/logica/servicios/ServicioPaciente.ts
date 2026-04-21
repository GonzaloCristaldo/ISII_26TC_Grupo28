import { RepositorioMediciones } from '../../modelos/repositorios/RepositorioMediciones';
import { RepositorioAlertas } from '../../modelos/repositorios/RepositorioAlertas';
import { RepositorioUmbrales } from '../../modelos/repositorios/RepositorioUmbrales';
import { Medicion, Alerta } from '../../modelos/tipos';
import { evaluarMedicion } from '../motorAlertas';

/**
 * Servicio central del Paciente.

 */
export class ServicioPaciente {
  constructor(
    private repoMediciones: RepositorioMediciones,
    private repoAlertas: RepositorioAlertas,
    private repoUmbrales?: RepositorioUmbrales,
  ) { }

  /**
   * Recibe datos de una medición capturada en la Capa de Presentación.
   */

  async registrarNuevaMedicion(datosMedicion: Medicion): Promise<{
    medicion: Medicion;
    alertaGenerada: boolean;
  }> {

    // 1. Guarda la medición usando el contrato 
    const medicionGuardada = await this.repoMediciones.guardar(datosMedicion);

    if (!medicionGuardada.id) {
      throw new Error('No se pudo confirmar el ID de la medicion al guardar');
    }

    // 2. Evaluamos bajo reglas médicas
    const umbral = this.repoUmbrales
      ? await this.repoUmbrales.obtenerPorTipo(medicionGuardada.tipo_medicion)
      : null;
    const estado = evaluarMedicion(medicionGuardada, umbral);

    let alertaGenerada = false;

    // 3. Crea alerta si es necesario (Advertencia o Crítico) 
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

    // 4. Se devuelve un resultado (a la capa de presentacion)
    return {
      medicion: medicionGuardada,
      alertaGenerada,
    };
  }
}
