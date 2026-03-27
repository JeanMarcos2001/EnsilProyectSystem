"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { upsertCatalogo, toggleEstadoCatalogo } from "./actions";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { IconPlus, IconEdit, IconLoader2, IconDeviceFloppy, IconSearch } from "@tabler/icons-react";

interface CatalogConfig {
  tableName: string;
  title: string;
  extraBool?: {
    name: string;
    label: string;
    description: string;
  };
}

interface GenericCatalogProps {
  data: any[];
  config: CatalogConfig;
}

export function GenericCatalog({ data, config }: GenericCatalogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<any>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      id: undefined,
      nombre: "",
      estado: true,
      [config.extraBool?.name || "__none"]: false,
    },
  });

  const handleCreate = () => {
    setEditingData(null);
    form.reset({
      id: undefined,
      nombre: "",
      estado: true,
      ...(config.extraBool ? { [config.extraBool.name]: false } : {}),
    });
    setGlobalError(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingData(item);
    form.reset({
      id: item.id,
      nombre: item.nombre,
      estado: item.estado,
      ...(config.extraBool ? { [config.extraBool.name]: item[config.extraBool.name] ?? false } : {}),
    });
    setGlobalError(null);
    setIsDialogOpen(true);
  };

  const handleToggle = async (id: string, estadoActual: boolean) => {
    await toggleEstadoCatalogo(config.tableName, id, estadoActual);
  };

  const onSubmit = async (values: any) => {
    if (!values.nombre || values.nombre.trim() === "") {
        setGlobalError("El nombre es obligatorio.");
        return;
    }

    setIsSubmitting(true);
    setGlobalError(null);
    const result = await upsertCatalogo(config.tableName, values);
    if (result.error) {
      setGlobalError(result.error);
    } else {
      setIsDialogOpen(false);
    }
    setIsSubmitting(false);
  };

  const filteredData = data.filter((item) =>
    item.nombre.toLowerCase().includes(globalFilter.toLowerCase())
  );

  return (
    <div className="space-y-4 h-full flex flex-col pt-2">
      <div className="flex flex-col sm:flex-row justify-between shrink-0 gap-4">
        <div className="relative w-full sm:w-80">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder={`Buscar en ${config.title}...`}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 bg-white shadow-sm border-gray-200"
          />
        </div>
        <Button onClick={handleCreate} className="bg-[var(--color-primary)] text-white">
          <IconPlus className="mr-2 h-4 w-4" /> Nuevo Registro
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm flex-1 overflow-hidden">
        <div className="overflow-auto h-full">
          <Table>
            <TableHeader className="bg-gray-50/80 sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-[40%]">Nombre</TableHead>
                {config.extraBool && <TableHead>{config.extraBool.label}</TableHead>}
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium text-gray-700">{item.nombre}</TableCell>
                    {config.extraBool && (
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${item[config.extraBool.name] ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                          {item[config.extraBool.name] ? "Sí" : "No"}
                        </span>
                      </TableCell>
                    )}
                    <TableCell>
                      <Switch
                        checked={item.estado}
                        onCheckedChange={() => handleToggle(item.id, item.estado)}
                        className={item.estado ? "bg-green-500" : "bg-gray-300"}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <IconEdit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                    No hay registros en {config.title}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingData ? "Editar Registro" : "Nuevo Registro"}</DialogTitle>
            <DialogDescription>Ajuste los datos del catálogo de {config.title}.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {globalError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200">
                  {globalError}
                </div>
              )}
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingrese el nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {config.extraBool && (
                <FormField
                  control={form.control}
                  name={config.extraBool.name as any}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>{config.extraBool?.label}</FormLabel>
                        <div className="text-sm text-gray-500">{config.extraBool?.description}</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Activo</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-[var(--color-accent)] text-white">
                  {isSubmitting ? <IconLoader2 className="animate-spin w-4 h-4 mr-2" /> : <IconDeviceFloppy className="w-4 h-4 mr-2" />}
                  Guardar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
