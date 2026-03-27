import { getMateriales } from "@/features/catalogos/materiales/actions";
import { MaterialList } from "@/features/catalogos/materiales/MaterialList";
import { IconBook } from "@tabler/icons-react";

export const metadata = {
  title: "Materiales y Kits | Sistema ENSIL",
};

export default async function MaterialesPage() {
  const materiales = await getMateriales();

  return (
    <div className="space-y-6 flex flex-col h-full overflow-hidden p-2 sm:p-4">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[var(--color-accent)]/10 rounded-lg">
              <IconBook className="h-6 w-6 text-[var(--color-accent)]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Catálogo de Materiales
            </h1>
          </div>
          <p className="text-[var(--color-text-secondary)] mt-1 ml-10">
            Gestione el inventario de libros, anillados, flashcards y otros materiales entregables.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto rounded-xl">
        <MaterialList data={materiales} />
      </div>
    </div>
  );
}
