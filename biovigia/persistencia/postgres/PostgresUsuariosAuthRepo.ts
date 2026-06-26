import { PoolClient } from 'pg';
import { RepositorioUsuariosAuth } from '@/modelos/repositorios/RepositorioUsuariosAuth';
import {
  DatosCuentaMedico,
  DatosCuentaPaciente,
  MedicoRegistrable,
  RolUsuario,
  UsuarioAutenticable,
} from '@/modelos/tipos';
import { pool } from './PostgresCliente';

type UsuarioAuthRow = {
  usuario_id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  username: string;
  password_hash: string;
  rol: RolUsuario;
  medico_id: string | null;
  paciente_id: string | null;
  activo: boolean;
};

type MedicoListadoRow = {
  medico_id: string;
  especialidad_id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  especialidad: string;
};

function armarNombreCompleto(nombre: string, apellido: string) {
  return [nombre, apellido].filter(Boolean).join(' ').trim();
}

function mapearUsuario(fila: UsuarioAuthRow): UsuarioAutenticable {
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
    passwordHash: fila.password_hash,
  };
}

const QUERY_USUARIO = `
  SELECT
    u.usuario_id,
    u.nombre,
    u.apellido,
    u.email,
    u.telefono,
    u.username,
    u.password_hash,
    r.nombre AS rol,
    u.activo,
    m.medico_id,
    p.paciente_id
  FROM usuarios u
  JOIN roles r ON r.rol_id = u.rol_id
  LEFT JOIN medicos m ON m.usuario_id = u.usuario_id
  LEFT JOIN pacientes p ON p.usuario_id = u.usuario_id
`;

async function buscarUsuarioPorId(client: PoolClient, usuarioId: string) {
  const resultado = await client.query<UsuarioAuthRow>(
    `${QUERY_USUARIO} WHERE u.usuario_id = $1 LIMIT 1`,
    [usuarioId],
  );
  const fila = resultado.rows[0];

  if (!fila) {
    throw new Error('No se pudo recuperar la cuenta creada.');
  }

  return mapearUsuario(fila);
}

async function obtenerRolId(client: PoolClient, nombreRol: RolUsuario) {
  const resultado = await client.query<{ rol_id: string }>(
    'SELECT rol_id FROM roles WHERE nombre = $1 LIMIT 1',
    [nombreRol],
  );
  const rolId = resultado.rows[0]?.rol_id;

  if (!rolId) {
    throw new Error(`No existe el rol ${nombreRol}.`);
  }

  return rolId;
}

export class PostgresUsuariosAuthRepo implements RepositorioUsuariosAuth {
  async buscarUsuarioPorUsername(username: string): Promise<UsuarioAutenticable | null> {
    const resultado = await pool.query<UsuarioAuthRow>(
      `${QUERY_USUARIO} WHERE u.username = $1 AND u.activo = true LIMIT 1`,
      [username],
    );
    const fila = resultado.rows[0];

    return fila ? mapearUsuario(fila) : null;
  }

  async listarMedicosRegistrables(): Promise<MedicoRegistrable[]> {
    const query = `
      SELECT
        m.medico_id,
        m.especialidad_id,
        u.nombre,
        u.apellido,
        u.email,
        u.telefono,
        e.nombre AS especialidad
      FROM medicos m
      JOIN especialidades e ON e.especialidad_id = m.especialidad_id
      JOIN usuarios u ON u.usuario_id = m.usuario_id
      WHERE u.activo = true
        AND e.activa = true
      ORDER BY u.apellido ASC, u.nombre ASC
    `;

    const resultado = await pool.query<MedicoListadoRow>(query);

    return resultado.rows.map((fila) => ({
      medico_id: fila.medico_id,
      especialidad_id: fila.especialidad_id,
      nombre: fila.nombre,
      apellido: fila.apellido,
      nombreCompleto: armarNombreCompleto(fila.nombre, fila.apellido),
      email: fila.email,
      telefono: fila.telefono,
      especialidad: fila.especialidad,
    }));
  }

  async registrarMedico(datos: DatosCuentaMedico): Promise<UsuarioAutenticable> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const rolId = await obtenerRolId(client, 'medico');

      const usuarioResultado = await client.query<{ usuario_id: string }>(
        `
          INSERT INTO usuarios (
            nombre,
            apellido,
            email,
            telefono,
            username,
            password_hash,
            rol_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING usuario_id
        `,
        [
          datos.nombre,
          datos.apellido,
          datos.email,
          datos.telefono,
          datos.username,
          datos.passwordHash,
          rolId,
        ],
      );

      const usuarioId = usuarioResultado.rows[0]?.usuario_id;

      if (!usuarioId) {
        throw new Error('No se pudo crear el usuario.');
      }

      const medicoResultado = await client.query<{ medico_id: string }>(
        `
          INSERT INTO medicos (usuario_id, especialidad_id, numero_licencia)
          VALUES ($1, $2, $3)
          RETURNING medico_id
        `,
        [usuarioId, datos.especialidadId, datos.numeroLicencia],
      );

      const medicoId = medicoResultado.rows[0]?.medico_id;

      if (!medicoId) {
        throw new Error('No se pudo crear el medico.');
      }

      await client.query('COMMIT');

      return buscarUsuarioPorId(client, usuarioId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async registrarPaciente(datos: DatosCuentaPaciente): Promise<UsuarioAutenticable> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const rolId = await obtenerRolId(client, 'paciente');

      const usuarioResultado = await client.query<{ usuario_id: string }>(
        `
          INSERT INTO usuarios (
            nombre,
            apellido,
            email,
            telefono,
            username,
            password_hash,
            rol_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING usuario_id
        `,
        [
          datos.nombre,
          datos.apellido,
          datos.email,
          datos.telefono,
          datos.username,
          datos.passwordHash,
          rolId,
        ],
      );

      const usuarioId = usuarioResultado.rows[0]?.usuario_id;

      if (!usuarioId) {
        throw new Error('No se pudo crear el usuario.');
      }

      const pacienteResultado = await client.query<{ paciente_id: string }>(
        `
          INSERT INTO pacientes (
            usuario_id,
            medico_id,
            fecha_nacimiento,
            grupo_sanguineo
          )
          VALUES ($1, $2, $3, $4)
          RETURNING paciente_id
        `,
        [usuarioId, datos.medicoResponsableId, datos.fechaNacimiento, datos.grupoSanguineo],
      );

      const pacienteId = pacienteResultado.rows[0]?.paciente_id;

      if (!pacienteId) {
        throw new Error('No se pudo crear el paciente.');
      }

      await client.query('COMMIT');

      return buscarUsuarioPorId(client, usuarioId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
