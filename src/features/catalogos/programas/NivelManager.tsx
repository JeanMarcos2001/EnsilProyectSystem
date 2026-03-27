"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconLayersLinked, IconTrash, IconLoader2, IconPlus, IconBook } from "@tabler/icons-react";
import { NivelFormValues, nivelSchema } from "./schema";
import { upsertNivel, deleteNivel } from "./actions";
import { RecetaManager } from "./RecetaManager";

interface NivelManagerProps {
  programaId: string;
  programaNombre: string;
  niveles: {
    id: string;
    nombre: string;
    duracion_meses: number;
    garantia_meses: number;
    orden: number;
  }[];
}

export function NivelManager({ programaId, programaNombre, niveles }: NivelManagerProps) {
  const [open, setOpen] = useState(false);
  const [editingNivel, setEditingNivel] = useState<Partial<NivelFormValues> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recetaNivel, setRecetaNivel] = useState<{id: string, nombre: string} | null>(null);

  const form = useForm<NivelFormValues>({
    // @ts-ignore: r-h-f types confunden input (unknown) de coerce.number con el output (number)
    resolver: zodResolver(nivelSchema) as any,
    defaultValues: {
      programa_id: programaId,
      nombre: "",
      duracion_meses: 3,
      garantia_meses: 3,
      orden: (niveles.length + 1) * 10,
    },
  });

  const resetForm = () => {
    setEditingNivel(null);
    form.reset({
      programa_id: programaId,
      nombre: "",
      duracion_meses: 3,
      garantia_meses: 3,
      orden: (niveles.length + 1) * 10,
    });
  };

  const startEdit = (nivel: any) => {
    setEditingNivel(nivel);
    form.reset({ ...nivel, programa_id: programaId });
  };

  async function onSubmit(data: NivelFormValues) {
    setIsSubmitting(true);
    try {
      const result = await upsertNivel(data);
      if (result.error) alert(result.error);
      else resetForm();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este nivel?")) return;
    try {
      const res = await deleteNivel(id);
      if (res.error) alert(res.error);
      if (editingNivel?.id === id) resetForm();
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <IconLayersLinked className="mr-2 h-4 w-4" />
          Configurar Niveles
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Niveles de {programaNombre}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Listado de Niveles */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-[var(--color-text-secondary)]">Niveles Existentes</h4>
            {niveles.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)] italic">No hay niveles configurados.</p>
            ) : (
              <ul className="divide-y rounded-md border text-sm">
                {niveles.map(n => (
                  <li key={n.id} className="flex justify-between items-center p-3 hover:bg-[var(--color-surface-muted)]">
                    <div>
                      <span className="font-medium mr-2">{n.nombre}</span>
                      <span className="text-[var(--color-text-muted)]">
                        ({n.duracion_meses} meses / {n.garantia_meses} gtia)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setRecetaNivel({id: n.id, nombre: n.nombre})}>
                        <IconBook className="mr-1 h-4 w-4" />
                        Receta
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => startEdit(n)}>Editar</Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(n.id)}>
                        <IconTrash size={16} />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            {!editingNivel && (
              <Button type="button" variant="ghost" size="sm" className="mt-2 w-full text-[var(--color-accent)]" onClick={resetForm}>
                <IconPlus className="mr-2 h-4 w-4" /> Agregar un Nuevo Nivel
              </Button>
            )}
          </div>

          {/* Formulario (Nuevo/Editar) */}
          {(editingNivel || niveles.length === 0) && (
            <div className="border rounded-md p-4 bg-[var(--color-surface-muted)]">
              <h4 className="text-sm font-semibold mb-4">
                {editingNivel ? `Edición: ${editingNivel.nombre}` : "Nuevo Nivel"}
              </h4>
              {/* @ts-ignore */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Nombre del Nivel</FormLabel>
                          <FormControl><Input placeholder="Ej. Nivel 1" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="duracion_meses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duración (meses)</FormLabel>
                          <FormControl><Input type="number" min={1} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="garantia_meses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Garantía (meses)</FormLabel>
                          <FormControl><Input type="number" min={0} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="orden"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Orden cronológico</FormLabel>
                          <FormControl><Input type="number" min={0} {...field} /></FormControl>
                          <div className="text-xs text-[var(--color-text-muted)]">Un nivel con orden menor se cursa primero.</div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    {editingNivel && (
                      <Button type="button" variant="outline" onClick={resetForm}>Cancelar Edición</Button>
                    )}
                    <Button type="submit" disabled={isSubmitting} style={{ backgroundColor: "var(--color-accent)", color: "white" }}>
                      {isSubmitting && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingNivel ? "Guardar Nivel" : "Crear Nivel"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </div>
      </DialogContent>
      {recetaNivel && (
        <RecetaManager 
          nivelId={recetaNivel.id} 
          nivelNombre={recetaNivel.nombre} 
          isOpen={!!recetaNivel} 
          onOpenChange={(v) => !v && setRecetaNivel(null)} 
        />
      )}
    </Dialog>
  );
}
