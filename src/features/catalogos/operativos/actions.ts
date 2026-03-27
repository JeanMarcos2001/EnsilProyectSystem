"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCatalogo(tabla: string) {
  const supabase = (await createClient()) as any;
  const { data, error } = await supabase
    .from(tabla)
    .select("*")
    .order("nombre", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function upsertCatalogo(tabla: string, payload: any) {
  const supabase = (await createClient()) as any;
  
  const { error } = await supabase
    .from(tabla)
    .upsert({
      ...(payload.id ? { id: payload.id } : {}),
      nombre: payload.nombre,
      estado: payload.estado,
      ...(payload.requiere_documento !== undefined ? { requiere_documento: payload.requiere_documento } : {}),
      ...(payload.reclutador_required !== undefined ? { reclutador_required: payload.reclutador_required } : {}),
    });

  if (error) return { error: error.message };

  revalidatePath("/catalogos/operativos");
  return { success: true };
}

export async function toggleEstadoCatalogo(tabla: string, id: string, estadoActual: boolean) {
  const supabase = (await createClient()) as any;
  const { error } = await supabase
    .from(tabla)
    .update({ estado: !estadoActual })
    .eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/catalogos/operativos");
  return { success: true };
}
