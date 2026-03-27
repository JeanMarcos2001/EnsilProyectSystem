import { createClient } from "@/lib/supabase/server";
import { MatriculasTable } from "@/features/matriculas/components/MatriculasTable";
import { IconSchool, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Matrículas | Sistema ENSIL",
};

export default async function MatriculasPage() {
  const supabase = (await createClient()) as any;

  // Optimización: Unir datos relacionados y paginar
  const { data: matriculas, error } = await supabase
    .from("matricula")
    .select(`
      id,
      fecha_matricula,
      estado,
      alumno:alumno_id(nombre, apellido_paterno, numero_documento, tipo_documento),
      titular:titular_id(nombre, apellido_paterno),
      filial:filial_id(nombre),
      programa:programa_id(nombre),
      nivel:nivel_id(nombre)
    `)
    .order("fecha_matricula", { ascending: false })
    .limit(50); // Muestra las ultimas 50. Para el V2 usar Data Table Server-side paginated.

  return (
    <div className="flex flex-col h-full overflow-hidden p-2 sm:p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-[var(--color-surface)] p-3 sm:px-6 sm:py-4 rounded-2xl border border-[var(--color-border)] shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
            <IconSchool className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Matrículas Activas
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Administre el listado de alumnos y sus planes de pago.
            </p>
          </div>
        </div>
        <Link href="/matriculas/nueva">
          <Button className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 shadow-sm">
            <IconPlus className="w-4 h-4 mr-1.5" />
            Nueva Matrícula
          </Button>
        </Link>
      </div>

      {/* Tabla Principal */}
      <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
        {error ? (
          <div className="p-6 text-red-500">Error listando matrículas: {error.message}</div>
        ) : (
          <MatriculasTable data={matriculas || []} />
        )}
      </div>
    </div>
  );
}
