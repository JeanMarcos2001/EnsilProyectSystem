import { createClient } from "@/lib/supabase/server"
import type { RolNombre } from "@/types/enums"

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("usuario_perfil")
    .select("*, rol(nombre)")
    .eq("id", user.id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data as any
}

export async function getUserRol(): Promise<RolNombre | null> {
  const profile = await getUserProfile()
  if (!profile) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (profile as any).rol?.nombre ?? null
}
