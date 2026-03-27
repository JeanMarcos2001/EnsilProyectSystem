import { z } from "zod";

export const personaExpressSchema = z.object({
  id: z.string().uuid().optional(),
  tipo_documento: z.string().default("DNI"),
  numero_documento: z.string().min(8, "Documento inválido"),
  nombre: z.string().min(2, "Obligatorio"),
  apellido_paterno: z.string().min(2, "Obligatorio"),
  apellido_materno: z.string().optional().or(z.literal('')),
  email: z.string().email("Correo inválido").optional().or(z.literal('')),
  telefono: z.string().optional().or(z.literal('')),
  fecha_nacimiento: z.string().optional().or(z.literal('')),
});

export type PersonaExpressValues = z.infer<typeof personaExpressSchema>;
