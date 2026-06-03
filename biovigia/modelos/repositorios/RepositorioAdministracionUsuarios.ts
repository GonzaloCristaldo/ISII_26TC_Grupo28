import {
  DatosEdicionMedico,
  DatosEdicionPaciente,
  UsuarioAdministrable,
} from '../tipos';

export interface RepositorioAdministracionUsuarios {
  listarUsuarios(): Promise<UsuarioAdministrable[]>;
  actualizarMedico(datos: DatosEdicionMedico): Promise<void>;
  actualizarPaciente(datos: DatosEdicionPaciente): Promise<void>;
  cambiarEstadoUsuario(usuarioId: string, activo: boolean): Promise<void>;
}
