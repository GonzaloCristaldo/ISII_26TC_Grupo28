import { ServicioMedico } from '@/logica/servicios/ServicioMedico';
import { ServicioPaciente } from '@/logica/servicios/ServicioPaciente';
import {
  crearRepositorioAlertas,
  crearRepositorioMediciones,
} from '@/persistencia/fabricaRepositorios';

export function crearServicioPaciente() {
  return new ServicioPaciente(
    crearRepositorioMediciones(),
    crearRepositorioAlertas(),
  );
}

export function crearServicioMedico() {
  return new ServicioMedico(crearRepositorioAlertas());
}
