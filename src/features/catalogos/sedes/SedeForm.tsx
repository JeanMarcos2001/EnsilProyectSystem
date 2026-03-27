"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sedeSchema, SedeFormValues } from "./schema";
import { upsertSede } from "./actions";

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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";

interface SedeFormProps {
  initialData?: Partial<SedeFormValues>;
  empresas: { id: string; razon_social: string; ruc: string }[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SedeForm({ initialData, empresas, onSuccess, onCancel }: SedeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const defaultEmpresaId = initialData?.empresa_id || (empresas.length > 0 ? empresas[0].id : "");

  const form = useForm<SedeFormValues>({
    // @ts-expect-error
    resolver: zodResolver(sedeSchema),
    defaultValues: {
      id: initialData?.id || undefined,
      empresa_id: defaultEmpresaId,
      nombre: initialData?.nombre || "",
      ciudad: initialData?.ciudad || "",
      direccion: initialData?.direccion || "",
      telefono: initialData?.telefono || "",
      estado: initialData?.estado ?? true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        id: initialData.id,
        empresa_id: initialData.empresa_id || defaultEmpresaId,
        nombre: initialData.nombre || "",
        ciudad: initialData.ciudad || "",
        direccion: initialData.direccion || "",
        telefono: initialData.telefono || "",
        estado: initialData.estado ?? true,
      });
    }
  }, [initialData, form, defaultEmpresaId]);

  async function onSubmit(data: SedeFormValues) {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      const result = await upsertSede(data);
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

  return (
    // @ts-expect-error
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
        {globalError && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
            {globalError}
          </div>
        )}

        <FormField
          control={form.control}
          name="empresa_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa Matriz</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Seleccione la Empresa" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {empresas.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.razon_social} ({e.ruc})
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
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Sede</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Sede Central Norte" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ciudad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciudad (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Lima" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono / Anexo (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. (01) 555-5555" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección Completa (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Av. Primavera 123" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estado"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-white">
              <div className="space-y-0.5">
                <FormLabel className="text-base text-[var(--color-text-primary)]">Estado Operativo</FormLabel>
                <div className="text-sm text-[var(--color-text-muted)]">
                  Indica si la sede está activa y visible en el sistema.
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
            Guardar Sede
          </Button>
        </div>
      </form>
    </Form>
  );
}
