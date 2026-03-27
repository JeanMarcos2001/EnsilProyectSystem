import { getPromociones, getDependenciasPromociones } from "@/features/catalogos/promociones/actions";
import { PromocionList } from "@/features/catalogos/promociones/PromocionList";
import { IconGift } from "@tabler/icons-react";

export const metadata = {
  title: "Gestión de Promociones | Sistema ENSIL",
};

export default async function PromocionesPage() {
  const [promociones, dependencias] = await Promise.all([
    getPromociones(),
    getDependenciasPromociones()
  ]);

  return (
    <div className="space-y-6 flex flex-col h-full overflow-hidden p-2 sm:p-4">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[var(--color-accent)]/10 rounded-lg">
              <IconGift className="h-6 w-6 text-[var(--color-accent)]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Promociones y Descuentos
            </h1>
          </div>
          <p className="text-[var(--color-text-secondary)] mt-1 ml-10">
            Configure beneficios para matrículas, como descuentos porcentuales, fijos, 2x1 o planes hermanos. 
            Controle en qué sede y programa aplican.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto rounded-xl">
        <PromocionList data={promociones} dependencias={dependencias} />
      </div>
    </div>
  );
}
