"use client";

import { useEffect, useState } from "react";
import { useMatriculaStore } from "../store";
import { getFilialesActivas, getProgramasActivos, getNivelesPorPrograma } from "../actions";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { IconBuilding, IconBook2, IconStairs } from "@tabler/icons-react";

export function StepAcademico() {
  const { academico, setAcademico } = useMatriculaStore();
  
  const [filiales, setFiliales] = useState<any[]>([]);
  const [programas, setProgramas] = useState<any[]>([]);
  const [niveles, setNiveles] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  // Cargar catálogos iniciales
  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      const [fData, pData] = await Promise.all([
        getFilialesActivas(),
        getProgramasActivos()
      ]);
      setFiliales(fData);
      setProgramas(pData);
      setIsLoading(false);
    }
    loadInitialData();
  }, []);

  // Cargar niveles cuando cambia el programa
  useEffect(() => {
    async function loadNiveles() {
      if (academico.programa_id) {
        const nData = await getNivelesPorPrograma(academico.programa_id);
        setNiveles(nData);
      } else {
        setNiveles([]);
      }
    }
    loadNiveles();
  }, [academico.programa_id]);

  const handleProgramaChange = (value: string) => {
    setAcademico({ programa_id: value, nivel_id: null }); // Reset nivel cuando cambia programa
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="p-4 sm:p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold mb-1 text-[var(--color-text-primary)]">Configuración Académica</h2>
        <p className="text-[var(--color-text-secondary)] text-sm mb-6">
          Seleccione la sede local, el programa de estudios y el nivel inicial con el que empezará el alumno.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sede / Filial */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-gray-700">
              <IconBuilding className="w-4 h-4 text-[var(--color-primary)]" /> Sede (Filial)
            </Label>
            <Select 
              value={academico.filial_id || ""} 
              onValueChange={(val) => setAcademico({ filial_id: val })}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Seleccione una sede..." />
              </SelectTrigger>
              <SelectContent>
                {filiales.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Programa */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-gray-700">
              <IconBook2 className="w-4 h-4 text-amber-600" /> Programa de Estudio
            </Label>
            <Select 
              value={academico.programa_id || ""} 
              onValueChange={handleProgramaChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Seleccione un programa..." />
              </SelectTrigger>
              <SelectContent>
                {programas.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nivel */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-gray-700">
              <IconStairs className="w-4 h-4 text-emerald-600" /> Nivel Inicial
            </Label>
            <Select 
              value={academico.nivel_id || ""} 
              onValueChange={(val) => setAcademico({ nivel_id: val })}
              disabled={!academico.programa_id || niveles.length === 0}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder={!academico.programa_id ? "Primero seleccione programa" : "Seleccione nivel..."} />
              </SelectTrigger>
              <SelectContent>
                {niveles.map(n => (
                  <SelectItem key={n.id} value={n.id}>{n.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
