"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  IconLayoutDashboard,
  IconClipboardList,
  IconClipboardPlus,
  IconCreditCard,
  IconBuildingBank,
  IconPigMoney,
  IconPigMoney as IconPigMoneyChica,
  IconPackage,
  IconPackageExport,
  IconChecklist,
  IconBrain,
  IconCalendar,
  IconChartBar,
  IconUsersGroup,
  IconUserPlus,
  IconShieldCheck,
  IconClockCheck,
  IconSettings,
  IconBuilding,
  IconTags,
  IconReceiptTax,
  IconChevronRight,
} from "@tabler/icons-react"

// Configuración de la sidebar secundaria por módulo
const sidebarConfig: Record<
  string,
  { title: string; items: { href: string; icon: React.ElementType; label: string }[] }
> = {
  "/": {
    title: "Dashboard",
    items: [
      { href: "/", icon: IconLayoutDashboard, label: "Resumen general" },
    ],
  },
  "/matriculas": {
    title: "Matrículas",
    items: [
      { href: "/matriculas",       icon: IconClipboardList, label: "Todas las matrículas" },
      { href: "/matriculas/nueva", icon: IconClipboardPlus, label: "Nueva matrícula"      },
    ],
  },
  "/cartera": {
    title: "Cartera",
    items: [
      { href: "/cartera",           icon: IconCreditCard, label: "Panel de cartera" },
      { href: "/aprobaciones",      icon: IconClockCheck, label: "Aprobaciones"     },
    ],
  },
  "/caja": {
    title: "Caja",
    items: [
      { href: "/caja",      icon: IconBuildingBank, label: "Movimientos"     },
      { href: "/caja-chica",icon: IconPigMoney,     label: "Caja chica"     },
    ],
  },
  "/caja-chica": {
    title: "Caja Chica",
    items: [
      { href: "/caja-chica", icon: IconPigMoneyChica, label: "Movimientos"  },
      { href: "/caja",       icon: IconBuildingBank,  label: "Caja general" },
    ],
  },
  "/verificacion": {
    title: "Verificación",
    items: [
      { href: "/verificacion", icon: IconChecklist,      label: "Verificaciones"  },
      { href: "/stock",        icon: IconPackage,         label: "Stock actual"    },
      { href: "/stock/movimientos", icon: IconPackageExport, label: "Movimientos" },
    ],
  },
  "/stock": {
    title: "Stock / Logística",
    items: [
      { href: "/stock",             icon: IconPackage,        label: "Stock actual"    },
      { href: "/stock/movimientos", icon: IconPackageExport,  label: "Movimientos"     },
      { href: "/verificacion",      icon: IconChecklist,      label: "Verificaciones"  },
    ],
  },
  "/psicopedagogia": {
    title: "Psicopedagogía",
    items: [
      { href: "/psicopedagogia",             icon: IconBrain,     label: "Panel de alumnos"  },
      { href: "/psicopedagogia/programacion",icon: IconCalendar,  label: "Programación"      },
      { href: "/psicopedagogia/seguimiento", icon: IconChartBar,  label: "Seguimiento"       },
      { href: "/psicopedagogia/cronogramas", icon: IconCalendar,  label: "Cronogramas"       },
    ],
  },
  "/personal": {
    title: "Personal",
    items: [
      { href: "/personal",       icon: IconUsersGroup, label: "Empleados"    },
      { href: "/personal/nuevo", icon: IconUserPlus,   label: "Nuevo empleado" },
    ],
  },
  "/reportes": {
    title: "Reportes",
    items: [
      { href: "/reportes", icon: IconChartBar, label: "Mis reportes" },
    ],
  },
  "/aprobaciones": {
    title: "Aprobaciones",
    items: [
      { href: "/aprobaciones", icon: IconClockCheck, label: "Bandeja de entrada" },
    ],
  },
  "/auditoria": {
    title: "Auditoría",
    items: [
      { href: "/auditoria", icon: IconShieldCheck, label: "Log de eventos" },
    ],
  },
  "/configuracion": {
    title: "Configuración",
    items: [
      { href: "/configuracion",                    icon: IconSettings,    label: "General"          },
      { href: "/configuracion/empresas",           icon: IconBuilding,    label: "Empresas y sedes" },
      { href: "/configuracion/usuarios",           icon: IconUsersGroup,  label: "Usuarios"         },
      { href: "/catalogos/programas",              icon: IconTags,        label: "Programas"        },
      { href: "/catalogos/materiales",             icon: IconPackage,     label: "Materiales"       },
      { href: "/catalogos/tipos-pago",             icon: IconCreditCard,  label: "Tipos de pago"   },
      { href: "/catalogos/tarifarios",             icon: IconReceiptTax,  label: "Tarifarios"      },
      { href: "/catalogos/promociones",            icon: IconTags,        label: "Promociones"     },
    ],
  },
}

function getModuleConfig(pathname: string) {
  // Buscar coincidencia exacta primero
  if (sidebarConfig[pathname]) return sidebarConfig[pathname]
  // Luego buscar por prefijo de mayor longitud
  const match = Object.keys(sidebarConfig)
    .filter(key => key !== "/" && pathname.startsWith(key))
    .sort((a, b) => b.length - a.length)[0]
  return match ? sidebarConfig[match] : sidebarConfig["/"]
}

export function SidebarSecondary() {
  const pathname = usePathname()
  const config = getModuleConfig(pathname)

  return (
    <aside
      className="flex flex-col shrink-0 border-r h-full overflow-hidden"
      style={{
        width: "var(--sidebar-secondary-w)",
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      {/* Título del módulo */}
      <div
        className="px-4 py-4 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--color-text-muted)" }}
        >
          {config.title}
        </p>
      </div>

      {/* Items de navegación secundaria */}
      <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1 overflow-y-auto">
        {config.items.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
              )}
              style={{
                backgroundColor: isActive ? "var(--color-accent-tint)" : "transparent",
                color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
              }}
            >
              <Icon size={16} strokeWidth={isActive ? 2 : 1.75} className="shrink-0" />
              <span className="truncate">{label}</span>
              {isActive && (
                <IconChevronRight
                  size={14}
                  className="ml-auto shrink-0"
                  style={{ color: "var(--color-accent)" }}
                />
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
