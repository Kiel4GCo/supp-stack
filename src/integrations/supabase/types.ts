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
      adherence_logs: {
        Row: {
          created_at: string
          id: string
          logged_date: string
          notes: string | null
          stack_item_id: string | null
          supplement_id: string
          taken: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          logged_date: string
          notes?: string | null
          stack_item_id?: string | null
          supplement_id: string
          taken?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          logged_date?: string
          notes?: string | null
          stack_item_id?: string | null
          supplement_id?: string
          taken?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adherence_logs_stack_item_id_fkey"
            columns: ["stack_item_id"]
            isOneToOne: false
            referencedRelation: "saved_stack_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adherence_logs_supplement_id_fkey"
            columns: ["supplement_id"]
            isOneToOne: false
            referencedRelation: "supplements"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      deficiencies: {
        Row: {
          created_at: string
          description: string
          dietary_sources: string[] | null
          expected_timeframe: string | null
          id: string
          name: string
          symptoms: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          dietary_sources?: string[] | null
          expected_timeframe?: string | null
          id?: string
          name: string
          symptoms?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          dietary_sources?: string[] | null
          expected_timeframe?: string | null
          id?: string
          name?: string
          symptoms?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      deficiency_supplements: {
        Row: {
          deficiency_id: string
          id: string
          notes: string | null
          priority: number
          supplement_id: string
        }
        Insert: {
          deficiency_id: string
          id?: string
          notes?: string | null
          priority?: number
          supplement_id: string
        }
        Update: {
          deficiency_id?: string
          id?: string
          notes?: string | null
          priority?: number
          supplement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deficiency_supplements_deficiency_id_fkey"
            columns: ["deficiency_id"]
            isOneToOne: false
            referencedRelation: "deficiencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deficiency_supplements_supplement_id_fkey"
            columns: ["supplement_id"]
            isOneToOne: false
            referencedRelation: "supplements"
            referencedColumns: ["id"]
          },
        ]
      }
      email_reminder_preferences: {
        Row: {
          created_at: string
          days_of_week: string[]
          email: string
          enabled: boolean
          id: string
          last_sent_at: string | null
          reminder_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_of_week?: string[]
          email: string
          enabled?: boolean
          id?: string
          last_sent_at?: string | null
          reminder_time?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_of_week?: string[]
          email?: string
          enabled?: boolean
          id?: string
          last_sent_at?: string | null
          reminder_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_stack_items: {
        Row: {
          created_at: string
          days_of_week: string[]
          id: string
          notes: string | null
          reminder_time: string | null
          stack_id: string
          supplement_id: string
        }
        Insert: {
          created_at?: string
          days_of_week?: string[]
          id?: string
          notes?: string | null
          reminder_time?: string | null
          stack_id: string
          supplement_id: string
        }
        Update: {
          created_at?: string
          days_of_week?: string[]
          id?: string
          notes?: string | null
          reminder_time?: string | null
          stack_id?: string
          supplement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_stack_items_stack_id_fkey"
            columns: ["stack_id"]
            isOneToOne: false
            referencedRelation: "saved_stacks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_stack_items_supplement_id_fkey"
            columns: ["supplement_id"]
            isOneToOne: false
            referencedRelation: "supplements"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_stacks: {
        Row: {
          created_at: string
          id: string
          is_public: boolean | null
          name: string
          share_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          name: string
          share_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          name?: string
          share_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      supplement_interactions: {
        Row: {
          created_at: string
          description: string
          id: string
          interaction_type: string
          related_supplement_id: string
          supplement_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          interaction_type: string
          related_supplement_id: string
          supplement_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          interaction_type?: string
          related_supplement_id?: string
          supplement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplement_interactions_related_supplement_id_fkey"
            columns: ["related_supplement_id"]
            isOneToOne: false
            referencedRelation: "supplements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplement_interactions_supplement_id_fkey"
            columns: ["supplement_id"]
            isOneToOne: false
            referencedRelation: "supplements"
            referencedColumns: ["id"]
          },
        ]
      }
      supplements: {
        Row: {
          benefits: string[]
          category: Database["public"]["Enums"]["supplement_category"]
          contraindications: string[] | null
          cost_per_unit: number | null
          created_at: string
          description: string
          dietary_preferences:
            | Database["public"]["Enums"]["dietary_preference"][]
            | null
          dosage_info: string
          evidence_level: Database["public"]["Enums"]["evidence_level"]
          id: string
          image_url: string | null
          name: string
          optimal_timing: Database["public"]["Enums"]["supplement_timing"][]
          servings_per_day: number | null
          side_effects: string[] | null
          units_per_container: number | null
          updated_at: string
        }
        Insert: {
          benefits?: string[]
          category: Database["public"]["Enums"]["supplement_category"]
          contraindications?: string[] | null
          cost_per_unit?: number | null
          created_at?: string
          description: string
          dietary_preferences?:
            | Database["public"]["Enums"]["dietary_preference"][]
            | null
          dosage_info: string
          evidence_level?: Database["public"]["Enums"]["evidence_level"]
          id?: string
          image_url?: string | null
          name: string
          optimal_timing?: Database["public"]["Enums"]["supplement_timing"][]
          servings_per_day?: number | null
          side_effects?: string[] | null
          units_per_container?: number | null
          updated_at?: string
        }
        Update: {
          benefits?: string[]
          category?: Database["public"]["Enums"]["supplement_category"]
          contraindications?: string[] | null
          cost_per_unit?: number | null
          created_at?: string
          description?: string
          dietary_preferences?:
            | Database["public"]["Enums"]["dietary_preference"][]
            | null
          dosage_info?: string
          evidence_level?: Database["public"]["Enums"]["evidence_level"]
          id?: string
          image_url?: string | null
          name?: string
          optimal_timing?: Database["public"]["Enums"]["supplement_timing"][]
          servings_per_day?: number | null
          side_effects?: string[] | null
          units_per_container?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      dietary_preference:
        | "vegan"
        | "vegetarian"
        | "gluten_free"
        | "non_gmo"
        | "organic"
        | "kosher"
        | "halal"
      evidence_level: "strong" | "emerging" | "limited"
      supplement_category:
        | "vitamins"
        | "minerals"
        | "amino_acids"
        | "herbs"
        | "probiotics"
        | "omega_fatty_acids"
        | "antioxidants"
        | "adaptogens"
        | "enzymes"
        | "other"
      supplement_timing:
        | "morning"
        | "afternoon"
        | "evening"
        | "with_food"
        | "empty_stomach"
        | "before_bed"
        | "any_time"
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
      dietary_preference: [
        "vegan",
        "vegetarian",
        "gluten_free",
        "non_gmo",
        "organic",
        "kosher",
        "halal",
      ],
      evidence_level: ["strong", "emerging", "limited"],
      supplement_category: [
        "vitamins",
        "minerals",
        "amino_acids",
        "herbs",
        "probiotics",
        "omega_fatty_acids",
        "antioxidants",
        "adaptogens",
        "enzymes",
        "other",
      ],
      supplement_timing: [
        "morning",
        "afternoon",
        "evening",
        "with_food",
        "empty_stomach",
        "before_bed",
        "any_time",
      ],
    },
  },
} as const
