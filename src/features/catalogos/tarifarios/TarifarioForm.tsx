"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tarifarioSchema, TarifarioFormValues } from "./schema";
import { upsertTarifario } from "./actions";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { IconDeviceFloppy, IconLoader2, IconAlertCircle } from "@tabler/icons-react";

interface TarifarioFormProps {
  initialData?: Partial<TarifarioFormValues>;
  dependencias: {
    filiales: any[];
    niveles: any[];
    tiposPago: any[];
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TarifarioForm({ initialData, dependencias, onSuccess, onCancel }: TarifarioFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<TarifarioFormValues>({
    // @ts-ignore
    resolver: zodResolver(tarifarioSchema) as any,
    defaultValues: {
      id: initialData?.id || undefined,
      filial_id: initialData?.filial_id || "",
      nivel_id: initialData?.nivel_id || "",
      tipo_pago_id: initialData?.tipo_pago_id || "",
      precio: initialData?.precio || 0,
      vigencia_desde: initialData?.vigencia_desde 
        ? new Date(initialData.vigencia_desde).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0],
      estado: initialData?.estado ?? true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        id: initialData.id,
        filial_id: initialData.filial_id || "",
        nivel_id: initialData.nivel_id || "",
        tipo_pago_id: initialData.tipo_pago_id || "",
        precio: initialData.precio || 0,
        vigencia_desde: initialData.vigencia_desde 
          ? new Date(initialData.vigencia_desde).toISOString().split('T')[0] 
          : new Date().toISOString().split('T')[0],
        estado: initialData.estado ?? true,
      });
    }
  }, [initialData, form]);

  async function onSubmit(data: TarifarioFormValues) {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      const result = await upsertTarifario(data);
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

  const isNew = !initialData?.id;

  return (
    <Form {...(form as any)}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
        {globalError && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
            {globalError}
          </div>
        )}

        {isNew && (
          <div className="flex bg-[var(--color-accent)]/10 text-[var(--color-text-primary)] p-3 rounded-lg border border-[var(--color-accent)]/20 items-start text-sm mb-4">
            <IconAlertCircle className="h-5 w-5 text-[var(--color-accent)] mr-2 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Regla de negocio:</strong> Si ya existe un tarifario vigente para la misma
              Sede, Nivel y Tipo de Pago, este se <strong>cerrará automáticamente</strong> un día antes del inicio de vigencia de este nuevo tarifario.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="filial_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sede / Filial</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isNew}>
                  <FormControl>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Seleccione Sede" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dependencias.filiales.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipo_pago_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Pago</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isNew}>
                  <FormControl>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Ej. Contado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dependencias.tiposPago.map((t) => (
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
            name="nivel_id"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Programa y Nivel</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isNew}>
                  <FormControl>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Seleccione combinación" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dependencias.niveles.map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.programa?.nombre} — {n.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="precio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio Total (Base)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
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
                <FormLabel>Inicio de Vigencia</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 col-span-1 md:col-span-2 shadow-sm bg-white">
                <div className="space-y-0.5">
                  <FormLabel className="text-base text-[var(--color-text-primary)]">Tarifario Activo</FormLabel>
                  <div className="text-sm text-[var(--color-text-muted)]">
                    Permite su uso en nuevas matrículas.
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
        </div>

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
            Guardar Tarifario
          </Button>
        </div>
      </form>
    </Form>
  );
}
