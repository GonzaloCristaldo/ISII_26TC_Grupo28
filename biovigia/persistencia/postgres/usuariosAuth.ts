import { PoolClient } from 'pg';
import { UsuarioSesion } from '@/modelos/tipos';
import { pool } from './PostgresCliente';

type UsuarioAuthRow = {
  usuario_id: string;
  username: string;
  password_hash: string;
  rol: 'medico' | 'paciente';
  medico_id: string | null;
  paciente_id: string | null;
  nombre_completo: string;
};

type MedicoListadoRow = {
  id: string;
  nombre_completo: string;
  especialidad: string;
};

type MedicoRegistrable = {
  id: string;
  nombreCompleto: string;
  especialidad: string;
};

type DatosRegistroMedico = {
  nombreCompleto: string;
  especialidad: string;
  numeroLicencia: string;
  username: string;
  passwordHash: string;
};

type DatosRegistroPaciente = {
  nombreCompleto: string;
  contacto: string;
  medicoResponsableId: string;
  username: string;
  passwordHash: string;
};

export type UsuarioAutenticable = UsuarioSesion & {
  passwordHash: string;
};

function mapearUsuario(fila: UsuarioAuthRow): UsuarioAutenticable {
  return {
    usuarioId: fila.usuario_id,
    username: fila.username,
    nombreCompleto: fila.nombre_completo,
    rol: fila.rol,
    medicoId: fila.medico_id,
    pacienteId: fila.paciente_id,
    passwordHash: fila.password_hash,
  };
}

const QUERY_USUARIO = `
  SELECT
    u.id AS usuario_id,
    u.username,
    u.password_hash,
    r.nombre AS rol,
    um.medico_id,
    up.paciente_id,
    COALESCE(m.nombre_completo, p.nombre_completo) AS nombre_completo
  FROM usuarios u
  JOIN roles r ON r.id = u.rol_id
  LEFT JOIN usuario_medico um ON um.usuario_id = u.id
  LEFT JOIN usuario_paciente up ON up.usuario_id = u.id
  LEFT JOIN medicos m ON m.id = um.medico_id
  LEFT JOIN pacientes p ON p.id = up.paciente_id
`;

export async function buscarUsuarioPorUsername(username: string): Promise<UsuarioAutenticable | null> {
  const resultado = await pool.query<UsuarioAuthRow>(
    `${QUERY_USUARIO} WHERE u.username = $1 LIMIT 1`,
    [username],
  );
  const fila = resultado.rows[0];

  return fila ? mapearUsuario(fila) : null;
}

export async function listarMedicosRegistrables(): Promise<MedicoRegistrable[]> {
  const query = `
    SELECT id, nombre_completo, especialidad
    FROM medicos
    ORDER BY nombre_completo ASC
  `;

  const resultado = await pool.query<MedicoListadoRow>(query);

  return resultado.rows.map((fila) => ({
    id: fila.id,
    nombreCompleto: fila.nombre_completo,
    especialidad: fila.especialidad,
  }));
}

async function buscarUsuarioPorId(client: PoolClient, usuarioId: string) {
  const resultado = await client.query<UsuarioAuthRow>(
    `${QUERY_USUARIO} WHERE u.id = $1 LIMIT 1`,
    [usuarioId],
  );
  const fila = resultado.rows[0];

  if (!fila) {
    throw new Error('No se pudo recuperar la cuenta creada.');
  }

  return mapearUsuario(fila);
}

async function obtenerRolId(client: PoolClient, nombreRol: 'medico' | 'paciente') {
  const resultado = await client.query<{ id: string }>(
    'SELECT id FROM roles WHERE nombre = $1 LIMIT 1',
    [nombreRol],
  );
  const rolId = resultado.rows[0]?.id;

  if (!rolId) {
    throw new Error(`No existe el rol ${nombreRol}.`);
  }

  return rolId;
}

export async function registrarMedico(datos: DatosRegistroMedico): Promise<UsuarioAutenticable> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const medicoResultado = await client.query<{ id: string }>(
      `
        INSERT INTO medicos (nombre_completo, especialidad, numero_licencia)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [datos.nombreCompleto, datos.especialidad, datos.numeroLicencia],
    );

    const medicoId = medicoResultado.rows[0]?.id;

    if (!medicoId) {
      throw new Error('No se pudo crear el medico.');
    }

    const rolId = await obtenerRolId(client, 'medico');

    const usuarioResultado = await client.query<{ id: string }>(
      `
        INSERT INTO usuarios (username, password_hash, rol_id)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [datos.username, datos.passwordHash, rolId],
    );

    const usuarioId = usuarioResultado.rows[0]?.id;

    if (!usuarioId) {
      throw new Error('No se pudo crear el usuario.');
    }

    await client.query(
      `
        INSERT INTO usuario_medico (usuario_id, medico_id)
        VALUES ($1, $2)
      `,
      [usuarioId, medicoId],
    );

    await client.query('COMMIT');

    return buscarUsuarioPorId(client, usuarioId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function registrarPaciente(datos: DatosRegistroPaciente): Promise<UsuarioAutenticable> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const pacienteResultado = await client.query<{ id: string }>(
      `
        INSERT INTO pacientes (nombre_completo, contacto, medico_responsable_id)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [datos.nombreCompleto, datos.contacto, datos.medicoResponsableId],
    );

    const pacienteId = pacienteResultado.rows[0]?.id;

    if (!pacienteId) {
      throw new Error('No se pudo crear el paciente.');
    }

    const rolId = await obtenerRolId(client, 'paciente');

    const usuarioResultado = await client.query<{ id: string }>(
      `
        INSERT INTO usuarios (username, password_hash, rol_id)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      [datos.username, datos.passwordHash, rolId],
    );

    const usuarioId = usuarioResultado.rows[0]?.id;

    if (!usuarioId) {
      throw new Error('No se pudo crear el usuario.');
    }

    await client.query(
      `
        INSERT INTO usuario_paciente (usuario_id, paciente_id)
        VALUES ($1, $2)
      `,
      [usuarioId, pacienteId],
    );

    await client.query('COMMIT');

    return buscarUsuarioPorId(client, usuarioId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
