"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { promocionSchema } from "./schema";

export async function getPromociones() {
  const supabase = (await createClient()) as any;
  const { data, error } = await supabase
    .from("promocion")
    .select(`
      *,
      promocion_filial(filial_id, filial(nombre)),
      promocion_programa(programa_id, programa(nombre))
    `)
    .order("vigencia_desde", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function upsertPromocion(formData: unknown) {
  const parseResult = promocionSchema.safeParse(formData);
  if (!parseResult.success) {
    return { error: "Datos de promoción inválidos", details: parseResult.error.flatten() };
  }

  const supabase = (await createClient()) as any;
  const data = parseResult.data;

  // 1. Insertar o actualizar la Promocion
  const { data: promo, error: promoError } = await supabase
    .from("promocion")
    .upsert({
      ...(data.id ? { id: data.id } : {}),
      nombre: data.nombre,
      tipo: data.tipo,
      valor: data.valor || null,
      vigencia_desde: data.vigencia_desde,
      vigencia_hasta: data.vigencia_hasta || null,
      estado: data.estado,
    })
    .select()
    .single();

  if (promoError) return { error: promoError.message };

  const promocionId = promo.id;

  // 2. Sincronizar Filiales (borrar anteriores y crear nuevas)
  await supabase.from("promocion_filial").delete().eq("promocion_id", promocionId);
  const filialesInserts = data.filiales_ids.map((f_id) => ({
    promocion_id: promocionId,
    filial_id: f_id,
  }));
  if (filialesInserts.length > 0) {
    await supabase.from("promocion_filial").insert(filialesInserts);
  }

  // 3. Sincronizar Programas
  await supabase.from("promocion_programa").delete().eq("promocion_id", promocionId);
  const programasInserts = data.programas_ids.map((p_id) => ({
    promocion_id: promocionId,
    programa_id: p_id,
  }));
  if (programasInserts.length > 0) {
    await supabase.from("promocion_programa").insert(programasInserts);
  }

  revalidatePath("/catalogos/promociones");
  return { success: true };
}

export async function toggleEstadoPromocion(id: string, estadoActual: boolean) {
  const supabase = (await createClient()) as any;
  const { error } = await supabase
    .from("promocion")
    .update({ estado: !estadoActual })
    .eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/catalogos/promociones");
  return { success: true };
}

export async function deletePromocion(id: string) {
  const supabase = (await createClient()) as any;
  const { error } = await supabase
    .from("promocion")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/catalogos/promociones");
  return { success: true };
}

export async function getDependenciasPromociones() {
  const supabase = (await createClient()) as any;
  const [filialesRes, programasRes] = await Promise.all([
    supabase.from("filial").select("id, nombre").eq("estado", true),
    supabase.from("programa").select("id, nombre").eq("estado", true).order("nombre")
  ]);

  return {
    filiales: filialesRes.data || [],
    programas: programasRes.data || [],
  };
}
