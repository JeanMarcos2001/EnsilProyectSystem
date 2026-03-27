import { getProgramas } from "@/features/catalogos/programas/actions";
import { ProgramaList } from "@/features/catalogos/programas/ProgramaList";

export const metadata = {
  title: "Catálogo de Programas | ENSIL",
};

export default async function ProgramasPage() {
  const programas = await getProgramas();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Programas Formativos
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Gestiona los programas educativos, sus niveles y configuraciones.
          </p>
        </div>
      </div>
      
      <ProgramaList data={programas} />
    </div>
  );
}
