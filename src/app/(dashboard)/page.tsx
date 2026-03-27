import { requireUser } from "@/lib/auth/get-user"

export default async function DashboardPage() {
  await requireUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Bienvenido al Sistema de Gestión ENSIL
        </p>
      </div>

      {/* KPIs placeholder - se rellenan en Sprint 7 (Reportes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {["Matrículas activas", "Caja del día", "Cartera vencida", "Stock bajo"].map((label) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {label}
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-2">—</p>
          </div>
        ))}
      </div>
    </div>
  )
}
