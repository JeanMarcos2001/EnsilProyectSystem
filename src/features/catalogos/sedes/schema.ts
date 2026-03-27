import { z } from "zod";

export const sedeSchema = z.object({
  id: z.string().uuid().optional(),
  empresa_id: z.string().uuid("Seleccione una empresa matriz"),
  nombre: z.string().min(3, "El nombre de la sede es obligatorio (mín 3 caracteres)"),
  ciudad: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  estado: z.boolean().default(true),
});

export type SedeFormValues = z.infer<typeof sedeSchema>;
