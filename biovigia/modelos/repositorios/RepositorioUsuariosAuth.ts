import {
  DatosCuentaMedico,
  DatosCuentaPaciente,
  MedicoRegistrable,
  UsuarioAutenticable,
} from '../tipos';

/**
 * Contrato para autenticacion y registro de usuarios.
 * La capa logica no debe conocer si esto termina en Postgres,
 * Supabase u otra persistencia.
 */
export interface RepositorioUsuariosAuth {
  buscarUsuarioPorUsername(username: string): Promise<UsuarioAutenticable | null>;
  registrarMedico(datos: DatosCuentaMedico): Promise<UsuarioAutenticable>;
  registrarPaciente(datos: DatosCuentaPaciente): Promise<UsuarioAutenticable>;
  listarMedicosRegistrables(): Promise<MedicoRegistrable[]>;
}
