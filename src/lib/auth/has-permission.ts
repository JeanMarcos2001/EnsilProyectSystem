import { createClient } from "@/lib/supabase/server"

export async function hasPermission(codigo: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from("usuario_perfil")
    .select("rol_id, rol(rol_permiso(permiso(codigo)))")
    .eq("id", user.id)
    .single()

  if (!data) return false

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const permisos: string[] = (data as any)?.rol?.rol_permiso?.map(
    (rp: { permiso: { codigo: string } }) => rp.permiso.codigo
  ) ?? []

  return permisos.includes(codigo)
}
