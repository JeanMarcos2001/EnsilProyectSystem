-- ============================================================
-- MIGRACIÓN 002: Roles y Permisos
-- ============================================================

CREATE TABLE rol (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text UNIQUE NOT NULL,
  descripcion text
);

CREATE TABLE permiso (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      text UNIQUE NOT NULL,
  modulo      text NOT NULL,
  descripcion text
);

CREATE TABLE rol_permiso (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rol_id     uuid NOT NULL REFERENCES rol(id) ON DELETE CASCADE,
  permiso_id uuid NOT NULL REFERENCES permiso(id) ON DELETE CASCADE,
  UNIQUE (rol_id, permiso_id)
);

-- Índices
CREATE INDEX idx_rol_permiso_rol     ON rol_permiso(rol_id);
CREATE INDEX idx_rol_permiso_permiso ON rol_permiso(permiso_id);

-- RLS
ALTER TABLE rol        ENABLE ROW LEVEL SECURITY;
ALTER TABLE permiso    ENABLE ROW LEVEL SECURITY;
ALTER TABLE rol_permiso ENABLE ROW LEVEL SECURITY;

-- Lectura libre para todos los usuarios autenticados (los roles son catálogo)
CREATE POLICY "rol_select_authenticated" ON rol
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "permiso_select_authenticated" ON permiso
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "rol_permiso_select_authenticated" ON rol_permiso
  FOR SELECT TO authenticated USING (true);
