// Tipos generados manualmente del esquema ENSIL
// En producción, usar: npx supabase gen types typescript --project-id lfxrtohmkprkkoaqecqj

export type Database = {
  public: {
    Tables: {
      empresa: {
        Row: {
          id: string
          razon_social: string
          ruc: string | null
          estado: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["empresa"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string
        }
        Update: Partial<Database["public"]["Tables"]["empresa"]["Insert"]>
      }
      filial: {
        Row: {
          id: string
          empresa_id: string
          nombre: string
          ciudad: string | null
          direccion: string | null
          telefono: string | null
          estado: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["filial"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string
        }
        Update: Partial<Database["public"]["Tables"]["filial"]["Insert"]>
      }
      usuario_perfil: {
        Row: {
          id: string
          rol_id: string
          nombre_completo: string
          email: string
          estado: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["usuario_perfil"]["Row"], "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["usuario_perfil"]["Insert"]>
      }
      // Se irán agregando tablas a medida que se creen las migraciones
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
