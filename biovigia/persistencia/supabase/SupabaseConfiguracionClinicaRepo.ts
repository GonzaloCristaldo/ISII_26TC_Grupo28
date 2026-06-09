import { RepositorioConfiguracionClinica } from '../../modelos/repositorios/RepositorioConfiguracionClinica';
import {
  DatosActualizacionTipoMedicionConUmbral,
  DatosTipoMedicionConUmbral,
  TipoMedicionConUmbral,
} from '../../modelos/tipos';

/**
 * Repositorio de configuración clínica (tipos de medición y umbrales) para Supabase.
 * Implementación pendiente — los métodos lanzan error hasta que
 * se conecte el cliente real de Supabase.
 */
export class SupabaseConfiguracionClinicaRepo implements RepositorioConfiguracionClinica {

  async crearTipoMedicionConUmbral(datos: DatosTipoMedicionConUmbral): Promise<TipoMedicionConUmbral> {
    void datos;
    throw new Error('crearTipoMedicionConUmbral no implementado en Supabase.');
  }

  async actualizarTipoMedicionConUmbral(datos: DatosActualizacionTipoMedicionConUmbral): Promise<TipoMedicionConUmbral> {
    void datos;
    throw new Error('actualizarTipoMedicionConUmbral no implementado en Supabase.');
  }
}
