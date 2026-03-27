-- ============================================================
-- MIGRACIÓN 010: Módulo de Personal
-- ============================================================

-- Empleado (referencia a persona del sistema)
CREATE TABLE empleado (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id              uuid NOT NULL UNIQUE REFERENCES persona(id) ON DELETE RESTRICT,
  codigo_interno          varchar(10) UNIQUE,
  fecha_ingreso_empresa   date NOT NULL,
  estado_laboral          text NOT NULL DEFAULT 'activo',
  observaciones           text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT empleado_estado_check CHECK (
    estado_laboral IN ('activo', 'inactivo', 'cesado')
  )
);

-- Asignación de empleado a filial + cargo + rol de sistema
CREATE TABLE empleado_asignacion (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empleado_id    uuid NOT NULL REFERENCES empleado(id) ON DELETE CASCADE,
  filial_id      uuid NOT NULL REFERENCES filial(id) ON DELETE RESTRICT,
  cargo          text NOT NULL,                -- nombre del puesto
  area           text,                         -- área funcional
  rol_sistema_id uuid REFERENCES rol(id) ON DELETE RESTRICT,
  fecha_inicio   date NOT NULL,
  fecha_fin      date,
  es_principal   boolean NOT NULL DEFAULT true,
  estado         boolean NOT NULL DEFAULT true,
  UNIQUE (empleado_id, filial_id, fecha_inicio)
);

-- Contrato laboral del empleado
CREATE TABLE empleado_contrato (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empleado_id         uuid NOT NULL REFERENCES empleado(id) ON DELETE CASCADE,
  tipo_contrato       text NOT NULL,           -- plazo_fijo, indefinido, locacion, practicas
  fecha_inicio        date NOT NULL,
  fecha_cese          date,
  full_time           boolean NOT NULL DEFAULT true,
  sistema_pension     text,                    -- AFP, ONP, RH (régimen HealthCare)
  fondo               text,                    -- fondo AFP seleccionado
  remuneracion_bruta  numeric(10,2),
  aporte              numeric(10,2),           -- aporte al sistema de pensiones
  remuneracion_neta   numeric(10,2),
  vacaciones_inicio   date,
  vacaciones_retorno  date,
  estado              text NOT NULL DEFAULT 'vigente',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contrato_estado_check CHECK (
    estado IN ('vigente', 'cerrado', 'renovado')
  ),
  CONSTRAINT contrato_pension_check CHECK (
    sistema_pension IN ('AFP', 'ONP', 'RH') OR sistema_pension IS NULL
  )
);

-- Triggers updated_at
CREATE TRIGGER empleado_updated_at
  BEFORE UPDATE ON empleado
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER empleado_contrato_updated_at
  BEFORE UPDATE ON empleado_contrato
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Índices
CREATE INDEX idx_empleado_persona      ON empleado(persona_id);
CREATE INDEX idx_empleado_estado       ON empleado(estado_laboral);
CREATE INDEX idx_asig_empleado         ON empleado_asignacion(empleado_id);
CREATE INDEX idx_asig_filial           ON empleado_asignacion(filial_id);
CREATE INDEX idx_asig_activa           ON empleado_asignacion(estado);
CREATE INDEX idx_contrato_empleado     ON empleado_contrato(empleado_id);
CREATE INDEX idx_contrato_estado       ON empleado_contrato(estado);

-- RLS
ALTER TABLE empleado             ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleado_asignacion  ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleado_contrato    ENABLE ROW LEVEL SECURITY;

-- Empleado: superadmin y administración ven todo
CREATE POLICY "empleado_select" ON empleado
  FOR SELECT TO authenticated
  USING (
    get_user_rol() IN ('superadmin', 'administracion')
  );

CREATE POLICY "empleado_insert" ON empleado
  FOR INSERT TO authenticated
  WITH CHECK (get_user_rol() IN ('superadmin', 'administracion'));

CREATE POLICY "empleado_update" ON empleado
  FOR UPDATE TO authenticated
  USING (get_user_rol() IN ('superadmin', 'administracion'));

-- Asignación: superadmin ve todo, administración ve su filial
CREATE POLICY "asig_select_by_filial" ON empleado_asignacion
  FOR SELECT TO authenticated
  USING (
    get_user_rol() = 'superadmin'
    OR (
      get_user_rol() = 'administracion'
      AND filial_id = ANY(ARRAY(SELECT get_user_filiales()))
    )
  );

CREATE POLICY "asig_insert" ON empleado_asignacion
  FOR INSERT TO authenticated
  WITH CHECK (get_user_rol() IN ('superadmin', 'administracion'));

CREATE POLICY "asig_update" ON empleado_asignacion
  FOR UPDATE TO authenticated
  USING (get_user_rol() IN ('superadmin', 'administracion'));

-- Contratos: solo superadmin y administración
CREATE POLICY "contrato_select" ON empleado_contrato
  FOR SELECT TO authenticated
  USING (get_user_rol() IN ('superadmin', 'administracion'));

CREATE POLICY "contrato_insert" ON empleado_contrato
  FOR INSERT TO authenticated
  WITH CHECK (get_user_rol() IN ('superadmin', 'administracion'));

CREATE POLICY "contrato_update" ON empleado_contrato
  FOR UPDATE TO authenticated
  USING (get_user_rol() IN ('superadmin', 'administracion'));
