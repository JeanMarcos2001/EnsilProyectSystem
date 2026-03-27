"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { IconPlus, IconLoader2 } from "@tabler/icons-react";
import { ProgramaFormValues, programaSchema } from "./schema";
import { upsertPrograma } from "./actions";

interface ProgramaFormProps {
  programa?: ProgramaFormValues;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function ProgramaForm({ programa, onSuccess, trigger }: ProgramaFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProgramaFormValues>({
    resolver: zodResolver(programaSchema),
    defaultValues: programa || {
      nombre: "",
      alias: "",
      descripcion: "",
      estado: true,
    },
  });

  async function onSubmit(data: ProgramaFormValues) {
    setIsLoading(true);
    try {
      const result = await upsertPrograma(data);
      if (result.error) {
        // En una app real usaríamos toast
        alert("Error: " + result.error);
        return;
      }
      setOpen(false);
      form.reset();
      if (onSuccess) onSuccess();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button style={{ backgroundColor: "var(--color-accent)" }}>
            <IconPlus size={18} className="mr-2" />
            Nuevo Programa
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{programa ? "Editar Programa" : "Crear Programa"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Oficial</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Pre-Kids" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alias (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre histórico" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Descripción breve" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Estado Activo</FormLabel>
                    <div className="text-sm text-slate-500">
                      Permitir matrículas en este programa
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

            <div className="flex justify-end pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="mr-2" 
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                style={{ backgroundColor: "var(--color-accent)", color: "white" }}
              >
                {isLoading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
