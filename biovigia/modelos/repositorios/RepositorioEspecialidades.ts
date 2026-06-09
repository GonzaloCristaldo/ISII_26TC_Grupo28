import { DatosEspecialidad, Especialidad } from '../tipos';

export interface RepositorioEspecialidades {
  listar(): Promise<Especialidad[]>;
  crear(datos: DatosEspecialidad): Promise<Especialidad>;
}
