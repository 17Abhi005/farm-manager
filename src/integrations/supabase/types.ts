export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      crop_analytics: {
        Row: {
          crops_by_status: Json | null
          harvest_predictions: Json | null
          id: string
          monthly_plantings: Json | null
          productivity_metrics: Json | null
          total_area: number | null
          total_crops: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          crops_by_status?: Json | null
          harvest_predictions?: Json | null
          id?: string
          monthly_plantings?: Json | null
          productivity_metrics?: Json | null
          total_area?: number | null
          total_crops?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          crops_by_status?: Json | null
          harvest_predictions?: Json | null
          id?: string
          monthly_plantings?: Json | null
          productivity_metrics?: Json | null
          total_area?: number | null
          total_crops?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crop_attachments: {
        Row: {
          created_at: string
          crop_id: string | null
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          crop_id?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          crop_id?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crop_attachments_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_recommendations: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          reason: string
          recommended_crop: string
          soil_data: Json | null
          user_id: string
          weather_data: Json | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          reason: string
          recommended_crop: string
          soil_data?: Json | null
          user_id: string
          weather_data?: Json | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          reason?: string
          recommended_crop?: string
          soil_data?: Json | null
          user_id?: string
          weather_data?: Json | null
        }
        Relationships: []
      }
      crops: {
        Row: {
          actual_harvest_date: string | null
          area_planted: number | null
          created_at: string
          expected_harvest_date: string | null
          id: string
          name: string
          notes: string | null
          planting_date: string | null
          status: string
          updated_at: string
          user_id: string
          variety: string | null
        }
        Insert: {
          actual_harvest_date?: string | null
          area_planted?: number | null
          created_at?: string
          expected_harvest_date?: string | null
          id?: string
          name: string
          notes?: string | null
          planting_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
          variety?: string | null
        }
        Update: {
          actual_harvest_date?: string | null
          area_planted?: number | null
          created_at?: string
          expected_harvest_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          planting_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          variety?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string
          created_at: string
          expiry_date: string | null
          id: string
          location: string | null
          min_threshold: number
          name: string
          price: number | null
          quantity: number
          supplier: string | null
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          location?: string | null
          min_threshold?: number
          name: string
          price?: number | null
          quantity?: number
          supplier?: string | null
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          location?: string | null
          min_threshold?: number
          name?: string
          price?: number | null
          quantity?: number
          supplier?: string | null
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          scheduled_for: string | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      parcels: {
        Row: {
          area: number
          coordinates: string | null
          created_at: string
          crops: Json | null
          id: string
          location: string | null
          name: string
          notes: string | null
          soil_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area: number
          coordinates?: string | null
          created_at?: string
          crops?: Json | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          soil_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: number
          coordinates?: string | null
          created_at?: string
          crops?: Json | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          soil_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          farm_name: string | null
          full_name: string | null
          id: string
          location: string | null
          notifications: Json | null
          phone: string | null
          preferences: Json | null
          privacy: Json | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          farm_name?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          notifications?: Json | null
          phone?: string | null
          preferences?: Json | null
          privacy?: Json | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          farm_name?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          notifications?: Json | null
          phone?: string | null
          preferences?: Json | null
          privacy?: Json | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          crop: string | null
          date: string
          description: string
          id: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          crop?: string | null
          date: string
          description: string
          id?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          crop?: string | null
          date?: string
          description?: string
          id?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_portfolios: {
        Row: {
          average_cost: number
          created_at: string
          id: string
          shares: number
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          average_cost?: number
          created_at?: string
          id?: string
          shares?: number
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          average_cost?: number
          created_at?: string
          id?: string
          shares?: number
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weather_data: {
        Row: {
          conditions: string | null
          created_at: string
          forecast_date: string
          humidity: number | null
          id: string
          location: string
          rainfall: number | null
          temperature: number | null
          user_id: string | null
          wind_speed: number | null
        }
        Insert: {
          conditions?: string | null
          created_at?: string
          forecast_date: string
          humidity?: number | null
          id?: string
          location: string
          rainfall?: number | null
          temperature?: number | null
          user_id?: string | null
          wind_speed?: number | null
        }
        Update: {
          conditions?: string | null
          created_at?: string
          forecast_date?: string
          humidity?: number | null
          id?: string
          location?: string
          rainfall?: number | null
          temperature?: number | null
          user_id?: string | null
          wind_speed?: number | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
