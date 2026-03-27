import { MatriculaStepper } from "@/features/matriculas/components/MatriculaStepper";
import { IconSchool } from "@tabler/icons-react";

export const metadata = {
  title: "Nueva Matrícula | Sistema ENSIL",
};

export default function NuevaMatriculaPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden p-2 sm:p-4 gap-4">
      {/* Short Header */}
      <div className="flex items-center gap-3 bg-[var(--color-surface)] p-3 sm:px-6 sm:py-4 rounded-2xl border border-[var(--color-border)] shadow-sm shrink-0">
        <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
          <IconSchool className="h-5 w-5 text-[var(--color-primary)]" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Asistente de Nueva Matrícula
        </h1>
      </div>

      {/* Stepper Wizard occupies the rest of screen */}
      <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
        <MatriculaStepper />
      </div>
    </div>
  );
}
