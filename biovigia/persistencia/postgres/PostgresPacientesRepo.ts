import type { RepositorioPacientes } from '@/modelos/repositorios/RepositorioPacientes';
import type { GrupoSanguineo, Paciente, PacienteConMedicoResponsable } from '@/modelos/tipos';
import { pool } from './PostgresCliente';

type PacienteRow = {
  paciente_id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  medico_id: string;
  fecha_nacimiento: string | Date | null;
  grupo_sanguineo: GrupoSanguineo | null;
};

type PacienteConMedicoRow = PacienteRow & {
  medico_especialidad_id: string;
  medico_nombre: string;
  medico_apellido: string;
  medico_email: string | null;
  medico_telefono: string | null;
  medico_especialidad: string;
  medico_numero_licencia: string;
};

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

function mapearPaciente(fila: PacienteRow): Paciente {
  return {
    paciente_id: fila.paciente_id,
    nombre: fila.nombre,
    apellido: fila.apellido,
    email: fila.email,
    telefono: fila.telefono,
    medico_id: fila.medico_id,
    fecha_nacimiento: mapearFechaNacimiento(fila.fecha_nacimiento),
    grupo_sanguineo: fila.grupo_sanguineo,
  };
}

export class PostgresPacientesRepo implements RepositorioPacientes {
  async obtenerAsignadosPorMedico(medicoId: string): Promise<Paciente[]> {
    const query = `
      SELECT *
      FROM fn_pacientes_asignados_medico($1)
    `;

    const respuesta = await pool.query<PacienteRow>(query, [medicoId]);
    return respuesta.rows.map(mapearPaciente);
  }

  async obtenerPorIdConMedico(pacienteId: string): Promise<PacienteConMedicoResponsable | null> {
    const query = `
      SELECT
        p.paciente_id,
        u.nombre,
        u.apellido,
        u.email,
        u.telefono,
        p.medico_id,
        p.fecha_nacimiento,
        p.grupo_sanguineo,
        mu.nombre AS medico_nombre,
        mu.apellido AS medico_apellido,
        mu.email AS medico_email,
        mu.telefono AS medico_telefono,
        m.especialidad_id AS medico_especialidad_id,
        e.nombre AS medico_especialidad,
        m.numero_licencia AS medico_numero_licencia
      FROM pacientes p
      JOIN usuarios u ON u.usuario_id = p.usuario_id
      JOIN medicos m ON m.medico_id = p.medico_id
      JOIN especialidades e ON e.especialidad_id = m.especialidad_id
      JOIN usuarios mu ON mu.usuario_id = m.usuario_id
      WHERE p.paciente_id = $1
    `;

    const respuesta = await pool.query<PacienteConMedicoRow>(query, [pacienteId]);
    const fila = respuesta.rows[0];

    if (!fila) {
      return null;
    }

    return {
      ...mapearPaciente(fila),
      medico_responsable: {
        medico_id: fila.medico_id,
        especialidad_id: fila.medico_especialidad_id,
        nombre: fila.medico_nombre,
        apellido: fila.medico_apellido,
        email: fila.medico_email,
        telefono: fila.medico_telefono,
        especialidad: fila.medico_especialidad,
        numero_licencia: fila.medico_numero_licencia,
      },
    };
  }
}
