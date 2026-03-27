"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconBook, IconTrash, IconPlus, IconLoader2 } from "@tabler/icons-react";

import { recetaSchema, RecetaFormValues } from "../materiales/schema";
import { upsertReceta, deleteReceta, getRecetasByNivel, getMateriales } from "../materiales/actions";

interface RecetaManagerProps {
  nivelId: string;
  nivelNombre: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecetaManager({ nivelId, nivelNombre, isOpen, onOpenChange }: RecetaManagerProps) {
  const [recetas, setRecetas] = useState<any[]>([]);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const form = useForm<RecetaFormValues>({
    resolver: zodResolver(recetaSchema) as any,
    defaultValues: {
      nivel_id: nivelId,
      material_id: "",
      cantidad: 1,
    },
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recetasData, materialesData] = await Promise.all([
        getRecetasByNivel(nivelId),
        getMateriales(),
      ]);
      setRecetas(recetasData);
      // Filtramos solo materiales activos
      setMateriales(materialesData.filter((m: any) => m.estado));
    } catch (e: any) {
      console.error(e);
      alert("Error cargando datos: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      form.reset({ nivel_id: nivelId, material_id: "", cantidad: 1 });
      setShowForm(false);
    }
  }, [isOpen, nivelId]);

  const onSubmit = async (data: RecetaFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await upsertReceta(data);
      if (result.error) {
        alert(result.error);
      } else {
        await loadData();
        setShowForm(false);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Quitar este material del nivel?")) return;
    try {
      const result = await deleteReceta(id);
      if (result.error) alert(result.error);
      else loadData();
    } catch (e: any) {
      alert("Error al eliminar: " + e.message);
    }
  };

  const materialesDisponibles = materiales.filter(
    (m) => !recetas.some((r) => r.material_id === m.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Materiales de {nivelNombre}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <IconLoader2 className="animate-spin text-[var(--color-accent)]" />
            </div>
          ) : (
            <>
              {/* Lista actual de recetas */}
              <div className="space-y-2">
                {recetas.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-muted)] italic">
                    Este nivel no tiene materiales asignados.
                  </p>
                ) : (
                  <ul className="divide-y rounded-md border text-sm">
                    {recetas.map((r) => (
                      <li key={r.id} className="flex justify-between items-center p-3 hover:bg-[var(--color-surface-muted)]">
                        <div>
                          <span className="font-medium mr-2">{r.material?.nombre}</span>
                          <span className="text-[var(--color-text-muted)] border px-1.5 py-0.5 rounded-full text-xs">
                            x{r.cantidad} {r.material?.unidad}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                          onClick={() => handleDelete(r.id)}
                        >
                          <IconTrash size={16} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Botón agregar / Formulario */}
              {!showForm ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => setShowForm(true)}
                  disabled={materialesDisponibles.length === 0}
                >
                  <IconPlus className="mr-2 h-4 w-4" />
                  {materialesDisponibles.length === 0
                    ? "No hay materiales disponibles"
                    : "Asignar nuevo material"}
                </Button>
              ) : (
                <div className="bg-[var(--color-surface-muted)] p-3 rounded-md border mt-2">
                  {/* @ts-ignore */}
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-3">
                      <div className="flex gap-2">
                        <FormField
                          control={form.control}
                          name="material_id"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Seleccione material" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {materialesDisponibles.map((m) => (
                                    <SelectItem key={m.id} value={m.id}>
                                      {m.nombre} ({m.tipo})
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
                          name="cantidad"
                          render={({ field }) => (
                            <FormItem className="w-24">
                              <FormControl>
                                <Input type="number" min={1} placeholder="Cant." className="bg-white" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" size="sm" disabled={isSubmitting || !form.watch("material_id")}>
                          {isSubmitting && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Agregar
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
