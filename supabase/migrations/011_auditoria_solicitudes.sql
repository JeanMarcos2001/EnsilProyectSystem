-- ============================================================
-- MIGRACIÓN 011: Auditoría y Solicitudes de Aprobación
-- (Se crea temprano porque es transversal al sistema)
-- ============================================================

-- Log de auditoría (append-only)
CREATE TABLE auditoria_evento (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id    uuid REFERENCES usuario_perfil(id) ON DELETE SET NULL,
  accion        text NOT NULL,  -- crear, editar, eliminar, cambio_estado, aprobar, reversar
  entidad       text NOT NULL,  -- nombre de la tabla
  entidad_id    uuid NOT NULL,
  datos_antes   jsonb,
  datos_despues jsonb,
  ip            text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Solicitudes de aprobación (bandeja)
CREATE TABLE solicitud_aprobacion (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo             text NOT NULL,  -- caida, traslado, refinanciacion, reapertura_caja
  referencia_id    uuid NOT NULL,
  motivo           text NOT NULL,
  comentario       text,
  solicitante_id   uuid NOT NULL REFERENCES usuario_perfil(id) ON DELETE RESTRICT,
  aprobador_id     uuid REFERENCES usuario_perfil(id) ON DELETE SET NULL,
  estado           text NOT NULL DEFAULT 'pendiente',  -- pendiente, aprobada, rechazada
  fecha_solicitud  timestamptz NOT NULL DEFAULT now(),
  fecha_resolucion timestamptz,
  CONSTRAINT chk_estado_solicitud CHECK (estado IN ('pendiente','aprobada','rechazada'))
);

-- Índices
CREATE INDEX idx_auditoria_entidad    ON auditoria_evento(entidad, entidad_id);
CREATE INDEX idx_auditoria_usuario    ON auditoria_evento(usuario_id);
CREATE INDEX idx_auditoria_created    ON auditoria_evento(created_at DESC);
CREATE INDEX idx_solicitud_estado     ON solicitud_aprobacion(estado);
CREATE INDEX idx_solicitud_solicitante ON solicitud_aprobacion(solicitante_id);

-- RLS
ALTER TABLE auditoria_evento    ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitud_aprobacion ENABLE ROW LEVEL SECURITY;

-- Auditoría: solo lectura, solo superadmin y administración
CREATE POLICY "auditoria_select_admin" ON auditoria_evento
  FOR SELECT TO authenticated
  USING (get_user_rol() IN ('superadmin', 'administracion'));

-- Solo el sistema (service role) puede insertar en auditoría
CREATE POLICY "auditoria_insert_service" ON auditoria_evento
  FOR INSERT TO authenticated
  WITH CHECK (get_user_rol() = 'superadmin'); -- en producción usar service_role

-- Solicitudes: el solicitante ve las suyas, superadmin/admin ve todas
CREATE POLICY "solicitud_select_by_role" ON solicitud_aprobacion
  FOR SELECT TO authenticated
  USING (
    get_user_rol() IN ('superadmin', 'administracion')
    OR solicitante_id = auth.uid()
  );

CREATE POLICY "solicitud_insert_authenticated" ON solicitud_aprobacion
  FOR INSERT TO authenticated
  WITH CHECK (solicitante_id = auth.uid());

CREATE POLICY "solicitud_update_admin" ON solicitud_aprobacion
  FOR UPDATE TO authenticated
  USING (get_user_rol() IN ('superadmin', 'administracion'))
  WITH CHECK (get_user_rol() IN ('superadmin', 'administracion'));

-- Función helper para registrar auditoría desde triggers
CREATE OR REPLACE FUNCTION registrar_auditoria(
  p_accion  text,
  p_entidad text,
  p_id      uuid,
  p_antes   jsonb DEFAULT NULL,
  p_despues jsonb DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO auditoria_evento (usuario_id, accion, entidad, entidad_id, datos_antes, datos_despues)
  VALUES (auth.uid(), p_accion, p_entidad, p_id, p_antes, p_despues);
END;
$$;
