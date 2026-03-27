"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { programaSchema, nivelSchema, ProgramaFormValues, NivelFormValues } from "./schema";

export async function getProgramas() {
  const supabase = (await createClient()) as any;
  const { data, error } = await supabase
    .from("programa")
    .select("*, niveles:nivel(*)")
    .order("nombre", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function getProgramaById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programa")
    .select("*, niveles:nivel(*)")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  
  const programa = data as any;
  // Ordenar niveles localmente si no vino ordenado desde supabase (fallback simple)
  if (programa?.niveles) {
    programa.niveles.sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));
  }
  
  return programa;
}

export async function upsertPrograma(formData: unknown) {
  const parseResult = programaSchema.safeParse(formData);
  if (!parseResult.success) {
    return { error: "Datos de formulario inválidos", details: parseResult.error.flatten() };
  }

  const supabase = (await createClient()) as any;
  const data = parseResult.data;

  // Si no hay ID, es insert
  const { error } = await supabase
    .from("programa")
    .upsert({
      ...(data.id ? { id: data.id } : {}),
      nombre: data.nombre,
      alias: data.alias || null,
      descripcion: data.descripcion || null,
      estado: data.estado,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/catalogos/programas");
  return { success: true };
}

export async function toggleEstadoPrograma(id: string, estadoActual: boolean) {
  const supabase = (await createClient()) as any;
  const { error } = await supabase
    .from("programa")
    .update({ estado: !estadoActual })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/catalogos/programas");
  return { success: true };
}

export async function upsertNivel(formData: unknown) {
  const parseResult = nivelSchema.safeParse(formData);
  if (!parseResult.success) {
    return { error: "Datos de nivel inválidos", details: parseResult.error.flatten() };
  }

  const supabase = (await createClient()) as any;
  const data = parseResult.data;

  const { error } = await supabase
    .from("nivel")
    .upsert({
      ...(data.id ? { id: data.id } : {}),
      programa_id: data.programa_id,
      nombre: data.nombre,
      duracion_meses: data.duracion_meses,
      garantia_meses: data.garantia_meses,
      orden: data.orden,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/catalogos/programas");
  return { success: true };
}

export async function deleteNivel(id: string) {
  const supabase = (await createClient()) as any;
  const { error } = await supabase
    .from("nivel")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/catalogos/programas");
  return { success: true };
}
