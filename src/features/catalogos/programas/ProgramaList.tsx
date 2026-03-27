"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { ProgramaForm } from "./ProgramaForm";
import { NivelManager } from "./NivelManager";
import { toggleEstadoPrograma } from "./actions";

// Tipo infiriendo los datos que retorna el action
type NivelData = {
  id: string;
  nombre: string;
  duracion_meses: number;
  garantia_meses: number;
  orden: number;
};

type ProgramaData = {
  id: string;
  nombre: string;
  alias: string | null;
  estado: boolean;
  niveles: NivelData[];
};

interface ProgramaListProps {
  data: ProgramaData[];
}

export function ProgramaList({ data }: ProgramaListProps) {
  const columnHelper = createColumnHelper<ProgramaData>();

  const columns = [
    columnHelper.accessor("nombre", {
      header: "Programa",
      cell: (info) => (
        <div>
          <div className="font-semibold text-[var(--color-text-primary)]">
            {info.getValue()}
          </div>
          {info.row.original.alias && (
            <div className="text-xs text-[var(--color-text-muted)]">
              Alias: {info.row.original.alias}
            </div>
          )}
        </div>
      ),
    }),
    columnHelper.accessor("niveles", {
      header: "Niveles",
      cell: (info) => {
        const niveles = info.getValue() || [];
        return (
          <div className="text-sm text-[var(--color-text-secondary)]">
            {niveles.length > 0 
              ? `${niveles.length} niveles configurados` 
              : "Sin niveles configurados"}
          </div>
        );
      },
    }),
    columnHelper.accessor("estado", {
      header: "Estado",
      cell: (info) => {
        const activo = info.getValue();
        return (
          <Badge 
            variant={activo ? "default" : "secondary"}
            className={activo 
              ? "bg-[var(--color-success-bg)] text-[var(--color-success-text)] hover:bg-[var(--color-success-bg)]" 
              : "bg-[var(--color-muted-bg)] text-[var(--color-muted-text)] hover:bg-[var(--color-muted-bg)]"
            }
          >
            {activo ? "Activo" : "Inactivo"}
          </Badge>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: (info) => {
        const p = info.row.original;
        return (
          <div className="flex items-center gap-2 justify-end">
            <NivelManager 
              programaId={p.id} 
              programaNombre={p.nombre} 
              niveles={p.niveles} 
            />
            <ProgramaForm 
              programa={{ id: p.id, nombre: p.nombre, alias: p.alias || "", descripcion: "", estado: p.estado }}
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--color-text-secondary)]">
                  <IconEdit size={16} />
                </Button>
              }
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-[var(--color-text-secondary)] hover:text-red-600 hover:bg-red-50"
              onClick={async () => {
                if(confirm(`¿Deseas cambiar el estado de ${p.nombre}?`)) {
                  await toggleEstadoPrograma(p.id, p.estado);
                }
              }}
            >
              <IconTrash size={16} />
            </Button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="space-x-2 flex justify-end">
         <ProgramaForm />
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <Table>
          <TableHeader className="bg-[var(--color-surface-muted)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-[var(--color-border)]">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-[var(--color-text-secondary)] font-medium">
                    {flexRender(
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
                <TableRow key={row.id} className="border-[var(--color-border)]">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                <TableCell colSpan={columns.length} className="h-32 text-center text-[var(--color-text-muted)]">
                  No hay programas configurados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
