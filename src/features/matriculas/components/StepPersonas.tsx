"use client";

import { useState } from "react";
import { useMatriculaStore } from "../store";
import { buscarPersona } from "../actions";
import { PersonaExpressForm } from "./PersonaExpressForm";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  IconSearch, 
  IconUserPlus, 
  IconId, 
  IconUser, 
  IconCheck,
  IconLoader2
} from "@tabler/icons-react";

export function StepPersonas() {
  const { participantes, setParticipantes } = useMatriculaStore();

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="p-4 sm:p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold mb-1 text-[var(--color-text-primary)]">Titular y Alumno</h2>
        <p className="text-[var(--color-text-secondary)] text-sm mb-6">
          La matrícula exige un pagador principal (Titular) y quien asistirá a clases (Alumno). Pueden ser la misma persona si el alumno es mayor de edad.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tarjeta Búsqueda Titular */}
          <BuscadorTarjeta 
            tipo="titular" 
            titulo="Datos del Titular (Pagador)" 
            descripcion="Padre, madre o apoderado financiero."
            valorActualId={participantes.titular_id}
            onSelect={(personaId) => setParticipantes({ titular_id: personaId })}
          />

          {/* Tarjeta Búsqueda Alumno */}
          <BuscadorTarjeta 
            tipo="alumno" 
            titulo="Datos del Alumno" 
            descripcion="El estudiante que tomará el programa."
            valorActualId={participantes.alumno_id}
            onSelect={(personaId) => setParticipantes({ alumno_id: personaId })}
          />
        </div>
      </div>
    </div>
  );
}

// ------------- COMPONENTE INTERNO DE BUSCADOR -------------

interface BuscadorTarjetaProps {
  tipo: "titular" | "alumno";
  titulo: string;
  descripcion: string;
  valorActualId: string | null;
  onSelect: (id: string | null) => void;
}

function BuscadorTarjeta({ tipo, titulo, descripcion, valorActualId, onSelect }: BuscadorTarjetaProps) {
  const [docSearch, setDocSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [errorNotFound, setErrorNotFound] = useState(false);
  
  // Modal de registro express
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Datos locales de la persona encontrada para mostrar su nombre
  const [personaVisual, setPersonaVisual] = useState<any>(null);

  const handleSearch = async () => {
    if (!docSearch.trim() || docSearch.length < 5) return;
    
    setIsSearching(true);
    setErrorNotFound(false);
    
    try {
      const persona = await buscarPersona(docSearch);
      if (persona) {
        setPersonaVisual(persona);
        onSelect(persona.id);
      } else {
        setPersonaVisual(null);
        setErrorNotFound(true);
      }
    } catch (e) {
      console.error(e);
      setPersonaVisual(null);
      setErrorNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setDocSearch("");
    setPersonaVisual(null);
    setErrorNotFound(false);
    onSelect(null);
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-1">
        <IconUser className="w-5 h-5 text-gray-500" />
        <h3 className="font-semibold text-gray-800">{titulo}</h3>
      </div>
      <p className="text-xs text-gray-500 mb-4">{descripcion}</p>

      {/* Si ya hay una persona seleccionada */}
      {valorActualId && personaVisual ? (
        <div className="bg-white border border-green-200 rounded-md p-3 flex flex-col gap-2 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-green-700 font-medium">
                <IconCheck className="w-4 h-4" />
                <span>{personaVisual.nombre} {personaVisual.apellido_paterno}</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5 ml-6">
                {personaVisual.tipo_documento}: {personaVisual.numero_documento}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClear} className="h-7 text-xs text-red-600 hover:bg-red-50 mt-1 self-start ml-4">
            Quitar Selección
          </Button>
        </div>
      ) : (
        /* Si NO hay persona seleccionada -> Mostrar Búsqueda */
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <IconId className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="DNI / CE" 
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9 bg-white"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || docSearch.length < 5} 
              variant="secondary"
            >
              {isSearching ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <IconSearch className="w-4 h-4" />}
            </Button>
          </div>

          {errorNotFound && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-3 text-sm flex flex-col gap-2">
              <p>Persona no encontrada en la base de datos.</p>
              <Button 
                onClick={() => setIsModalOpen(true)}
                size="sm" 
                className="bg-amber-600 hover:bg-amber-700 self-start"
              >
                <IconUserPlus className="w-4 h-4 mr-1.5" />
                Registrar Rápidamente
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-gray-50 border-b">
            <DialogTitle>Registro Express - {titulo}</DialogTitle>
            <DialogDescription>
              Añade rápidamente a la persona al sistema para asignarla.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <PersonaExpressForm 
              initialDocumento={docSearch}
              defaultTipoPersona={tipo}
              onCancel={() => setIsModalOpen(false)}
              onSuccess={(nuevaPersona) => {
                setPersonaVisual(nuevaPersona);
                onSelect(nuevaPersona.id);
                setIsModalOpen(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
