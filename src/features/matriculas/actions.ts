"use server";

import { createClient } from "@/lib/supabase/server";

export async function buscarPersona(documento: string) {
  const supabase = (await createClient()) as any;
  const { data, error } = await supabase
    .from("persona")
    .select("*")
    .eq("numero_documento", documento)
    .single();

  if (error && error.code !== "PGRST116") { // 116 = not found
    throw new Error(error.message);
  }
  
  return data || null;
}

export async function upsertPersonaExpress(payload: any) {
  const supabase = (await createClient()) as any;
  
  const { data, error } = await supabase
    .from("persona")
    .upsert({
      ...(payload.id ? { id: payload.id } : {}),
      tipo_documento: payload.tipo_documento || "DNI",
      numero_documento: payload.numero_documento,
      nombre: payload.nombre,
      apellido_paterno: payload.apellido_paterno,
      apellido_materno: payload.apellido_materno || null,
      email: payload.email || null,
      telefono: payload.telefono || null,
      fecha_nacimiento: payload.fecha_nacimiento || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function getFilialesActivas() {
  const supabase = (await createClient()) as any;
  const { data } = await supabase.from("filial").select("id, nombre").eq("estado", "activo").order("nombre");
  return data || [];
}

export async function getProgramasActivos() {
  const supabase = (await createClient()) as any;
  const { data } = await supabase.from("programa").select("id, nombre").eq("estado", "activo").order("nombre");
  return data || [];
}

export async function getNivelesPorPrograma(programaId: string) {
  if (!programaId) return [];
  const supabase = (await createClient()) as any;
  const { data } = await supabase.from("nivel").select("id, nombre, matricula_incluida").eq("programa_id", programaId).eq("estado", "activo").order("orden");
  return data || [];
}

export async function guardarMatriculaCheckout(payload: any) {
  const supabase = (await createClient()) as any;
  const { data, error } = await supabase.rpc("crear_matricula_transaccional", {
    payload
  });

  if (error) {
    console.error("RPC Error:", error);
    return { error: error.message };
  }

  return { data };
}
export async function getOrigenesLeadActivos() {
  const supabase = (await createClient()) as any;
  const { data } = await supabase.from("origen_lead").select("id, nombre").eq("estado", "activo").order("nombre");
  return data || [];
}

export async function getTiposPagoActivos() {
  const supabase = (await createClient()) as any;
  const { data } = await supabase.from("tipo_pago").select("id, nombre, cantidad_cuotas").eq("estado", "activo").order("cantidad_cuotas");
  return data || [];
}

export async function getTarifarioActivo(programaId: string, nivelId: string, tipoPagoId: string) {
  if (!programaId || !nivelId || !tipoPagoId) return null;
  const supabase = (await createClient()) as any;
  const { data } = await supabase
    .from("tarifario")
    .select("*")
    .eq("programa_id", programaId)
    .eq("nivel_id", nivelId)
    .eq("tipo_pago_id", tipoPagoId)
    .eq("estado", "activo")
    .single();
  return data || null;
}

export async function getPromocionesValidas(filialId: string, programaId: string) {
  if (!filialId || !programaId) return [];
  const supabase = (await createClient()) as any;
  
  const { data, error } = await supabase
    .from("promocion")
    .select(`
      id, nombre, monto_descuento, porcentaje_descuento, tipo_promocion, requiere_aprobacion, aplica_matricula, estado,
      promocion_filial!inner(filial_id),
      promocion_programa!inner(programa_id)
    `)
    .eq("estado", "activo")
    .eq("promocion_filial.filial_id", filialId)
    .eq("promocion_programa.programa_id", programaId)
    .lte("vigencia_desde", new Date().toISOString())
    .gte("vigencia_hasta", new Date().toISOString());

  if (error) {
    console.error("Error promociones:", error);
    return [];
  }
  return data || [];
}

export async function getMatriculaById(id: string) {
  const supabase = (await createClient()) as any;
  const { data, error } = await supabase
    .from("matricula")
    .select(`
      *,
      alumno:alumno_id(*),
      titular:titular_id(*),
      programa:programa_id(nombre),
      nivel:nivel_id(nombre),
      filial:filial_id(nombre),
      origen_lead:origen_lead_id(nombre),
      plan_snapshot!inner(*),
      cuota(*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error getMatriculaById:", error);
    return null;
  }
  return data;
}

