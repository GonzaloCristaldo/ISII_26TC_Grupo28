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
