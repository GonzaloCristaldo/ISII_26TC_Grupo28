import { ServicioMedico } from '@/logica/servicios/ServicioMedico';
import { ServicioPaciente } from '@/logica/servicios/ServicioPaciente';
import {
  crearRepositorioAlertas,
  crearRepositorioMediciones,
  crearRepositorioUmbrales,
} from '@/persistencia/fabricaRepositorios';

export function crearServicioPaciente() {
  return new ServicioPaciente(
    crearRepositorioMediciones(),
    crearRepositorioAlertas(),
    crearRepositorioUmbrales(),
  );
}

export function crearServicioMedico() {
  return new ServicioMedico(crearRepositorioAlertas());
}
