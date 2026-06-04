import type { RepositorioPacientes } from '@/modelos/repositorios/RepositorioPacientes';
import type { Paciente } from '@/modelos/tipos';
import { pool } from './PostgresCliente';

type PacienteRow = {
  id: string;
  nombre_completo: string;
  contacto: string | null;
  medico_responsable_id: string;
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
}
