
/** Repositorio para la gestión de configuraciones de tipos de mediciones con umbrales en la clínica. */

import {
  DatosActualizacionTipoMedicionConUmbral,
  DatosTipoMedicionConUmbral,
  TipoMedicionConUmbral,
} from '../tipos';

export interface RepositorioConfiguracionClinica {
  crearTipoMedicionConUmbral(
    datos: DatosTipoMedicionConUmbral,
  ): Promise<TipoMedicionConUmbral>;
  actualizarTipoMedicionConUmbral(
    datos: DatosActualizacionTipoMedicionConUmbral,
  ): Promise<TipoMedicionConUmbral>;
}
