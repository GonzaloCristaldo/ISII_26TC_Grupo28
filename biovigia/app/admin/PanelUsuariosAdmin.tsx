'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { MedicoRegistrable, UsuarioAdministrable } from '@/modelos/tipos';
import {
  actualizarMedicoAdminAccion,
  actualizarPacienteAdminAccion,
  cambiarEstadoUsuarioAdminAccion,
} from './accionesAdmin';

type UsuarioAdministrableVista = Omit<UsuarioAdministrable, 'creadoEn'> & {
  creadoEn: string;
};

type Props = {
  usuarios: UsuarioAdministrableVista[];
  medicos: MedicoRegistrable[];
};

const USUARIOS_POR_PAGINA = 5;

type FiltroEstadoUsuario = 'todos' | 'activos' | 'inactivos';
type FiltroAsignacionPaciente = 'todos' | 'conMedico' | 'sinMedico';
type OrdenUsuarios = 'nombre' | 'usuario' | 'estado';

function coincideBusqueda(usuario: UsuarioAdministrableVista, busqueda: string) {
  const texto = [
    usuario.nombreCompleto,
    usuario.username,
    usuario.especialidad,
    usuario.numeroLicencia,
    usuario.contacto,
    usuario.medicoResponsableNombre,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return texto.includes(busqueda.trim().toLowerCase());
}

function coincideEstado(usuario: UsuarioAdministrableVista, filtro: FiltroEstadoUsuario) {
  if (filtro === 'activos') return usuario.activo;
  if (filtro === 'inactivos') return !usuario.activo;
  return true;
}

function coincideAsignacionPaciente(
  usuario: UsuarioAdministrableVista,
  filtro: FiltroAsignacionPaciente,
) {
  if (filtro === 'conMedico') return Boolean(usuario.medicoResponsableId);
  if (filtro === 'sinMedico') return !usuario.medicoResponsableId;
  return true;
}

function ordenarUsuarios(usuarios: UsuarioAdministrableVista[], orden: OrdenUsuarios) {
  return [...usuarios].sort((a, b) => {
    if (orden === 'estado') {
      if (a.activo !== b.activo) return a.activo ? -1 : 1;
    }

    const campoA = orden === 'usuario' ? a.username : a.nombreCompleto;
    const campoB = orden === 'usuario' ? b.username : b.nombreCompleto;
    return campoA.localeCompare(campoB, 'es');
  });
}

function campoTexto(label: string, name: string, defaultValue: string) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      <input
        name={name}
        defaultValue={defaultValue}
        required
        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-700"
      />
    </label>
  );
}

