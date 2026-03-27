import { z } from "zod";

export const TIPOS_PROMOCION = [
  { id: "descuento_porcentaje", nombre: "Descuento por Porcentaje (%)" },
  { id: "descuento_monto", nombre: "Descuento por Monto Fijo (S/)" },
  { id: "2x1", nombre: "Promoción 2x1" },
  { id: "hermanos", nombre: "Descuento Hermanos" },
] as const;

export const promocionSchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z.string().min(1, "El nombre es requerido"),
  tipo: z.enum(["descuento_porcentaje", "descuento_monto", "2x1", "hermanos"]),
  valor: z.union([z.number(), z.string()]).transform(Number).optional(),
  vigencia_desde: z.string().min(1, "Fecha de inicio requerida"),
  vigencia_hasta: z.string().optional().nullable(),
  estado: z.boolean().default(true),
  
  filiales_ids: z.array(z.string().uuid()).min(1, "Seleccione al menos una sede"),
  programas_ids: z.array(z.string().uuid()).min(1, "Seleccione al menos un programa"),
});

export type PromocionFormValues = z.infer<typeof promocionSchema>;
