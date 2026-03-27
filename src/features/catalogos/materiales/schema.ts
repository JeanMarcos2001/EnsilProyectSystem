import { z } from "zod";

export const materialSchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z.string().min(2, "El nombre del material es requerido"),
  tipo: z.string().min(1, "El tipo es requerido"),
  unidad: z.string().min(1, "La unidad es requerida"),
  estado: z.boolean(),
});

export const recetaSchema = z.object({
  id: z.string().uuid().optional(),
  nivel_id: z.string().uuid("ID de nivel requerido"),
  material_id: z.string().uuid("Material requerido"),
  cantidad: z.union([z.number(), z.string()]).transform(Number),
});

export type MaterialFormValues = z.infer<typeof materialSchema>;
export type RecetaFormValues = z.infer<typeof recetaSchema>;
