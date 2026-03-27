"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { materialSchema, recetaSchema } from "./schema";

export async function getMateriales() {
  const supabase = (await createClient()) as any;
  const { data, error } = await supabase
    .from("material")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function getRecetasByNivel(nivelId: string) {
  const supabase = (await createClient()) as any;
  const { data, error } = await supabase
    .from("programa_material")
    .select("*, material(*)")
    .eq("nivel_id", nivelId);

  if (error) throw new Error(error.message);
  return data;
}

export async function upsertMaterial(formData: unknown) {
  const parseResult = materialSchema.safeParse(formData);
  if (!parseResult.success) {
    return { error: "Datos de material inválidos", details: parseResult.error.flatten() };
  }

  const supabase = (await createClient()) as any;
  const data = parseResult.data;

  // @ts-ignore: Supabase infiere never temporalmente
  const { error } = await supabase
    .from("material")
    .upsert({
      ...(data.id ? { id: data.id } : {}),
      nombre: data.nombre,
      tipo: data.tipo,
      unidad: data.unidad,
      estado: data.estado,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/catalogos/materiales");
  return { success: true };
}

export async function toggleEstadoMaterial(id: string, estadoActual: boolean) {
  const supabase = (await createClient()) as any;
  // @ts-ignore
  const { error } = await supabase
    .from("material")
    .update({ estado: !estadoActual })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/catalogos/materiales");
  return { success: true };
}

export async function upsertReceta(formData: unknown) {
  const parseResult = recetaSchema.safeParse(formData);
  if (!parseResult.success) {
    return { error: "Datos de receta inválidos", details: parseResult.error.flatten() };
  }

  const supabase = (await createClient()) as any;
  const data = parseResult.data;

  // @ts-ignore
  const { error } = await supabase
    .from("programa_material")
    .upsert({
      ...(data.id ? { id: data.id } : {}),
      nivel_id: data.nivel_id,
      material_id: data.material_id,
      cantidad: data.cantidad,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Las recetas se pueden ver dentro de programas o materiales, revalidamos ambos
  revalidatePath("/catalogos/programas");
  revalidatePath("/catalogos/materiales");
  return { success: true };
}

export async function deleteReceta(id: string) {
  const supabase = (await createClient()) as any;
  const { error } = await supabase
    .from("programa_material")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/catalogos/programas");
  revalidatePath("/catalogos/materiales");
  return { success: true };
}
