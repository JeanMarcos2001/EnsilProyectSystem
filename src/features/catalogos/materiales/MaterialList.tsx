"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import { IconEdit, IconPlus, IconSearch } from "@tabler/icons-react";
import { Switch } from "@/components/ui/switch";
import { MaterialForm } from "./MaterialForm";
import { toggleEstadoMaterial } from "./actions";

interface MaterialListProps {
  data: any[];
}

export function MaterialList({ data }: MaterialListProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre del Material",
      cell: ({ row }) => (
        <div className="font-medium text-[var(--color-text-primary)]">
          {row.getValue("nombre")}
        </div>
      ),
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
      cell: ({ row }) => {
        const tipo = String(row.getValue("tipo"));
        return (
          <Badge variant="outline" className="capitalize">
            {tipo}
          </Badge>
        );
      },
    },
    {
      accessorKey: "unidad",
      header: "Unidad",
      cell: ({ row }) => <span className="text-sm">{row.getValue("unidad")}</span>,
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.getValue("estado") as boolean;
        const id = row.original.id;
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={estado}
              onCheckedChange={async (newVal) => {
                await toggleEstadoMaterial(id, !newVal);
              }}
            />
            <Badge variant={estado ? "default" : "secondary"}>
              {estado ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingMaterial(row.original);
                setIsFormOpen(true);
              }}
            >
              <IconEdit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Toolbox */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)] shadow-sm">
        <div className="relative w-full sm:w-72">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <Input
            placeholder="Buscar material..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 bg-[var(--color-background)] border-[var(--color-border)] focus-visible:ring-[var(--color-accent)]"
          />
        </div>
        <Button
          onClick={() => {
            setEditingMaterial(null);
            setIsFormOpen(true);
          }}
          style={{ backgroundColor: "var(--color-accent)", color: "white" }}
          className="w-full sm:w-auto hover:opacity-90"
        >
          <IconPlus className="mr-2 h-4 w-4" />
          Nuevo Material
        </Button>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-[var(--color-surface-muted)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-[var(--color-border)]">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-[var(--color-text-muted)] font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-[var(--color-text-muted)]">
                  No se encontraron materiales registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-end space-x-2 py-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="border-[var(--color-border)] text-[var(--color-text-secondary)]"
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="border-[var(--color-border)] text-[var(--color-text-secondary)]"
        >
          Siguiente
        </Button>
      </div>

      {/* Modal Formulario */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[var(--color-text-primary)]">
              {editingMaterial ? "Editar Material" : "Nuevo Material"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <MaterialForm
              initialData={editingMaterial}
              onSuccess={() => setIsFormOpen(false)}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
