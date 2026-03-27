import { z } from "zod";

export const tarifarioSchema = z.object({
  id: z.string().uuid().optional(),
  filial_id: z.string().uuid("Seleccione una sede"),
  nivel_id: z.string().uuid("Seleccione un nivel"),
  tipo_pago_id: z.string().uuid("Seleccione un tipo de pago"),
  precio: z.union([z.number(), z.string()]).transform(Number).refine(val => val > 0, "El precio debe ser mayor a 0"),
  vigencia_desde: z.string().min(1, "Fecha de inicio obligatoria").transform(val => new Date(val).toISOString().split('T')[0]),
  estado: z.boolean(),
});

export type TarifarioFormValues = z.infer<typeof tarifarioSchema>;
