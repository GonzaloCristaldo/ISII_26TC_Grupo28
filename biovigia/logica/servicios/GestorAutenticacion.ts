import { RepositorioUsuariosAuth } from '@/modelos/repositorios/RepositorioUsuariosAuth';
import { generarPasswordHash, verificarPassword } from '@/logica/seguridad/password';
import {
  DatosLogin,
  DatosRegistroMedico,
  DatosRegistroPaciente,
} from '@/logica/validadores/validadorAutenticacion';
import { MedicoRegistrable, UsuarioAutenticable, UsuarioSesion } from '@/modelos/tipos';

function mapearUsuarioSesion(usuario: UsuarioAutenticable): UsuarioSesion {
  return {
    usuarioId: usuario.usuarioId,
    username: usuario.username,
    nombreCompleto: usuario.nombreCompleto,
    rol: usuario.rol,
    medicoId: usuario.medicoId,
    pacienteId: usuario.pacienteId,
  };
}

export class GestorAutenticacion {
  constructor(private repoUsuariosAuth: RepositorioUsuariosAuth) { }

  async iniciarSesionConCredenciales(datos: DatosLogin): Promise<UsuarioSesion> {
    const usuario = await this.repoUsuariosAuth.buscarUsuarioPorUsername(datos.username);

    if (!usuario || !verificarPassword(datos.password, usuario.passwordHash)) {
      throw new Error('Usuario o clave invalidos.');
    }

    return mapearUsuarioSesion(usuario);
  }

  async registrarCuentaMedico(datos: DatosRegistroMedico): Promise<UsuarioSesion> {
    const usuario = await this.repoUsuariosAuth.registrarMedico({
      nombreCompleto: datos.nombreCompleto,
      especialidad: datos.especialidad,
      numeroLicencia: datos.numeroLicencia,
      username: datos.username,
      passwordHash: generarPasswordHash(datos.password),
    });

    return mapearUsuarioSesion(usuario);
  }

  async registrarCuentaPaciente(datos: DatosRegistroPaciente): Promise<UsuarioSesion> {
    const usuario = await this.repoUsuariosAuth.registrarPaciente({
      nombreCompleto: datos.nombreCompleto,
      contacto: datos.contacto,
      medicoResponsableId: datos.medicoResponsableId,
      username: datos.username,
      passwordHash: generarPasswordHash(datos.password),
    });

    return mapearUsuarioSesion(usuario);
  }

  async listarMedicosRegistrables(): Promise<MedicoRegistrable[]> {
    return this.repoUsuariosAuth.listarMedicosRegistrables();
  }
}
