-- ============================================================
-- MIGRACIÓN 006: Matrículas, Plan Snapshot y Cuotas
-- ============================================================

-- Grupo promocional (para 2x1, hermanos, etc.)
-- Se crea antes de matricula porque matricula lo referencia
CREATE TABLE promocion_grupo (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promocion_id uuid NOT NULL REFERENCES promocion(id) ON DELETE RESTRICT,
  monto_total  numeric(10,2) NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Matrículas
CREATE TABLE matricula (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correlativo        varchar(10) UNIQUE NOT NULL,
  -- Personas involucradas
  titular_id         uuid NOT NULL REFERENCES persona(id) ON DELETE RESTRICT,
  titular_secundario_id uuid REFERENCES persona(id) ON DELETE RESTRICT,
  alumno_id          uuid NOT NULL REFERENCES persona(id) ON DELETE RESTRICT,
  -- Programa y sede
  programa_id        uuid NOT NULL REFERENCES programa(id) ON DELETE RESTRICT,
  nivel_id           uuid NOT NULL REFERENCES nivel(id) ON DELETE RESTRICT,
  filial_id          uuid NOT NULL REFERENCES filial(id) ON DELETE RESTRICT,
  -- Ejecutivo de ventas
  ejecutivo_id       uuid REFERENCES usuario_perfil(id) ON DELETE SET NULL,
  -- Lead
  origen_lead_id     uuid REFERENCES origen_lead(id) ON DELETE SET NULL,
  -- Fechas
  fecha_matricula    date NOT NULL DEFAULT CURRENT_DATE,
  fecha_registro     timestamptz NOT NULL DEFAULT now(),
  -- Estado operativo
  estado             text NOT NULL DEFAULT 'borrador',
  -- Promoción grupal (si aplica)
  promocion_grupo_id uuid REFERENCES promocion_grupo(id) ON DELETE SET NULL,
  -- Observaciones
  observaciones      text,
  -- Auditoría
  created_by         uuid REFERENCES usuario_perfil(id) ON DELETE SET NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  -- Validación de estado
  CONSTRAINT matricula_estado_check CHECK (
    estado IN (
      'borrador', 'activa', 'pendiente_verificacion',
      'verificada_incompleta', 'verificada_completa',
      'suspendida', 'cancelada', 'caida', 'trasladada', 'finalizada'
    )
  )
);

-- Secuencia para el correlativo global
CREATE SEQUENCE matricula_correlativo_seq START 1;

-- Función para generar correlativo
CREATE OR REPLACE FUNCTION generar_correlativo_matricula()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.correlativo IS NULL OR NEW.correlativo = '' THEN
    NEW.correlativo := LPAD(nextval('matricula_correlativo_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER matricula_set_correlativo
  BEFORE INSERT ON matricula
  FOR EACH ROW EXECUTE FUNCTION generar_correlativo_matricula();

-- Plan Snapshot (inmutable — NO tiene trigger de updated_at)
-- Congela los valores financieros al momento de confirmar la matrícula
CREATE TABLE plan_snapshot (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula_id        uuid NOT NULL UNIQUE REFERENCES matricula(id) ON DELETE RESTRICT,
  tipo_pago_id        uuid NOT NULL REFERENCES tipo_pago(id) ON DELETE RESTRICT,
  moneda              varchar(3) NOT NULL DEFAULT 'USD',
  costo_matricula     numeric(10,2) NOT NULL DEFAULT 0,
  costo_total         numeric(10,2) NOT NULL,
  costo_cuota         numeric(10,2) NOT NULL DEFAULT 0,
  cantidad_cuotas     int NOT NULL DEFAULT 1,
  version             int NOT NULL DEFAULT 1,
  tarifario_id_origen uuid REFERENCES tarifario(id) ON DELETE SET NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT plan_snapshot_moneda_check CHECK (moneda IN ('USD', 'PEN')),
  CONSTRAINT plan_snapshot_version_check CHECK (version >= 1)
);

-- Cuotas generadas por el plan
CREATE TABLE cuota (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_snapshot_id uuid NOT NULL REFERENCES plan_snapshot(id) ON DELETE RESTRICT,
  matricula_id     uuid NOT NULL REFERENCES matricula(id) ON DELETE RESTRICT,
  numero           int NOT NULL,   -- 0 = cuota de matrícula, 1..N = cuotas del plan
  nombre           text NOT NULL,  -- "Matrícula", "Cuota 1", etc.
  monto            numeric(10,2) NOT NULL,
  fecha_vencimiento date NOT NULL,
  estado           text NOT NULL DEFAULT 'pendiente',
  version_plan     int NOT NULL DEFAULT 1,
  cuota_origen_id  uuid REFERENCES cuota(id) ON DELETE SET NULL, -- para refinanciación
  created_by       uuid REFERENCES usuario_perfil(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cuota_estado_check CHECK (
    estado IN (
      'pendiente', 'parcial', 'pagada', 'vencida',
      'refinanciada', 'anulada_refinanciacion', 'cancelada_caida',
      'suspendida'
    )
  ),
  UNIQUE (plan_snapshot_id, numero, version_plan)
);

-- Índices
CREATE INDEX idx_matricula_alumno    ON matricula(alumno_id);
CREATE INDEX idx_matricula_titular   ON matricula(titular_id);
CREATE INDEX idx_matricula_filial    ON matricula(filial_id);
CREATE INDEX idx_matricula_estado    ON matricula(estado);
CREATE INDEX idx_matricula_fecha     ON matricula(fecha_matricula);
CREATE INDEX idx_plan_snapshot_mat   ON plan_snapshot(matricula_id);
CREATE INDEX idx_cuota_matricula     ON cuota(matricula_id);
CREATE INDEX idx_cuota_plan          ON cuota(plan_snapshot_id);
CREATE INDEX idx_cuota_estado        ON cuota(estado);
CREATE INDEX idx_cuota_vencimiento   ON cuota(fecha_vencimiento);

-- Triggers updated_at
CREATE TRIGGER matricula_updated_at
  BEFORE UPDATE ON matricula
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER cuota_updated_at
  BEFORE UPDATE ON cuota
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE matricula       ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_snapshot   ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuota           ENABLE ROW LEVEL SECURITY;
ALTER TABLE promocion_grupo ENABLE ROW LEVEL SECURITY;

-- Matrículas: superadmin ve todo, el resto solo su filial
CREATE POLICY "matricula_select_by_filial" ON matricula
  FOR SELECT TO authenticated
  USING (
    get_user_rol() = 'superadmin'
    OR filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

CREATE POLICY "matricula_insert_by_filial" ON matricula
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_rol() IN ('superadmin', 'administracion', 'filial')
    AND filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

CREATE POLICY "matricula_update_by_filial" ON matricula
  FOR UPDATE TO authenticated
  USING (
    get_user_rol() IN ('superadmin', 'administracion', 'filial')
    AND filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

-- Plan Snapshot: sigue a la matrícula
CREATE POLICY "plan_snapshot_select" ON plan_snapshot
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matricula m
      WHERE m.id = plan_snapshot.matricula_id
        AND (
          get_user_rol() = 'superadmin'
          OR m.filial_id = ANY(ARRAY(SELECT get_user_filiales()))
        )
    )
  );

CREATE POLICY "plan_snapshot_insert" ON plan_snapshot
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_rol() IN ('superadmin', 'administracion', 'filial')
  );

-- Cuotas: siguen a la matrícula
CREATE POLICY "cuota_select_by_filial" ON cuota
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matricula m
      WHERE m.id = cuota.matricula_id
        AND (
          get_user_rol() = 'superadmin'
          OR m.filial_id = ANY(ARRAY(SELECT get_user_filiales()))
        )
    )
  );

CREATE POLICY "cuota_insert" ON cuota
  FOR INSERT TO authenticated
  WITH CHECK (get_user_rol() IN ('superadmin', 'administracion', 'filial'));

CREATE POLICY "cuota_update" ON cuota
  FOR UPDATE TO authenticated
  USING (get_user_rol() IN ('superadmin', 'administracion', 'filial'));

-- Promocion grupo: lectura para autenticados
CREATE POLICY "promocion_grupo_select" ON promocion_grupo
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "promocion_grupo_insert" ON promocion_grupo
  FOR INSERT TO authenticated
  WITH CHECK (get_user_rol() IN ('superadmin', 'administracion', 'filial'));
