import { RepositorioAdministracionUsuarios } from '@/modelos/repositorios/RepositorioAdministracionUsuarios';
import { RepositorioUsuariosAuth } from '@/modelos/repositorios/RepositorioUsuariosAuth';
import { generarPasswordHash } from '@/logica/seguridad/password';
import {
  DatosRegistroMedico,
  DatosRegistroPaciente,
  validarDatosRegistroMedico,
  validarDatosRegistroPaciente,
} from '@/logica/validadores/validadorAutenticacion';
import {
  DatosEdicionMedico,
  DatosEdicionPaciente,
  MedicoRegistrable,
  UsuarioAdministrable,
} from '@/modelos/tipos';

function validarDatosEdicionMedico(datos: DatosEdicionMedico) {
  if (!datos.medicoId || !datos.nombreCompleto || !datos.especialidad || !datos.numeroLicencia) {
    throw new Error('Completa todos los datos del medico.');
  }
}

function validarDatosEdicionPaciente(datos: DatosEdicionPaciente) {
  if (!datos.pacienteId || !datos.nombreCompleto || !datos.contacto || !datos.medicoResponsableId) {
    throw new Error('Completa todos los datos del paciente.');
  }
}

export class GestorAdministracionUsuarios {
  constructor(
    private repoAdministracionUsuarios: RepositorioAdministracionUsuarios,
    private repoUsuariosAuth: RepositorioUsuariosAuth,
  ) { }

  async listarUsuarios(): Promise<UsuarioAdministrable[]> {
    return this.repoAdministracionUsuarios.listarUsuarios();
  }

  async listarMedicosRegistrables(): Promise<MedicoRegistrable[]> {
    return this.repoUsuariosAuth.listarMedicosRegistrables();
  }

  async registrarMedico(datos: DatosRegistroMedico): Promise<void> {
    validarDatosRegistroMedico(datos);

    await this.repoUsuariosAuth.registrarMedico({
      nombreCompleto: datos.nombreCompleto,
      especialidad: datos.especialidad,
      numeroLicencia: datos.numeroLicencia,
      username: datos.username,
      passwordHash: generarPasswordHash(datos.password),
    });
  }

  async registrarPaciente(datos: DatosRegistroPaciente): Promise<void> {
    validarDatosRegistroPaciente(datos);

    await this.repoUsuariosAuth.registrarPaciente({
      nombreCompleto: datos.nombreCompleto,
      contacto: datos.contacto,
      medicoResponsableId: datos.medicoResponsableId,
      username: datos.username,
      passwordHash: generarPasswordHash(datos.password),
    });
  }

  async actualizarMedico(datos: DatosEdicionMedico): Promise<void> {
    validarDatosEdicionMedico(datos);
    await this.repoAdministracionUsuarios.actualizarMedico(datos);
  }

  async actualizarPaciente(datos: DatosEdicionPaciente): Promise<void> {
    validarDatosEdicionPaciente(datos);
    await this.repoAdministracionUsuarios.actualizarPaciente(datos);
  }

  async reasignarPaciente(pacienteId: string, medicoResponsableId: string): Promise<void> {
    const usuarios = await this.repoAdministracionUsuarios.listarUsuarios();
    const paciente = usuarios.find((usuario) => usuario.pacienteId === pacienteId);

    if (!paciente) {
      throw new Error('El paciente indicado no existe.');
    }

    await this.actualizarPaciente({
      pacienteId,
      nombreCompleto: paciente.nombreCompleto,
      contacto: paciente.contacto ?? '',
      medicoResponsableId,
    });
  }

  async cambiarEstadoUsuario(usuarioId: string, activo: boolean): Promise<void> {
    if (!usuarioId) {
      throw new Error('El usuario indicado no existe.');
    }

    await this.repoAdministracionUsuarios.cambiarEstadoUsuario(usuarioId, activo);
  }
}
