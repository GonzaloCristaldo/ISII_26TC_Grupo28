import { RepositorioAdministracionUsuarios } from '../../modelos/repositorios/RepositorioAdministracionUsuarios';
import {
  DatosEdicionMedico,
  DatosEdicionPaciente,
  UsuarioAdministrable,
} from '../../modelos/tipos';

/**
 * Repositorio de administración de usuarios para Supabase.
 * Implementación pendiente — los métodos lanzan error hasta que
 * se conecte el cliente real de Supabase.
 */
export class SupabaseAdministracionUsuariosRepo implements RepositorioAdministracionUsuarios {

  async listarUsuarios(): Promise<UsuarioAdministrable[]> {
    throw new Error('listarUsuarios no implementado en Supabase.');
  }

  async actualizarMedico(datos: DatosEdicionMedico): Promise<void> {
    void datos;
    throw new Error('actualizarMedico no implementado en Supabase.');
  }

  async actualizarPaciente(datos: DatosEdicionPaciente): Promise<void> {
    void datos;
    throw new Error('actualizarPaciente no implementado en Supabase.');
  }

  async cambiarEstadoUsuario(usuarioId: string, activo: boolean): Promise<void> {
    void usuarioId;
    void activo;
    throw new Error('cambiarEstadoUsuario no implementado en Supabase.');
  }
}
