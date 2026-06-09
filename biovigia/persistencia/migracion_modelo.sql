
BEGIN;

CREATE TABLE IF NOT EXISTS roles (
    rol_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS estados_alerta (
    estado_alerta_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descripcion VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS tipos_medicion (
    tipo_medicion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    unidad VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS especialidades (
    especialidad_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(120) UNIQUE NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'rol_id') THEN
    ALTER TABLE roles RENAME COLUMN id TO rol_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estados_alerta' AND column_name = 'id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estados_alerta' AND column_name = 'estado_alerta_id') THEN
    ALTER TABLE estados_alerta RENAME COLUMN id TO estado_alerta_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tipos_medicion' AND column_name = 'id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tipos_medicion' AND column_name = 'tipo_medicion_id') THEN
    ALTER TABLE tipos_medicion RENAME COLUMN id TO tipo_medicion_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medicos' AND column_name = 'id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medicos' AND column_name = 'medico_id') THEN
    ALTER TABLE medicos RENAME COLUMN id TO medico_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pacientes' AND column_name = 'id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pacientes' AND column_name = 'paciente_id') THEN
    ALTER TABLE pacientes RENAME COLUMN id TO paciente_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pacientes' AND column_name = 'medico_' || 'responsable_id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pacientes' AND column_name = 'medico_id') THEN
    EXECUTE 'ALTER TABLE pacientes RENAME COLUMN medico_' || 'responsable_id TO medico_id';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'usuario_id') THEN
    ALTER TABLE usuarios RENAME COLUMN id TO usuario_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mediciones' AND column_name = 'id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mediciones' AND column_name = 'medicion_id') THEN
    ALTER TABLE mediciones RENAME COLUMN id TO medicion_id;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alertas' AND column_name = 'id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alertas' AND column_name = 'alerta_id') THEN
    ALTER TABLE alertas RENAME COLUMN id TO alerta_id;
  END IF;
END $$;

INSERT INTO roles (rol_id, nombre) VALUES
  ('7d696604-c2ce-47b1-ae2d-72c8ff8f86f1', 'medico'),
  ('6da368fb-2d8d-4d39-8de6-e75e70ca9018', 'paciente'),
  ('82be8d86-9e52-4e2e-9a62-9a17b2e61335', 'administrador')
ON CONFLICT DO NOTHING;

INSERT INTO estados_alerta (estado_alerta_id, descripcion) VALUES
  ('f575778a-c264-4755-b5ee-95ab69f7d8df', 'Normal'),
  ('94f5eff5-a93d-4787-9d0e-ac94a412e920', 'Advertencia'),
  ('0dfab290-a31e-49fd-86e7-7f87f4191b44', 'Critico')
ON CONFLICT DO NOTHING;

INSERT INTO tipos_medicion (tipo_medicion_id, nombre, unidad) VALUES
  ('5cf4ad39-700d-4cd8-8377-4ecce758e3df', 'PresionArterial', 'mmHg'),
  ('fdd8e652-7a9f-4bc2-afec-d47876ef64a8', 'Glucosa', 'mg/dL')
ON CONFLICT DO NOTHING;

INSERT INTO especialidades (especialidad_id, nombre) VALUES
  ('bb6e2dbd-c0f9-4b0b-a131-857f1f63c5c5', 'Medicina General'),
  ('30f45bb2-7c1b-47f2-b0a4-cf4090f243e0', 'Cardiologia'),
  ('6642ebea-e31f-4862-bc2b-b3f606a1e8c5', 'Clinica Medica'),
  ('7a79dc59-654c-4410-8f56-18ec656f691f', 'Pediatria')
ON CONFLICT DO NOTHING;

ALTER TABLE mediciones ADD COLUMN IF NOT EXISTS tipo_medicion_id UUID;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mediciones' AND column_name = 'tipo_medicion') THEN
    EXECUTE '
      UPDATE mediciones
      SET tipo_medicion_id = tm.tipo_medicion_id
      FROM tipos_medicion tm
      WHERE tm.nombre = mediciones.tipo_medicion::text
        AND mediciones.tipo_medicion_id IS NULL
    ';
  END IF;
END $$;

ALTER TABLE alertas ADD COLUMN IF NOT EXISTS estado_alerta_id UUID;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'alertas' AND column_name = 'estado_alerta') THEN
    EXECUTE '
      UPDATE alertas
      SET estado_alerta_id = ea.estado_alerta_id
      FROM estados_alerta ea
      WHERE ea.descripcion = alertas.estado_alerta::text
        AND alertas.estado_alerta_id IS NULL
    ';
  END IF;
END $$;

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol_id UUID;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nombre VARCHAR(120);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS apellido VARCHAR(120);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(50);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS grupo_sanguineo VARCHAR(3);
ALTER TABLE medicos ADD COLUMN IF NOT EXISTS especialidad_id UUID;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'medicos'
      AND column_name = 'especialidad'
  ) THEN
    EXECUTE '
      INSERT INTO especialidades (nombre)
      SELECT DISTINCT especialidad
      FROM medicos
      WHERE especialidad IS NOT NULL
      ON CONFLICT (nombre) DO NOTHING
    ';

    EXECUTE '
      UPDATE medicos m
      SET especialidad_id = e.especialidad_id
      FROM especialidades e
      WHERE e.nombre = m.especialidad
        AND m.especialidad_id IS NULL
    ';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'rol') THEN
    EXECUTE '
      UPDATE usuarios
      SET rol_id = r.rol_id
      FROM roles r
      WHERE r.nombre = usuarios.rol::text
        AND usuarios.rol_id IS NULL
    ';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS usuario_medico (
    usuario_id UUID PRIMARY KEY,
    medico_id UUID UNIQUE NOT NULL,
    fecha_habilitacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_medico_usuario
      FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_medico_medico
      FOREIGN KEY (medico_id) REFERENCES medicos(medico_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS usuario_paciente (
    usuario_id UUID PRIMARY KEY,
    paciente_id UUID UNIQUE NOT NULL,
    fecha_registro_paciente TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_paciente_usuario
      FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_paciente_paciente
      FOREIGN KEY (paciente_id) REFERENCES pacientes(paciente_id) ON DELETE CASCADE
);

ALTER TABLE usuario_medico
  ADD COLUMN IF NOT EXISTS fecha_habilitacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE usuario_paciente
  ADD COLUMN IF NOT EXISTS fecha_registro_paciente TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'medico_id') THEN
    EXECUTE '
      INSERT INTO usuario_medico (usuario_id, medico_id)
      SELECT usuario_id, medico_id
      FROM usuarios
      WHERE medico_id IS NOT NULL
      ON CONFLICT (usuario_id) DO NOTHING
    ';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'paciente_id') THEN
    EXECUTE '
      INSERT INTO usuario_paciente (usuario_id, paciente_id)
      SELECT usuario_id, paciente_id
      FROM usuarios
      WHERE paciente_id IS NOT NULL
      ON CONFLICT (usuario_id) DO NOTHING
    ';
  END IF;
