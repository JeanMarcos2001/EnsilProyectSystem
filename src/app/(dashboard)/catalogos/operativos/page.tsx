import { getCatalogo } from "@/features/catalogos/operativos/actions";
import { GenericCatalog } from "@/features/catalogos/operativos/GenericCatalog";
import { IconSettings2 } from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "Catálogos Operativos | Sistema ENSIL",
};

export default async function OperativosPage() {
  const [mediosPago, comprobantes, origenes] = await Promise.all([
    getCatalogo("medio_pago"),
    getCatalogo("tipo_comprobante"),
    getCatalogo("origen_lead"),
  ]);

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-120px)] p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[var(--color-accent)]/10 rounded-lg">
              <IconSettings2 className="h-6 w-6 text-[var(--color-accent)]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
              Catálogos Operativos
            </h1>
          </div>
          <p className="text-[var(--color-text-secondary)] mt-1 ml-10">
            Administre valores de uso común como canales de venta, métodos de pago o tipos de comprobantes comerciales.
          </p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl border p-4 shadow-sm flex flex-col min-h-0">
        <Tabs defaultValue="medios_pago" className="flex flex-col h-full w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl shrink-0">
            <TabsTrigger value="medios_pago">Medios de Pago</TabsTrigger>
            <TabsTrigger value="comprobantes">Comprobantes</TabsTrigger>
            <TabsTrigger value="origenes">Orígenes (Lead)</TabsTrigger>
          </TabsList>

          <div className="mt-4 flex-1 min-h-0">
            <TabsContent value="medios_pago" className="h-full m-0 data-[state=inactive]:hidden">
              <GenericCatalog
                data={mediosPago}
                config={{
                  tableName: "medio_pago",
                  title: "Medios de Pago",
                }}
              />
            </TabsContent>
            <TabsContent value="comprobantes" className="h-full m-0 data-[state=inactive]:hidden">
              <GenericCatalog
                data={comprobantes}
                config={{
                  tableName: "tipo_comprobante",
                  title: "Tipos de Comprobante",
                  extraBool: {
                    name: "requiere_documento",
                    label: "Requiere Documento",
                    description: "Solicita DNI/RUC al momento de facturar.",
                  },
                }}
              />
            </TabsContent>
            <TabsContent value="origenes" className="h-full m-0 data-[state=inactive]:hidden">
              <GenericCatalog
                data={origenes}
                config={{
                  tableName: "origen_lead",
                  title: "Orígenes de Lead",
                  extraBool: {
                    name: "reclutador_required",
                    label: "Requiere Reclutador",
                    description: "Obliga a detallar qué promotor captó al alumno.",
                  },
                }}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
