"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconLayoutDashboard,
  IconClipboardList,
  IconCreditCard,
  IconBuildingBank,
  IconPigMoney,
  IconPackage,
  IconPackageExport,
  IconChecklist,
  IconBrain,
  IconUsersGroup,
  IconChartBar,
  IconShieldCheck,
  IconClockCheck,
  IconSettings,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/",               icon: IconLayoutDashboard, label: "Dashboard"       },
  { href: "/matriculas",     icon: IconClipboardList,   label: "Matrículas"      },
  { href: "/cartera",        icon: IconCreditCard,      label: "Cartera"         },
  { href: "/caja",           icon: IconBuildingBank,    label: "Caja"            },
  { href: "/caja-chica",     icon: IconPigMoney,        label: "Caja Chica"      },
  { href: "/verificacion",   icon: IconChecklist,       label: "Verificación"    },
  { href: "/stock",          icon: IconPackage,         label: "Stock"           },
  { href: "/psicopedagogia", icon: IconBrain,           label: "Psicopedagogía"  },
  { href: "/personal",       icon: IconUsersGroup,      label: "Personal"        },
  { href: "/reportes",       icon: IconChartBar,        label: "Reportes"        },
  { href: "/aprobaciones",   icon: IconClockCheck,      label: "Aprobaciones"    },
  { href: "/auditoria",      icon: IconShieldCheck,     label: "Auditoría"       },
  { href: "/configuracion",  icon: IconSettings,        label: "Configuración"   },
]

export function SidebarPrimary() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col shrink-0 border-r h-full py-3 items-center gap-1 overflow-hidden" style={{
      width: "var(--sidebar-primary-w)",
      borderColor: "var(--color-border)",
      backgroundColor: "var(--color-surface)",
    }}>
      {/* Logo */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 shrink-0"
        style={{ backgroundColor: "var(--color-accent)" }}
      >
        <span className="text-white text-xs font-bold tracking-wide">E</span>
      </div>

      {/* Separador */}
      <div
        className="w-8 h-px mb-2 shrink-0"
        style={{ backgroundColor: "var(--color-border)" }}
      />

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 w-full px-2 flex-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "flex items-center justify-center w-full h-10 rounded-lg transition-all duration-150 group relative",
                isActive
                  ? "text-[--color-accent]"
                  : "text-[--color-text-muted] hover:text-[--color-text-secondary]",
              )}
              style={{
                backgroundColor: isActive ? "var(--color-accent-tint)" : undefined,
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.75} />
              {/* Tooltip */}
              <span
                className="absolute left-full ml-2.5 px-2.5 py-1.5 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 transition-opacity duration-150 shadow-lg font-medium"
                style={{ backgroundColor: "var(--color-text-primary)" }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
