-- ============================================================
-- MIGRACIÓN 003: Usuarios y asignación de filiales
-- ============================================================

-- Perfil de usuario (extiende auth.users de Supabase)
CREATE TABLE usuario_perfil (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  rol_id          uuid NOT NULL REFERENCES rol(id) ON DELETE RESTRICT,
  nombre_completo text NOT NULL,
  email           text NOT NULL,
  estado          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Filiales asignadas a cada usuario
CREATE TABLE usuario_filial (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  uuid NOT NULL REFERENCES usuario_perfil(id) ON DELETE CASCADE,
  filial_id   uuid NOT NULL REFERENCES filial(id) ON DELETE CASCADE,
  es_principal boolean NOT NULL DEFAULT false,
  UNIQUE (usuario_id, filial_id)
);

-- Índices
CREATE INDEX idx_usuario_perfil_rol    ON usuario_perfil(rol_id);
CREATE INDEX idx_usuario_filial_user   ON usuario_filial(usuario_id);
CREATE INDEX idx_usuario_filial_filial ON usuario_filial(filial_id);

-- Trigger updated_at
CREATE TRIGGER usuario_perfil_updated_at
  BEFORE UPDATE ON usuario_perfil
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE usuario_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_filial  ENABLE ROW LEVEL SECURITY;

-- Función helper: retorna el rol del usuario actual
CREATE OR REPLACE FUNCTION get_user_rol()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT r.nombre FROM usuario_perfil up
  JOIN rol r ON r.id = up.rol_id
  WHERE up.id = auth.uid()
$$;

-- Función helper: retorna las filiales del usuario actual
CREATE OR REPLACE FUNCTION get_user_filiales()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT filial_id FROM usuario_filial WHERE usuario_id = auth.uid()
$$;

-- Políticas de usuario_perfil
CREATE POLICY "usuario_perfil_select_self" ON usuario_perfil
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR get_user_rol() IN ('superadmin', 'administracion')
  );

CREATE POLICY "usuario_perfil_update_self" ON usuario_perfil
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Superadmin puede insertar/eliminar usuarios
CREATE POLICY "usuario_perfil_insert_superadmin" ON usuario_perfil
  FOR INSERT TO authenticated
  WITH CHECK (get_user_rol() = 'superadmin');

-- Políticas de usuario_filial
CREATE POLICY "usuario_filial_select" ON usuario_filial
  FOR SELECT TO authenticated
  USING (
    usuario_id = auth.uid()
    OR get_user_rol() IN ('superadmin', 'administracion')
  );

-- Actualizar políticas de empresa y filial para respetar roles
DROP POLICY IF EXISTS "empresa_select_all" ON empresa;
DROP POLICY IF EXISTS "filial_select_all"  ON filial;

CREATE POLICY "empresa_select_authenticated" ON empresa
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "filial_select_by_role" ON filial
  FOR SELECT TO authenticated
  USING (
    get_user_rol() = 'superadmin'
    OR id = ANY(ARRAY(SELECT get_user_filiales()))
  );

-- Trigger: crear perfil automáticamente al registrar usuario en auth
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Solo inserta si el metadato 'rol_id' fue enviado
  IF NEW.raw_user_meta_data->>'rol_id' IS NOT NULL THEN
    INSERT INTO usuario_perfil (id, rol_id, nombre_completo, email)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'rol_id')::uuid,
      COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
      NEW.email
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();
