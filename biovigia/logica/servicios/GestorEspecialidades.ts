import { RepositorioEspecialidades } from '@/modelos/repositorios/RepositorioEspecialidades';
import { DatosEspecialidad, Especialidad } from '@/modelos/tipos';

function normalizar(datos: DatosEspecialidad): DatosEspecialidad {
  return {
    nombre: datos.nombre.trim(),
  };
}

function validar(datos: DatosEspecialidad) {
  if (!datos.nombre) {
    throw new Error('Completa el nombre de la especialidad.');
  }
}

export class GestorEspecialidades {
  constructor(private repoEspecialidades: RepositorioEspecialidades) {}

  async listar(): Promise<Especialidad[]> {
    return this.repoEspecialidades.listar();
  }

  async crear(datos: DatosEspecialidad): Promise<Especialidad> {
    const datosNormalizados = normalizar(datos);
    validar(datosNormalizados);
    return this.repoEspecialidades.crear(datosNormalizados);
  }
}
