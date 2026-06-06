import { RepositorioAdministracionUsuarios } from '@/modelos/repositorios/RepositorioAdministracionUsuarios';
import {
  DatosEdicionMedico,
  DatosEdicionPaciente,
  RolUsuario,
  UsuarioAdministrable,
} from '@/modelos/tipos';
import { pool } from './PostgresCliente';

type UsuarioAdministrableRow = {
  usuario_id: string;
  username: string;
  rol: RolUsuario;
  activo: boolean;
  creado_en: string;
  medico_id: string | null;
  paciente_id: string | null;
  nombre_completo: string;
  especialidad: string | null;
  numero_licencia: string | null;
  contacto: string | null;
  paciente_medico_id: string | null;
  medico_responsable_nombre: string | null;
};

function mapearUsuario(fila: UsuarioAdministrableRow): UsuarioAdministrable {
  return {
    usuarioId: fila.usuario_id,
    username: fila.username,
    nombreCompleto: fila.nombre_completo,
    rol: fila.rol,
    medicoId: fila.medico_id,
    pacienteId: fila.paciente_id,
    activo: fila.activo,
    creadoEn: new Date(fila.creado_en),
    especialidad: fila.especialidad,
    numeroLicencia: fila.numero_licencia,
    contacto: fila.contacto,
    medicoResponsableId: fila.paciente_medico_id,
    medicoResponsableNombre: fila.medico_responsable_nombre,
  };
}

export class PostgresAdministracionUsuariosRepo implements RepositorioAdministracionUsuarios {
  async listarUsuarios(): Promise<UsuarioAdministrable[]> {
    const query = `
      SELECT
        u.usuario_id,
        u.username,
        r.nombre AS rol,
        u.activo,
        u.creado_en,
        um.medico_id,
        up.paciente_id,
        COALESCE(m.nombre_completo, p.nombre_completo, u.username) AS nombre_completo,
        m.especialidad,
        m.numero_licencia,
        p.contacto,
        p.medico_id AS paciente_medico_id,
        mr.nombre_completo AS medico_responsable_nombre
      FROM usuarios u
      JOIN roles r ON r.rol_id = u.rol_id
      LEFT JOIN usuario_medico um ON um.usuario_id = u.usuario_id
      LEFT JOIN usuario_paciente up ON up.usuario_id = u.usuario_id
      LEFT JOIN medicos m ON m.medico_id = um.medico_id
      LEFT JOIN pacientes p ON p.paciente_id = up.paciente_id
      LEFT JOIN medicos mr ON mr.medico_id = p.medico_id
      ORDER BY r.nombre ASC, nombre_completo ASC
    `;

    const resultado = await pool.query<UsuarioAdministrableRow>(query);
    return resultado.rows.map(mapearUsuario);
  }

  async actualizarMedico(datos: DatosEdicionMedico): Promise<void> {
    const resultado = await pool.query(
      `
        UPDATE medicos
        SET nombre_completo = $2,
            especialidad = $3,
            numero_licencia = $4
        WHERE medico_id = $1
      `,
      [datos.medicoId, datos.nombreCompleto, datos.especialidad, datos.numeroLicencia],
    );

    if (resultado.rowCount === 0) {
      throw new Error('El medico indicado no existe.');
    }
  }

  async actualizarPaciente(datos: DatosEdicionPaciente): Promise<void> {
    const resultado = await pool.query(
      `
        UPDATE pacientes
        SET nombre_completo = $2,
            contacto = $3,
            medico_id = $4
        WHERE paciente_id = $1
      `,
      [datos.pacienteId, datos.nombreCompleto, datos.contacto, datos.medicoResponsableId],
    );

    if (resultado.rowCount === 0) {
      throw new Error('El paciente indicado no existe.');
    }
  }

  async cambiarEstadoUsuario(usuarioId: string, activo: boolean): Promise<void> {
    const usuario = await pool.query<{ rol: RolUsuario }>(
      `
        SELECT r.nombre AS rol
        FROM usuarios u
        JOIN roles r ON r.rol_id = u.rol_id
        WHERE u.usuario_id = $1
        LIMIT 1
      `,
      [usuarioId],
    );
    const rol = usuario.rows[0]?.rol;

    if (!rol) {
      throw new Error('El usuario indicado no existe.');
    }

    if (rol === 'administrador' && !activo) {
      throw new Error('No se puede desactivar una cuenta administradora.');
    }

    await pool.query('UPDATE usuarios SET activo = $2 WHERE usuario_id = $1', [usuarioId, activo]);
  }
}
