import { create } from "zustand";

export interface ParticipantesData {
  titular_id: string | null;
  titular_secundario_id: string | null;
  alumno_id: string | null;
}

export interface AcademicoData {
  filial_id: string | null;
  programa_id: string | null;
  nivel_id: string | null;
}

export interface ComercialData {
  origen_lead_id: string | null;
  tipo_pago_id: string | null;
  tarifario_id: string | null;
  promocion_id: string | null;
}

export interface CuotaSimulada {
  numero: number;
  nombre: string;
  monto: number;
  fecha_vencimiento: string;
}

export interface PlanFinancieroData {
  costo_matricula: number;
  costo_total: number;
  costo_cuota: number;
  cantidad_cuotas: number;
  moneda: string;
}

interface MatriculaState {
  currentStep: number;
  
  participantes: ParticipantesData;
  academico: AcademicoData;
  comercial: ComercialData;
  
  planBase: PlanFinancieroData | null;
  cuotasSimuladas: CuotaSimulada[];
  
  observaciones: string;
  
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  setParticipantes: (data: Partial<ParticipantesData>) => void;
  setAcademico: (data: Partial<AcademicoData>) => void;
  setComercial: (data: Partial<ComercialData>) => void;
  setPlanBase: (data: PlanFinancieroData) => void;
  setCuotasSimuladas: (cuotas: CuotaSimulada[]) => void;
  setObservaciones: (obs: string) => void;
  
  resetStore: () => void;
}

const initialState = {
  currentStep: 1,
  
  participantes: {
    titular_id: null,
    titular_secundario_id: null,
    alumno_id: null,
  },
  academico: {
    filial_id: null,
    programa_id: null,
    nivel_id: null,
  },
  comercial: {
    origen_lead_id: null,
    tipo_pago_id: null,
    tarifario_id: null,
    promocion_id: null,
  },
  
  planBase: null,
  cuotasSimuladas: [],
  observaciones: "",
};

export const useMatriculaStore = create<MatriculaState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

  setParticipantes: (data) => set((state) => ({ participantes: { ...state.participantes, ...data } })),
  setAcademico: (data) => set((state) => ({ academico: { ...state.academico, ...data } })),
  setComercial: (data) => set((state) => ({ comercial: { ...state.comercial, ...data } })),
  
  setPlanBase: (planBase) => set({ planBase }),
  setCuotasSimuladas: (cuotasSimuladas) => set({ cuotasSimuladas }),
  setObservaciones: (observaciones) => set({ observaciones }),

  resetStore: () => set(initialState),
}));
