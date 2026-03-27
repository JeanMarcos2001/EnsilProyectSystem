"use client";

import { useEffect, useState } from "react";
import { useMatriculaStore, CuotaSimulada } from "../store";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconCalculator, IconCalendarEvent, IconAlertTriangle } from "@tabler/icons-react";

export function StepSimulador() {
  const { planBase, comercial, cuotasSimuladas, setCuotasSimuladas } = useMatriculaStore();
  const [promocionAplicada, setPromocionAplicada] = useState<any>(null); // Idealmente tendríamos el objeto completo o lo calculamos aquí

  useEffect(() => {
    if (!planBase) return;

    // Aquí calcularíamos el descuento real si tuviéramos el objeto promoción completo.
    // Como solo tenemos el ID en el store, podríamos hacer un fetch o simplificar para la demo:
    // Asumiremos 0 descuento por ahora si no tenemos el dato exacto disponible sincrónicamente.
    // En produccion: const promo = promociones.find(p => p.id === comercial.promocion_id);
    let descuentoTotal = 0;
    
    const costoFinal = planBase.costo_total - descuentoTotal;
    const montoCuota = costoFinal / planBase.cantidad_cuotas;

    const nuevasCuotas: CuotaSimulada[] = [];
    const fechaActual = new Date();

    // Cuota 0: Matrícula
    if (planBase.costo_matricula > 0) {
      nuevasCuotas.push({
        numero: 0,
        nombre: "Matrícula",
        monto: planBase.costo_matricula,
        fecha_vencimiento: fechaActual.toISOString().split('T')[0]
      });
    }

    // Cuotas Regulares
    for (let i = 1; i <= planBase.cantidad_cuotas; i++) {
      const fechaVencimiento = new Date(fechaActual);
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);

      nuevasCuotas.push({
        numero: i,
        nombre: `Cuota ${i}`,
        monto: montoCuota,
        fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0]
      });
    }

    setCuotasSimuladas(nuevasCuotas);
  }, [planBase, comercial.promocion_id]);

  if (!planBase) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-red-200 bg-red-50 rounded-xl text-red-600">
        <IconAlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-80" />
        <h3 className="font-semibold">Faltan Datos Financieros</h3>
        <p className="text-sm">Por favor regrese al Paso 3 y asegúrese de que haya un Tarifario Activo seleccionado.</p>
      </div>
    );
  }

  const totalSimulado = cuotasSimuladas.reduce((acc, c) => acc + c.monto, 0);

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="p-4 sm:p-6 bg-white rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1 text-[var(--color-text-primary)]">Simulador de Plan de Pagos</h2>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Revise el desglose exacto de lo que se facturará al alumno. Estas cuotas se crearán automáticamente al procesar la matrícula.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 border rounded-lg p-4 bg-gray-50 flex flex-col justify-center">
            <div className="text-sm text-gray-500 mb-1">Costo Original</div>
            <div className="text-lg font-semibold text-gray-400 line-through">S/ {(planBase.costo_total + planBase.costo_matricula).toFixed(2)}</div>
            
            <div className="text-sm text-gray-500 mb-1 mt-4">Total a Pagar</div>
            <div className="text-2xl font-bold text-[var(--color-primary)]">S/ {totalSimulado.toFixed(2)}</div>
          </div>

          <div className="md:col-span-3 border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[100px]">Nº</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Fecha Venc.</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cuotasSimuladas.map((cuota) => (
                  <TableRow key={cuota.numero}>
                    <TableCell className="font-medium text-gray-500">
                      {cuota.numero === 0 ? "—" : cuota.numero}
                    </TableCell>
                    <TableCell>
                      {cuota.numero === 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs font-semibold">
                          {cuota.nombre}
                        </span>
                      ) : (
                        cuota.nombre
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-sm">
                        <IconCalendarEvent className="w-4 h-4 text-gray-400" />
                        {cuota.fecha_vencimiento}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      S/ {cuota.monto.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

      </div>
    </div>
  );
}
