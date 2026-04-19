import { Pool } from 'pg';

/**
 * Cliente nativo de PostgreSQL (EnterpriseDB local).
 * Utiliza variables de entorno para conectarse de forma segura.
 */
export const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  database: process.env.POSTGRES_DB,
  // Ojo, si usamos EnterpriseDB local, 
  // ssl segun SOflow deberia estar en false.
  ssl: false 
});

// Event listener para detectar fallos imprevistos en conexiones inactivas
pool.on('error', (err) => {
  console.error('Error imprevisto en cliente de PostgreSQL', err);
});
