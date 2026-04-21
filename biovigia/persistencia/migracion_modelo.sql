-- Migracion para aceptar login.
-- Ejecutar sobre una base ya existente antes de volver a correr datos_iniciales.sql si hiciera falta.

BEGIN;

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS estados_alerta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descripcion VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS tipos_medicion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    unidad VARCHAR(50) NOT NULL
);

INSERT INTO roles (id, nombre) VALUES
  ('7d696604-c2ce-47b1-ae2d-72c8ff8f86f1', 'medico'),
  ('6da368fb-2d8d-4d39-8de6-e75e70ca9018', 'paciente')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO estados_alerta (id, descripcion) VALUES
  ('f575778a-c264-4755-b5ee-95ab69f7d8df', 'Normal'),
  ('94f5eff5-a93d-4787-9d0e-ac94a412e920', 'Advertencia'),
  ('0dfab290-a31e-49fd-86e7-7f87f4191b44', 'Critico')
ON CONFLICT (descripcion) DO NOTHING;

INSERT INTO tipos_medicion (id, nombre, unidad) VALUES
  ('5cf4ad39-700d-4cd8-8377-4ecce758e3df', 'PresionArterial', 'mmHg'),
  ('fdd8e652-7a9f-4bc2-afec-d47876ef64a8', 'Glucosa', 'mg/dL')
ON CONFLICT (nombre) DO NOTHING;

ALTER TABLE mediciones ADD COLUMN IF NOT EXISTS tipo_medicion_id UUID;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mediciones' AND column_name = 'tipo_medicion') THEN
    EXECUTE '
      UPDATE mediciones
      SET tipo_medicion_id = tm.id
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
      SET estado_alerta_id = ea.id
      FROM estados_alerta ea
      WHERE ea.descripcion = alertas.estado_alerta::text
        AND alertas.estado_alerta_id IS NULL
    ';
  END IF;
END $$;

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol_id UUID;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'rol') THEN
    EXECUTE '
      UPDATE usuarios
      SET rol_id = r.id
      FROM roles r
      WHERE r.nombre = usuarios.rol::text
        AND usuarios.rol_id IS NULL
    ';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS usuario_medico (
    usuario_id UUID PRIMARY KEY,
    medico_id UUID UNIQUE NOT NULL,
    CONSTRAINT fk_usuario_medico_usuario
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_medico_medico
      FOREIGN KEY (medico_id) REFERENCES medicos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS usuario_paciente (
    usuario_id UUID PRIMARY KEY,
    paciente_id UUID UNIQUE NOT NULL,
    CONSTRAINT fk_usuario_paciente_usuario
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_paciente_paciente
      FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'medico_id') THEN
    EXECUTE '
      INSERT INTO usuario_medico (usuario_id, medico_id)
      SELECT id, medico_id
      FROM usuarios
      WHERE medico_id IS NOT NULL
      ON CONFLICT (usuario_id) DO NOTHING
    ';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'paciente_id') THEN
    EXECUTE '
      INSERT INTO usuario_paciente (usuario_id, paciente_id)
      SELECT id, paciente_id
      FROM usuarios
      WHERE paciente_id IS NOT NULL
      ON CONFLICT (usuario_id) DO NOTHING
    ';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS umbrales_nuevos (
    tipo_medicion_id UUID PRIMARY KEY,
    valor_minimo_normal NUMERIC NOT NULL,
    valor_maximo_normal NUMERIC NOT NULL,
    valor_critico NUMERIC NOT NULL,
    CONSTRAINT fk_umbral_tipo_medicion_nuevo
      FOREIGN KEY (tipo_medicion_id) REFERENCES tipos_medicion(id),
    CONSTRAINT ck_umbral_rangos_nuevo
      CHECK (
        valor_minimo_normal >= 0 AND
        valor_minimo_normal < valor_maximo_normal AND
        valor_critico > valor_maximo_normal
      )
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'umbrales' AND column_name = 'tipo_medicion') THEN
    EXECUTE '
      INSERT INTO umbrales_nuevos (tipo_medicion_id, valor_minimo_normal, valor_maximo_normal, valor_critico)
      SELECT tm.id, u.valor_minimo_normal, u.valor_maximo_normal, u.valor_critico
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

ALTER TABLE mediciones
  ALTER COLUMN tipo_medicion_id SET NOT NULL;

ALTER TABLE alertas
  ALTER COLUMN estado_alerta_id SET NOT NULL;

ALTER TABLE usuarios
  ALTER COLUMN rol_id SET NOT NULL;

ALTER TABLE mediciones DROP CONSTRAINT IF EXISTS fk_medicion_tipo_migrado;
ALTER TABLE mediciones
  ADD CONSTRAINT fk_medicion_tipo_migrado
  FOREIGN KEY (tipo_medicion_id) REFERENCES tipos_medicion(id);

ALTER TABLE alertas DROP CONSTRAINT IF EXISTS fk_alerta_estado_migrado;
ALTER TABLE alertas
  ADD CONSTRAINT fk_alerta_estado_migrado
  FOREIGN KEY (estado_alerta_id) REFERENCES estados_alerta(id);

ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS fk_usuario_rol_migrado;
ALTER TABLE usuarios
  ADD CONSTRAINT fk_usuario_rol_migrado
  FOREIGN KEY (rol_id) REFERENCES roles(id);

ALTER TABLE alertas DROP CONSTRAINT IF EXISTS uq_alerta_medicion;
ALTER TABLE alertas
  ADD CONSTRAINT uq_alerta_medicion UNIQUE (medicion_id);

ALTER TABLE mediciones DROP CONSTRAINT IF EXISTS ck_medicion_valor_positivo;
ALTER TABLE mediciones
  ADD CONSTRAINT ck_medicion_valor_positivo CHECK (valor > 0);

ALTER TABLE usuarios DROP COLUMN IF EXISTS medico_id;
ALTER TABLE usuarios DROP COLUMN IF EXISTS paciente_id;
ALTER TABLE usuarios DROP COLUMN IF EXISTS rol;
ALTER TABLE alertas DROP COLUMN IF EXISTS estado_alerta;
ALTER TABLE mediciones DROP COLUMN IF EXISTS tipo_medicion;

DROP TYPE IF EXISTS tipo_rol_usuario;
DROP TYPE IF EXISTS tipo_estado_medicion;
DROP TYPE IF EXISTS medicion_categoria;

COMMIT;
