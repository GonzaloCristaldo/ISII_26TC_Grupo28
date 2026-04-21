-- Datos iniciales para el esquema academico.

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

INSERT INTO medicos (id, nombre_completo, especialidad, numero_licencia)
VALUES ('3d5a4435-0275-430c-99e2-ab001ac0aa3f', 'Dra. Laura Gomez', 'Medicina General', 'MN-1001')
ON CONFLICT DO NOTHING;

INSERT INTO pacientes (id, nombre_completo, contacto, medico_responsable_id)
VALUES (
  'e5b87140-5712-4c2f-b4de-1a221f00a581',
  'Sofia Martinez',
  'sofia.martinez@example.com',
  '3d5a4435-0275-430c-99e2-ab001ac0aa3f'
)
ON CONFLICT DO NOTHING;

INSERT INTO usuarios (id, username, password_hash, rol_id)
VALUES (
  'f2fdb3d8-4f6d-481e-b08a-76f858d1f2f7',
  'laura.gomez',
  'scrypt$5432cab35c4330c279d758b2a5e6fcd3$bac9e320f0b186e785fd11583ff8f5ed388cbd415e9c7b5095e722aaffd3666b4f72debd757aa0abc7da1a57a8458221b6720a66f6b313b372c74adf95106890',
  '7d696604-c2ce-47b1-ae2d-72c8ff8f86f1'
)
ON CONFLICT (username) DO NOTHING;

INSERT INTO usuarios (id, username, password_hash, rol_id)
VALUES (
  '7ef9f957-b4a0-4dd4-9f6f-2d689d8ef2d5',
  'sofia.martinez',
  'scrypt$76ea755ab60095a04c54721d8e4eca33$e1f2fb49914f9792481247ef9723d9fbf69314b339bdaa13508593120769f151bf325f6ad887b0896bb3df6370777012ec7c45551216648b58fb5d336376df52',
  '6da368fb-2d8d-4d39-8de6-e75e70ca9018'
)
ON CONFLICT (username) DO NOTHING;

INSERT INTO usuario_medico (usuario_id, medico_id)
VALUES (
  'f2fdb3d8-4f6d-481e-b08a-76f858d1f2f7',
  '3d5a4435-0275-430c-99e2-ab001ac0aa3f'
)
ON CONFLICT (usuario_id) DO NOTHING;

INSERT INTO usuario_paciente (usuario_id, paciente_id)
VALUES (
  '7ef9f957-b4a0-4dd4-9f6f-2d689d8ef2d5',
  'e5b87140-5712-4c2f-b4de-1a221f00a581'
)
ON CONFLICT (usuario_id) DO NOTHING;

INSERT INTO umbrales (tipo_medicion_id, valor_minimo_normal, valor_maximo_normal, valor_critico)
VALUES
  ('5cf4ad39-700d-4cd8-8377-4ecce758e3df', 90, 120, 180),
  ('fdd8e652-7a9f-4bc2-afec-d47876ef64a8', 70, 100, 140)
ON CONFLICT (tipo_medicion_id) DO NOTHING;
