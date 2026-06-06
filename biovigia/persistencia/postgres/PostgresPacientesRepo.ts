import type { RepositorioPacientes } from '@/modelos/repositorios/RepositorioPacientes';
import type { Paciente, PacienteConMedicoResponsable } from '@/modelos/tipos';
import { pool } from './PostgresCliente';

type PacienteRow = {
  paciente_id: string;
  nombre_completo: string;
  contacto: string | null;
  medico_id: string;
};

type PacienteConMedicoRow = PacienteRow & {
  medico_nombre_completo: string;
  medico_especialidad: string;
  medico_numero_licencia: string;
};

export class PostgresPacientesRepo implements RepositorioPacientes {
  async obtenerAsignadosPorMedico(medicoId: string): Promise<Paciente[]> {
    const query = `
      SELECT
        p.paciente_id,
        p.nombre_completo,
        p.contacto,
        p.medico_id
      FROM pacientes p
      WHERE p.medico_id = $1
      ORDER BY p.nombre_completo ASC
    `;

    const respuesta = await pool.query<PacienteRow>(query, [medicoId]);
    return respuesta.rows;
  }

  async obtenerPorIdConMedico(pacienteId: string): Promise<PacienteConMedicoResponsable | null> {
    const query = `
      SELECT
        p.paciente_id,
        p.nombre_completo,
        p.contacto,
        p.medico_id,
        m.nombre_completo AS medico_nombre_completo,
        m.especialidad AS medico_especialidad,
        m.numero_licencia AS medico_numero_licencia
      FROM pacientes p
      JOIN medicos m ON m.medico_id = p.medico_id
      WHERE p.paciente_id = $1
    `;

    const respuesta = await pool.query<PacienteConMedicoRow>(query, [pacienteId]);
    const fila = respuesta.rows[0];

    if (!fila) {
      return null;
    }

    return {
      paciente_id: fila.paciente_id,
      nombre_completo: fila.nombre_completo,
      contacto: fila.contacto,
      medico_id: fila.medico_id,
      medico_responsable: {
        medico_id: fila.medico_id,
        nombre_completo: fila.medico_nombre_completo,
        especialidad: fila.medico_especialidad,
        numero_licencia: fila.medico_numero_licencia,
      },
    };
  }
}
