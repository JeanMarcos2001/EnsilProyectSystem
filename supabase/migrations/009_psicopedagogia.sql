-- ============================================================
-- MIGRACIÓN 009: Módulo de Psicopedagogía
-- ============================================================

-- Reserva de asesoría (agendamiento de sesión con psicopedagoga)
CREATE TABLE reserva_asesoria (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id   uuid NOT NULL REFERENCES persona(id) ON DELETE RESTRICT,
  matricula_id uuid NOT NULL REFERENCES matricula(id) ON DELETE RESTRICT,
  filial_id   uuid NOT NULL REFERENCES filial(id) ON DELETE RESTRICT,
  fecha       date NOT NULL,
  hora_inicio time NOT NULL,
  estado      text NOT NULL DEFAULT 'reservado',
  observaciones text,
  created_by  uuid REFERENCES usuario_perfil(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reserva_estado_check CHECK (
    estado IN (
      'reservado', 'confirmado', 'asistio', 'falto',
      'no_reservo', 'reprogramado', 'cancelado_sede', 'cancelado_alumno'
    )
  )
);

-- Seguimiento de sesión (registro de métricas por programa)
CREATE TABLE seguimiento_sesion (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reserva_id        uuid NOT NULL REFERENCES reserva_asesoria(id) ON DELETE CASCADE,
  alumno_id         uuid NOT NULL REFERENCES persona(id) ON DELETE RESTRICT,
  programa_id       uuid NOT NULL REFERENCES programa(id) ON DELETE RESTRICT,
  nivel_id          uuid REFERENCES nivel(id) ON DELETE RESTRICT,
  fecha_asistencia  date NOT NULL,
  -- Campos para Especialización
  modulo_numero     int,
  velocidad_ppm     int,
  comprension_pct   numeric(5,2),
  -- Campos para Kids
  sesion_numero     int,
  velocidad_kids    int,
  comprension_kids  numeric(5,2),
  -- Campos para Pre-Kids
  semana_numero     int,
  identifica        text,          -- SI / NO / 50%
  lee_solo          text,          -- SI / NO / 50%
  -- General
  observaciones     text,
  created_by        uuid REFERENCES usuario_perfil(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT seg_identifica_check CHECK (identifica IN ('SI', 'NO', '50%') OR identifica IS NULL),
  CONSTRAINT seg_lee_solo_check   CHECK (lee_solo   IN ('SI', 'NO', '50%') OR lee_solo   IS NULL)
);

-- Cronograma mensual de actividades por sede
CREATE TABLE cronograma_mensual (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filial_id   uuid NOT NULL REFERENCES filial(id) ON DELETE RESTRICT,
  mes         int NOT NULL,
  anio        int NOT NULL,
  titulo      text NOT NULL DEFAULT 'CRONOGRAMA MENSUAL',
  estado      text NOT NULL DEFAULT 'borrador',
  created_by  uuid REFERENCES usuario_perfil(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (filial_id, mes, anio),
  CONSTRAINT cronograma_mes_check  CHECK (mes  BETWEEN 1 AND 12),
  CONSTRAINT cronograma_anio_check CHECK (anio BETWEEN 2020 AND 2100),
  CONSTRAINT cronograma_estado_check CHECK (estado IN ('borrador', 'publicado'))
);

-- Actividades del cronograma
CREATE TABLE cronograma_actividad (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cronograma_id     uuid NOT NULL REFERENCES cronograma_mensual(id) ON DELETE CASCADE,
  nombre_actividad  text NOT NULL,
  fecha             date NOT NULL,
  hora              time,
  responsable       text,
  observaciones     text,
  orden             int NOT NULL DEFAULT 0
);

-- Triggers updated_at
CREATE TRIGGER reserva_updated_at
  BEFORE UPDATE ON reserva_asesoria
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER cronograma_updated_at
  BEFORE UPDATE ON cronograma_mensual
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Índices
CREATE INDEX idx_reserva_alumno     ON reserva_asesoria(alumno_id);
CREATE INDEX idx_reserva_matricula  ON reserva_asesoria(matricula_id);
CREATE INDEX idx_reserva_filial     ON reserva_asesoria(filial_id);
CREATE INDEX idx_reserva_fecha      ON reserva_asesoria(fecha);
CREATE INDEX idx_reserva_estado     ON reserva_asesoria(estado);
CREATE INDEX idx_seguimiento_alumno ON seguimiento_sesion(alumno_id);
CREATE INDEX idx_seguimiento_reserva ON seguimiento_sesion(reserva_id);
CREATE INDEX idx_cronograma_filial  ON cronograma_mensual(filial_id);
CREATE INDEX idx_cronograma_mes     ON cronograma_mensual(mes, anio);

-- RLS
ALTER TABLE reserva_asesoria    ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguimiento_sesion  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cronograma_mensual  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cronograma_actividad ENABLE ROW LEVEL SECURITY;

-- Reservas: por filial
CREATE POLICY "reserva_select_by_filial" ON reserva_asesoria
  FOR SELECT TO authenticated
  USING (
    get_user_rol() = 'superadmin'
    OR filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

CREATE POLICY "reserva_insert" ON reserva_asesoria
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_rol() IN ('superadmin', 'administracion', 'filial', 'psicopedagogia')
    AND filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

CREATE POLICY "reserva_update" ON reserva_asesoria
  FOR UPDATE TO authenticated
  USING (
    get_user_rol() IN ('superadmin', 'administracion', 'filial', 'psicopedagogia')
    AND filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

-- Seguimiento: por filial de la reserva
CREATE POLICY "seguimiento_select" ON seguimiento_sesion
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reserva_asesoria r
      WHERE r.id = seguimiento_sesion.reserva_id
        AND (
          get_user_rol() = 'superadmin'
          OR r.filial_id = ANY(ARRAY(SELECT get_user_filiales()))
        )
    )
  );

CREATE POLICY "seguimiento_insert" ON seguimiento_sesion
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_rol() IN ('superadmin', 'administracion', 'psicopedagogia')
  );

CREATE POLICY "seguimiento_update" ON seguimiento_sesion
  FOR UPDATE TO authenticated
  USING (
    get_user_rol() IN ('superadmin', 'administracion', 'psicopedagogia')
  );

-- Cronograma: por filial
CREATE POLICY "cronograma_select" ON cronograma_mensual
  FOR SELECT TO authenticated
  USING (
    get_user_rol() = 'superadmin'
    OR filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

CREATE POLICY "cronograma_insert" ON cronograma_mensual
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_rol() IN ('superadmin', 'administracion', 'psicopedagogia')
    AND filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

CREATE POLICY "cronograma_update" ON cronograma_mensual
  FOR UPDATE TO authenticated
  USING (
    get_user_rol() IN ('superadmin', 'administracion', 'psicopedagogia')
    AND filial_id = ANY(ARRAY(SELECT get_user_filiales()))
  );

-- Actividades: siguen al cronograma
CREATE POLICY "cronograma_act_select" ON cronograma_actividad
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cronograma_mensual c
      WHERE c.id = cronograma_actividad.cronograma_id
        AND (
          get_user_rol() = 'superadmin'
          OR c.filial_id = ANY(ARRAY(SELECT get_user_filiales()))
        )
    )
  );

CREATE POLICY "cronograma_act_insert" ON cronograma_actividad
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_rol() IN ('superadmin', 'administracion', 'psicopedagogia')
  );

CREATE POLICY "cronograma_act_update" ON cronograma_actividad
  FOR UPDATE TO authenticated
  USING (
    get_user_rol() IN ('superadmin', 'administracion', 'psicopedagogia')
  );

CREATE POLICY "cronograma_act_delete" ON cronograma_actividad
  FOR DELETE TO authenticated
  USING (
    get_user_rol() IN ('superadmin', 'administracion', 'psicopedagogia')
  );
