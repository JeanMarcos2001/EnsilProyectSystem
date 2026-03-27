-- ============================================================
-- MIGRACIÓN 001: Empresas y Filiales
-- ============================================================

CREATE TABLE empresa (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razon_social text NOT NULL,
  ruc          varchar(11) UNIQUE,
  estado       boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE filial (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  uuid NOT NULL REFERENCES empresa(id) ON DELETE RESTRICT,
  nombre      text NOT NULL,
  ciudad      text,
  direccion   text,
  telefono    text,
  estado      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_filial_empresa ON filial(empresa_id);
CREATE INDEX idx_filial_estado   ON filial(estado);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER empresa_updated_at
  BEFORE UPDATE ON empresa
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER filial_updated_at
  BEFORE UPDATE ON filial
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE filial   ENABLE ROW LEVEL SECURITY;

-- Política: superadmin ve todo, el resto solo sus filiales asignadas
-- (se refinan en migración 003 cuando existan usuarios)
CREATE POLICY "empresa_select_all" ON empresa
  FOR SELECT USING (true); -- temporal, se restringe con roles

CREATE POLICY "filial_select_all" ON filial
  FOR SELECT USING (true); -- temporal, se restringe con roles
