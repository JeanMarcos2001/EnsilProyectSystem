"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { SedeForm } from "./SedeForm";
import { toggleEstadoSede } from "./actions";

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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  IconPlus,
  IconEdit,
  IconSearch,
  IconBuilding,
  IconMapPin,
} from "@tabler/icons-react";

interface SedesListProps {
  data: any[];
  empresas: any[];
}

export function SedesList({ data, empresas }: SedesListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingData, setEditingData] = useState<any>(null);
  const [globalFilter, setGlobalFilter] = useState("");

  const handleEdit = (sede: any) => {
    setEditingData(sede);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingData(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingData(null);
  };

  const filteredData = data.filter((item) =>
    item.nombre.toLowerCase().includes(globalFilter.toLowerCase()) || 
    (item.ciudad && item.ciudad.toLowerCase().includes(globalFilter.toLowerCase()))
  );

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "nombre",
      header: "Sede",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium">
          <IconBuilding className="w-5 h-5 text-[var(--color-primary)]" />
          <span>{row.original.nombre}</span>
        </div>
      ),
    },
    {
      accessorKey: "empresa",
      header: "Empresa Matriz",
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {row.original.empresa?.razon_social || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "ubicacion",
      header: "Ubicación",
      cell: ({ row }) => {
        const ciudad = row.original.ciudad;
        const dir = row.original.direccion;
        if (!ciudad && !dir) return <span className="text-gray-400 italic">Sin definir</span>;
        
        return (
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
             <IconMapPin className="w-4 h-4" />
             <span className="truncate max-w-[200px]" title={`${dir || ''} - ${ciudad || ''}`}>
                {ciudad ? <strong>{ciudad}</strong> : ''}
                {ciudad && dir ? ' - ' : ''}
                {dir}
             </span>
          </div>
        );
      },
    },
    {
      accessorKey: "telefono",
      header: "Contacto",
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const [isUpdating, setIsUpdating] = useState(false);
        const { id, estado } = row.original;

        const handleToggle = async () => {
          setIsUpdating(true);
          await toggleEstadoSede(id, estado);
          setIsUpdating(false);
        };

        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={estado}
              onCheckedChange={handleToggle}
              disabled={isUpdating}
              className={`${estado ? "bg-green-500" : "bg-gray-300"}`}
            />
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              estado ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            }`}>
              {estado ? "Activo" : "Inactivo"}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row.original)}
            className="h-8 w-8 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] bg-white border border-gray-200"
          >
            <IconEdit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4 h-full flex flex-col pt-2">
      <div className="flex flex-col sm:flex-row justify-between shrink-0 gap-4">
        <div className="relative w-full sm:w-80">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por nombre o ciudad..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 bg-white shadow-sm border-gray-200 focus-visible:ring-[var(--color-primary)] rounded-lg"
          />
        </div>
        <Button 
            onClick={handleCreate}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white shadow-sm rounded-lg"
        >
          <IconPlus className="mr-2 h-4 w-4" /> Nueva Sede
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b-gray-200">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-gray-600 font-semibold uppercase tracking-wider text-xs h-10">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-gray-50/50 transition-colors border-b-gray-100"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-gray-500"
                  >
                    No se encontraron sedes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-gray-50">
          <DialogHeader className="p-6 bg-white border-b">
            <DialogTitle className="text-xl">
              {editingData ? "Editar Sede" : "Registrar Nueva Sede"}
            </DialogTitle>
            <DialogDescription>
              Complete la información de la filial.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <SedeForm 
              initialData={editingData || undefined}
              empresas={empresas}
              onSuccess={handleCloseDialog}
              onCancel={handleCloseDialog}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
