'use server';

import { revalidatePath } from 'next/cache';
import {
  crearGestorAdministracionUsuarios,
  crearGestorConfiguracionClinica,
} from '@/app/lib/crearDependencias';
import { requerirAdministrador } from '@/app/lib/session';

function texto(formData: FormData, campo: string) {
  return String(formData.get(campo) ?? '').trim();
}

function numero(formData: FormData, campo: string) {
  return Number(formData.get(campo));
}

function revalidarVistasAdministradas() {
  revalidatePath('/admin');
  revalidatePath('/registro');
  revalidatePath('/paciente/nueva-medicion');
  revalidatePath('/medico/alertas');
  revalidatePath('/medico/dashboard');
}

export async function registrarMedicoAdminAccion(formData: FormData) {
  await requerirAdministrador();
  const gestor = crearGestorAdministracionUsuarios();

  await gestor.registrarMedico({
    nombreCompleto: texto(formData, 'nombre_completo'),
    especialidad: texto(formData, 'especialidad'),
    numeroLicencia: texto(formData, 'numero_licencia'),
    username: texto(formData, 'username'),
    password: String(formData.get('password') ?? ''),
  });

  revalidarVistasAdministradas();
}

export async function registrarPacienteAdminAccion(formData: FormData) {
  await requerirAdministrador();
  const gestor = crearGestorAdministracionUsuarios();

  await gestor.registrarPaciente({
    nombreCompleto: texto(formData, 'nombre_completo'),
    contacto: texto(formData, 'contacto'),
    medicoResponsableId: texto(formData, 'medico_responsable_id'),
    username: texto(formData, 'username'),
    password: String(formData.get('password') ?? ''),
  });

  revalidarVistasAdministradas();
}

export async function actualizarMedicoAdminAccion(formData: FormData) {
  await requerirAdministrador();
  const gestor = crearGestorAdministracionUsuarios();

  await gestor.actualizarMedico({
    medicoId: texto(formData, 'medico_id'),
    nombreCompleto: texto(formData, 'nombre_completo'),
    especialidad: texto(formData, 'especialidad'),
    numeroLicencia: texto(formData, 'numero_licencia'),
  });

  revalidarVistasAdministradas();
}

export async function actualizarPacienteAdminAccion(formData: FormData) {
  await requerirAdministrador();
  const gestor = crearGestorAdministracionUsuarios();

  await gestor.actualizarPaciente({
    pacienteId: texto(formData, 'paciente_id'),
    nombreCompleto: texto(formData, 'nombre_completo'),
    contacto: texto(formData, 'contacto'),
    medicoResponsableId: texto(formData, 'medico_responsable_id'),
  });

  revalidarVistasAdministradas();
}

export async function cambiarEstadoUsuarioAdminAccion(formData: FormData) {
  await requerirAdministrador();
  const gestor = crearGestorAdministracionUsuarios();

  await gestor.cambiarEstadoUsuario(
    texto(formData, 'usuario_id'),
    texto(formData, 'activo') === 'true',
  );

  revalidarVistasAdministradas();
}

export async function crearTipoMedicionAdminAccion(formData: FormData) {
  await requerirAdministrador();
  const gestor = crearGestorConfiguracionClinica();

  await gestor.crearTipoMedicionConUmbral({
    nombre: texto(formData, 'nombre'),
    unidad: texto(formData, 'unidad'),
    valor_minimo_normal: numero(formData, 'valor_minimo_normal'),
    valor_maximo_normal: numero(formData, 'valor_maximo_normal'),
    valor_critico: numero(formData, 'valor_critico'),
  });

  revalidarVistasAdministradas();
}

export async function actualizarTipoMedicionAdminAccion(formData: FormData) {
  await requerirAdministrador();
  const gestor = crearGestorConfiguracionClinica();

  await gestor.actualizarTipoMedicionConUmbral({
    tipoMedicionId: texto(formData, 'tipo_medicion_id'),
    nombre: texto(formData, 'nombre'),
    unidad: texto(formData, 'unidad'),
    valor_minimo_normal: numero(formData, 'valor_minimo_normal'),
    valor_maximo_normal: numero(formData, 'valor_maximo_normal'),
    valor_critico: numero(formData, 'valor_critico'),
  });

  revalidarVistasAdministradas();
}
