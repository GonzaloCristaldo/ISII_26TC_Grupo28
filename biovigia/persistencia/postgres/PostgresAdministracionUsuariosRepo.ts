import { RepositorioAdministracionUsuarios } from '@/modelos/repositorios/RepositorioAdministracionUsuarios';
import {
  DatosEdicionMedico,
  DatosEdicionPaciente,
  GrupoSanguineo,
  RolUsuario,
  UsuarioAdministrable,
} from '@/modelos/tipos';
import { pool } from './PostgresCliente';

type UsuarioAdministrableRow = {
  usuario_id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  username: string;
  rol: RolUsuario;
  activo: boolean;
  creado_en: string;
  medico_id: string | null;
  paciente_id: string | null;
  especialidad_id: string | null;
  especialidad: string | null;
  numero_licencia: string | null;
  fecha_nacimiento: string | Date | null;
  grupo_sanguineo: GrupoSanguineo | null;
  paciente_medico_id: string | null;
  medico_responsable_nombre: string | null;
};

function armarNombreCompleto(nombre: string, apellido: string) {
  return [nombre, apellido].filter(Boolean).join(' ').trim();
}

function mapearFechaNacimiento(fecha: string | Date | null) {
  if (!fecha) return null;

  if (fecha instanceof Date) {
    return Number.isNaN(fecha.getTime()) ? null : fecha;
  }

  const textoFecha = fecha.trim();
  if (!textoFecha) return null;

  const valorFecha = /^\d{4}-\d{2}-\d{2}$/.test(textoFecha)
    ? `${textoFecha}T00:00:00`
    : textoFecha;
  const fechaParseada = new Date(valorFecha);

  return Number.isNaN(fechaParseada.getTime()) ? null : fechaParseada;
}

function mapearUsuario(fila: UsuarioAdministrableRow): UsuarioAdministrable {
  return {
    usuarioId: fila.usuario_id,
    nombre: fila.nombre,
    apellido: fila.apellido,
    email: fila.email,
    telefono: fila.telefono,
    username: fila.username,
    nombreCompleto: armarNombreCompleto(fila.nombre, fila.apellido),
    rol: fila.rol,
    medicoId: fila.medico_id,
    pacienteId: fila.paciente_id,
    activo: fila.activo,
    creadoEn: new Date(fila.creado_en),
    especialidadId: fila.especialidad_id,
    especialidad: fila.especialidad,
    numeroLicencia: fila.numero_licencia,
    fechaNacimiento: mapearFechaNacimiento(fila.fecha_nacimiento),
    grupoSanguineo: fila.grupo_sanguineo,
    medicoResponsableId: fila.paciente_medico_id,
    medicoResponsableNombre: fila.medico_responsable_nombre,
  };
}

export class PostgresAdministracionUsuariosRepo implements RepositorioAdministracionUsuarios {
  async listarUsuarios(): Promise<UsuarioAdministrable[]> {
    const query = `
      SELECT
        u.usuario_id,
        u.nombre,
        u.apellido,
        u.email,
        u.telefono,
        u.username,
        r.nombre AS rol,
        u.activo,
        u.creado_en,
        um.medico_id,
        up.paciente_id,
        m.especialidad_id,
        e.nombre AS especialidad,
        m.numero_licencia,
        p.fecha_nacimiento,
        p.grupo_sanguineo,
        p.medico_id AS paciente_medico_id,
        btrim(concat_ws(' ', mr_u.nombre, mr_u.apellido)) AS medico_responsable_nombre
      FROM usuarios u
      JOIN roles r ON r.rol_id = u.rol_id
      LEFT JOIN usuario_medico um ON um.usuario_id = u.usuario_id
      LEFT JOIN medicos m ON m.medico_id = um.medico_id
      LEFT JOIN especialidades e ON e.especialidad_id = m.especialidad_id
      LEFT JOIN usuario_paciente up ON up.usuario_id = u.usuario_id
      LEFT JOIN pacientes p ON p.paciente_id = up.paciente_id
      LEFT JOIN medicos mr ON mr.medico_id = p.medico_id
      LEFT JOIN usuario_medico mr_um ON mr_um.medico_id = mr.medico_id
      LEFT JOIN usuarios mr_u ON mr_u.usuario_id = mr_um.usuario_id
      ORDER BY r.nombre ASC, u.apellido ASC, u.nombre ASC
    `;

    const resultado = await pool.query<UsuarioAdministrableRow>(query);
    return resultado.rows.map(mapearUsuario);
  }

  async actualizarMedico(datos: DatosEdicionMedico): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const usuarioResultado = await client.query(
        `
          UPDATE usuarios u
          SET nombre = $2,
              apellido = $3,
              email = $4,
              telefono = $5
          FROM usuario_medico um
          WHERE um.usuario_id = u.usuario_id
            AND um.medico_id = $1
        `,
        [datos.medicoId, datos.nombre, datos.apellido, datos.email, datos.telefono],
      );

      if (usuarioResultado.rowCount === 0) {
        throw new Error('El medico indicado no existe.');
      }

      const medicoResultado = await client.query(
        `
          UPDATE medicos
          SET especialidad_id = $2,
              numero_licencia = $3
          WHERE medico_id = $1
        `,
        [datos.medicoId, datos.especialidadId, datos.numeroLicencia],
      );

      if (medicoResultado.rowCount === 0) {
        throw new Error('El medico indicado no existe.');
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async actualizarPaciente(datos: DatosEdicionPaciente): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const usuarioResultado = await client.query(
        `
          UPDATE usuarios u
          SET nombre = $2,
              apellido = $3,
              email = $4,
              telefono = $5
          FROM usuario_paciente up
          WHERE up.usuario_id = u.usuario_id
            AND up.paciente_id = $1
        `,
        [datos.pacienteId, datos.nombre, datos.apellido, datos.email, datos.telefono],
      );

      if (usuarioResultado.rowCount === 0) {
        throw new Error('El paciente indicado no existe.');
      }

      const pacienteResultado = await client.query(
        `
          UPDATE pacientes
          SET medico_id = $2,
              fecha_nacimiento = $3,
              grupo_sanguineo = $4
          WHERE paciente_id = $1
        `,
        [
          datos.pacienteId,
          datos.medicoResponsableId,
          datos.fechaNacimiento,
          datos.grupoSanguineo,
        ],
      );

      if (pacienteResultado.rowCount === 0) {
        throw new Error('El paciente indicado no existe.');
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
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
