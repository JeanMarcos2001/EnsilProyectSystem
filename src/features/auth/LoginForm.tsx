"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { IconMail, IconLock, IconLoader2, IconAlertCircle } from "@tabler/icons-react"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError("Credenciales incorrectas. Verifica tu email y contraseña.")
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-sm font-medium"
          style={{ color: "var(--color-text-primary)" }}
        >
          Correo electrónico
        </label>
        <div className="relative">
          <IconMail
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--color-text-muted)" }}
          />
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="usuario@ensil.pe"
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border outline-none transition-all"
            style={{
              height: "42px",
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface-muted)",
              color: "var(--color-text-primary)",
            }}
            onFocus={e => {
              e.target.style.borderColor = "var(--color-accent)"
              e.target.style.backgroundColor = "var(--color-surface)"
              e.target.style.boxShadow = "0 0 0 3px var(--color-accent-tint)"
            }}
            onBlur={e => {
              e.target.style.borderColor = "var(--color-border)"
              e.target.style.backgroundColor = "var(--color-surface-muted)"
              e.target.style.boxShadow = "none"
            }}
          />
        </div>
      </div>

      {/* Contraseña */}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-medium"
          style={{ color: "var(--color-text-primary)" }}
        >
          Contraseña
        </label>
        <div className="relative">
          <IconLock
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--color-text-muted)" }}
          />
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border outline-none transition-all"
            style={{
              height: "42px",
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface-muted)",
              color: "var(--color-text-primary)",
            }}
            onFocus={e => {
              e.target.style.borderColor = "var(--color-accent)"
              e.target.style.backgroundColor = "var(--color-surface)"
              e.target.style.boxShadow = "0 0 0 3px var(--color-accent-tint)"
            }}
            onBlur={e => {
              e.target.style.borderColor = "var(--color-border)"
              e.target.style.backgroundColor = "var(--color-surface-muted)"
              e.target.style.boxShadow = "none"
            }}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm"
          style={{
            backgroundColor: "var(--color-danger-bg)",
            color: "var(--color-danger-text)",
            border: "1px solid #FECDCA",
          }}
        >
          <IconAlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Botón */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white rounded-xl transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
        style={{
          height: "42px",
          backgroundColor: loading ? "var(--color-accent-hover)" : "var(--color-accent)",
        }}
        onMouseEnter={e => {
          if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-accent-hover)"
        }}
        onMouseLeave={e => {
          if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-accent)"
        }}
      >
        {loading && <IconLoader2 size={16} className="animate-spin" />}
        {loading ? "Ingresando..." : "Ingresar al sistema"}
      </button>
    </form>
  )
}
