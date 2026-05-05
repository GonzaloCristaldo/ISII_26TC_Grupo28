import { GestorAutenticacion } from '@/logica/servicios/GestorAutenticacion';
import { GestorAlertasMedico } from '@/logica/servicios/GestorAlertasMedico';
import { GestorRegistroMedicion } from '@/logica/servicios/GestorRegistroMedicion';
import {
  crearRepositorioAlertas,
  crearRepositorioMediciones,
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
  return new GestorAlertasMedico(crearRepositorioAlertas());
}

export function crearGestorAutenticacion() {
  return new GestorAutenticacion(crearRepositorioUsuariosAuth());
}
