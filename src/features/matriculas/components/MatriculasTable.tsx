"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconSearch, IconEye, IconUserCircle } from "@tabler/icons-react";

export function MatriculasTable({ data }: { data: any[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data.filter((m) => {
    const term = searchTerm.toLowerCase();
    const alumnoStr = `${m.alumno?.nombre} ${m.alumno?.apellido_paterno} ${m.alumno?.numero_documento}`.toLowerCase();
    const titularStr = `${m.titular?.nombre} ${m.titular?.apellido_paterno}`.toLowerCase();
    return alumnoStr.includes(term) || titularStr.includes(term) || m.id.includes(term);
  });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activa': return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'borrador': return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
      case 'anulada': return 'bg-red-100 text-red-700 hover:bg-red-100';
      case 'finalizada': return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Buscador Local */}
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <div className="relative w-full max-w-sm">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Buscar por DNI, Alumno o Expediente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-gray-50/50"
          />
        </div>
      </div>

      {/* Tabla Responsiva */}
      <div className="flex-1 overflow-auto border rounded-lg">
        <Table>
          <TableHeader className="bg-gray-50 sticky top-0 z-10">
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Alumno</TableHead>
              <TableHead>Titular</TableHead>
              <TableHead>Académico</TableHead>
              <TableHead>Sede</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Operaciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((m) => (
                <TableRow key={m.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {new Date(m.fecha_matricula).toLocaleDateString('es-PE')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <IconUserCircle className="w-4 h-4 text-gray-400" />
                       <span className="font-semibold text-gray-800">{m.alumno?.nombre} {m.alumno?.apellido_paterno}</span>
                    </div>
                    <span className="text-xs text-gray-500 block ml-6">{m.alumno?.tipo_documento}: {m.alumno?.numero_documento}</span>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {m.titular?.nombre} {m.titular?.apellido_paterno}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-[var(--color-primary)]">{m.programa?.nombre}</div>
                    <div className="text-xs text-gray-500">{m.nivel?.nombre}</div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {m.filial?.nombre}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`font-semibold shrink-0 cursor-default ${getEstadoColor(m.estado)}`}>
                      {m.estado.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => router.push(`/matriculas/${m.id}`)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <IconEye className="w-4 h-4 mr-1.5" />
                      Expediente
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
