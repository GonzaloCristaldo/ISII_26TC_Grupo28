-- Esquema normalizado para BioVigia, con procedimientos almacenados y funciones.

CREATE TABLE roles (
    rol_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE estados_alerta (
    estado_alerta_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descripcion VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE tipos_medicion (
    tipo_medicion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    unidad VARCHAR(50) NOT NULL
);

CREATE TABLE especialidades (
    especialidad_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(120) UNIQUE NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
    usuario_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(120) NOT NULL,
    apellido VARCHAR(120) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(50),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol_id UUID NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_rol
      FOREIGN KEY (rol_id) REFERENCES roles(rol_id)
);

CREATE TABLE medicos (
    medico_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID UNIQUE NOT NULL,
    especialidad_id UUID NOT NULL,
    numero_licencia VARCHAR(100) UNIQUE NOT NULL,
    fecha_habilitacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_medico_usuario
      FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id),
    CONSTRAINT fk_medico_especialidad
      FOREIGN KEY (especialidad_id) REFERENCES especialidades(especialidad_id)
);

CREATE TABLE pacientes (
    paciente_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID UNIQUE NOT NULL,
    medico_id UUID NOT NULL,
    fecha_nacimiento DATE,
    grupo_sanguineo VARCHAR(3),
    fecha_registro_paciente TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_paciente_usuario
      FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id),
    CONSTRAINT fk_paciente_medico
      FOREIGN KEY (medico_id) REFERENCES medicos(medico_id),
    CONSTRAINT ck_paciente_grupo_sanguineo
      CHECK (
        grupo_sanguineo IS NULL OR
        grupo_sanguineo IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
      )
);

CREATE TABLE umbrales (
    tipo_medicion_id UUID PRIMARY KEY,
    valor_minimo_normal NUMERIC NOT NULL,
    valor_maximo_normal NUMERIC NOT NULL,
    valor_critico NUMERIC NOT NULL,
    CONSTRAINT fk_umbral_tipo_medicion
      FOREIGN KEY (tipo_medicion_id) REFERENCES tipos_medicion(tipo_medicion_id),
    CONSTRAINT ck_umbral_rangos
      CHECK (
        valor_minimo_normal >= 0 AND
        valor_minimo_normal < valor_maximo_normal AND
        (
          valor_critico < valor_minimo_normal OR
          valor_critico > valor_maximo_normal
        )
      )
);

CREATE TABLE mediciones (
    medicion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL,
    tipo_medicion_id UUID NOT NULL,
    valor NUMERIC NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_medicion_paciente
      FOREIGN KEY (paciente_id) REFERENCES pacientes(paciente_id),
    CONSTRAINT fk_medicion_tipo
      FOREIGN KEY (tipo_medicion_id) REFERENCES tipos_medicion(tipo_medicion_id),
    CONSTRAINT ck_medicion_valor_positivo CHECK (valor > 0)
);

CREATE TABLE alertas (
    alerta_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicion_id UUID NOT NULL UNIQUE,
    estado_alerta_id UUID NOT NULL,
    leido_por_medico BOOLEAN DEFAULT false,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alerta_medicion
      FOREIGN KEY (medicion_id) REFERENCES mediciones(medicion_id) ON DELETE CASCADE,
    CONSTRAINT fk_alerta_estado
      FOREIGN KEY (estado_alerta_id) REFERENCES estados_alerta(estado_alerta_id)
);

-- Funciones y procedimientos almacenados agregados despues de la revision 2.

