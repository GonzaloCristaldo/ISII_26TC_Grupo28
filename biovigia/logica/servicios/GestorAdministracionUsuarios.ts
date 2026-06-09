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
  GrupoSanguineo,
  MedicoRegistrable,
  UsuarioAdministrable,
} from '@/modelos/tipos';

const GRUPOS_SANGUINEOS: GrupoSanguineo[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function validarDatosEdicionMedico(datos: DatosEdicionMedico) {
  if (!datos.medicoId || !datos.nombre || !datos.apellido || !datos.especialidadId || !datos.numeroLicencia) {
    throw new Error('Completa todos los datos del medico.');
  }
}

function validarDatosEdicionPaciente(datos: DatosEdicionPaciente) {
  if (!datos.pacienteId || !datos.nombre || !datos.apellido || !datos.medicoResponsableId) {
    throw new Error('Completa todos los datos del paciente.');
  }

  if (datos.grupoSanguineo && !GRUPOS_SANGUINEOS.includes(datos.grupoSanguineo)) {
    throw new Error('El grupo sanguineo indicado no es valido.');
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
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      telefono: datos.telefono,
      especialidadId: datos.especialidadId,
      numeroLicencia: datos.numeroLicencia,
      username: datos.username,
      passwordHash: generarPasswordHash(datos.password),
    });
  }

  async registrarPaciente(datos: DatosRegistroPaciente): Promise<void> {
    validarDatosRegistroPaciente(datos);

    await this.repoUsuariosAuth.registrarPaciente({
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      telefono: datos.telefono,
      fechaNacimiento: datos.fechaNacimiento,
      grupoSanguineo: datos.grupoSanguineo,
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
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      email: paciente.email,
      telefono: paciente.telefono,
      fechaNacimiento: paciente.fechaNacimiento
        ? paciente.fechaNacimiento.toISOString().slice(0, 10)
        : null,
      grupoSanguineo: paciente.grupoSanguineo,
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
