import { getSedes, getEmpresasActivas } from "@/features/catalogos/sedes/actions";
import { SedesList } from "@/features/catalogos/sedes/SedesList";
import { IconMapPin } from "@tabler/icons-react";

export const metadata = {
  title: "Gestión de Sedes | Sistema ENSIL",
};

export default async function SedesPage() {
  const [sedes, empresas] = await Promise.all([
    getSedes(),
    getEmpresasActivas()
  ]);

  return (
    <div className="space-y-6 flex flex-col h-full overflow-hidden p-2 sm:p-4">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
              <IconMapPin className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Sedes / Filiales
            </h1>
          </div>
          <p className="text-[var(--color-text-secondary)] mt-1 ml-10">
            Gestione las diferentes locaciones físicas donde se dictan las clases o se opera comercialmente.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto rounded-xl">
        <SedesList data={sedes} empresas={empresas} />
      </div>
    </div>
  );
}
