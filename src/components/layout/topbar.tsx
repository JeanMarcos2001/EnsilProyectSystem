import { signOut } from "@/features/auth/actions"
import { getUserProfile } from "@/lib/auth/get-role"
import { getFilialPrincipal } from "@/lib/auth/get-filiales"
import { IconLogout, IconBuilding } from "@tabler/icons-react"

export async function Topbar() {
  const [profile, filial] = await Promise.all([
    getUserProfile(),
    getFilialPrincipal(),
  ])

  // Iniciales del nombre para el avatar
  const fullName: string = (profile as { nombre_completo?: string } | null)?.nombre_completo ?? "Usuario"
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map(n => n[0])
    .join("")
    .toUpperCase()

  const filialNombre = (filial as { filial?: { nombre?: string } } | null)?.filial?.nombre
  const rolNombre    = (profile as { rol?: { nombre?: string } } | null)?.rol?.nombre

  return (
    <header
      className="h-14 flex items-center justify-between px-5 shrink-0 border-b"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Sede actual */}
      <div className="flex items-center gap-1.5 text-sm">
        <IconBuilding size={15} style={{ color: "var(--color-text-muted)" }} />
        <span className="font-medium" style={{ color: "var(--color-text-secondary)" }}>
          {filialNombre ?? "Sin sede asignada"}
        </span>
      </div>

      {/* Usuario + logout */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold leading-none" style={{ color: "var(--color-text-primary)" }}>
            {fullName}
          </p>
          {rolNombre && (
            <p className="text-xs mt-0.5 capitalize" style={{ color: "var(--color-text-muted)" }}>
              {rolNombre}
            </p>
          )}
        </div>

        {/* Avatar con iniciales */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ backgroundColor: "var(--color-accent)" }}
        >
          {initials}
        </div>

        {/* Logout */}
        <form action={signOut}>
          <button
            type="submit"
            title="Cerrar sesión"
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            style={{ color: "var(--color-text-muted)" }}
          >
            <IconLogout size={16} />
          </button>
        </form>
      </div>
    </header>
  )
}

