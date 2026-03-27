import { requireUser } from "@/lib/auth/get-user"
import { AppShell } from "@/components/layout/app-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireUser()

  return <AppShell>{children}</AppShell>
}
