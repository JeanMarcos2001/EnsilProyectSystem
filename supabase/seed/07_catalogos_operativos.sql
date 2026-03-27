-- ============================================================
-- SEED 07: Catálogos Operativos
-- ============================================================
-- Medios de pago, tipos de comprobante, orígenes de lead

-- Medios de pago
INSERT INTO medio_pago (nombre, estado) VALUES
  ('Efectivo',          true),
  ('Yape',              true),
  ('Plin',              true),
  ('Transferencia',     true),
  ('Depósito bancario', true),
  ('Tarjeta débito',    true),
  ('Tarjeta crédito',   true),
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

-- Orígenes de lead (canales de captación de alumnos)
INSERT INTO origen_lead (nombre, estado) VALUES
  ('Facebook Ads',           true),
  ('Instagram Ads',          true),
  ('Google Ads',             true),
  ('TikTok',                 true),
  ('WhatsApp',               true),
  ('Referido',               true),
  ('Base de datos propia',   true),
  ('Activación en calle',    true),
  ('Feria o evento',         true),
  ('Volanteo',               true),
  ('Recomendación familiar', true),
  ('Web / Landing',          true),
  ('Llamada entrante',       true),
  ('Otro',                   true)
ON CONFLICT (nombre) DO NOTHING;