function EstadoBadge({ activo }: { activo: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        activo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}

function EstadoForm({ usuario }: { usuario: UsuarioAdministrableVista }) {
  return (
    <form
      action={cambiarEstadoUsuarioAdminAccion}
      onSubmit={(event) => {
        const accion = usuario.activo ? 'dar de baja' : 'reactivar';
        const confirmado = window.confirm(`Confirma ${accion} la cuenta de ${usuario.nombreCompleto}?`);
        if (!confirmado) event.preventDefault();
      }}
    >
      <input type="hidden" name="usuario_id" value={usuario.usuarioId} />
      <input type="hidden" name="activo" value={String(!usuario.activo)} />
      <button
        type="submit"
        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
          usuario.activo ? 'bg-rose-700 hover:bg-rose-800' : 'bg-emerald-700 hover:bg-emerald-800'
        }`}
      >
        {usuario.activo ? 'Dar de baja' : 'Reactivar'}
      </button>
    </form>
  );
}

function ListaUsuarios({
  titulo,
  subtitulo,
  usuarios,
  seleccionadoId,
  onSeleccionar,
  busqueda,
  onBuscar,
  filtroEstado,
  onCambiarFiltroEstado,
  orden,
  onCambiarOrden,
  filtroExtra,
  descripcion,
  detalleSeleccionado,
  pagina,
  totalPaginas,
  totalResultados,
  mensajeVacio,
  onPaginaAnterior,
  onPaginaSiguiente,
}: {
  titulo: string;
  subtitulo: string;
  usuarios: UsuarioAdministrableVista[];
  seleccionadoId: string;
  onSeleccionar: (usuarioId: string) => void;
  busqueda: string;
  onBuscar: (valor: string) => void;
  filtroEstado: FiltroEstadoUsuario;
  onCambiarFiltroEstado: (valor: FiltroEstadoUsuario) => void;
  orden: OrdenUsuarios;
  onCambiarOrden: (valor: OrdenUsuarios) => void;
  filtroExtra?: ReactNode;
  descripcion: (usuario: UsuarioAdministrableVista) => string;
  detalleSeleccionado: ReactNode;
  pagina: number;
  totalPaginas: number;
  totalResultados: number;
  mensajeVacio: string;
  onPaginaAnterior: () => void;
  onPaginaSiguiente: () => void;
}) {
  const desde = totalResultados === 0 ? 0 : (pagina - 1) * USUARIOS_POR_PAGINA + 1;
  const hasta = Math.min(pagina * USUARIOS_POR_PAGINA, totalResultados);

  return (
    <div className="rounded-lg border border-slate-300 bg-white">
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">{titulo}</h3>
            <p className="mt-1 text-sm text-slate-500">{subtitulo}</p>
          </div>
          <p className="font-mono text-sm text-slate-500">{totalResultados}</p>
        </div>
        <input
          type="search"
          value={busqueda}
          onChange={(event) => onBuscar(event.target.value)}
          placeholder="Buscar por nombre, usuario o dato asociado"
          className="mt-4 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-700"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {([
            ['todos', 'Todos'],
            ['activos', 'Activos'],
            ['inactivos', 'Inactivos'],
          ] as const).map(([valor, etiqueta]) => (
            <button
              key={valor}
              type="button"
              onClick={() => onCambiarFiltroEstado(valor)}
              className={`h-9 rounded-lg border px-3 text-xs font-semibold transition ${
                filtroEstado === valor
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-500'
              }`}
            >
              {etiqueta}
            </button>
          ))}
          {filtroExtra}
          <select
            value={orden}
            onChange={(event) => onCambiarOrden(event.target.value as OrdenUsuarios)}
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-slate-700"
            aria-label={`Ordenar ${titulo.toLowerCase()}`}
          >
            <option value="nombre">Nombre</option>
            <option value="usuario">Usuario</option>
            <option value="estado">Estado</option>
          </select>
        </div>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
          {totalResultados === 0 ? 'Sin resultados' : `${desde}-${hasta} de ${totalResultados}`}
        </p>
      </div>

      <div className="border-b border-slate-200 bg-slate-50 p-4">
        {detalleSeleccionado}
      </div>

      <div className="max-h-[430px] overflow-y-auto p-2">
        {usuarios.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
            {mensajeVacio}
          </p>
        ) : (
          usuarios.map((usuario) => {
            const seleccionado = seleccionadoId === usuario.usuarioId;

            return (
              <button
                key={usuario.usuarioId}
                type="button"
                onClick={() => onSeleccionar(usuario.usuarioId)}
                className={`mb-2 grid w-full gap-2 rounded-lg border px-4 py-3 text-left transition last:mb-0 ${
                  seleccionado
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold">{usuario.nombreCompleto}</p>
                    <p className={`mt-1 truncate text-sm ${seleccionado ? 'text-slate-300' : 'text-slate-500'}`}>
                      {usuario.username}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      usuario.activo
                        ? seleccionado
                          ? 'bg-emerald-300 text-emerald-950'
                          : 'bg-emerald-50 text-emerald-700'
                        : seleccionado
                          ? 'bg-slate-700 text-slate-200'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className={`truncate text-sm ${seleccionado ? 'text-slate-300' : 'text-slate-500'}`}>
                  {descripcion(usuario)}
                </p>
              </button>
            );
          })
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={onPaginaAnterior}
          disabled={pagina <= 1}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
          Pagina {totalPaginas === 0 ? 0 : pagina} de {totalPaginas}
        </p>
        <button
          type="button"
          onClick={onPaginaSiguiente}
          disabled={pagina >= totalPaginas}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default function PanelUsuariosAdmin({ usuarios, medicos }: Props) {
  const [busquedaMedicos, setBusquedaMedicos] = useState('');
  const [busquedaPacientes, setBusquedaPacientes] = useState('');
  const [paginaMedicos, setPaginaMedicos] = useState(1);
  const [paginaPacientes, setPaginaPacientes] = useState(1);
  const [filtroEstadoMedicos, setFiltroEstadoMedicos] = useState<FiltroEstadoUsuario>('todos');
  const [filtroEstadoPacientes, setFiltroEstadoPacientes] = useState<FiltroEstadoUsuario>('todos');
  const [filtroAsignacionPacientes, setFiltroAsignacionPacientes] =
    useState<FiltroAsignacionPaciente>('todos');
  const [ordenMedicos, setOrdenMedicos] = useState<OrdenUsuarios>('nombre');
  const [ordenPacientes, setOrdenPacientes] = useState<OrdenUsuarios>('nombre');

  const administradores = useMemo(
    () => usuarios.filter((usuario) => usuario.rol === 'administrador'),
    [usuarios],
  );
  const medicosBase = useMemo(
    () => usuarios.filter((usuario) => usuario.rol === 'medico'),
    [usuarios],
  );
  const pacientesBase = useMemo(
    () => usuarios.filter((usuario) => usuario.rol === 'paciente'),
    [usuarios],
  );
  const medicosUsuarios = useMemo(
    () =>
      ordenarUsuarios(
        medicosBase
          .filter((usuario) => coincideBusqueda(usuario, busquedaMedicos))
          .filter((usuario) => coincideEstado(usuario, filtroEstadoMedicos)),
        ordenMedicos,
      ),
    [medicosBase, busquedaMedicos, filtroEstadoMedicos, ordenMedicos],
  );
  const pacientesUsuarios = useMemo(
    () =>
      ordenarUsuarios(
        pacientesBase
          .filter((usuario) => coincideBusqueda(usuario, busquedaPacientes))
          .filter((usuario) => coincideEstado(usuario, filtroEstadoPacientes))
          .filter((usuario) => coincideAsignacionPaciente(usuario, filtroAsignacionPacientes)),
        ordenPacientes,
      ),
    [
      pacientesBase,
      busquedaPacientes,
      filtroEstadoPacientes,
      filtroAsignacionPacientes,
      ordenPacientes,
    ],
  );
  const [medicoSeleccionadoId, setMedicoSeleccionadoId] = useState(
    medicosUsuarios[0]?.usuarioId ?? '',
  );
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState(
    pacientesUsuarios[0]?.usuarioId ?? '',
  );
  const medicoSeleccionado =
    medicosUsuarios.find((usuario) => usuario.usuarioId === medicoSeleccionadoId) ??
    medicosUsuarios[0];
  const pacienteSeleccionado =
    pacientesUsuarios.find((usuario) => usuario.usuarioId === pacienteSeleccionadoId) ??
    pacientesUsuarios[0];
  const totalPaginasMedicos = Math.ceil(medicosUsuarios.length / USUARIOS_POR_PAGINA);
  const totalPaginasPacientes = Math.ceil(pacientesUsuarios.length / USUARIOS_POR_PAGINA);
  const paginaMedicosActual = Math.min(paginaMedicos, Math.max(totalPaginasMedicos, 1));
  const paginaPacientesActual = Math.min(paginaPacientes, Math.max(totalPaginasPacientes, 1));
  const medicosPaginados = medicosUsuarios.slice(
    (paginaMedicosActual - 1) * USUARIOS_POR_PAGINA,
    paginaMedicosActual * USUARIOS_POR_PAGINA,
  );
  const pacientesPaginados = pacientesUsuarios.slice(
    (paginaPacientesActual - 1) * USUARIOS_POR_PAGINA,
    paginaPacientesActual * USUARIOS_POR_PAGINA,
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-300 pb-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Usuarios</h2>
          <p className="mt-1 text-sm text-slate-600">
            Listado separado para busqueda rapida y edicion por seleccion.
          </p>
        </div>
        <p className="font-mono text-sm text-slate-500">{usuarios.length} cuentas</p>
      </div>

      {administradores.length > 0 ? (
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Administradores
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {administradores.map((usuario) => (
              <span
                key={usuario.usuarioId}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700"
              >
                {usuario.nombreCompleto} ({usuario.username})
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <ListaUsuarios
            titulo="Medicos"
            subtitulo="Profesionales registrados"
            usuarios={medicosPaginados}
            seleccionadoId={medicoSeleccionado?.usuarioId ?? ''}
            onSeleccionar={setMedicoSeleccionadoId}
            busqueda={busquedaMedicos}
            onBuscar={(valor) => {
              setBusquedaMedicos(valor);
              setPaginaMedicos(1);
            }}
            filtroEstado={filtroEstadoMedicos}
            onCambiarFiltroEstado={(valor) => {
              setFiltroEstadoMedicos(valor);
              setPaginaMedicos(1);
            }}
            orden={ordenMedicos}
            onCambiarOrden={(valor) => {
              setOrdenMedicos(valor);
              setPaginaMedicos(1);
            }}
            descripcion={(usuario) => usuario.especialidad ?? 'Sin especialidad registrada'}
            pagina={paginaMedicosActual}
            totalPaginas={totalPaginasMedicos}
            totalResultados={medicosUsuarios.length}
            mensajeVacio="No hay medicos que coincidan con la busqueda y los filtros activos."
            onPaginaAnterior={() => setPaginaMedicos((pagina) => Math.max(1, pagina - 1))}
            onPaginaSiguiente={() =>
              setPaginaMedicos((pagina) => Math.min(totalPaginasMedicos, pagina + 1))
            }
            detalleSeleccionado={
              medicoSeleccionado?.medicoId ? (
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Medico seleccionado
                      </p>
                      <h3 className="mt-1 text-xl font-semibold text-slate-950">
                        {medicoSeleccionado.nombreCompleto}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Usuario: {medicoSeleccionado.username}
                      </p>
                    </div>
                    <EstadoBadge activo={medicoSeleccionado.activo} />
                  </div>

                  <form
                    action={actualizarMedicoAdminAccion}
                    onSubmit={(event) => {
                      const confirmado = window.confirm(
                        `Guardar cambios del medico ${medicoSeleccionado.nombreCompleto}?`,
                      );
                      if (!confirmado) event.preventDefault();
                    }}
                    className="mt-4 grid gap-3 md:grid-cols-2"
                  >
                    <input type="hidden" name="medico_id" value={medicoSeleccionado.medicoId} />
                    {campoTexto('Nombre completo', 'nombre_completo', medicoSeleccionado.nombreCompleto)}
                    {campoTexto('Especialidad', 'especialidad', medicoSeleccionado.especialidad ?? '')}
                    {campoTexto('Numero licencia', 'numero_licencia', medicoSeleccionado.numeroLicencia ?? '')}
                    <button
                      type="submit"
                      className="self-end rounded-lg border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                    >
                      Guardar cambios
                    </button>
                  </form>

                  <div className="mt-4">
                    <EstadoForm usuario={medicoSeleccionado} />
                  </div>
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                  Selecciona un medico para editar sus datos.
                </p>
              )
            }
          />
        </div>

        <div className="space-y-4">
          <ListaUsuarios
            titulo="Pacientes"
            subtitulo="Pacientes asignados"
            usuarios={pacientesPaginados}
            seleccionadoId={pacienteSeleccionado?.usuarioId ?? ''}
            onSeleccionar={setPacienteSeleccionadoId}
            busqueda={busquedaPacientes}
            onBuscar={(valor) => {
              setBusquedaPacientes(valor);
              setPaginaPacientes(1);
            }}
            filtroEstado={filtroEstadoPacientes}
            onCambiarFiltroEstado={(valor) => {
              setFiltroEstadoPacientes(valor);
              setPaginaPacientes(1);
            }}
            orden={ordenPacientes}
            onCambiarOrden={(valor) => {
              setOrdenPacientes(valor);
              setPaginaPacientes(1);
            }}
            filtroExtra={
              <select
                value={filtroAsignacionPacientes}
                onChange={(event) => {
                  setFiltroAsignacionPacientes(event.target.value as FiltroAsignacionPaciente);
                  setPaginaPacientes(1);
                }}
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-slate-700"
                aria-label="Filtrar pacientes por asignacion"
              >
                <option value="todos">Asignacion</option>
                <option value="conMedico">Con medico</option>
                <option value="sinMedico">Sin medico</option>
              </select>
            }
            descripcion={(usuario) =>
              usuario.medicoResponsableNombre
                ? `Medico: ${usuario.medicoResponsableNombre}`
                : 'Sin medico responsable'
            }
            pagina={paginaPacientesActual}
            totalPaginas={totalPaginasPacientes}
            totalResultados={pacientesUsuarios.length}
            mensajeVacio="No hay pacientes que coincidan con la busqueda y los filtros activos."
            onPaginaAnterior={() => setPaginaPacientes((pagina) => Math.max(1, pagina - 1))}
            onPaginaSiguiente={() =>
              setPaginaPacientes((pagina) => Math.min(totalPaginasPacientes, pagina + 1))
            }
            detalleSeleccionado={
              pacienteSeleccionado?.pacienteId ? (
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Paciente seleccionado
                      </p>
                      <h3 className="mt-1 text-xl font-semibold text-slate-950">
                        {pacienteSeleccionado.nombreCompleto}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Usuario: {pacienteSeleccionado.username}
                      </p>
                    </div>
                    <EstadoBadge activo={pacienteSeleccionado.activo} />
                  </div>

                  <form
                    action={actualizarPacienteAdminAccion}
                    onSubmit={(event) => {
                      const confirmado = window.confirm(
                        `Guardar cambios del paciente ${pacienteSeleccionado.nombreCompleto}?`,
                      );
                      if (!confirmado) event.preventDefault();
                    }}
                    className="mt-4 grid gap-3 md:grid-cols-2"
                  >
                    <input type="hidden" name="paciente_id" value={pacienteSeleccionado.pacienteId} />
                    {campoTexto('Nombre completo', 'nombre_completo', pacienteSeleccionado.nombreCompleto)}
                    {campoTexto('Contacto', 'contacto', pacienteSeleccionado.contacto ?? '')}
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Medico responsable
                      </span>
                      <select
                        name="medico_responsable_id"
                        defaultValue={pacienteSeleccionado.medicoResponsableId ?? ''}
                        required
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-700"
                      >
                        {medicos.map((medico) => (
                          <option key={medico.id} value={medico.id}>
                            {medico.nombreCompleto} - {medico.especialidad}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="submit"
                      className="self-end rounded-lg border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                    >
                      Guardar cambios
                    </button>
                  </form>

                  <div className="mt-4">
                    <EstadoForm usuario={pacienteSeleccionado} />
                  </div>
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                  Selecciona un paciente para editar sus datos.
                </p>
              )
            }
          />
        </div>
      </div>
    </section>
  );
}
