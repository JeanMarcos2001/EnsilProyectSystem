-- ============================================================
-- SEED 05: Materiales por Programa
-- ============================================================
-- Basado en el ApÃ©ndice B del PLANIFICACION_SISTEMA_ENSIL.md

INSERT INTO material (nombre, tipo, unidad, estado) VALUES
  -- Pre-Kids
  ('Cuaderno de DiversiÃ³n N1',    'cuaderno',  'unidad', true),
  ('Cuaderno de DiversiÃ³n N2',    'cuaderno',  'unidad', true),
  ('Lecturas de ComprensiÃ³n N1',  'anillado',  'unidad', true),
  ('Lecturas de ComprensiÃ³n N2',  'anillado',  'unidad', true),
  ('Flashcards N1',               'flashcard', 'unidad', true),
  ('Flashcards N2',               'flashcard', 'unidad', true),
  -- Kids
  ('Anillado Kids 1',             'anillado',  'unidad', true),
  ('Anillado Kids 2',             'anillado',  'unidad', true),
  ('Anillado Kids 3',             'anillado',  'unidad', true),
  ('Paquete 8 libros Kids 1',     'libro',     'paquete', true),
  ('Paquete 8 libros Kids 2',     'libro',     'paquete', true),
  ('Paquete 8 libros Kids 3',     'libro',     'paquete', true),
  ('MaletÃ­n',                     'maletin',   'unidad', true),
  ('VelÃ³ptico Kids',              'veloptico', 'unidad', true),
  -- Pre-lectura
  ('Anillado Pre-lectura',        'anillado',  'unidad', true),
  -- EspecializaciÃ³n
  ('VelÃ³ptico 1',                 'veloptico', 'unidad', true),
  ('VelÃ³ptico 2',                 'veloptico', 'unidad', true),
  ('VelÃ³ptico 3',                 'veloptico', 'unidad', true),
  ('MÃ³dulos PRO 1ra etapa',       'modulo',    'unidad', true),
  ('MÃ³dulos PRO 2da etapa',       'modulo',    'unidad', true),
  ('MÃ³dulos PRO 3ra etapa',       'modulo',    'unidad', true),
  ('MÃ³dulos PRO 4ta etapa',       'modulo',    'unidad', true),
  ('Lectura Progresiva',          'libro',     'unidad', true),
  ('Gimnasia Ocular',             'libro',     'unidad', true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Recetas de materiales por nivel (programa_material)
-- ============================================================

-- Pre-Kids Nivel 1
INSERT INTO programa_material (nivel_id, material_id, cantidad)
SELECT
  n.id,
  m.id,
  1
FROM nivel n
JOIN programa p ON p.id = n.programa_id
CROSS JOIN material m
WHERE p.nombre = 'Pre-Kids'
  AND n.nombre = 'Nivel 1'
  AND m.nombre IN (
    'Cuaderno de DiversiÃ³n N1',
    'Lecturas de ComprensiÃ³n N1',
    'Flashcards N1'
  )
ON CONFLICT DO NOTHING;

-- Pre-Kids Nivel 2
INSERT INTO programa_material (nivel_id, material_id, cantidad)
SELECT n.id, m.id, 1
FROM nivel n
JOIN programa p ON p.id = n.programa_id
CROSS JOIN material m
WHERE p.nombre = 'Pre-Kids'
  AND n.nombre = 'Nivel 2'
  AND m.nombre IN (
    'Cuaderno de DiversiÃ³n N2',
    'Lecturas de ComprensiÃ³n N2',
    'Flashcards N2'
  )
ON CONFLICT DO NOTHING;

-- Kids Nivel 1
INSERT INTO programa_material (nivel_id, material_id, cantidad)
SELECT n.id, m.id, 1
FROM nivel n
JOIN programa p ON p.id = n.programa_id
CROSS JOIN material m
WHERE p.nombre = 'Kids'
  AND n.nombre = 'Nivel 1'
  AND m.nombre IN (
    'Anillado Kids 1',
    'Paquete 8 libros Kids 1',
    'MaletÃ­n'
  )
ON CONFLICT DO NOTHING;

-- Kids Nivel 2
INSERT INTO programa_material (nivel_id, material_id, cantidad)
SELECT n.id, m.id, 1
FROM nivel n
JOIN programa p ON p.id = n.programa_id
CROSS JOIN material m
WHERE p.nombre = 'Kids'
  AND n.nombre = 'Nivel 2'
  AND m.nombre IN (
    'Anillado Kids 2',
    'Paquete 8 libros Kids 2',
    'MaletÃ­n',
    'VelÃ³ptico Kids'
  )
ON CONFLICT DO NOTHING;

-- Kids Nivel 3
INSERT INTO programa_material (nivel_id, material_id, cantidad)
SELECT n.id, m.id, 1
FROM nivel n
JOIN programa p ON p.id = n.programa_id
CROSS JOIN material m
WHERE p.nombre = 'Kids'
  AND n.nombre = 'Nivel 3'
  AND m.nombre IN (
    'Anillado Kids 3',
    'Paquete 8 libros Kids 3',
    'MaletÃ­n',
    'VelÃ³ptico Kids'
  )
ON CONFLICT DO NOTHING;

-- Pre-lectura (nivel Ãºnico)
INSERT INTO programa_material (nivel_id, material_id, cantidad)
SELECT n.id, m.id, 1
FROM nivel n
JOIN programa p ON p.id = n.programa_id
CROSS JOIN material m
WHERE p.nombre = 'Pre-lectura'
  AND m.nombre = 'Anillado Pre-lectura'
ON CONFLICT DO NOTHING;

-- EspecializaciÃ³n (paquete completo â€” 10 materiales)
INSERT INTO programa_material (nivel_id, material_id, cantidad)
SELECT n.id, m.id, 1
FROM nivel n
JOIN programa p ON p.id = n.programa_id
CROSS JOIN material m
WHERE p.nombre = 'EspecializaciÃ³n'
  AND m.nombre IN (
    'VelÃ³ptico 1',
    'VelÃ³ptico 2',
    'VelÃ³ptico 3',
    'MÃ³dulos PRO 1ra etapa',
    'MÃ³dulos PRO 2da etapa',
    'MÃ³dulos PRO 3ra etapa',
    'MÃ³dulos PRO 4ta etapa',
    'Lectura Progresiva',
    'Gimnasia Ocular',
    'MaletÃ­n'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED 06: Tipos de Pago
-- ============================================================
-- Basado en el ApÃ©ndice A del PLANIFICACION_SISTEMA_ENSIL.md

INSERT INTO tipo_pago (nombre, num_cuotas, descripcion, estado) VALUES
  ('Contado',          1, 'Pago Ãºnico al momento de la matrÃ­cula',                              true),
  ('Contado 2 partes', 2, 'Pago dividido en 2 partes con montos y fechas a definir',             true),
  ('Plan 2',           2, 'Cuota de matrÃ­cula + 1 cuota. Para Kids, Pre-Kids y Pre-lectura',     true),
  ('Plan 3',           3, 'Cuota de matrÃ­cula + 3 cuotas. Solo para EspecializaciÃ³n',            true),
  ('Plan 6',           6, 'Cuota de matrÃ­cula + 6 cuotas. Solo para EspecializaciÃ³n',            true),
  ('Plan 9',           9, 'Cuota de matrÃ­cula + 9 cuotas. Solo para EspecializaciÃ³n',            true)
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- SEED 07: CatÃ¡logos Operativos
-- ============================================================
-- Medios de pago, tipos de comprobante, orÃ­genes de lead

-- Medios de pago
INSERT INTO medio_pago (nombre, estado) VALUES
  ('Efectivo',          true),
  ('Yape',              true),
  ('Plin',              true),
  ('Transferencia',     true),
  ('DepÃ³sito bancario', true),
  ('Tarjeta dÃ©bito',    true),
  ('Tarjeta crÃ©dito',   true),
  ('Cheque',            true),
  ('Lukita',            true),
  ('Western Union',     true)
ON CONFLICT (nombre) DO NOTHING;

-- Tipos de comprobante
INSERT INTO tipo_comprobante (nombre, estado) VALUES
  ('Boleta',   true),
  ('Factura',  true),
  ('Recibo',   true)
ON CONFLICT (nombre) DO NOTHING;

-- OrÃ­genes de lead (canales de captaciÃ³n de alumnos)
INSERT INTO origen_lead (nombre, estado) VALUES
  ('Facebook Ads',           true),
  ('Instagram Ads',          true),
  ('Google Ads',             true),
  ('TikTok',                 true),
  ('WhatsApp',               true),
  ('Referido',               true),
  ('Base de datos propia',   true),
  ('ActivaciÃ³n en calle',    true),
  ('Feria o evento',         true),
  ('Volanteo',               true),
  ('RecomendaciÃ³n familiar', true),
  ('Web / Landing',          true),
  ('Llamada entrante',       true),
  ('Otro',                   true)
ON CONFLICT (nombre) DO NOTHING;
