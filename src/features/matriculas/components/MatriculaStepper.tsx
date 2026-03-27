"use client";

import { useState } from "react";
import { useMatriculaStore } from "../store";
import { guardarMatriculaCheckout } from "../actions";
import { useRouter } from "next/navigation";

import { StepPersonas } from "./StepPersonas";
import { StepAcademico } from "./StepAcademico";
import { StepComercial } from "./StepComercial";
import { StepSimulador } from "./StepSimulador";
import { Button } from "@/components/ui/button";
import { IconCheck, IconChevronRight, IconChevronLeft, IconLoader2 } from "@tabler/icons-react";

const STEPS = [
  { id: 1, title: "Participantes" },
  { id: 2, title: "Académico" },
  { id: 3, title: "Comercial" },
  { id: 4, title: "Simulador" },
];

export function MatriculaStepper() {
  const router = useRouter();
  const { currentStep, nextStep, prevStep, participantes, academico, comercial, planBase, cuotasSimuladas, resetStore } = useMatriculaStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinalizar = async () => {
    setIsSubmitting(true);
    
    // Contruir payload esperado por el RPC `crear_matricula_transaccional`
    const payload = {
      titular_id: participantes.titular_id,
      titular_secundario_id: participantes.titular_secundario_id,
      alumno_id: participantes.alumno_id,
      
      programa_id: academico.programa_id,
      nivel_id: academico.nivel_id,
      filial_id: academico.filial_id,
      
      origen_lead_id: comercial.origen_lead_id,
      promocion_id: comercial.promocion_id,
      
      // Notas: Por ahora null en UI, podríamos añadir campo texto en el paso 4
      observaciones: "", 
      
      plan: {
        tipo_pago_id: comercial.tipo_pago_id,
        moneda: planBase?.moneda || 'PEN',
        costo_matricula: planBase?.costo_matricula || 0,
        costo_total: planBase?.costo_total || 0,
        costo_cuota: planBase?.costo_cuota || 0,
        cantidad_cuotas: planBase?.cantidad_cuotas || 1,
        tarifario_id_origen: comercial.tarifario_id
      },
      cuotas: cuotasSimuladas
    };

    const res = await guardarMatriculaCheckout(payload);
    
    setIsSubmitting(false);

    if (res.error) {
      alert("Error al procesar la matrícula: " + res.error);
    } else {
      alert("Matrícula procesada correctamente.");
      resetStore();
      router.push(`/matriculas`);
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 1) {
      return !participantes.titular_id || !participantes.alumno_id;
    }
    if (currentStep === 2) {
      return !academico.filial_id || !academico.programa_id || !academico.nivel_id;
    }
    if (currentStep === 3) {
      return !comercial.tipo_pago_id || !planBase;
    }
    return false;
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return <StepPersonas />;
      case 2: return <StepAcademico />;
      case 3: return <StepComercial />;
      case 4: return <StepSimulador />;
      default: return <StepPersonas />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/30 rounded-xl overflow-hidden shadow-sm border">
      
      {/* Progress Header */}
      <div className="bg-white border-b px-4 sm:px-8 py-5 flex items-center w-full overflow-x-auto shrink-0 z-10">
        <ol className="flex items-center w-full min-w-max relative z-10">
          {STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <li key={step.id} className={`flex items-center ${index !== STEPS.length - 1 ? 'w-full' : ''}`}>
                <div className="flex items-center relative gap-3">
                  <span className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 z-10 bg-white
                    font-semibold text-sm transition-colors duration-200
                    ${isActive ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : ''}
                    ${isCompleted ? 'border-green-500 bg-green-500 text-white' : ''}
                    ${!isActive && !isCompleted ? 'border-gray-300 text-gray-400' : ''}
                  `}>
                    {isCompleted ? <IconCheck size={18} stroke={3} /> : step.id}
                  </span>
                  
                  <span className={`
                    text-sm font-medium mr-4 transition-colors duration-200
                    ${isActive ? 'text-[var(--color-primary)]' : ''}
                    ${isCompleted ? 'text-green-600' : ''}
                    ${!isActive && !isCompleted ? 'text-gray-400' : ''}
                  `}>
                    {step.title}
                  </span>
                </div>

                {index !== STEPS.length - 1 && (
                  <div className={`
                    flex-1 h-0.5 mx-2 bg-gray-200 block transition-colors duration-300
                    ${isCompleted ? 'bg-green-500' : ''}
                  `}></div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Step Content Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {renderCurrentStep()}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t px-6 py-4 shrink-0 flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={currentStep === 1 || isSubmitting}
          className="w-32 bg-white"
        >
          <IconChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        {currentStep < 4 ? (
          <Button 
            onClick={nextStep} 
            disabled={isNextDisabled() || isSubmitting}
            className="w-32 bg-[var(--color-primary)] text-white"
          >
            Siguiente
            <IconChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleFinalizar} 
            disabled={isSubmitting || cuotasSimuladas.length === 0}
            className="w-auto px-6 bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90"
          >
            {isSubmitting ? (
              <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <IconCheck className="w-4 h-4 mr-2" />
            )}
            Finalizar e Insertar Matrícula
          </Button>
        )}
      </div>
    </div>
  );
}
