-- ============================================================
-- SEED 05: Materiales por Programa
-- ============================================================
-- Basado en el Apéndice B del PLANIFICACION_SISTEMA_ENSIL.md

INSERT INTO material (nombre, tipo, unidad, estado) VALUES
  -- Pre-Kids
  ('Cuaderno de Diversión N1',    'cuaderno',  'unidad', true),
  ('Cuaderno de Diversión N2',    'cuaderno',  'unidad', true),
  ('Lecturas de Comprensión N1',  'anillado',  'unidad', true),
  ('Lecturas de Comprensión N2',  'anillado',  'unidad', true),
  ('Flashcards N1',               'flashcard', 'unidad', true),
  ('Flashcards N2',               'flashcard', 'unidad', true),
  -- Kids
  ('Anillado Kids 1',             'anillado',  'unidad', true),
  ('Anillado Kids 2',             'anillado',  'unidad', true),
  ('Anillado Kids 3',             'anillado',  'unidad', true),
  ('Paquete 8 libros Kids 1',     'libro',     'paquete', true),
  ('Paquete 8 libros Kids 2',     'libro',     'paquete', true),
  ('Paquete 8 libros Kids 3',     'libro',     'paquete', true),
  ('Maletín',                     'maletin',   'unidad', true),
  ('Velóptico Kids',              'veloptico', 'unidad', true),
  -- Pre-lectura
  ('Anillado Pre-lectura',        'anillado',  'unidad', true),
  -- Especialización
  ('Velóptico 1',                 'veloptico', 'unidad', true),
  ('Velóptico 2',                 'veloptico', 'unidad', true),
  ('Velóptico 3',                 'veloptico', 'unidad', true),
  ('Módulos PRO 1ra etapa',       'modulo',    'unidad', true),
  ('Módulos PRO 2da etapa',       'modulo',    'unidad', true),
  ('Módulos PRO 3ra etapa',       'modulo',    'unidad', true),
  ('Módulos PRO 4ta etapa',       'modulo',    'unidad', true),
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
    'Cuaderno de Diversión N1',
    'Lecturas de Comprensión N1',
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
    'Cuaderno de Diversión N2',
    'Lecturas de Comprensión N2',
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
    'Maletín'
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
    'Maletín',
    'Velóptico Kids'
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
    'Maletín',
    'Velóptico Kids'
  )
ON CONFLICT DO NOTHING;

-- Pre-lectura (nivel único)
INSERT INTO programa_material (nivel_id, material_id, cantidad)
SELECT n.id, m.id, 1
FROM nivel n
JOIN programa p ON p.id = n.programa_id
CROSS JOIN material m
WHERE p.nombre = 'Pre-lectura'
  AND m.nombre = 'Anillado Pre-lectura'
ON CONFLICT DO NOTHING;

-- Especialización (paquete completo — 10 materiales)
INSERT INTO programa_material (nivel_id, material_id, cantidad)
SELECT n.id, m.id, 1
FROM nivel n
JOIN programa p ON p.id = n.programa_id
CROSS JOIN material m
WHERE p.nombre = 'Especialización'
  AND m.nombre IN (
    'Velóptico 1',
    'Velóptico 2',
    'Velóptico 3',
    'Módulos PRO 1ra etapa',
    'Módulos PRO 2da etapa',
    'Módulos PRO 3ra etapa',
    'Módulos PRO 4ta etapa',
    'Lectura Progresiva',
    'Gimnasia Ocular',
    'Maletín'
  )
ON CONFLICT DO NOTHING;
