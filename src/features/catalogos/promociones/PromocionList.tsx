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
import { IconEdit, IconPlus, IconSearch, IconTrash, IconGift } from "@tabler/icons-react";
import { Switch } from "@/components/ui/switch";
import { PromocionForm } from "./PromocionForm";
import { toggleEstadoPromocion, deletePromocion } from "./actions";
import { TIPOS_PROMOCION } from "./schema";

interface PromocionListProps {
  data: any[];
  dependencias: {
    filiales: any[];
    programas: any[];
  };
}

export function PromocionList({ data, dependencias }: PromocionListProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any | null>(null);

  const formatTipo = (tipoKey: string) => {
    return TIPOS_PROMOCION.find(t => t.id === tipoKey)?.nombre || tipoKey;
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "nombre",
      header: "Promoción",
      cell: ({ row }) => (
        <span className="font-medium text-[var(--color-text-primary)]">{row.getValue("nombre")}</span>
      ),
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-[var(--color-surface-muted)] text-[var(--color-secondary)]">
          {formatTipo(row.getValue("tipo"))}
        </Badge>
      ),
    },
    {
      id: "alcance",
      header: "Alcance",
      cell: ({ row }) => {
        const filiales = row.original.promocion_filial;
        const programas = row.original.promocion_programa;
        return (
          <div className="text-xs space-y-1">
            <div className="flex gap-1 flex-wrap">
              <span className="text-[var(--color-text-muted)] font-medium">Sedes:</span>
              {filiales.map((f: any) => f.filial?.nombre).join(", ") || "Ninguna"}
            </div>
            <div className="flex gap-1 flex-wrap">
              <span className="text-[var(--color-text-muted)] font-medium">Programas:</span>
              {programas.map((p: any) => p.programa?.nombre).join(", ") || "Ninguno"}
            </div>
          </div>
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
              {hasta ? <span className="font-medium">{hasta}</span> : <span className="text-green-500 font-medium">Indefinido</span>}
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
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={estado}
              onCheckedChange={async (newVal) => {
                await toggleEstadoPromocion(id, !newVal);
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
        const handleDelete = async () => {
          if (confirm("¿Estás seguro de eliminar esta promoción permanentemente?")) {
            await deletePromocion(row.original.id);
          }
        };

        const mapDataToForm = () => {
          setEditingPromo({
            ...row.original,
            filiales_ids: row.original.promocion_filial.map((f: any) => f.filial_id),
            programas_ids: row.original.promocion_programa.map((p: any) => p.programa_id),
          });
          setIsFormOpen(true);
        };

        return (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={mapDataToForm}>
              <IconEdit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={handleDelete}>
              <IconTrash className="h-4 w-4" />
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
            placeholder="Buscar promoción..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 bg-[var(--color-background)] border-[var(--color-border)] focus-visible:ring-[var(--color-accent)]"
          />
        </div>
        <Button
          onClick={() => {
            setEditingPromo(null);
            setIsFormOpen(true);
          }}
          style={{ backgroundColor: "var(--color-accent)", color: "white" }}
          className="w-full sm:w-auto hover:opacity-90"
        >
          <IconPlus className="mr-2 h-4 w-4" />
          Nueva Promoción
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
                  No se encontraron promociones registradas.
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-[var(--color-surface)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-[var(--color-text-primary)]">
              <IconGift className="h-6 w-6 text-[var(--color-accent)]" />
              {editingPromo ? "Editar Promoción" : "Registrar Promoción"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <PromocionForm
              initialData={editingPromo}
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
