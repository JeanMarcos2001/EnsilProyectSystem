"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { materialSchema, MaterialFormValues } from "./schema";
import { upsertMaterial } from "./actions";

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
import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";

interface MaterialFormProps {
  initialData?: Partial<MaterialFormValues>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TIPOS_MATERIAL = [
  "libro",
  "anillado",
  "maletin",
  "veloptico",
  "flashcard",
  "modulo",
  "otro",
];

export function MaterialForm({ initialData, onSuccess, onCancel }: MaterialFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema) as any,
    defaultValues: {
      id: initialData?.id || undefined,
      nombre: initialData?.nombre || "",
      tipo: initialData?.tipo || "libro",
      unidad: initialData?.unidad || "unidad",
      estado: initialData?.estado ?? true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        id: initialData.id,
        nombre: initialData.nombre || "",
        tipo: initialData.tipo || "libro",
        unidad: initialData.unidad || "unidad",
        estado: initialData.estado ?? true,
      });
    }
  }, [initialData, form]);

  async function onSubmit(data: MaterialFormValues) {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      const result = await upsertMaterial(data);
      if (result.error) {
        setGlobalError(result.error);
      } else {
        form.reset();
        onSuccess?.();
      }
    } catch (e: any) {
      setGlobalError("Ocurrió un error inesperado: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...(form as any)}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
        {globalError && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {globalError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Nombre del Material</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Libro Kids Nivel 1" {...field} />
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
                <FormLabel>Tipo de Material</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIPOS_MATERIAL.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
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
            name="unidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad de Medida</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. unidad, caja, set" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 col-span-1 md:col-span-2 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Material Activo</FormLabel>
                  <div className="text-sm text-[var(--color-text-muted)]">
                    Solo los materiales activos se pueden asignar a las recetas de los niveles.
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

        <div className="flex justify-end space-x-2 pt-4 border-t">
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
            Guardar Material
          </Button>
        </div>
      </form>
    </Form>
  );
}
