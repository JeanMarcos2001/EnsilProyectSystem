-- ============================================================
-- MIGRACIÓN 012: RPC Transaccional para Creación de Matrículas
-- ============================================================

-- Esta función asegura que todo el registro de la matrícula, 
-- su snapshot financiero (plan) y la distribución de cuotas 
-- se inserten atómicamente, fallando completamente si hay un error.

CREATE OR REPLACE FUNCTION crear_matricula_transaccional(payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_matricula_id uuid;
  v_plan_id uuid;
  v_promocion_grupo_id uuid := NULL;
  v_cuota jsonb;
  v_usuario_id uuid;
  v_titular_secundario_id uuid := NULL;
BEGIN
  -- 1. Obtener usuario actual (para created_by audit)
  v_usuario_id := auth.uid();

  -- 2. Manejar Promocion Grupo (si existe)
  IF payload->>'promocion_id' IS NOT NULL AND payload->>'promocion_id' != '' THEN
     INSERT INTO promocion_grupo (promocion_id, monto_total)
     VALUES ((payload->>'promocion_id')::uuid, COALESCE((payload->>'promocion_monto_total')::numeric, 0))
     RETURNING id INTO v_promocion_grupo_id;
  END IF;

  -- Preparar campos opcionales
  IF payload->>'titular_secundario_id' IS NOT NULL AND payload->>'titular_secundario_id' != '' THEN
      v_titular_secundario_id := (payload->>'titular_secundario_id')::uuid;
  END IF;

  -- 3. Insertar Matrícula
  INSERT INTO matricula (
     titular_id,
     titular_secundario_id,
     alumno_id,
     programa_id,
     nivel_id,
     filial_id,
     ejecutivo_id,
     origen_lead_id,
     fecha_matricula,
     estado,
     promocion_grupo_id,
     observaciones,
     created_by
  ) VALUES (
     (payload->>'titular_id')::uuid,
     v_titular_secundario_id,
     (payload->>'alumno_id')::uuid,
     (payload->>'programa_id')::uuid,
     (payload->>'nivel_id')::uuid,
     (payload->>'filial_id')::uuid,
     NULLIF(payload->>'ejecutivo_id', '')::uuid,
     NULLIF(payload->>'origen_lead_id', '')::uuid,
     COALESCE((payload->>'fecha_matricula')::date, CURRENT_DATE),
     'activa', -- Podemos iniciarla activa directamente u otra lógica
     v_promocion_grupo_id,
     payload->>'observaciones',
     v_usuario_id
  ) RETURNING id INTO v_matricula_id;

  -- 4. Insertar Plan Snapshot
  INSERT INTO plan_snapshot (
     matricula_id,
     tipo_pago_id,
     moneda,
     costo_matricula,
     costo_total,
     costo_cuota,
     cantidad_cuotas,
     tarifario_id_origen
  ) VALUES (
     v_matricula_id,
     (payload->'plan'->>'tipo_pago_id')::uuid,
     COALESCE(payload->'plan'->>'moneda', 'PEN'),
     (payload->'plan'->>'costo_matricula')::numeric,
     (payload->'plan'->>'costo_total')::numeric,
     (payload->'plan'->>'costo_cuota')::numeric,
     (payload->'plan'->>'cantidad_cuotas')::int,
     NULLIF(payload->'plan'->>'tarifario_id_origen', '')::uuid
  ) RETURNING id INTO v_plan_id;

  -- 5. Insertar Cuotas
  FOR v_cuota IN SELECT * FROM jsonb_array_elements(payload->'cuotas')
  LOOP
     INSERT INTO cuota (
       plan_snapshot_id,
       matricula_id,
       numero,
       nombre,
       monto,
       fecha_vencimiento,
       estado,
       created_by
     ) VALUES (
       v_plan_id,
       v_matricula_id,
       (v_cuota->>'numero')::int,
       v_cuota->>'nombre',
       (v_cuota->>'monto')::numeric,
       (v_cuota->>'fecha_vencimiento')::date,
       'pendiente',
       v_usuario_id
     );
  END LOOP;

  RETURN v_matricula_id;
END;
$$;
