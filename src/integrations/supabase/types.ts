export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      eventos: {
        Row: {
          created_at: string | null
          created_by: string | null
          descripcion: string | null
          fecha: string
          hora: string | null
          id: string
          materia_id: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          fecha: string
          hora?: string | null
          id?: string
          materia_id?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          fecha?: string
          hora?: string | null
          id?: string
          materia_id?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
        ]
      }
      materiales: {
        Row: {
          created_at: string | null
          created_by: string | null
          descripcion: string | null
          id: string
          materia_id: string
          tipo: string
          titulo: string
          url: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          id?: string
          materia_id: string
          tipo: string
          titulo: string
          url: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          descripcion?: string | null
          id?: string
          materia_id?: string
          tipo?: string
          titulo?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "materiales_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
        ]
      }
      materias: {
        Row: {
          color: string | null
          created_at: string | null
          descripcion: string | null
          icono: string | null
          id: string
          nombre: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          descripcion?: string | null
          icono?: string | null
          id?: string
          nombre: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          descripcion?: string | null
          icono?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      mensajes: {
        Row: {
          asunto: string
          created_at: string | null
          destinatario_id: string
          id: string
          leido: boolean | null
          mensaje: string
          remitente_id: string
        }
        Insert: {
          asunto: string
          created_at?: string | null
          destinatario_id: string
          id?: string
          leido?: boolean | null
          mensaje: string
          remitente_id: string
        }
        Update: {
          asunto?: string
          created_at?: string | null
          destinatario_id?: string
          id?: string
          leido?: boolean | null
          mensaje?: string
          remitente_id?: string
        }
        Relationships: []
      }
      noticias: {
        Row: {
          autor: string
          contenido: string
          created_at: string | null
          created_by: string | null
          destacada: boolean | null
          id: string
          imagen_url: string | null
          titulo: string
        }
        Insert: {
          autor: string
          contenido: string
          created_at?: string | null
          created_by?: string | null
          destacada?: boolean | null
          id?: string
          imagen_url?: string | null
          titulo: string
        }
        Update: {
          autor?: string
          contenido?: string
          created_at?: string | null
          created_by?: string | null
          destacada?: boolean | null
          id?: string
          imagen_url?: string | null
          titulo?: string
        }
        Relationships: []
      }
      preguntas: {
        Row: {
          activa: boolean | null
          created_at: string | null
          created_by: string | null
          explicacion: string | null
          id: string
          imagen_url: string | null
          materia_id: string
          opcion_a: string
          opcion_b: string
          opcion_c: string
          opcion_d: string
          pregunta: string
          respuesta_correcta: string
          updated_at: string | null
        }
        Insert: {
          activa?: boolean | null
          created_at?: string | null
          created_by?: string | null
          explicacion?: string | null
          id?: string
          imagen_url?: string | null
          materia_id: string
          opcion_a: string
          opcion_b: string
          opcion_c: string
          opcion_d: string
          pregunta: string
          respuesta_correcta: string
          updated_at?: string | null
        }
        Update: {
          activa?: boolean | null
          created_at?: string | null
          created_by?: string | null
          explicacion?: string | null
          id?: string
          imagen_url?: string | null
          materia_id?: string
          opcion_a?: string
          opcion_b?: string
          opcion_c?: string
          opcion_d?: string
          pregunta?: string
          respuesta_correcta?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preguntas_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activo: boolean | null
          created_at: string | null
          email: string
          id: string
          nombre: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          email: string
          id: string
          nombre: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          nombre?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      resultados_simulacro: {
        Row: {
          created_at: string | null
          detalles: Json | null
          id: string
          puntaje: number
          respuestas_correctas: number
          tiempo_segundos: number
          total_preguntas: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          detalles?: Json | null
          id?: string
          puntaje: number
          respuestas_correctas: number
          tiempo_segundos: number
          total_preguntas: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          detalles?: Json | null
          id?: string
          puntaje?: number
          respuestas_correctas?: number
          tiempo_segundos?: number
          total_preguntas?: number
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "profesor" | "estudiante"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "profesor", "estudiante"],
    },
  },
} as const
