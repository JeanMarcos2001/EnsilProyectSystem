import { z } from "zod";

export const programaSchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  alias: z.string().optional(),
  descripcion: z.string().optional(),
  estado: z.boolean(),
});

export const nivelSchema = z.object({
  id: z.string().uuid().optional(),
  programa_id: z.string().uuid("ID de programa inválido"),
  nombre: z.string().min(2, "El nombre del nivel es requerido"),
  duracion_meses: z.coerce.number().min(1, "La duración mínima es 1 mes"),
  garantia_meses: z.coerce.number().min(0, "La garantía no puede ser negativa"),
  orden: z.coerce.number().min(0),
});

export type ProgramaFormValues = z.infer<typeof programaSchema>;
export type NivelFormValues = z.infer<typeof nivelSchema>;
