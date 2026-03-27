-- Seed: Programas y Niveles ENSIL

INSERT INTO programa (nombre, alias, descripcion) VALUES
  ('Especialización',  'Profesional, Adultos',    'Programa para adultos y jóvenes'),
  ('Kids',             'ENSIL Kids',              'Programa para niños'),
  ('Pre-Kids',         'Pre Kids',                'Programa pre-escolar'),
  ('Pre-lectura',      'Pre lectores',            'Programa de iniciación a la lectura');

-- Niveles de Especialización (20 módulos típicamente)
INSERT INTO nivel (programa_id, nombre, duracion_meses, garantia_meses, orden)
SELECT id, 'Nivel 1', 3, 3, 1 FROM programa WHERE nombre = 'Especialización'
UNION ALL
SELECT id, 'Nivel 2', 3, 3, 2 FROM programa WHERE nombre = 'Especialización'
UNION ALL
SELECT id, 'Nivel 3', 3, 3, 3 FROM programa WHERE nombre = 'Especialización'
UNION ALL
SELECT id, 'Nivel 4', 3, 3, 4 FROM programa WHERE nombre = 'Especialización'
UNION ALL
SELECT id, 'Nivel 5', 3, 3, 5 FROM programa WHERE nombre = 'Especialización';

-- Niveles de Kids
INSERT INTO nivel (programa_id, nombre, duracion_meses, garantia_meses, orden)
SELECT id, 'Nivel 1', 3, 3, 1 FROM programa WHERE nombre = 'Kids'
UNION ALL
SELECT id, 'Nivel 2', 3, 3, 2 FROM programa WHERE nombre = 'Kids'
UNION ALL
SELECT id, 'Nivel 3', 3, 3, 3 FROM programa WHERE nombre = 'Kids';

-- Niveles de Pre-Kids
INSERT INTO nivel (programa_id, nombre, duracion_meses, garantia_meses, orden)
SELECT id, 'Nivel 1', 3, 3, 1 FROM programa WHERE nombre = 'Pre-Kids'
UNION ALL
SELECT id, 'Nivel 2', 3, 3, 2 FROM programa WHERE nombre = 'Pre-Kids';

-- Nivel de Pre-lectura (programa único)
INSERT INTO nivel (programa_id, nombre, duracion_meses, garantia_meses, orden)
SELECT id, 'Nivel Único', 3, 3, 1 FROM programa WHERE nombre = 'Pre-lectura';

-- Tipos de pago base
INSERT INTO tipo_pago (nombre, num_cuotas, descripcion) VALUES
  ('Contado',    1, 'Pago completo al momento de la matrícula'),
  ('2 cuotas',   2, 'Matrícula + 1 cuota'),
  ('3 cuotas',   3, 'Matrícula + 2 cuotas'),
  ('4 cuotas',   4, 'Matrícula + 3 cuotas');

-- Orígenes de lead
INSERT INTO origen_lead (nombre) VALUES
  ('Referido'),
  ('Redes sociales'),
  ('Publicidad impresa'),
  ('Radio'),
  ('Television'),
  ('Web / Google'),
  ('Feria educativa'),
  ('Volanteo'),
  ('Llamada saliente'),
  ('Otros');

-- Medios de pago
INSERT INTO medio_pago (nombre) VALUES
  ('Efectivo'),
  ('Yape'),
  ('Plin'),
  ('Transferencia bancaria'),
  ('Depósito en cuenta'),
  ('Tarjeta de débito'),
  ('Tarjeta de crédito'),
  ('Otros');

-- Tipos de comprobante
INSERT INTO tipo_comprobante (nombre) VALUES
  ('Boleta'),
  ('Factura'),
  ('Ninguno');
