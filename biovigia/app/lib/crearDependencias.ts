import { GestorAutenticacion } from '@/logica/servicios/GestorAutenticacion';
import { GestorAlertasMedico } from '@/logica/servicios/GestorAlertasMedico';
import { GestorAdministracionUsuarios } from '@/logica/servicios/GestorAdministracionUsuarios';
import { GestorConfiguracionClinica } from '@/logica/servicios/GestorConfiguracionClinica';
import { GestorRegistroMedicion } from '@/logica/servicios/GestorRegistroMedicion';
import { GestorPacientesMedico } from '@/logica/servicios/GestorPacientesMedico';
import {
  crearRepositorioAdministracionUsuarios,
  crearRepositorioAlertas,
  crearRepositorioConfiguracionClinica,
  crearRepositorioMediciones,
  crearRepositorioPacientes,
  crearRepositorioUmbrales,
  crearRepositorioUsuariosAuth,
} from '@/persistencia/creadorRepositorios';

export function crearGestorRegistroMedicion() {
  return new GestorRegistroMedicion(
    crearRepositorioMediciones(),
    crearRepositorioAlertas(),
    crearRepositorioUmbrales(),
  );
}

export function crearGestorAlertasMedico() {
  return new GestorAlertasMedico(
    crearRepositorioAlertas(),
    crearRepositorioMediciones(),
  );
}

export function crearGestorPacientesMedico() {
  return new GestorPacientesMedico(crearRepositorioPacientes());
}

export function crearGestorAutenticacion() {
  return new GestorAutenticacion(crearRepositorioUsuariosAuth());
}

export function crearGestorAdministracionUsuarios() {
  return new GestorAdministracionUsuarios(
    crearRepositorioAdministracionUsuarios(),
    crearRepositorioUsuariosAuth(),
  );
}

export function crearGestorConsultaTiposMedicion() {
  return new GestorConfiguracionClinica(crearRepositorioUmbrales());
}

export function crearGestorConfiguracionClinica() {
  return new GestorConfiguracionClinica(
    crearRepositorioUmbrales(),
    crearRepositorioConfiguracionClinica(),
  );
}
