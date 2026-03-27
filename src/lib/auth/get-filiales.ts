import { createClient } from "@/lib/supabase/server"

export async function getUserFiliales() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("usuario_filial")
    .select("filial_id, es_principal, filial(id, nombre, ciudad, empresa_id)")
    .eq("usuario_id", user.id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]) ?? []
}

export async function getFilialPrincipal() {
  const filiales = await getUserFiliales()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return filiales.find((f: any) => f.es_principal) ?? filiales[0] ?? null
}