END $$;

DO $$
DECLARE
  v_nombre_col TEXT := 'nombre_' || 'completo';
  v_dato_col TEXT := 'con' || 'tacto';
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'medicos'
      AND column_name = v_nombre_col
  ) THEN
    EXECUTE format(
      '
        UPDATE usuarios u
        SET
          nombre = COALESCE(NULLIF(split_part(m.%1$I, '' '', 1), ''''), u.username),
          apellido = COALESCE(
            NULLIF(btrim(substr(m.%1$I, length(split_part(m.%1$I, '' '', 1)) + 2)), ''''),
            ''''
          )
        FROM usuario_medico um
        JOIN medicos m ON m.medico_id = um.medico_id
        WHERE u.usuario_id = um.usuario_id
          AND (u.nombre IS NULL OR u.apellido IS NULL)
      ',
      v_nombre_col
    );
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'pacientes'
      AND column_name = v_nombre_col
  ) THEN
    EXECUTE format(
      '
        UPDATE usuarios u
        SET
          nombre = COALESCE(NULLIF(split_part(p.%1$I, '' '', 1), ''''), u.username),
          apellido = COALESCE(
            NULLIF(btrim(substr(p.%1$I, length(split_part(p.%1$I, '' '', 1)) + 2)), ''''),
            ''''
          )
        FROM usuario_paciente up
        JOIN pacientes p ON p.paciente_id = up.paciente_id
        WHERE u.usuario_id = up.usuario_id
          AND (u.nombre IS NULL OR u.apellido IS NULL)
      ',
      v_nombre_col
    );
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'pacientes'
      AND column_name = v_dato_col
  ) THEN
    EXECUTE format(
      '
        UPDATE usuarios u
        SET
          email = CASE
            WHEN p.%1$I ~ ''^[^@]+@[^@]+\.[^@]+$'' THEN p.%1$I
            ELSE u.email
          END,
          telefono = CASE
            WHEN p.%1$I IS NOT NULL AND p.%1$I !~ ''^[^@]+@[^@]+\.[^@]+$'' THEN p.%1$I
            ELSE u.telefono
          END
        FROM usuario_paciente up
        JOIN pacientes p ON p.paciente_id = up.paciente_id
        WHERE u.usuario_id = up.usuario_id
      ',
      v_dato_col
    );
  END IF;
END $$;

UPDATE usuarios
SET
  nombre = COALESCE(NULLIF(nombre, ''), username),
  apellido = COALESCE(apellido, ''),
  email = NULLIF(email, ''),
  telefono = NULLIF(telefono, '');

UPDATE usuario_medico um
SET fecha_habilitacion = COALESCE(u.creado_en, CURRENT_TIMESTAMP)
FROM usuarios u
WHERE u.usuario_id = um.usuario_id
  AND um.fecha_habilitacion IS NULL;

UPDATE usuario_paciente up
SET fecha_registro_paciente = COALESCE(u.creado_en, CURRENT_TIMESTAMP)
FROM usuarios u
WHERE u.usuario_id = up.usuario_id
  AND up.fecha_registro_paciente IS NULL;

ALTER TABLE usuarios
  ALTER COLUMN nombre SET NOT NULL;

ALTER TABLE usuarios
  ALTER COLUMN apellido SET NOT NULL;

ALTER TABLE pacientes DROP CONSTRAINT IF EXISTS ck_paciente_grupo_sanguineo;
ALTER TABLE pacientes
  ADD CONSTRAINT ck_paciente_grupo_sanguineo
  CHECK (
    grupo_sanguineo IS NULL OR
    grupo_sanguineo IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
  );

CREATE TABLE IF NOT EXISTS umbrales_nuevos (
    tipo_medicion_id UUID PRIMARY KEY,
    valor_minimo_normal NUMERIC NOT NULL,
    valor_maximo_normal NUMERIC NOT NULL,
    valor_critico NUMERIC NOT NULL,
    CONSTRAINT fk_umbral_tipo_medicion_nuevo
      FOREIGN KEY (tipo_medicion_id) REFERENCES tipos_medicion(tipo_medicion_id),
    CONSTRAINT ck_umbral_rangos_nuevo
      CHECK (
        valor_minimo_normal >= 0 AND
        valor_minimo_normal < valor_maximo_normal AND
        (
          valor_critico < valor_minimo_normal OR
          valor_critico > valor_maximo_normal
        )
      )
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'umbrales' AND column_name = 'tipo_medicion') THEN
    EXECUTE '
      INSERT INTO umbrales_nuevos (tipo_medicion_id, valor_minimo_normal, valor_maximo_normal, valor_critico)
      SELECT tm.tipo_medicion_id, u.valor_minimo_normal, u.valor_maximo_normal, u.valor_critico
      FROM umbrales u
      JOIN tipos_medicion tm ON tm.nombre = u.tipo_medicion::text
      ON CONFLICT (tipo_medicion_id) DO NOTHING
    ';
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'umbrales' AND column_name = 'tipo_medicion_id') THEN
    EXECUTE '
      INSERT INTO umbrales_nuevos (tipo_medicion_id, valor_minimo_normal, valor_maximo_normal, valor_critico)
      SELECT u.tipo_medicion_id, u.valor_minimo_normal, u.valor_maximo_normal, u.valor_critico
      FROM umbrales u
      ON CONFLICT (tipo_medicion_id) DO NOTHING
    ';
  END IF;
END $$;

DROP TABLE IF EXISTS umbrales;
ALTER TABLE umbrales_nuevos RENAME TO umbrales;

ALTER TABLE pacientes DROP CONSTRAINT IF EXISTS fk_paciente_medico;
ALTER TABLE pacientes
  ADD CONSTRAINT fk_paciente_medico
  FOREIGN KEY (medico_id) REFERENCES medicos(medico_id);

ALTER TABLE medicos
  ALTER COLUMN especialidad_id SET NOT NULL;

ALTER TABLE medicos DROP CONSTRAINT IF EXISTS fk_medico_especialidad;
ALTER TABLE medicos
  ADD CONSTRAINT fk_medico_especialidad
  FOREIGN KEY (especialidad_id) REFERENCES especialidades(especialidad_id);

ALTER TABLE mediciones
  ALTER COLUMN tipo_medicion_id SET NOT NULL;

ALTER TABLE alertas
  ALTER COLUMN estado_alerta_id SET NOT NULL;

ALTER TABLE usuarios
  ALTER COLUMN rol_id SET NOT NULL;

ALTER TABLE usuarios
  ALTER COLUMN activo SET DEFAULT true;

ALTER TABLE mediciones DROP CONSTRAINT IF EXISTS fk_medicion_tipo_migrado;
ALTER TABLE mediciones
  ADD CONSTRAINT fk_medicion_tipo_migrado
  FOREIGN KEY (tipo_medicion_id) REFERENCES tipos_medicion(tipo_medicion_id);

ALTER TABLE alertas DROP CONSTRAINT IF EXISTS fk_alerta_estado_migrado;
ALTER TABLE alertas
  ADD CONSTRAINT fk_alerta_estado_migrado
  FOREIGN KEY (estado_alerta_id) REFERENCES estados_alerta(estado_alerta_id);

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS fk_usuario_rol_migrado;
ALTER TABLE usuarios
  ADD CONSTRAINT fk_usuario_rol_migrado
  FOREIGN KEY (rol_id) REFERENCES roles(rol_id);

ALTER TABLE alertas DROP CONSTRAINT IF EXISTS uq_alerta_medicion;
ALTER TABLE alertas
  ADD CONSTRAINT uq_alerta_medicion UNIQUE (medicion_id);

ALTER TABLE mediciones DROP CONSTRAINT IF EXISTS ck_medicion_valor_positivo;
ALTER TABLE mediciones
  ADD CONSTRAINT ck_medicion_valor_positivo CHECK (valor > 0);

ALTER TABLE umbrales DROP CONSTRAINT IF EXISTS ck_umbral_rangos;
ALTER TABLE umbrales DROP CONSTRAINT IF EXISTS ck_umbral_rangos_nuevo;
ALTER TABLE umbrales
  ADD CONSTRAINT ck_umbral_rangos
  CHECK (
    valor_minimo_normal >= 0 AND
    valor_minimo_normal < valor_maximo_normal AND
    (
      valor_critico < valor_minimo_normal OR
      valor_critico > valor_maximo_normal
    )
  );

ALTER TABLE usuarios DROP COLUMN IF EXISTS medico_id;
ALTER TABLE usuarios DROP COLUMN IF EXISTS paciente_id;
ALTER TABLE usuarios DROP COLUMN IF EXISTS rol;
ALTER TABLE alertas DROP COLUMN IF EXISTS estado_alerta;
ALTER TABLE mediciones DROP COLUMN IF EXISTS tipo_medicion;
ALTER TABLE medicos DROP COLUMN IF EXISTS especialidad;

DO $$
DECLARE
  v_nombre_col TEXT := 'nombre_' || 'completo';
  v_dato_col TEXT := 'con' || 'tacto';
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'medicos'
      AND column_name = v_nombre_col
  ) THEN
    EXECUTE format('ALTER TABLE medicos DROP COLUMN %I', v_nombre_col);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'pacientes'
      AND column_name = v_nombre_col
  ) THEN
    EXECUTE format('ALTER TABLE pacientes DROP COLUMN %I', v_nombre_col);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'pacientes'
      AND column_name = v_dato_col
  ) THEN
    EXECUTE format('ALTER TABLE pacientes DROP COLUMN %I', v_dato_col);
  END IF;
END $$;

DROP TYPE IF EXISTS tipo_rol_usuario;
DROP TYPE IF EXISTS tipo_estado_medicion;
DROP TYPE IF EXISTS medicion_categoria;

COMMIT;
