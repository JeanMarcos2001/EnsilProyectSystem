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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { IconEdit, IconPlus, IconSearch, IconCurrencyDollar } from "@tabler/icons-react";
import { Switch } from "@/components/ui/switch";
import { TarifarioForm } from "./TarifarioForm";
import { toggleEstadoTarifario } from "./actions";

interface TarifarioListProps {
  data: any[];
  dependencias: {
    filiales: any[];
    niveles: any[];
    tiposPago: any[];
  };
}

export function TarifarioList({ data, dependencias }: TarifarioListProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTarifario, setEditingTarifario] = useState<any | null>(null);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "filial.nombre",
      header: "Sede",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.filial?.nombre}</span>
      ),
    },
    {
      id: "programa_nivel",
      header: "Nivel / Programa",
      accessorFn: (row) => `${row.nivel?.programa?.nombre} ${row.nivel?.nombre}`,
      cell: ({ row }) => {
        const prog = row.original.nivel?.programa?.nombre;
        const niv = row.original.nivel?.nombre;
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-[var(--color-primary)]">{prog}</span>
            <span className="text-xs text-[var(--color-text-muted)]">{niv}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "tipo_pago.nombre",
      header: "Plan",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-[var(--color-surface-muted)]">
          {row.original.tipo_pago?.nombre}
        </Badge>
      ),
    },
    {
      accessorKey: "precio",
      header: "Monto",
      cell: ({ row }) => {
        const precio = Number(row.getValue("precio"));
        return (
          <span className="font-bold text-[var(--color-accent)]">
            S/ {precio.toFixed(2)}
          </span>
        );
      },
    },
    {
      id: "vigencia",
      header: "Vigencia",
      cell: ({ row }) => {
        const desde = row.original.vigencia_desde;
        const hasta = row.original.vigencia_hasta;
        return (
          <div className="text-xs">
            <div><span className="text-[var(--color-text-muted)] mr-1">Desde:</span> {desde}</div>
            <div>
              <span className="text-[var(--color-text-muted)] mr-1">Hasta:</span> 
              {hasta ? <span className="text-red-500 font-medium">{hasta}</span> : <span className="text-green-500 font-medium">Actual</span>}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.getValue("estado") as boolean;
        const id = row.original.id;
        // Si tiene fecha "hasta" (y ya pasó), lógicamente está cerrado, 
        // pero mostramos el flag estricto de la bd.
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={estado}
              onCheckedChange={async (newVal) => {
                await toggleEstadoTarifario(id, !newVal);
              }}
            />
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
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingTarifario(row.original);
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
            placeholder="Buscar tarifario..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 bg-[var(--color-background)] border-[var(--color-border)] focus-visible:ring-[var(--color-accent)]"
          />
        </div>
        <Button
          onClick={() => {
            setEditingTarifario(null);
            setIsFormOpen(true);
          }}
          style={{ backgroundColor: "var(--color-accent)", color: "white" }}
          className="w-full sm:w-auto hover:opacity-90"
        >
          <IconPlus className="mr-2 h-4 w-4" />
          Nuevo Tarifario
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
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-[var(--color-text-muted)]">
                  No se encontraron tarifarios.
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[var(--color-surface)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-[var(--color-text-primary)]">
              <IconCurrencyDollar className="h-6 w-6 text-[var(--color-accent)]" />
              {editingTarifario ? "Editar Tarifario" : "Registrar Tarifario"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <TarifarioForm
              initialData={editingTarifario}
              dependencias={dependencias}
              onSuccess={() => setIsFormOpen(false)}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
