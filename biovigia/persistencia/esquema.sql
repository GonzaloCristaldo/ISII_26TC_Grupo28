-- Esquema academico normalizado para BioVigia.

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE estados_alerta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    descripcion VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE tipos_medicion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    unidad VARCHAR(50) NOT NULL
);

CREATE TABLE medicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_completo VARCHAR(255) NOT NULL,
    especialidad VARCHAR(255) NOT NULL,
    numero_licencia VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_completo VARCHAR(255) NOT NULL,
    contacto VARCHAR(255),
    medico_responsable_id UUID NOT NULL,
    CONSTRAINT fk_paciente_medico
      FOREIGN KEY (medico_responsable_id) REFERENCES medicos(id)
);

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol_id UUID NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_rol
      FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE usuario_medico (
    usuario_id UUID PRIMARY KEY,
    medico_id UUID UNIQUE NOT NULL,
    CONSTRAINT fk_usuario_medico_usuario
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_medico_medico
      FOREIGN KEY (medico_id) REFERENCES medicos(id) ON DELETE CASCADE
);

CREATE TABLE usuario_paciente (
    usuario_id UUID PRIMARY KEY,
    paciente_id UUID UNIQUE NOT NULL,
    CONSTRAINT fk_usuario_paciente_usuario
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_paciente_paciente
      FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
);

CREATE TABLE umbrales (
    tipo_medicion_id UUID PRIMARY KEY,
    valor_minimo_normal NUMERIC NOT NULL,
    valor_maximo_normal NUMERIC NOT NULL,
    valor_critico NUMERIC NOT NULL,
    CONSTRAINT fk_umbral_tipo_medicion
      FOREIGN KEY (tipo_medicion_id) REFERENCES tipos_medicion(id),
    CONSTRAINT ck_umbral_rangos
      CHECK (
        valor_minimo_normal >= 0 AND
        valor_minimo_normal < valor_maximo_normal AND
        valor_critico > valor_maximo_normal
      )
);

CREATE TABLE mediciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL,
    tipo_medicion_id UUID NOT NULL,
    valor NUMERIC NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_medicion_paciente
      FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    CONSTRAINT fk_medicion_tipo
      FOREIGN KEY (tipo_medicion_id) REFERENCES tipos_medicion(id),
    CONSTRAINT ck_medicion_valor_positivo CHECK (valor > 0)
);

CREATE TABLE alertas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicion_id UUID NOT NULL UNIQUE,
    estado_alerta_id UUID NOT NULL,
    leido_por_medico BOOLEAN DEFAULT false,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alerta_medicion
      FOREIGN KEY (medicion_id) REFERENCES mediciones(id) ON DELETE CASCADE,
    CONSTRAINT fk_alerta_estado
      FOREIGN KEY (estado_alerta_id) REFERENCES estados_alerta(id)
);
