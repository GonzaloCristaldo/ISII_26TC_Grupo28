import { RolUsuario } from '@/modelos/tipos';

export function destinoPorRol(rol: RolUsuario) {
  if (rol === 'administrador') {
    return '/admin';
  }

  return rol === 'medico' ? '/' : '/paciente/nueva-medicion';
}
