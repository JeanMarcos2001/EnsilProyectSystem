"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sedeSchema } from "./schema";

export async function getEmpresasActivas() {
  const supabase = (await createClient()) as any;
  const { data, error } = await supabase
    .from("empresa")
    .select("id, razon_social, ruc")
    .eq("estado", true);

  if (error) throw new Error(error.message);
  return data;
}

export async function getSedes() {
  const supabase = (await createClient()) as any;
  const { data, error } = await supabase
    .from("filial")
    .select("*, empresa(razon_social)")
    .order("nombre", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function upsertSede(formData: unknown) {
  const parseResult = sedeSchema.safeParse(formData);
  if (!parseResult.success) {
    return { error: "Datos de sede inválidos", details: parseResult.error.flatten() };
  }

  const supabase = (await createClient()) as any;
  const data = parseResult.data;

  const { error } = await supabase
    .from("filial")
    .upsert({
      ...(data.id ? { id: data.id } : {}),
      empresa_id: data.empresa_id,
      nombre: data.nombre,
      ciudad: data.ciudad || null,
      direccion: data.direccion || null,
      telefono: data.telefono || null,
      estado: data.estado,
    });

  if (error) return { error: error.message };

  revalidatePath("/catalogos/sedes");
  return { success: true };
}

export async function toggleEstadoSede(id: string, estadoActual: boolean) {
  const supabase = (await createClient()) as any;
  const { error } = await supabase
    .from("filial")
    .update({ estado: !estadoActual })
    .eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/catalogos/sedes");
  return { success: true };
}
