import { pool } from './PostgresCliente';

type TablaDemo = 'pacientes' | 'medicos';
type FilaId = { id: string };

const CONSULTAS: Record<TablaDemo, string> = {
  pacientes: 'SELECT id FROM pacientes ORDER BY nombre_completo, id LIMIT 1',
  medicos: 'SELECT id FROM medicos ORDER BY especialidad, id LIMIT 1',
};

async function obtenerPrimerId(tabla: TablaDemo): Promise<string> {
  const respuesta = await pool.query<FilaId>(CONSULTAS[tabla]);
  const fila = respuesta.rows[0];

  if (!fila) {
    throw new Error(
      `No hay registros en ${tabla}. Ejecuta esquema.sql y luego datos_demo.sql para probar en local.`,
    );
  }

  return fila.id;
}

export function obtenerPacienteDemoId() {
  return obtenerPrimerId('pacientes');
}

export function obtenerMedicoDemoId() {
  return obtenerPrimerId('medicos');
}
