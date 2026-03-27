-- ============================================================
-- MIGRACIÓN 008: Verificación de Matrículas y Control de Stock
-- ============================================================

-- Verificación de entrega de materiales por matrícula
CREATE TABLE verificacion (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula_id       uuid NOT NULL REFERENCES matricula(id) ON DELETE RESTRICT,
  verificador_id     uuid REFERENCES usuario_perfil(id) ON DELETE SET NULL,
  fecha_verificacion date NOT NULL DEFAULT CURRENT_DATE,
  estado             text NOT NULL DEFAULT 'pendiente',
  observaciones      text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT verificacion_estado_check CHECK (
    estado IN ('pendiente', 'incompleta', 'completa')
  )
);

-- Detalle de materiales verificados
CREATE TABLE verificacion_material (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verificacion_id    uuid NOT NULL REFERENCES verificacion(id) ON DELETE CASCADE,
  material_id        uuid NOT NULL REFERENCES material(id) ON DELETE RESTRICT,
  cantidad_requerida int NOT NULL DEFAULT 1,
  cantidad_entregada int NOT NULL DEFAULT 0,
  entregado          boolean NOT NULL DEFAULT false,
  UNIQUE (verificacion_id, material_id)
);

-- Stock actual por sede y material
CREATE TABLE stock_sede (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filial_id        uuid NOT NULL REFERENCES filial(id) ON DELETE RESTRICT,
  material_id      uuid NOT NULL REFERENCES material(id) ON DELETE RESTRICT,
  cantidad_actual  int NOT NULL DEFAULT 0,
  stock_minimo     int NOT NULL DEFAULT 0,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (filial_id, material_id),
  CONSTRAINT stock_cantidad_check CHECK (cantidad_actual >= 0)
);

-- Movimientos de stock (kardex)
CREATE TABLE movimiento_stock (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filial_id      uuid NOT NULL REFERENCES filial(id) ON DELETE RESTRICT,
  material_id    uuid NOT NULL REFERENCES material(id) ON DELETE RESTRICT,
  tipo           text NOT NULL,
  cantidad       int NOT NULL,
  referencia_id  uuid,             -- ID de verificacion, transferencia, etc.
  motivo         text,
  created_by     uuid REFERENCES usuario_perfil(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mov_stock_tipo_check CHECK (
    tipo IN (
      'ingreso_compra', 'ingreso_transferencia',
      'salida_entrega', 'salida_merma',
      'ajuste_positivo', 'ajuste_negativo', 'traslado'
    )
  ),
  CONSTRAINT mov_stock_cantidad_check CHECK (cantidad > 0)
);

-- Solicitudes de transferencia de stock entre sedes
CREATE TABLE transferencia_stock (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filial_origen_id   uuid NOT NULL REFERENCES filial(id) ON DELETE RESTRICT,
  filial_destino_id  uuid NOT NULL REFERENCES filial(id) ON DELETE RESTRICT,
  estado             text NOT NULL DEFAULT 'solicitada',
  solicitante_id     uuid REFERENCES usuario_perfil(id) ON DELETE SET NULL,
  aprobador_id       uuid REFERENCES usuario_perfil(id) ON DELETE SET NULL,
  fecha_solicitud    timestamptz NOT NULL DEFAULT now(),
  fecha_despacho     timestamptz,
  fecha_recepcion    timestamptz,
  observaciones      text,
  CONSTRAINT trans_estado_check CHECK (
    estado IN ('solicitada', 'aprobada', 'despachada', 'recepcionada', 'rechazada')
  ),
  CONSTRAINT trans_filiales_check CHECK (filial_origen_id <> filial_destino_id)
);

-- Detalle de la transferencia
CREATE TABLE transferencia_stock_detalle (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transferencia_id  uuid NOT NULL REFERENCES transferencia_stock(id) ON DELETE CASCADE,
  material_id       uuid NOT NULL REFERENCES material(id) ON DELETE RESTRICT,
  cantidad          int NOT NULL,
  UNIQUE (transferencia_id, material_id),
  CONSTRAINT trans_det_cantidad_check CHECK (cantidad > 0)
);

-- Función para actualizar stock automáticamente al registrar movimiento
CREATE OR REPLACE FUNCTION actualizar_stock_sede()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  delta int;
BEGIN
  -- Determinar si es suma o resta
  IF NEW.tipo IN ('ingreso_compra', 'ingreso_transferencia', 'ajuste_positivo') THEN
    delta := NEW.cantidad;
  ELSIF NEW.tipo IN ('salida_entrega', 'salida_merma', 'ajuste_negativo', 'traslado') THEN
    delta := -NEW.cantidad;
  ELSE
    delta := 0;
  END IF;

  -- Upsert en stock_sede
  INSERT INTO stock_sede (filial_id, material_id, cantidad_actual, stock_minimo)
  VALUES (NEW.filial_id, NEW.material_id, GREATEST(0, delta), 0)
  ON CONFLICT (filial_id, material_id)
  DO UPDATE SET
    cantidad_actual = GREATEST(0, stock_sede.cantidad_actual + delta),
    updated_at = now();

  RETURN NEW;
END;
$$;

CREATE TRIGGER mov_stock_actualiza_sede
  AFTER INSERT ON movimiento_stock
  FOR EACH ROW EXECUTE FUNCTION actualizar_stock_sede();

-- Trigger updated_at para stock_sede
CREATE TRIGGER stock_sede_updated_at
  BEFORE UPDATE ON stock_sede
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Índices
CREATE INDEX idx_verificacion_matricula ON verificacion(matricula_id);
CREATE INDEX idx_verificacion_estado    ON verificacion(estado);
CREATE INDEX idx_ver_material_ver       ON verificacion_material(verificacion_id);
CREATE INDEX idx_stock_sede_filial      ON stock_sede(filial_id);
CREATE INDEX idx_stock_sede_material    ON stock_sede(material_id);
CREATE INDEX idx_mov_stock_filial       ON movimiento_stock(filial_id);
CREATE INDEX idx_mov_stock_material     ON movimiento_stock(material_id);
CREATE INDEX idx_trans_stock_origen     ON transferencia_stock(filial_origen_id);
CREATE INDEX idx_trans_stock_destino    ON transferencia_stock(filial_destino_id);
CREATE INDEX idx_trans_stock_estado     ON transferencia_stock(estado);

-- RLS
ALTER TABLE verificacion             ENABLE ROW LEVEL SECURITY;
ALTER TABLE verificacion_material    ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_sede               ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimiento_stock         ENABLE ROW LEVEL SECURITY;
ALTER TABLE transferencia_stock      ENABLE ROW LEVEL SECURITY;
ALTER TABLE transferencia_stock_detalle ENABLE ROW LEVEL SECURITY;

-- Verificación: por filial de la matrícula
CREATE POLICY "verificacion_select" ON verificacion
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matricula m
      WHERE m.id = verificacion.matricula_id
        AND (
          get_user_rol() = 'superadmin'
          OR m.filial_id = ANY(ARRAY(SELECT get_user_filiales()))
        )
    )
  );

CREATE POLICY "verificacion_insert" ON verificacion
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_rol() IN ('superadmin', 'administracion', 'filial', 'logistica')
  );

CREATE POLICY "verificacion_update" ON verificacion
  FOR UPDATE TO authenticated
  USING (
    get_user_rol() IN ('superadmin', 'administracion', 'filial', 'logistica')
  );

-- Material verificado: sigue a verificación
CREATE POLICY "ver_material_select" ON verificacion_material
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM verificacion v
      JOIN matricula m ON m.id = v.matricula_id
      WHERE v.id = verificacion_material.verificacion_id
        AND (
          get_user_rol() = 'superadmin'
          OR m.filial_id = ANY(ARRAY(SELECT get_user_filiales()))
        )
    )
  );

CREATE POLICY "ver_material_insert" ON verificacion_material
  FOR INSERT TO authenticated
  WITH CHECK (get_user_rol() IN ('superadmin', 'administracion', 'filial', 'logistica'));

CREATE POLICY "ver_material_update" ON verificacion_material
  FOR UPDATE TO authenticated
  USING (get_user_rol() IN ('superadmin', 'administracion', 'filial', 'logistica'));

-- Stock sede: por filial
CREATE POLICY "stock_sede_select" ON stock_sede
  FOR SELECT TO authenticated
  USING (
    get_user_rol() = 'superadmin'
    OR filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

CREATE POLICY "stock_sede_upsert" ON stock_sede
  FOR ALL TO authenticated
  USING (get_user_rol() IN ('superadmin', 'administracion', 'logistica'));

-- Movimiento de stock: por filial
CREATE POLICY "mov_stock_select" ON movimiento_stock
  FOR SELECT TO authenticated
  USING (
    get_user_rol() = 'superadmin'
    OR filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

CREATE POLICY "mov_stock_insert" ON movimiento_stock
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_rol() IN ('superadmin', 'administracion', 'logistica')
    AND filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

-- Transferencia de stock: sedes involucradas
CREATE POLICY "trans_stock_select" ON transferencia_stock
  FOR SELECT TO authenticated
  USING (
    get_user_rol() = 'superadmin'
    OR filial_origen_id = ANY(ARRAY(SELECT get_user_filiales()))
    OR filial_destino_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

CREATE POLICY "trans_stock_insert" ON transferencia_stock
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_rol() IN ('superadmin', 'administracion', 'logistica')
  );

CREATE POLICY "trans_stock_update" ON transferencia_stock
  FOR UPDATE TO authenticated
  USING (get_user_rol() IN ('superadmin', 'administracion', 'logistica'));

-- Detalle de transferencia
CREATE POLICY "trans_det_select" ON transferencia_stock_detalle
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transferencia_stock t
      WHERE t.id = transferencia_stock_detalle.transferencia_id
        AND (
          get_user_rol() = 'superadmin'
          OR t.filial_origen_id = ANY(ARRAY(SELECT get_user_filiales()))
          OR t.filial_destino_id = ANY(ARRAY(SELECT get_user_filiales()))
        )
    )
  );

CREATE POLICY "trans_det_insert" ON transferencia_stock_detalle
  FOR INSERT TO authenticated
  WITH CHECK (get_user_rol() IN ('superadmin', 'administracion', 'logistica'));
