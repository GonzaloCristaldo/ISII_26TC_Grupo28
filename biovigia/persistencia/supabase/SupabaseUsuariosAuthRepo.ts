import { RepositorioUsuariosAuth } from '../../modelos/repositorios/RepositorioUsuariosAuth';
import {
  DatosCuentaMedico,
  DatosCuentaPaciente,
  MedicoRegistrable,
  UsuarioAutenticable,
} from '../../modelos/tipos';
import { supabase } from './SupabaseCliente';

/**
 * Repositorio de autenticación y registro de usuarios para Supabase.
 * Implementación pendiente — los métodos lanzan error hasta que
 * se conecte el cliente real de Supabase.
 */
export class SupabaseUsuariosAuthRepo implements RepositorioUsuariosAuth {

  async buscarUsuarioPorUsername(username: string): Promise<UsuarioAutenticable | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select<{ usuario_id: string; username: string; password_hash: string; rol: string }>('*');

    if (error) throw new Error(`Error al buscar usuario: ${error.message}`);

    const encontrado = data.find((u) => u.username === username);
    if (!encontrado) return null;

    return {
      usuarioId: encontrado.usuario_id,
      username: encontrado.username,
      passwordHash: encontrado.password_hash,
      rol: encontrado.rol as UsuarioAutenticable['rol'],
    };
  }

  async registrarMedico(datos: DatosCuentaMedico): Promise<UsuarioAutenticable> {
    void datos;
    throw new Error('registrarMedico no implementado en Supabase.');
  }

  async registrarPaciente(datos: DatosCuentaPaciente): Promise<UsuarioAutenticable> {
    void datos;
    throw new Error('registrarPaciente no implementado en Supabase.');
  }

  async listarMedicosRegistrables(): Promise<MedicoRegistrable[]> {
    throw new Error('listarMedicosRegistrables no implementado en Supabase.');
  }
}
