-- ============================================================
-- MIGRACIÓN 007: Pagos y Gestión de Caja
-- ============================================================

-- Pago principal
CREATE TABLE pago (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula_id           uuid NOT NULL REFERENCES matricula(id) ON DELETE RESTRICT,
  filial_id              uuid NOT NULL REFERENCES filial(id) ON DELETE RESTRICT,
  monto_total            numeric(10,2) NOT NULL,
  fecha_pago             date NOT NULL DEFAULT CURRENT_DATE,
  -- Comprobante
  tipo_comprobante       text NOT NULL,          -- boleta / factura
  serie_comprobante      text,
  numero_comprobante     text,
  empresa_id             uuid REFERENCES empresa(id) ON DELETE RESTRICT,
  -- Moneda
  moneda_pago            varchar(3) NOT NULL DEFAULT 'USD',
  tipo_cambio            numeric(8,4),           -- si paga en PEN un monto en USD
  monto_moneda_original  numeric(10,2),
  -- Evidencia obligatoria
  evidencia_url          text NOT NULL,
  -- Estado
  estado                 text NOT NULL DEFAULT 'activo',
  observaciones          text,
  -- Auditoría
  created_by             uuid REFERENCES usuario_perfil(id) ON DELETE SET NULL,
  created_at             timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pago_estado_check CHECK (estado IN ('activo', 'reversado')),
  CONSTRAINT pago_moneda_check CHECK (moneda_pago IN ('USD', 'PEN')),
  -- Comprobante único por empresa
  UNIQUE (empresa_id, tipo_comprobante, serie_comprobante, numero_comprobante)
);

-- Medios de pago usados en un pago (puede ser mix: yape + efectivo)
CREATE TABLE pago_componente (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pago_id         uuid NOT NULL REFERENCES pago(id) ON DELETE CASCADE,
  medio_pago_id   uuid NOT NULL REFERENCES medio_pago(id) ON DELETE RESTRICT,
  monto           numeric(10,2) NOT NULL,
  numero_operacion text                           -- número de transacción si aplica
);

-- Aplicación del pago a cuotas específicas
CREATE TABLE pago_cuota (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pago_id        uuid NOT NULL REFERENCES pago(id) ON DELETE CASCADE,
  cuota_id       uuid NOT NULL REFERENCES cuota(id) ON DELETE RESTRICT,
  monto_aplicado numeric(10,2) NOT NULL,
  UNIQUE (pago_id, cuota_id)
);

