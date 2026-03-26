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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      access_codes: {
        Row: {
          access_code: string
          created_at: string
          id: string
          is_used: boolean
          purpose: string | null
          resident_id: string
          status: Database["public"]["Enums"]["access_code_status"]
          used_at: string | null
          used_by_security: string | null
          valid_from: string
          valid_until: string
          visitor_name: string
          visitor_phone: string | null
        }
        Insert: {
          access_code: string
          created_at?: string
          id?: string
          is_used?: boolean
          purpose?: string | null
          resident_id: string
          status?: Database["public"]["Enums"]["access_code_status"]
          used_at?: string | null
          used_by_security?: string | null
          valid_from: string
          valid_until: string
          visitor_name: string
          visitor_phone?: string | null
        }
        Update: {
          access_code?: string
          created_at?: string
          id?: string
          is_used?: boolean
          purpose?: string | null
          resident_id?: string
          status?: Database["public"]["Enums"]["access_code_status"]
          used_at?: string | null
          used_by_security?: string | null
          valid_from?: string
          valid_until?: string
          visitor_name?: string
          visitor_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_codes_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_urgent: boolean
          title: string
        }
        Insert: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_urgent?: boolean
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_urgent?: boolean
          title?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          id: string
          marked_at: string | null
          meeting_id: string
          resident_id: string
          status: Database["public"]["Enums"]["attendance_status"]
        }
        Insert: {
          id?: string
          marked_at?: string | null
          meeting_id: string
          resident_id: string
          status?: Database["public"]["Enums"]["attendance_status"]
        }
        Update: {
          id?: string
          marked_at?: string | null
          meeting_id?: string
          resident_id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
        }
        Relationships: [
          {
            foreignKeyName: "attendance_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string
          id: string
          photo_url: string | null
          resident_id: string
          status: Database["public"]["Enums"]["complaint_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string
          id?: string
          photo_url?: string | null
          resident_id: string
          status?: Database["public"]["Enums"]["complaint_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string
          id?: string
          photo_url?: string | null
          resident_id?: string
          status?: Database["public"]["Enums"]["complaint_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string | null
          created_at: string
          file_size: string | null
          file_type: string
          file_url: string
          id: string
          is_public: boolean
          title: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          file_size?: string | null
          file_type?: string
          file_url: string
          id?: string
          is_public?: boolean
          title: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          file_size?: string | null
          file_type?: string
          file_url?: string
          id?: string
          is_public?: boolean
          title?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      dues: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string
          frequency: Database["public"]["Enums"]["due_frequency"]
          id: string
          is_active: boolean
          title: string
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date: string
          frequency?: Database["public"]["Enums"]["due_frequency"]
          id?: string
          is_active?: boolean
          title: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string
          frequency?: Database["public"]["Enums"]["due_frequency"]
          id?: string
          is_active?: boolean
          title?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          attendance_window_end: string
          attendance_window_start: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          meeting_date: string
          title: string
        }
        Insert: {
          attendance_window_end: string
          attendance_window_start: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          meeting_date: string
          title: string
        }
        Update: {
          attendance_window_end?: string
          attendance_window_start?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          meeting_date?: string
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          profile_image_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          profile_image_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          profile_image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resident_dues: {
        Row: {
          amount: number
          confirmed_at: string | null
          confirmed_by: string | null
          due_id: string
          id: string
          paid_at: string | null
          payment_reference: string | null
          resident_id: string
          status: Database["public"]["Enums"]["due_status"]
        }
        Insert: {
          amount?: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          due_id: string
          id?: string
          paid_at?: string | null
          payment_reference?: string | null
          resident_id: string
          status?: Database["public"]["Enums"]["due_status"]
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          due_id?: string
          id?: string
          paid_at?: string | null
          payment_reference?: string | null
          resident_id?: string
          status?: Database["public"]["Enums"]["due_status"]
        }
        Relationships: [
          {
            foreignKeyName: "resident_dues_due_id_fkey"
            columns: ["due_id"]
            isOneToOne: false
            referencedRelation: "dues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resident_dues_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      residents: {
        Row: {
          created_at: string
          date_moved_in: string | null
          emergency_contact: string | null
          employment_info: string | null
          house_unit_number: string
          id: string
          is_active: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          date_moved_in?: string | null
          emergency_contact?: string | null
          employment_info?: string | null
          house_unit_number?: string
          id?: string
          is_active?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          date_moved_in?: string | null
          emergency_contact?: string | null
          employment_info?: string | null
          house_unit_number?: string
          id?: string
          is_active?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      access_code_status: "active" | "used" | "expired" | "cancelled"
      app_role: "admin" | "resident" | "security"
      attendance_status: "present" | "absent"
      complaint_status: "open" | "in_progress" | "resolved"
      due_frequency: "one_time" | "monthly" | "quarterly" | "annually"
      due_status: "pending" | "paid" | "overdue" | "pending_confirmation"
      notification_type:
        | "dues"
        | "meeting"
        | "complaint"
        | "announcement"
        | "payment"
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
      access_code_status: ["active", "used", "expired", "cancelled"],
      app_role: ["admin", "resident", "security"],
      attendance_status: ["present", "absent"],
      complaint_status: ["open", "in_progress", "resolved"],
      due_frequency: ["one_time", "monthly", "quarterly", "annually"],
      due_status: ["pending", "paid", "overdue", "pending_confirmation"],
      notification_type: [
        "dues",
        "meeting",
        "complaint",
        "announcement",
        "payment",
      ],
    },
  },
} as const
