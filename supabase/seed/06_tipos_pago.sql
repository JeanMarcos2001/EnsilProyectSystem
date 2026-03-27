-- ============================================================
-- SEED 06: Tipos de Pago
-- ============================================================
-- Basado en el Apéndice A del PLANIFICACION_SISTEMA_ENSIL.md

INSERT INTO tipo_pago (nombre, num_cuotas, descripcion, estado) VALUES
  ('Contado',          1, 'Pago único al momento de la matrícula',                              true),
  ('Contado 2 partes', 2, 'Pago dividido en 2 partes con montos y fechas a definir',             true),
  ('Plan 2',           2, 'Cuota de matrícula + 1 cuota. Para Kids, Pre-Kids y Pre-lectura',     true),
  ('Plan 3',           3, 'Cuota de matrícula + 3 cuotas. Solo para Especialización',            true),
  ('Plan 6',           6, 'Cuota de matrícula + 6 cuotas. Solo para Especialización',            true),
  ('Plan 9',           9, 'Cuota de matrícula + 9 cuotas. Solo para Especialización',            true)
ON CONFLICT (nombre) DO NOTHING;