-- Movimientos de caja (generados automáticamente por pagos e ingresos/egresos)
CREATE TABLE movimiento_caja (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filial_id        uuid NOT NULL REFERENCES filial(id) ON DELETE RESTRICT,
  tipo             text NOT NULL,                -- ingreso, egreso, ajuste
  categoria        text NOT NULL,                -- matricula, deposito_cuenta, ajuste, etc.
  moneda           varchar(3) NOT NULL DEFAULT 'PEN',
  monto            numeric(10,2) NOT NULL,
  tipo_cambio      numeric(8,4),
  pago_id          uuid REFERENCES pago(id) ON DELETE SET NULL,
  concepto         text NOT NULL,
  lote_deposito_id uuid,                         -- FK a lote_deposito (se agrega después)
  periodo          varchar(7) NOT NULL,          -- YYYY-MM
  estado           text NOT NULL DEFAULT 'activo',
  created_by       uuid REFERENCES usuario_perfil(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mov_caja_tipo_check CHECK (tipo IN ('ingreso', 'egreso', 'ajuste')),
  CONSTRAINT mov_caja_estado_check CHECK (estado IN ('activo', 'reversado')),
  CONSTRAINT mov_caja_moneda_check CHECK (moneda IN ('USD', 'PEN'))
);

-- Lotes de depósito (agrupar pagos para depositar al banco)
CREATE TABLE lote_deposito (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filial_id   uuid NOT NULL REFERENCES filial(id) ON DELETE RESTRICT,
  moneda      varchar(3) NOT NULL DEFAULT 'PEN',
  monto_total numeric(10,2) NOT NULL,
  fecha       date NOT NULL,
  referencia  text,                               -- número de depósito bancario
  observaciones text,
  created_by  uuid REFERENCES usuario_perfil(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lote_moneda_check CHECK (moneda IN ('USD', 'PEN'))
);

-- FK diferida: movimiento_caja -> lote_deposito
ALTER TABLE movimiento_caja
  ADD CONSTRAINT fk_movimiento_lote
  FOREIGN KEY (lote_deposito_id) REFERENCES lote_deposito(id) ON DELETE SET NULL;

-- Cierre de caja por filial + tipo_caja + periodo
CREATE TABLE cierre_caja (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filial_id        uuid NOT NULL REFERENCES filial(id) ON DELETE RESTRICT,
  tipo_caja        text NOT NULL,                -- matriculas_pen, matriculas_usd, caja_chica
  periodo          varchar(7) NOT NULL,          -- YYYY-MM
  estado           text NOT NULL DEFAULT 'abierto',
  cerrado_por      uuid REFERENCES usuario_perfil(id) ON DELETE SET NULL,
  fecha_cierre     timestamptz,
  reabierto_por    uuid REFERENCES usuario_perfil(id) ON DELETE SET NULL,
  fecha_reapertura timestamptz,
  motivo_reapertura text,
  UNIQUE (filial_id, tipo_caja, periodo),
  CONSTRAINT cierre_estado_check CHECK (estado IN ('abierto', 'cerrado')),
  CONSTRAINT cierre_tipo_check CHECK (
    tipo_caja IN ('matriculas_pen', 'matriculas_usd', 'caja_chica')
  )
);

-- Movimientos de caja chica (gastos operativos de la sede)
CREATE TABLE movimiento_caja_chica (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filial_id   uuid NOT NULL REFERENCES filial(id) ON DELETE RESTRICT,
  tipo        text NOT NULL,                     -- ingreso, egreso
  categoria   text NOT NULL,                     -- movilidad, utiles, marketing, etc.
  monto       numeric(10,2) NOT NULL,
  concepto    text NOT NULL,
  evidencia_url text,
  periodo     varchar(7) NOT NULL,               -- YYYY-MM
  created_by  uuid REFERENCES usuario_perfil(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mov_chica_tipo_check CHECK (tipo IN ('ingreso', 'egreso'))
);

-- Índices
CREATE INDEX idx_pago_matricula     ON pago(matricula_id);
CREATE INDEX idx_pago_filial        ON pago(filial_id);
CREATE INDEX idx_pago_fecha         ON pago(fecha_pago);
CREATE INDEX idx_pago_estado        ON pago(estado);
CREATE INDEX idx_pago_comp          ON pago(empresa_id, tipo_comprobante, serie_comprobante, numero_comprobante);
CREATE INDEX idx_pago_componente    ON pago_componente(pago_id);
CREATE INDEX idx_pago_cuota_pago    ON pago_cuota(pago_id);
CREATE INDEX idx_pago_cuota_cuota   ON pago_cuota(cuota_id);
CREATE INDEX idx_mov_caja_filial    ON movimiento_caja(filial_id);
CREATE INDEX idx_mov_caja_periodo   ON movimiento_caja(periodo);
CREATE INDEX idx_cierre_caja_filial ON cierre_caja(filial_id, tipo_caja, periodo);
CREATE INDEX idx_mov_chica_filial   ON movimiento_caja_chica(filial_id);
CREATE INDEX idx_mov_chica_periodo  ON movimiento_caja_chica(periodo);

-- RLS
ALTER TABLE pago                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pago_componente        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pago_cuota             ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimiento_caja        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lote_deposito          ENABLE ROW LEVEL SECURITY;
ALTER TABLE cierre_caja            ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimiento_caja_chica  ENABLE ROW LEVEL SECURITY;

-- Pagos: por filial
CREATE POLICY "pago_select_by_filial" ON pago
  FOR SELECT TO authenticated
  USING (
    get_user_rol() = 'superadmin'
    OR filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

CREATE POLICY "pago_insert_by_filial" ON pago
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_rol() IN ('superadmin', 'administracion', 'filial')
    AND filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

-- Pago componente y cuota: siguen al pago
CREATE POLICY "pago_componente_select" ON pago_componente
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pago p
      WHERE p.id = pago_componente.pago_id
        AND (
          get_user_rol() = 'superadmin'
          OR p.filial_id = ANY(ARRAY(SELECT get_user_filiales()))
        )
    )
  );

CREATE POLICY "pago_componente_insert" ON pago_componente
  FOR INSERT TO authenticated
  WITH CHECK (get_user_rol() IN ('superadmin', 'administracion', 'filial'));

CREATE POLICY "pago_cuota_select" ON pago_cuota
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pago p
      WHERE p.id = pago_cuota.pago_id
        AND (
          get_user_rol() = 'superadmin'
          OR p.filial_id = ANY(ARRAY(SELECT get_user_filiales()))
        )
    )
  );

CREATE POLICY "pago_cuota_insert" ON pago_cuota
  FOR INSERT TO authenticated
  WITH CHECK (get_user_rol() IN ('superadmin', 'administracion', 'filial'));

-- Movimiento caja: por filial
CREATE POLICY "mov_caja_select_by_filial" ON movimiento_caja
  FOR SELECT TO authenticated
  USING (
    get_user_rol() = 'superadmin'
    OR filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

CREATE POLICY "mov_caja_insert" ON movimiento_caja
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_rol() IN ('superadmin', 'administracion', 'filial')
    AND filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

-- Lote depósito: por filial
CREATE POLICY "lote_deposito_select" ON lote_deposito
  FOR SELECT TO authenticated
  USING (
    get_user_rol() = 'superadmin'
    OR filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

CREATE POLICY "lote_deposito_insert" ON lote_deposito
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_rol() IN ('superadmin', 'administracion')
    AND filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

-- Cierre caja: por filial
CREATE POLICY "cierre_caja_select" ON cierre_caja
  FOR SELECT TO authenticated
  USING (
    get_user_rol() = 'superadmin'
    OR filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

CREATE POLICY "cierre_caja_insert" ON cierre_caja
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_rol() IN ('superadmin', 'administracion')
  );

CREATE POLICY "cierre_caja_update" ON cierre_caja
  FOR UPDATE TO authenticated
  USING (get_user_rol() IN ('superadmin', 'administracion'));

-- Caja chica: por filial
CREATE POLICY "mov_chica_select" ON movimiento_caja_chica
  FOR SELECT TO authenticated
  USING (
    get_user_rol() = 'superadmin'
    OR filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

CREATE POLICY "mov_chica_insert" ON movimiento_caja_chica
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_rol() IN ('superadmin', 'administracion', 'filial')
    AND filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );
