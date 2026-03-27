-- ============================================================
-- MIGRACIÓN 004: Personas y Expedientes
-- ============================================================

CREATE TABLE persona (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_documento   varchar(10) NOT NULL DEFAULT 'DNI',
  numero_documento varchar(20) NOT NULL,
  nombre           text NOT NULL,
  apellido_paterno text NOT NULL,
  apellido_materno text,
  fecha_nacimiento date,
  genero           varchar(1),  -- M / F
  telefono         text,
  email            text,
  direccion        text,
  distrito         text,
  provincia        text,
  departamento     text,
  -- Campos de lead/origen (para titulares)
  origen_lead_id   uuid,        -- FK se agrega en migración de catálogos
  referido_por     text,
  observaciones    text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tipo_documento, numero_documento)
);

-- Expediente académico del alumno (información adicional de la persona como alumno)
CREATE TABLE expediente_alumno (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id      uuid NOT NULL REFERENCES persona(id) ON DELETE CASCADE,
  -- Datos específicos del alumno
  nivel_educativo text,        -- inicial, primaria, secundaria, superior, adulto
  institucion     text,        -- colegio o universidad
  grado           text,
  turno           text,        -- mañana / tarde / noche
  -- Observaciones psicopedagógicas generales
  observaciones_psico text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (persona_id)
);

-- Índices
CREATE INDEX idx_persona_documento ON persona(tipo_documento, numero_documento);
CREATE INDEX idx_persona_nombre    ON persona(apellido_paterno, apellido_materno, nombre);

-- Trigger updated_at
CREATE TRIGGER persona_updated_at
  BEFORE UPDATE ON persona
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER expediente_alumno_updated_at
  BEFORE UPDATE ON expediente_alumno
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE persona            ENABLE ROW LEVEL SECURITY;
ALTER TABLE expediente_alumno  ENABLE ROW LEVEL SECURITY;

-- Personas son accesibles para usuarios autenticados
-- (se filtrará por filial a través de las matrículas en queries de negocio)
CREATE POLICY "persona_select_authenticated" ON persona
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "persona_insert_authenticated" ON persona
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "persona_update_authenticated" ON persona
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "expediente_select_authenticated" ON expediente_alumno
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "expediente_insert_authenticated" ON expediente_alumno
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "expediente_update_authenticated" ON expediente_alumno
  FOR UPDATE TO authenticated USING (true);
