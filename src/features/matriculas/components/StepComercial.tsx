"use client";

import { useEffect, useState } from "react";
import { useMatriculaStore } from "../store";
import { 
  getOrigenesLeadActivos, 
  getTiposPagoActivos, 
  getTarifarioActivo, 
  getPromocionesValidas 
} from "../actions";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { IconReceipt2, IconTags, IconSpeakerphone, IconCoins, IconAlertCircle } from "@tabler/icons-react";

export function StepComercial() {
  const { academico, comercial, setComercial, setPlanBase, planBase } = useMatriculaStore();

  const [origenes, setOrigenes] = useState<any[]>([]);
  const [tiposPago, setTiposPago] = useState<any[]>([]);
  const [promociones, setPromociones] = useState<any[]>([]);

  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);
  const [isFetchingTarifario, setIsFetchingTarifario] = useState(false);
  const [errorTarifario, setErrorTarifario] = useState<string | null>(null);

  // Cargar catalogos
  useEffect(() => {
    async function loadCatalogos() {
      setIsLoadingCatalogs(true);
      const [oData, tData] = await Promise.all([
        getOrigenesLeadActivos(),
        getTiposPagoActivos()
      ]);
      setOrigenes(oData);
      setTiposPago(tData);
      setIsLoadingCatalogs(false);
    }
    loadCatalogos();
  }, []);

  // Cargar promociones aplicables si ya tenemos Sede y Programa
  useEffect(() => {
    async function fetchPromos() {
      if (academico.filial_id && academico.programa_id) {
        const pData = await getPromocionesValidas(academico.filial_id, academico.programa_id);
        setPromociones(pData);
      } else {
        setPromociones([]);
      }
    }
    fetchPromos();
  }, [academico.filial_id, academico.programa_id]);

  // Cargar Tarifario Activo cuando cambia el Tipo de Pago, Programa o Nivel
  useEffect(() => {
    async function loadTarifario() {
      if (!academico.programa_id || !academico.nivel_id || !comercial.tipo_pago_id) {
        setPlanBase(null as any);
        setComercial({ tarifario_id: null });
        return;
      }
      
      setIsFetchingTarifario(true);
      setErrorTarifario(null);

      try {
        const tarifario = await getTarifarioActivo(
          academico.programa_id, 
          academico.nivel_id, 
          comercial.tipo_pago_id
        );

        if (tarifario) {
          setComercial({ tarifario_id: tarifario.id });
          
          // Guardamos un snapshot base del plan (luego el simulador aplica descuentos)
          const tp = tiposPago.find(t => t.id === comercial.tipo_pago_id);
          
          setPlanBase({
            costo_matricula: Number(tarifario.precio_matricula),
            costo_total: Number(tarifario.precio_total),
            costo_cuota: Number(tarifario.precio_cuota_base || 0),
            cantidad_cuotas: tp ? Number(tp.cantidad_cuotas) : 1,
            moneda: 'PEN'
          });

        } else {
          setPlanBase(null as any);
          setComercial({ tarifario_id: null });
          setErrorTarifario("No se encontró un tarifario activo para esta combinación.");
        }
      } catch (err) {
        setErrorTarifario("Error al buscar el tarifario.");
      } finally {
        setIsFetchingTarifario(false);
      }
    }
    loadTarifario();
  }, [academico.programa_id, academico.nivel_id, comercial.tipo_pago_id, tiposPago]); // setPlanBase / setComercial are stable from Zustand

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="p-4 sm:p-6 bg-white rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1 text-[var(--color-text-primary)]">Perfil Comercial</h2>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Determine la vía de ingreso, opciones de pago y si aplica alguna promoción disponible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Col 1 */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-gray-700">
                <IconSpeakerphone className="w-4 h-4 text-purple-600" /> Origen del Prospecto (Lead)
              </Label>
              <Select 
                value={comercial.origen_lead_id || "none"} 
                onValueChange={(val) => setComercial({ origen_lead_id: val === "none" ? null : val })}
                disabled={isLoadingCatalogs}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Opcional: ¿Cómo nos conoció?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- No especificado --</SelectItem>
                  {origenes.map(o => (
                    <SelectItem key={o.id} value={o.id}>{o.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-gray-700">
                <IconReceipt2 className="w-4 h-4 text-blue-600" /> Tipo de Pago
              </Label>
              <Select 
                value={comercial.tipo_pago_id || ""} 
                onValueChange={(val) => setComercial({ tipo_pago_id: val })}
                disabled={isLoadingCatalogs}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Seleccione el plan de pago" />
                </SelectTrigger>
                <SelectContent>
                  {tiposPago.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.nombre} ({t.cantidad_cuotas} cuotas)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-gray-700">
                <IconTags className="w-4 h-4 text-pink-600" /> Promociones y Descuentos
              </Label>
              <Select 
                value={comercial.promocion_id || "none"} 
                onValueChange={(val) => setComercial({ promocion_id: val === "none" ? null : val })}
                disabled={promociones.length === 0}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder={promociones.length > 0 ? "Seleccionar promoción..." : "No hay promociones vigentes"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Sin promoción (Precio Regular) --</SelectItem>
                  {promociones.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre} ({p.monto_descuento ? `-S/${p.monto_descuento}` : `-${p.porcentaje_descuento}%`})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cuadro Resumen Tarifario */}
            <div className={`p-4 rounded-xl border-2 ${planBase ? 'border-green-100 bg-green-50/50' : 'border-dashed border-gray-200 bg-gray-50'}`}>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-gray-700">
                <IconCoins className="w-4 h-4 text-green-600" />
                Tarifario Base (Pre-descuentos)
              </h3>
              
              {isFetchingTarifario ? (
                <div className="h-16 flex items-center justify-center text-sm text-gray-500">
                  <span className="animate-pulse">Consultando tarifario vigente...</span>
                </div>
              ) : errorTarifario ? (
                <div className="p-2 bg-red-50 text-red-600 text-sm rounded flex items-start gap-2">
                  <IconAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{errorTarifario}</p>
                </div>
              ) : planBase ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs">Pago Inicial (Matrícula)</span>
                    <span className="font-medium text-gray-900">S/ {planBase.costo_matricula.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Costo Programa</span>
                    <span className="font-medium text-gray-900">S/ {planBase.costo_total.toFixed(2)}</span>
                  </div>
                  {planBase.cantidad_cuotas > 1 && (
                    <div className="col-span-2 border-t border-green-100 pt-2 mt-1">
                      <span className="text-gray-500 block text-xs">Estructura Regular</span>
                      <span className="font-medium text-green-700">{planBase.cantidad_cuotas} cuotas de S/ {planBase.costo_cuota.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-400 text-center py-4">
                  Seleccione un Tipo de Pago para ver los costos.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
