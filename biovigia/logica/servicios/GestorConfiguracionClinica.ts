import { RepositorioConfiguracionClinica } from '@/modelos/repositorios/RepositorioConfiguracionClinica';
import { RepositorioUmbrales } from '@/modelos/repositorios/RepositorioUmbrales';
import {
  DatosActualizacionTipoMedicionConUmbral,
  DatosTipoMedicionConUmbral,
  TipoMedicionConUmbral,
  Umbral,
} from '@/modelos/tipos';

function normalizarDatosTipoMedicion<T extends DatosTipoMedicionConUmbral>(datos: T): T {
  return {
    ...datos,
    nombre: datos.nombre.trim(),
    unidad: datos.unidad.trim(),
  };
}

function validarUmbral(datos: DatosTipoMedicionConUmbral) {
  if (!datos.nombre || !datos.unidad) {
    throw new Error('Completa el nombre y la unidad del tipo de medicion.');
  }

  if (
    !Number.isFinite(datos.valor_minimo_normal) ||
    !Number.isFinite(datos.valor_maximo_normal) ||
    !Number.isFinite(datos.valor_critico)
  ) {
    throw new Error('Los valores del umbral deben ser numericos.');
  }

  const rangoNormalValido =
    datos.valor_minimo_normal >= 0 &&
    datos.valor_minimo_normal < datos.valor_maximo_normal;
  const valorCriticoValido =
    datos.valor_critico < datos.valor_minimo_normal ||
    datos.valor_critico > datos.valor_maximo_normal;

  if (!rangoNormalValido || !valorCriticoValido) {
    throw new Error('El umbral debe tener un rango normal valido y un valor critico fuera del rango normal.');
  }
}

function mapearUmbralATipo(umbral: Umbral): TipoMedicionConUmbral {
  return {
    id: umbral.tipo_medicion_id,
    nombre: umbral.tipo_medicion,
    unidad: umbral.unidad,
    valor_minimo_normal: umbral.valor_minimo_normal,
    valor_maximo_normal: umbral.valor_maximo_normal,
    valor_critico: umbral.valor_critico,
  };
}

export class GestorConfiguracionClinica {
  constructor(
    private repoUmbrales: RepositorioUmbrales,
    private repoConfiguracionClinica?: RepositorioConfiguracionClinica,
  ) { }

  async listarUmbrales(): Promise<Umbral[]> {
    return this.repoUmbrales.listar();
  }

  async listarTiposMedicionConUmbral(): Promise<TipoMedicionConUmbral[]> {
    const umbrales = await this.repoUmbrales.listar();
    return umbrales.map(mapearUmbralATipo);
  }

  async crearTipoMedicionConUmbral(
    datos: DatosTipoMedicionConUmbral,
  ): Promise<TipoMedicionConUmbral> {
    if (!this.repoConfiguracionClinica) {
      throw new Error('Repositorio de configuracion clinica no disponible.');
    }

    const datosNormalizados = normalizarDatosTipoMedicion(datos);
    validarUmbral(datosNormalizados);
    return this.repoConfiguracionClinica.crearTipoMedicionConUmbral(datosNormalizados);
  }

  async actualizarTipoMedicionConUmbral(
    datos: DatosActualizacionTipoMedicionConUmbral,
  ): Promise<TipoMedicionConUmbral> {
    if (!this.repoConfiguracionClinica) {
      throw new Error('Repositorio de configuracion clinica no disponible.');
    }

    if (!datos.tipoMedicionId) {
      throw new Error('El tipo de medicion indicado no existe.');
    }

    const datosNormalizados = normalizarDatosTipoMedicion(datos);
    validarUmbral(datosNormalizados);
    return this.repoConfiguracionClinica.actualizarTipoMedicionConUmbral(datosNormalizados);
  }
}
