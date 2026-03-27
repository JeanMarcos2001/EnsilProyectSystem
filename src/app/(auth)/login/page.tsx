import { LoginForm } from "@/features/auth/LoginForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ingresar — Sistema ENSIL",
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--color-app-bg)", fontFamily: "var(--font-sans)" }}
    >
      {/* Panel izquierdo — Brand */}
      <div
        className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col justify-between p-10 shrink-0"
        style={{ backgroundColor: "var(--color-accent)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="text-white text-sm font-bold">E</span>
          </div>
          <span className="text-white font-semibold text-base tracking-tight">Sistema ENSIL</span>
        </div>

        {/* Copy central */}
        <div className="space-y-4">
          <h2 className="text-white text-3xl font-bold leading-snug">
            Gestión integral<br />del grupo ENSIL
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-[320px]">
            CRM · Matrículas · Cartera · Caja · Stock · Psicopedagogía
          </p>

          {/* Stats */}
          <div className="flex gap-6 pt-2">
            {[
              { value: "6",   label: "empresas" },
              { value: "16+", label: "filiales" },
              { value: "5",   label: "roles"    },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-white text-2xl font-bold">{value}</p>
                <p className="text-white/60 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/40 text-xs">© 2026 ENSIL Perú. Todos los derechos reservados.</p>
      </div>

      {/* Panel derecho — Formulario */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px] space-y-8">

          {/* Header mobile (logo) */}
          <div className="lg:hidden flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              <span className="text-white text-xs font-bold">E</span>
            </div>
            <span className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
              Sistema ENSIL
            </span>
          </div>

          {/* Título */}
          <div className="space-y-1">
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Bienvenido de vuelta
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Card del formulario */}
          <div
            className="rounded-2xl border p-6 shadow-sm"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            <LoginForm />
          </div>

          <p
            className="text-center text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            ¿Olvidaste tu contraseña? Contacta al administrador de tu sede.
          </p>
        </div>
      </div>
    </div>
  )
}