CREATE OR REPLACE FUNCTION fn_obtener_umbral_por_tipo(p_tipo_medicion TEXT)
RETURNS TABLE (
  tipo_medicion_id UUID,
  tipo_medicion TEXT,
  unidad TEXT,
  valor_minimo_normal NUMERIC,
  valor_maximo_normal NUMERIC,
  valor_critico NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    u.tipo_medicion_id,
    tm.nombre::TEXT AS tipo_medicion,
    tm.unidad::TEXT AS unidad,
    u.valor_minimo_normal,
    u.valor_maximo_normal,
    u.valor_critico
  FROM umbrales u
  JOIN tipos_medicion tm ON tm.tipo_medicion_id = u.tipo_medicion_id
  WHERE tm.nombre = p_tipo_medicion
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION fn_listar_umbrales()
RETURNS TABLE (
  tipo_medicion_id UUID,
  tipo_medicion TEXT,
  unidad TEXT,
  valor_minimo_normal NUMERIC,
  valor_maximo_normal NUMERIC,
  valor_critico NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    u.tipo_medicion_id,
    tm.nombre::TEXT AS tipo_medicion,
    tm.unidad::TEXT AS unidad,
    u.valor_minimo_normal,
    u.valor_maximo_normal,
    u.valor_critico
  FROM umbrales u
  JOIN tipos_medicion tm ON tm.tipo_medicion_id = u.tipo_medicion_id
  ORDER BY tm.nombre ASC;
$$;

CREATE OR REPLACE FUNCTION fn_registrar_medicion_con_alerta(
  p_paciente_id UUID,
  p_tipo_medicion TEXT,
  p_valor NUMERIC,
  p_fecha TIMESTAMPTZ,
  p_estado_alerta TEXT
)
RETURNS TABLE (
  medicion_id UUID,
  paciente_id UUID,
  tipo_medicion TEXT,
  valor NUMERIC,
  fecha TIMESTAMPTZ,
  alerta_generada BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_tipo_medicion_id UUID;
  v_estado_alerta_id UUID;
  v_medicion_id UUID;
  v_fecha TIMESTAMPTZ;
BEGIN
  SELECT tm.tipo_medicion_id
  INTO v_tipo_medicion_id
  FROM tipos_medicion tm
  WHERE tm.nombre = p_tipo_medicion;

  IF v_tipo_medicion_id IS NULL THEN
    RAISE EXCEPTION 'No existe el tipo de medicion indicado: %', p_tipo_medicion
      USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO mediciones (paciente_id, tipo_medicion_id, valor, fecha)
  VALUES (p_paciente_id, v_tipo_medicion_id, p_valor, p_fecha)
  RETURNING mediciones.medicion_id, mediciones.fecha
  INTO v_medicion_id, v_fecha;

  alerta_generada := false;

  IF p_estado_alerta <> 'Normal' THEN
    SELECT ea.estado_alerta_id
    INTO v_estado_alerta_id
    FROM estados_alerta ea
    WHERE ea.descripcion = p_estado_alerta;

    IF v_estado_alerta_id IS NULL THEN
      RAISE EXCEPTION 'No existe el estado de alerta indicado: %', p_estado_alerta
        USING ERRCODE = 'P0002';
    END IF;

    INSERT INTO alertas (medicion_id, estado_alerta_id, leido_por_medico, fecha)
    VALUES (v_medicion_id, v_estado_alerta_id, false, v_fecha);

    alerta_generada := true;
  END IF;

  RETURN QUERY
  SELECT
    v_medicion_id,
    p_paciente_id,
    p_tipo_medicion,
    p_valor,
    v_fecha,
    alerta_generada;
END;
$$;

CREATE OR REPLACE FUNCTION fn_alertas_pendientes_medico(p_medico_id UUID)
RETURNS TABLE (
  alerta_id UUID,
  medicion_id UUID,
  estado_alerta TEXT,
  leido_por_medico BOOLEAN,
  fecha TIMESTAMPTZ,
  paciente_id UUID,
  paciente_nombre TEXT,
  medicion_tipo TEXT,
  medicion_unidad TEXT,
  medicion_valor NUMERIC,
  medicion_fecha TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    a.alerta_id,
    a.medicion_id,
    ea.descripcion::TEXT AS estado_alerta,
    a.leido_por_medico,
    a.fecha,
    p.paciente_id,
    btrim(concat_ws(' ', u.nombre, u.apellido))::TEXT AS paciente_nombre,
    tm.nombre::TEXT AS medicion_tipo,
    tm.unidad::TEXT AS medicion_unidad,
    m.valor AS medicion_valor,
    m.fecha AS medicion_fecha
  FROM alertas a
  JOIN estados_alerta ea ON ea.estado_alerta_id = a.estado_alerta_id
  JOIN mediciones m ON a.medicion_id = m.medicion_id
  JOIN tipos_medicion tm ON tm.tipo_medicion_id = m.tipo_medicion_id
  JOIN pacientes p ON m.paciente_id = p.paciente_id
  JOIN usuarios u ON u.usuario_id = p.usuario_id
  WHERE p.medico_id = p_medico_id
    AND a.leido_por_medico = false
  ORDER BY a.fecha DESC;
$$;

CREATE OR REPLACE PROCEDURE sp_marcar_alerta_como_leida(
  p_alerta_id UUID,
  p_medico_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_actualizadas INTEGER;
BEGIN
  UPDATE alertas a
  SET leido_por_medico = true
  FROM mediciones m
  JOIN pacientes p ON p.paciente_id = m.paciente_id
  WHERE a.alerta_id = p_alerta_id
    AND a.medicion_id = m.medicion_id
    AND p.medico_id = p_medico_id;

  GET DIAGNOSTICS v_actualizadas = ROW_COUNT;

  IF v_actualizadas = 0 THEN
    RAISE EXCEPTION 'La alerta no existe o no pertenece al medico autenticado.'
      USING ERRCODE = 'P0002';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_pacientes_asignados_medico(p_medico_id UUID)
RETURNS TABLE (
  paciente_id UUID,
  nombre TEXT,
  apellido TEXT,
  email TEXT,
  telefono TEXT,
  fecha_nacimiento DATE,
  grupo_sanguineo TEXT,
  medico_id UUID
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.paciente_id,
    u.nombre::TEXT AS nombre,
    u.apellido::TEXT AS apellido,
    u.email::TEXT AS email,
    u.telefono::TEXT AS telefono,
    p.fecha_nacimiento,
    p.grupo_sanguineo::TEXT AS grupo_sanguineo,
    p.medico_id
  FROM pacientes p
  JOIN usuarios u ON u.usuario_id = p.usuario_id
  WHERE p.medico_id = p_medico_id
  ORDER BY u.apellido ASC, u.nombre ASC;
$$;

CREATE OR REPLACE FUNCTION fn_historial_mediciones_paciente(p_paciente_id UUID)
RETURNS TABLE (
  medicion_id UUID,
  paciente_id UUID,
  tipo_medicion TEXT,
  valor NUMERIC,
  fecha TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    m.medicion_id,
    m.paciente_id,
    tm.nombre::TEXT AS tipo_medicion,
    m.valor,
    m.fecha
  FROM mediciones m
  JOIN tipos_medicion tm ON tm.tipo_medicion_id = m.tipo_medicion_id
  WHERE m.paciente_id = p_paciente_id
  ORDER BY m.fecha DESC;
$$;
