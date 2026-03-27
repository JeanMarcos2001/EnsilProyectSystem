"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { promocionSchema, PromocionFormValues, TIPOS_PROMOCION } from "./schema";
import { upsertPromocion } from "./actions";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";

interface PromocionFormProps {
  initialData?: Partial<PromocionFormValues>;
  dependencias: {
    filiales: any[];
    programas: any[];
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PromocionForm({ initialData, dependencias, onSuccess, onCancel }: PromocionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<PromocionFormValues>({
    // @ts-ignore
    resolver: zodResolver(promocionSchema) as any,
    defaultValues: {
      id: initialData?.id || undefined,
      nombre: initialData?.nombre || "",
      tipo: initialData?.tipo || "descuento_porcentaje",
      valor: initialData?.valor || 0,
      vigencia_desde: initialData?.vigencia_desde 
        ? new Date(initialData.vigencia_desde).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0],
      vigencia_hasta: initialData?.vigencia_hasta 
        ? new Date(initialData.vigencia_hasta).toISOString().split('T')[0] 
        : undefined,
      estado: initialData?.estado ?? true,
      filiales_ids: initialData?.filiales_ids || [],
      programas_ids: initialData?.programas_ids || [],
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        id: initialData.id,
        nombre: initialData.nombre || "",
        tipo: initialData.tipo || "descuento_porcentaje",
        valor: initialData.valor || 0,
        vigencia_desde: initialData.vigencia_desde 
          ? new Date(initialData.vigencia_desde).toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0],
        vigencia_hasta: initialData.vigencia_hasta 
          ? new Date(initialData.vigencia_hasta).toISOString().split('T')[0] 
          : undefined,
        estado: initialData.estado ?? true,
        filiales_ids: initialData.filiales_ids || [],
        programas_ids: initialData.programas_ids || [],
      });
    }
  }, [initialData, form]);

  async function onSubmit(data: PromocionFormValues) {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      const result = await upsertPromocion(data);
      if (result.error) {
        setGlobalError(result.error);
      } else {
        form.reset();
        onSuccess?.();
      }
    } catch (e: any) {
      setGlobalError("Error inesperado: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const tipoValor = form.watch("tipo");
  const requiereValor = tipoValor === "descuento_porcentaje" || tipoValor === "descuento_monto";

  return (
    <Form {...(form as any)}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
        {globalError && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
            {globalError}
          </div>
        )}

        {/* Sección General */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2">Datos Generales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel>Nombre de la Promoción</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Cyber Kids 20% OFF" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Promoción</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Seleccione Tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIPOS_PROMOCION.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor {requiereValor ? "" : "(Opcional)"}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      placeholder="0" 
                      disabled={!requiereValor} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vigencia_desde"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inicio Vigencia</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vigencia_hasta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fin Vigencia (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Sección Relaciones M:M */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2">Alcance de la Promoción</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="filiales_ids"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Sedes (Filiales)</FormLabel>
                    <FormDescription>
                      Seleccione las sedes donde aplica.
                    </FormDescription>
                  </div>
                  <div className="space-y-2 border p-3 rounded-md bg-white max-h-40 overflow-y-auto w-full max-w-sm">
                    {dependencias.filiales.map((f) => (
                      <FormField
                        key={f.id}
                        control={form.control}
                        name="filiales_ids"
                        render={({ field }) => {
                          return (
                            <FormItem key={f.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(f.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, f.id])
                                      : field.onChange(field.value?.filter((value) => value !== f.id))
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm cursor-pointer leading-tight">
                                {f.nombre}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="programas_ids"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Programas</FormLabel>
                    <FormDescription>
                      Seleccione los programas donde aplica.
                    </FormDescription>
                  </div>
                  <div className="space-y-2 border p-3 rounded-md bg-white max-h-40 overflow-y-auto w-full max-w-sm">
                    {dependencias.programas.map((p) => (
                      <FormField
                        key={p.id}
                        control={form.control}
                        name="programas_ids"
                        render={({ field }) => {
                          return (
                            <FormItem key={p.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(p.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, p.id])
                                      : field.onChange(field.value?.filter((value) => value !== p.id))
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm cursor-pointer leading-tight">
                                {p.nombre}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="estado"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-white">
              <div className="space-y-0.5">
                <FormLabel className="text-base text-[var(--color-text-primary)]">Promoción Activa</FormLabel>
                <div className="text-sm text-[var(--color-text-muted)]">
                  Indica si la promoción puede ser seleccionada.
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4 border-t mt-6">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            style={{ backgroundColor: "var(--color-accent)", color: "white" }}
          >
            {isSubmitting ? (
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <IconDeviceFloppy className="mr-2 h-4 w-4" />
            )}
            Guardar Promoción
          </Button>
        </div>
      </form>
    </Form>
  );
}
