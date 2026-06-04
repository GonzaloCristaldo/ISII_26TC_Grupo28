import type { RepositorioPacientes } from '@/modelos/repositorios/RepositorioPacientes';
import type { Paciente, PacienteConMedicoResponsable } from '@/modelos/tipos';
import { pool } from './PostgresCliente';

type PacienteRow = {
  id: string;
  nombre_completo: string;
  contacto: string | null;
  medico_responsable_id: string;
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
        p.id,
        p.nombre_completo,
        p.contacto,
        p.medico_responsable_id
      FROM pacientes p
      WHERE p.medico_responsable_id = $1
      ORDER BY p.nombre_completo ASC
    `;

    const respuesta = await pool.query<PacienteRow>(query, [medicoId]);
    return respuesta.rows;
  }

  async obtenerPorIdConMedico(pacienteId: string): Promise<PacienteConMedicoResponsable | null> {
    const query = `
      SELECT
        p.id,
        p.nombre_completo,
        p.contacto,
        p.medico_responsable_id,
        m.nombre_completo AS medico_nombre_completo,
        m.especialidad AS medico_especialidad,
        m.numero_licencia AS medico_numero_licencia
      FROM pacientes p
      JOIN medicos m ON m.id = p.medico_responsable_id
      WHERE p.id = $1
    `;

    const respuesta = await pool.query<PacienteConMedicoRow>(query, [pacienteId]);
    const fila = respuesta.rows[0];

    if (!fila) {
      return null;
    }

    return {
      id: fila.id,
      nombre_completo: fila.nombre_completo,
      contacto: fila.contacto,
      medico_responsable_id: fila.medico_responsable_id,
      medico_responsable: {
        id: fila.medico_responsable_id,
        nombre_completo: fila.medico_nombre_completo,
        especialidad: fila.medico_especialidad,
        numero_licencia: fila.medico_numero_licencia,
      },
    };
  }
}
