import { RepositorioAlertas } from '@/modelos/repositorios/RepositorioAlertas';
import { RepositorioAdministracionUsuarios } from '@/modelos/repositorios/RepositorioAdministracionUsuarios';
import { RepositorioConfiguracionClinica } from '@/modelos/repositorios/RepositorioConfiguracionClinica';
import { RepositorioMediciones } from '@/modelos/repositorios/RepositorioMediciones';
import { RepositorioPacientes } from '@/modelos/repositorios/RepositorioPacientes';
import { RepositorioUmbrales } from '@/modelos/repositorios/RepositorioUmbrales';
import { RepositorioUsuariosAuth } from '@/modelos/repositorios/RepositorioUsuariosAuth';
import { PostgresAdministracionUsuariosRepo } from '@/persistencia/postgres/PostgresAdministracionUsuariosRepo';
import { PostgresAlertasRepo } from '@/persistencia/postgres/PostgresAlertasRepo';
import { PostgresConfiguracionClinicaRepo } from '@/persistencia/postgres/PostgresConfiguracionClinicaRepo';
import { PostgresMedicionesRepo } from '@/persistencia/postgres/PostgresMedicionesRepo';
import { PostgresPacientesRepo } from '@/persistencia/postgres/PostgresPacientesRepo';
import { PostgresUmbralesRepo } from '@/persistencia/postgres/PostgresUmbralesRepo';
import { PostgresUsuariosAuthRepo } from '@/persistencia/postgres/PostgresUsuariosAuthRepo';
import { SupabaseAlertasRepo } from '@/persistencia/supabase/SupabaseAlertasRepo';
import { SupabaseMedicionesRepo } from '@/persistencia/supabase/SupabaseMedicionesRepo';
import { SupabasePacientesRepo } from '@/persistencia/supabase/SupabasePacientesRepo';
import { SupabaseUmbralesRepo } from '@/persistencia/supabase/SupabaseUmbralesRepo';

/*Se intenta juntar aca la creacion de "repositorio de datos" 
para que la logica de negocio no tenga que conocer detalles de persistencia, 
y solo sepa que tiene un "RepositorioMediciones" y un "RepositorioAlertas" para usar.
Queremos tener la opcion de usar Supabase en caso de "levantar online" hacia la entrega final
A la par tenemos la opcion de usar Postgres local para desarrollo,
 y asi no depender de una conexion a internet o supa.

*/

/*Aca se decide que driver de persistencia usar, 
leyendo una variable de entorno, y se crean las instancias concretas de los repositorios segun corresponda.
*/
type DriverPersistencia = 'postgres' | 'supabase';

function resolverDriverPersistencia(): DriverPersistencia {
  const driver = (process.env.PERSISTENCE_DRIVER ?? 'postgres').toLowerCase();

  if (driver === 'postgres' || driver === 'supabase') {
    return driver;
  }

  throw new Error(`Driver de persistencia no soportado: ${driver}`);
}

export function obtenerDriverPersistenciaActiva() {
  return resolverDriverPersistencia();
}

export function crearRepositorioMediciones(): RepositorioMediciones {
  switch (resolverDriverPersistencia()) {
    case 'postgres':
      return new PostgresMedicionesRepo();
    case 'supabase':
      return new SupabaseMedicionesRepo();
  }
}

export function crearRepositorioAlertas(): RepositorioAlertas {
  switch (resolverDriverPersistencia()) {
    case 'postgres':
      return new PostgresAlertasRepo();
    case 'supabase':
      return new SupabaseAlertasRepo();
  }
}

export function crearRepositorioPacientes(): RepositorioPacientes {
  switch (resolverDriverPersistencia()) {
    case 'postgres':
      return new PostgresPacientesRepo();
    case 'supabase':
      return new SupabasePacientesRepo();
  }
}

export function crearRepositorioUmbrales(): RepositorioUmbrales {
  switch (resolverDriverPersistencia()) {
    case 'postgres':
      return new PostgresUmbralesRepo();
    case 'supabase':
      return new SupabaseUmbralesRepo();
  }
}

export function crearRepositorioUsuariosAuth(): RepositorioUsuariosAuth {
  switch (resolverDriverPersistencia()) {
    case 'postgres':
      return new PostgresUsuariosAuthRepo();
    case 'supabase':
      throw new Error('La autenticacion con Supabase todavia no esta implementada.');
  }
}

export function crearRepositorioAdministracionUsuarios(): RepositorioAdministracionUsuarios {
  switch (resolverDriverPersistencia()) {
    case 'postgres':
      return new PostgresAdministracionUsuariosRepo();
    case 'supabase':
      throw new Error('La administracion de usuarios con Supabase todavia no esta implementada.');
  }
}

export function crearRepositorioConfiguracionClinica(): RepositorioConfiguracionClinica {
  switch (resolverDriverPersistencia()) {
    case 'postgres':
      return new PostgresConfiguracionClinicaRepo();
    case 'supabase':
      throw new Error('La configuracion clinica con Supabase todavia no esta implementada.');
  }
}
