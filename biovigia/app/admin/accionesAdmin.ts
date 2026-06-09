'use server';

import { revalidatePath } from 'next/cache';
import {
  crearGestorAdministracionUsuarios,
  crearGestorConfiguracionClinica,
  crearGestorEspecialidades,
} from '@/app/lib/crearDependencias';
import { requerirAdministrador } from '@/app/lib/session';
import type { GrupoSanguineo } from '@/modelos/tipos';

function texto(formData: FormData, campo: string) {
  return String(formData.get(campo) ?? '').trim();
}

function textoOpcional(formData: FormData, campo: string) {
  return texto(formData, campo) || null;
}

function grupoSanguineo(formData: FormData) {
  return textoOpcional(formData, 'grupo_sanguineo') as GrupoSanguineo | null;
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
    nombre: texto(formData, 'nombre'),
    apellido: texto(formData, 'apellido'),
    email: textoOpcional(formData, 'email'),
    telefono: textoOpcional(formData, 'telefono'),
    especialidadId: texto(formData, 'especialidad_id'),
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
    nombre: texto(formData, 'nombre'),
    apellido: texto(formData, 'apellido'),
    email: textoOpcional(formData, 'email'),
    telefono: textoOpcional(formData, 'telefono'),
    fechaNacimiento: textoOpcional(formData, 'fecha_nacimiento'),
    grupoSanguineo: grupoSanguineo(formData),
    medicoResponsableId: texto(formData, 'medico_id'),
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
    nombre: texto(formData, 'nombre'),
    apellido: texto(formData, 'apellido'),
    email: textoOpcional(formData, 'email'),
    telefono: textoOpcional(formData, 'telefono'),
    especialidadId: texto(formData, 'especialidad_id'),
    numeroLicencia: texto(formData, 'numero_licencia'),
  });

  revalidarVistasAdministradas();
}

export async function actualizarPacienteAdminAccion(formData: FormData) {
  await requerirAdministrador();
  const gestor = crearGestorAdministracionUsuarios();

  await gestor.actualizarPaciente({
    pacienteId: texto(formData, 'paciente_id'),
    nombre: texto(formData, 'nombre'),
    apellido: texto(formData, 'apellido'),
    email: textoOpcional(formData, 'email'),
    telefono: textoOpcional(formData, 'telefono'),
    fechaNacimiento: textoOpcional(formData, 'fecha_nacimiento'),
    grupoSanguineo: grupoSanguineo(formData),
    medicoResponsableId: texto(formData, 'medico_id'),
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

export async function crearEspecialidadAdminAccion(formData: FormData) {
  await requerirAdministrador();
  const gestor = crearGestorEspecialidades();

  await gestor.crear({
    nombre: texto(formData, 'nombre'),
  });

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
