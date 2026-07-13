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
          estate_id: string | null
          exit_logged: boolean
          exited_at: string | null
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
          estate_id?: string | null
          exit_logged?: boolean
          exited_at?: string | null
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
          estate_id?: string | null
          exit_logged?: boolean
          exited_at?: string | null
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
            foreignKeyName: "access_codes_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
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
          estate_id: string | null
          id: string
          is_urgent: boolean
          title: string
        }
        Insert: {
          content?: string
          created_at?: string
          created_by?: string | null
          estate_id?: string | null
          id?: string
          is_urgent?: boolean
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          estate_id?: string | null
          id?: string
          is_urgent?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          estate_id: string | null
          id: string
          marked_at: string | null
          meeting_id: string
          resident_id: string
          status: Database["public"]["Enums"]["attendance_status"]
        }
        Insert: {
          estate_id?: string | null
          id?: string
          marked_at?: string | null
          meeting_id: string
          resident_id: string
          status?: Database["public"]["Enums"]["attendance_status"]
        }
        Update: {
          estate_id?: string | null
          id?: string
          marked_at?: string | null
          meeting_id?: string
          resident_id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
        }
        Relationships: [
          {
            foreignKeyName: "attendance_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity: string
          entity_id: string | null
          estate_id: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity: string
          entity_id?: string | null
          estate_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string
          entity_id?: string | null
          estate_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          description: string
          estate_id: string | null
          id: string
          photo_url: string | null
          resident_id: string
          status: Database["public"]["Enums"]["complaint_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string
          estate_id?: string | null
          id?: string
          photo_url?: string | null
          resident_id: string
          status?: Database["public"]["Enums"]["complaint_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string
          estate_id?: string | null
          id?: string
          photo_url?: string | null
          resident_id?: string
          status?: Database["public"]["Enums"]["complaint_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
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
          estate_id: string | null
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
          estate_id?: string | null
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
          estate_id?: string | null
          file_size?: string | null
          file_type?: string
          file_url?: string
          id?: string
          is_public?: boolean
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      dues: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string
          estate_id: string | null
          frequency: Database["public"]["Enums"]["due_frequency"]
          id: string
          is_active: boolean
          last_generated_at: string | null
          next_run_date: string | null
          title: string
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date: string
          estate_id?: string | null
          frequency?: Database["public"]["Enums"]["due_frequency"]
          id?: string
          is_active?: boolean
          last_generated_at?: string | null
          next_run_date?: string | null
          title: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string
          estate_id?: string | null
          frequency?: Database["public"]["Enums"]["due_frequency"]
          id?: string
          is_active?: boolean
          last_generated_at?: string | null
          next_run_date?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "dues_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estate_settings: {
        Row: {
          brand_name: string | null
          created_at: string
          custom_domain: string | null
          email_sender_name: string | null
          estate_id: string
          id: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          support_contact: string | null
          updated_at: string
        }
        Insert: {
          brand_name?: string | null
          created_at?: string
          custom_domain?: string | null
          email_sender_name?: string | null
          estate_id: string
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          support_contact?: string | null
          updated_at?: string
        }
        Update: {
          brand_name?: string | null
          created_at?: string
          custom_domain?: string | null
          email_sender_name?: string | null
          estate_id?: string
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          support_contact?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estate_settings_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: true
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      estates: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          status: string
          subscription_plan: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          status?: string
          subscription_plan?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          status?: string
          subscription_plan?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          body: string
          created_at: string
          estate_id: string
          id: string
          resident_id: string
          thread_id: string
        }
        Insert: {
          body: string
          created_at?: string
          estate_id: string
          id?: string
          resident_id: string
          thread_id: string
        }
        Update: {
          body?: string
          created_at?: string
          estate_id?: string
          id?: string
          resident_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_threads: {
        Row: {
          body: string
          created_at: string
          estate_id: string
          id: string
          is_locked: boolean
          resident_id: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          estate_id: string
          id?: string
          is_locked?: boolean
          resident_id: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          estate_id?: string
          id?: string
          is_locked?: boolean
          resident_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_threads_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_threads_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          created_at: string
          description: string
          estate_id: string
          id: string
          photo_url: string | null
          price: number
          resident_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          estate_id: string
          id?: string
          photo_url?: string | null
          price?: number
          resident_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          estate_id?: string
          id?: string
          photo_url?: string | null
          price?: number
          resident_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          attendance_window_end: string
          attendance_window_start: string
          created_at: string
          created_by: string | null
          description: string | null
          estate_id: string | null
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
          estate_id?: string | null
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
          estate_id?: string | null
          id?: string
          meeting_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          estate_id: string | null
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
          estate_id?: string | null
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
          estate_id?: string | null
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          metadata: Json
          tenant_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          metadata?: Json
          tenant_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          metadata?: Json
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          allow_new_registrations: boolean
          id: string
          maintenance_mode: boolean
          platform_name: string
          primary_color: string
          support_email: string
          trial_mode_enabled: boolean
          updated_at: string
        }
        Insert: {
          allow_new_registrations?: boolean
          id?: string
          maintenance_mode?: boolean
          platform_name?: string
          primary_color?: string
          support_email?: string
          trial_mode_enabled?: boolean
          updated_at?: string
        }
        Update: {
          allow_new_registrations?: boolean
          id?: string
          maintenance_mode?: boolean
          platform_name?: string
          primary_color?: string
          support_email?: string
          trial_mode_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          estate_id: string | null
          full_name: string
          id: string
          inactivity_pin_hash: string | null
          phone: string | null
          profile_image_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          estate_id?: string | null
          full_name: string
          id: string
          inactivity_pin_hash?: string | null
          phone?: string | null
          profile_image_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          estate_id?: string | null
          full_name?: string
          id?: string
          inactivity_pin_hash?: string | null
          phone?: string | null
          profile_image_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      resident_dues: {
        Row: {
          amount: number
          confirmed_at: string | null
          confirmed_by: string | null
          due_id: string
          estate_id: string | null
          id: string
          paid_at: string | null
          payment_reference: string | null
          receipt_url: string | null
          resident_id: string
          status: Database["public"]["Enums"]["due_status"]
        }
        Insert: {
          amount?: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          due_id: string
          estate_id?: string | null
          id?: string
          paid_at?: string | null
          payment_reference?: string | null
          receipt_url?: string | null
          resident_id: string
          status?: Database["public"]["Enums"]["due_status"]
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          due_id?: string
          estate_id?: string | null
          id?: string
          paid_at?: string | null
          payment_reference?: string | null
          receipt_url?: string | null
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
            foreignKeyName: "resident_dues_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
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
          estate_id: string | null
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
          estate_id?: string | null
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
          estate_id?: string | null
          house_unit_number?: string
          id?: string
          is_active?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "residents_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle: string | null
          created_at: string
          end_date: string | null
          estate_id: string
          id: string
          plan: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string
          end_date?: string | null
          estate_id: string
          id?: string
          plan?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string
          end_date?: string | null
          estate_id?: string
          id?: string
          plan?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admins: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          permissions: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          message: string
          metadata: Json
          priority: string
          status: string
          subject: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          message: string
          metadata?: Json
          priority?: string
          status?: string
          subject: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string
          metadata?: Json
          priority?: string
          status?: string
          subject?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_bookings: {
        Row: {
          created_at: string
          estate_id: string
          id: string
          notes: string | null
          requested_date: string
          resident_id: string
          status: string
          technician_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          estate_id: string
          id?: string
          notes?: string | null
          requested_date: string
          resident_id: string
          status?: string
          technician_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          estate_id?: string
          id?: string
          notes?: string | null
          requested_date?: string
          resident_id?: string
          status?: string
          technician_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_bookings_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_bookings_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_bookings_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      technicians: {
        Row: {
          created_at: string
          created_by: string | null
          estate_id: string
          id: string
          is_active: boolean
          name: string
          phone: string
          rate_info: string | null
          trade: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          estate_id: string
          id?: string
          is_active?: boolean
          name: string
          phone: string
          rate_info?: string | null
          trade: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          estate_id?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string
          rate_info?: string | null
          trade?: string
        }
        Relationships: [
          {
            foreignKeyName: "technicians_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: false
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_billing: {
        Row: {
          amount: number
          billing_cycle: string | null
          created_at: string
          id: string
          metadata: Json
          payment_reference: string | null
          plan: string
          renewal_date: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          billing_cycle?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          payment_reference?: string | null
          plan?: string
          renewal_date?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_cycle?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          payment_reference?: string | null
          plan?: string
          renewal_date?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_billing_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_features: {
        Row: {
          created_at: string
          enabled: boolean
          feature_key: string
          id: string
          limit_value: number | null
          metadata: Json
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          feature_key: string
          id?: string
          limit_value?: number | null
          metadata?: Json
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          feature_key?: string
          id?: string
          limit_value?: number | null
          metadata?: Json
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_features_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          created_at: string
          currency: string
          custom_domain: string | null
          estate_id: string | null
          id: string
          logo_url: string | null
          metadata: Json
          name: string
          plan: string
          primary_color: string | null
          secondary_color: string | null
          slug: string
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          currency?: string
          custom_domain?: string | null
          estate_id?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json
          name: string
          plan?: string
          primary_color?: string | null
          secondary_color?: string | null
          slug: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          currency?: string
          custom_domain?: string | null
          estate_id?: string | null
          id?: string
          logo_url?: string | null
          metadata?: Json
          name?: string
          plan?: string
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_estate_id_fkey"
            columns: ["estate_id"]
            isOneToOne: true
            referencedRelation: "estates"
            referencedColumns: ["id"]
          },
        ]
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
      get_user_estate_id: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_tenant_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_platform_super_admin: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      access_code_status: "active" | "used" | "expired" | "cancelled"
      app_role: "admin" | "resident" | "security" | "super_admin"
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
      app_role: ["admin", "resident", "security", "super_admin"],
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
