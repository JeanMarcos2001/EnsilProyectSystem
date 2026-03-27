"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { tarifarioSchema } from "./schema";

export async function getTarifarios() {
  const supabase = (await createClient()) as any;
  const { data, error } = await supabase
    .from("tarifario")
    .select(`
      *,
      filial(nombre),
      nivel(nombre, programa(nombre)),
      tipo_pago(nombre, num_cuotas)
    `)
    .order("vigencia_desde", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function upsertTarifario(formData: unknown) {
  const parseResult = tarifarioSchema.safeParse(formData);
  if (!parseResult.success) {
    return { error: "Datos de tarifario inválidos", details: parseResult.error.flatten() };
  }

  const supabase = (await createClient()) as any;
  const data = parseResult.data;

  // REGLA DE NEGOCIO: Cierre automático de tarifario anterior
  // Si estamos insertando un NUEVO tarifario, debemos cerrar el tarifario activo anterior
  // para las mismas coordenadas (filial_id, nivel_id, tipo_pago_id).
  if (!data.id) {
    const { data: previousActive } = await supabase
      .from("tarifario")
      .select("id, vigencia_desde")
      .eq("filial_id", data.filial_id)
      .eq("nivel_id", data.nivel_id)
      .eq("tipo_pago_id", data.tipo_pago_id)
      .is("vigencia_hasta", null)
      .maybeSingle();

    if (previousActive) {
      // Fecha fin = fecha inicio del nuevo - 1 día
      const nuevaFechaInicio = new Date(data.vigencia_desde);
      nuevaFechaInicio.setDate(nuevaFechaInicio.getDate() - 1);
      const vigenciaHasta = nuevaFechaInicio.toISOString().split("T")[0];

      await supabase
        .from("tarifario")
        .update({ vigencia_hasta: vigenciaHasta })
        .eq("id", previousActive.id);
    }
  }

  // Insertar o actualizar
  const { error } = await supabase
    .from("tarifario")
    .upsert({
      ...(data.id ? { id: data.id } : {}),
      filial_id: data.filial_id,
      nivel_id: data.nivel_id,
      tipo_pago_id: data.tipo_pago_id,
      precio: data.precio,
      vigencia_desde: data.vigencia_desde,
      estado: data.estado,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/catalogos/tarifarios");
  return { success: true };
}

export async function toggleEstadoTarifario(id: string, estadoActual: boolean) {
  const supabase = (await createClient()) as any;
  const { error } = await supabase
    .from("tarifario")
    .update({ estado: !estadoActual })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/catalogos/tarifarios");
  return { success: true };
}

// Helpers para dependencias
export async function getDependenciasTarifarios() {
  const supabase = (await createClient()) as any;
  const [filialesRes, nivelesRes, tiposPagoRes] = await Promise.all([
    supabase.from("filial").select("id, nombre").eq("estado", true),
    supabase.from("nivel").select("id, nombre, programa(nombre)").order("orden", { ascending: true }),
    supabase.from("tipo_pago").select("id, nombre, num_cuotas").eq("estado", true)
  ]);

  return {
    filiales: filialesRes.data || [],
    niveles: nivelesRes.data || [],
    tiposPago: tiposPagoRes.data || [],
  };
}
