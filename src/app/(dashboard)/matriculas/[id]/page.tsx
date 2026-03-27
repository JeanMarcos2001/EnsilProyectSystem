import { getMatriculaById } from "@/features/matriculas/actions";
import { notFound } from "next/navigation";
import { IconArrowLeft, IconUserCircle, IconBook2, IconReceipt2, IconCheck, IconAlertCircle } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Expediente de Matrícula | Sistema ENSIL",
};

export default async function DetalleMatriculaPage({ params }: { params: { id: string } }) {
  const matricula = await getMatriculaById(params.id);

  if (!matricula) {
    return notFound();
  }

  const { alumno, titular, programa, nivel, filial, plan_snapshot, cuota } = matricula;

  // Ordenar cuotas de menor a mayor (0 es inscripción, 1,2,3 son mensuales)
  const cuotasOrdenadas = cuota ? [...cuota].sort((a, b) => a.numero - b.numero) : [];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-amber-100 text-amber-700';
      case 'pagada': return 'bg-green-100 text-green-700';
      case 'vencida': return 'bg-red-100 text-red-700';
      case 'anulada': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-2 sm:p-4 gap-4">
      {/* Header (Slim) */}
      <div className="flex items-center justify-between bg-white p-3 sm:px-6 sm:py-4 rounded-xl border shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/matriculas">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
              <IconArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">
                Expediente: {matricula.id.split('-')[0].toUpperCase()}
              </h1>
              <Badge variant="outline" className={`capitalize ${
                matricula.estado === 'activa' ? 'border-green-500 text-green-700' : 'border-gray-500 text-gray-700'
              }`}>
                {matricula.estado}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Inscrito el {new Date(matricula.fecha_matricula).toLocaleDateString('es-PE')} en Sede {filial?.nombre}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Scrollable */}
      <div className="flex-1 overflow-auto rounded-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LADO IZQUIERDO: Información */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <IconUserCircle className="w-5 h-5 text-[var(--color-primary)]" />
                Participantes
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Alumno</label>
                  <div className="font-medium text-gray-900">{alumno?.nombres} {alumno?.apellidos}</div>
                  <div className="text-sm text-gray-500">{alumno?.tipo_documento}: {alumno?.documento_identidad}</div>
                </div>

                <div className="pt-3 border-t">
                  <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Titular Financiero</label>
                  <div className="font-medium text-gray-900">{titular?.nombres} {titular?.apellidos}</div>
                  <div className="text-sm text-gray-500">{titular?.tipo_documento}: {titular?.documento_identidad}</div>
                  {titular?.celular && <div className="text-sm text-gray-500">Cel: {titular.celular}</div>}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border shadow-sm">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <IconBook2 className="w-5 h-5 text-amber-600" />
                Programa Académico
              </h3>
              
              <div className="space-y-1">
                <div className="text-lg font-bold text-[var(--color-primary)]">{programa?.nombre}</div>
                <div className="text-sm text-gray-600 font-medium">Nivel: {nivel?.nombre}</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border shadow-sm bg-gradient-to-br from-green-50 to-emerald-50/20 border-green-100">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <IconReceipt2 className="w-5 h-5 text-emerald-600" />
                Resumen Financiero
              </h3>
              
              {plan_snapshot && plan_snapshot.length > 0 ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monto Matrícula</span>
                    <span className="font-medium">S/ {Number(plan_snapshot[0].costo_matricula).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Costo Total del Programa</span>
                    <span className="font-medium">S/ {Number(plan_snapshot[0].costo_total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-green-200/60 mt-2">
                    <span className="text-gray-600">Plan Fraccionado</span>
                    <Badge variant="outline" className="bg-white">{plan_snapshot[0].cantidad_cuotas} Cuotas</Badge>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <IconAlertCircle className="w-4 h-4 text-amber-500" />
                  No se encontró foto financiera.
                </div>
              )}
            </div>
            
          </div>

          {/* LADO DERECHO: Cronograma de Cuotas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-5 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  Cronograma de Pagos (Estado de Cuenta)
                </h3>
              </div>
              
              <div className="p-0 overflow-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b">
                     <tr>
                        <th className="px-6 py-3 font-medium">Concepto</th>
                        <th className="px-6 py-3 font-medium">Vencimiento</th>
                        <th className="px-6 py-3 font-medium text-right">Monto</th>
                        <th className="px-6 py-3 font-medium text-center">Estado</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y">
                     {cuotasOrdenadas.map((c) => {
                       const vencida = c.estado === 'pendiente' && new Date(c.fecha_vencimiento) < new Date();
                       
                       return (
                         <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                           <td className="px-6 py-4 font-medium text-gray-900">
                             {c.numero === 0 ? (
                               <span className="inline-flex text-blue-700 bg-blue-50 px-2.5 py-1 rounded text-xs font-semibold">
                                 {c.nombre || "Matrícula Inicial"}
                               </span>
                             ) : (
                               c.nombre || `Cuota ${c.numero}`
                             )}
                           </td>
                           <td className={`px-6 py-4 ${vencida ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                             {new Date(c.fecha_vencimiento).toLocaleDateString('es-PE')}
                           </td>
                           <td className="px-6 py-4 text-right font-bold text-gray-900">
                             S/ {Number(c.monto).toFixed(2)}
                           </td>
                           <td className="px-6 py-4 text-center">
                             <Badge className={`font-medium ${getEstadoColor(vencida ? 'vencida' : c.estado)}`} variant="secondary">
                               {vencida ? 'VENCIDA' : c.estado.toUpperCase()}
                             </Badge>
                             
                             {c.estado === 'pagada' && (
                               <IconCheck className="w-4 h-4 text-green-600 inline ml-2" />
                             )}
                           </td>
                         </tr>
                       )
                     })}
                     
                     {cuotasOrdenadas.length === 0 && (
                       <tr>
                         <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                           No hay cuotas programadas para esta matrícula.
                         </td>
                       </tr>
                     )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
