import { GestorAlertasMedico } from '@/logica/servicios/GestorAlertasMedico';
import { GestorRegistroMedicion } from '@/logica/servicios/GestorRegistroMedicion';
import {
  crearRepositorioAlertas,
  crearRepositorioMediciones,
  crearRepositorioUmbrales,
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
