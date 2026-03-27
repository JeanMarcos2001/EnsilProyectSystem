-- ============================================================
-- MIGRACIÓN 005: Programas, Catálogos y Configuración
-- ============================================================

-- Programas formativos
CREATE TABLE programa (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text NOT NULL,
  alias       text,
  descripcion text,
  estado      boolean NOT NULL DEFAULT true
);

-- Niveles por programa
CREATE TABLE nivel (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programa_id     uuid NOT NULL REFERENCES programa(id) ON DELETE RESTRICT,
  nombre          text NOT NULL,
  duracion_meses  int NOT NULL DEFAULT 3,
  garantia_meses  int NOT NULL DEFAULT 3,
  orden           int NOT NULL DEFAULT 0
);

-- Materiales del sistema
CREATE TABLE material (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre  text NOT NULL,
  tipo    text NOT NULL, -- libro, anillado, maletin, veloptico, flashcard, modulo
  unidad  text NOT NULL DEFAULT 'unidad',
  estado  boolean NOT NULL DEFAULT true
);

-- Receta de materiales por nivel (qué materiales incluye cada nivel)
CREATE TABLE programa_material (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nivel_id    uuid NOT NULL REFERENCES nivel(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES material(id) ON DELETE RESTRICT,
  cantidad    int NOT NULL DEFAULT 1,
  UNIQUE (nivel_id, material_id)
);

-- Orígenes de lead
CREATE TABLE origen_lead (
  id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text UNIQUE NOT NULL,
  estado boolean NOT NULL DEFAULT true
);

-- FK diferida de persona.origen_lead_id
ALTER TABLE persona
  ADD CONSTRAINT fk_persona_origen_lead
  FOREIGN KEY (origen_lead_id) REFERENCES origen_lead(id) ON DELETE SET NULL;

-- Tipos de pago (contado, 2 cuotas, 3 cuotas, etc.)
CREATE TABLE tipo_pago (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          text UNIQUE NOT NULL,
  num_cuotas      int NOT NULL DEFAULT 1,     -- 1 = contado
  descripcion     text,
  estado          boolean NOT NULL DEFAULT true
);

-- Tarifarios: precio base por nivel + tipo_pago + filial (vigencia)
CREATE TABLE tarifario (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filial_id       uuid NOT NULL REFERENCES filial(id) ON DELETE RESTRICT,
  nivel_id        uuid NOT NULL REFERENCES nivel(id) ON DELETE RESTRICT,
  tipo_pago_id    uuid NOT NULL REFERENCES tipo_pago(id) ON DELETE RESTRICT,
  precio          numeric(10,2) NOT NULL,
  vigencia_desde  date NOT NULL,
  vigencia_hasta  date,          -- NULL = vigente indefinidamente
  estado          boolean NOT NULL DEFAULT true,
  UNIQUE (filial_id, nivel_id, tipo_pago_id, vigencia_desde)
);

-- Promociones
CREATE TABLE promocion (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          text NOT NULL,
  tipo            text NOT NULL,  -- descuento_porcentaje, descuento_monto, 2x1, hermanos
  valor           numeric(10,2),  -- % o monto fijo según tipo
  vigencia_desde  date NOT NULL,
  vigencia_hasta  date,
  estado          boolean NOT NULL DEFAULT true
);

-- Filiales donde aplica la promoción
CREATE TABLE promocion_filial (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promocion_id uuid NOT NULL REFERENCES promocion(id) ON DELETE CASCADE,
  filial_id    uuid NOT NULL REFERENCES filial(id) ON DELETE CASCADE,
  UNIQUE (promocion_id, filial_id)
);

-- Niveles/programas a los que aplica la promoción
CREATE TABLE promocion_programa (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promocion_id uuid NOT NULL REFERENCES promocion(id) ON DELETE CASCADE,
  programa_id  uuid NOT NULL REFERENCES programa(id) ON DELETE CASCADE,
  UNIQUE (promocion_id, programa_id)
);

-- Medios de pago (catálogo simple)
CREATE TABLE medio_pago (
  id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text UNIQUE NOT NULL,  -- efectivo, yape, plin, transferencia, etc.
  estado boolean NOT NULL DEFAULT true
);

-- Tipos de comprobante (catálogo simple)
CREATE TABLE tipo_comprobante (
  id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text UNIQUE NOT NULL,  -- boleta, factura
  estado boolean NOT NULL DEFAULT true
);

-- Metas por programa (para reportes de psicopedagogía)
CREATE TABLE meta_programa (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programa_id uuid NOT NULL REFERENCES programa(id) ON DELETE CASCADE,
  nivel_id    uuid REFERENCES nivel(id) ON DELETE CASCADE,
  indicador   text NOT NULL,   -- velocidad_ppm, comprension_pct, etc.
  valor_meta  numeric(10,2) NOT NULL,
  descripcion text
);

-- Índices
CREATE INDEX idx_nivel_programa      ON nivel(programa_id);
CREATE INDEX idx_programa_material_n ON programa_material(nivel_id);
CREATE INDEX idx_tarifario_filial    ON tarifario(filial_id);
CREATE INDEX idx_tarifario_vigencia  ON tarifario(vigencia_desde, vigencia_hasta);

-- RLS: catálogos son de lectura global para autenticados
ALTER TABLE programa         ENABLE ROW LEVEL SECURITY;
ALTER TABLE nivel            ENABLE ROW LEVEL SECURITY;
ALTER TABLE material         ENABLE ROW LEVEL SECURITY;
ALTER TABLE programa_material ENABLE ROW LEVEL SECURITY;
ALTER TABLE origen_lead      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipo_pago        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarifario        ENABLE ROW LEVEL SECURITY;
ALTER TABLE promocion        ENABLE ROW LEVEL SECURITY;
ALTER TABLE promocion_filial  ENABLE ROW LEVEL SECURITY;
ALTER TABLE promocion_programa ENABLE ROW LEVEL SECURITY;
ALTER TABLE medio_pago       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipo_comprobante ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_programa    ENABLE ROW LEVEL SECURITY;

-- Políticas de solo lectura para autenticados
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'programa','nivel','material','programa_material','origen_lead',
    'tipo_pago','medio_pago','tipo_comprobante','meta_programa'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY "%s_select_authenticated" ON %I FOR SELECT TO authenticated USING (true)',
      t, t
    );
  END LOOP;
END;
$$;

-- Tarifario: filtrado por filial
CREATE POLICY "tarifario_select_by_filial" ON tarifario
  FOR SELECT TO authenticated
  USING (
    get_user_rol() = 'superadmin'
    OR filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

-- Promociones: filtradas por filial
CREATE POLICY "promocion_select_authenticated" ON promocion
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "promocion_filial_select_by_filial" ON promocion_filial
  FOR SELECT TO authenticated
  USING (
    get_user_rol() = 'superadmin'
    OR filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

CREATE POLICY "promocion_programa_select_authenticated" ON promocion_programa
  FOR SELECT TO authenticated USING (true);
