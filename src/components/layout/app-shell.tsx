import { SidebarPrimary } from "./sidebar-primary"
import { SidebarSecondary } from "./sidebar-secondary"
import { Topbar } from "./topbar"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--color-app-bg)" }}>
      {/* Sidebar primaria: iconos de módulos */}
      <SidebarPrimary />

      {/* Sidebar secundaria: navegación contextual del módulo */}
      <SidebarSecondary />

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

