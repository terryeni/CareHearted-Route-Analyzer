export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'manager' | 'installer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'manager' | 'installer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'manager' | 'installer'
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          job_id: string
          client_name: string
          job_type: 'delivery_only' | 'install_stand' | 'display_backdrop' | 'shelving'
          postcodes: string[]
          notes: string | null
          preferred_date_start: string | null
          preferred_date_end: string | null
          vehicle_size: 'small_van' | 'lwb' | 'tail_lift'
          status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          client_name: string
          job_type: 'delivery_only' | 'install_stand' | 'display_backdrop' | 'shelving'
          postcodes: string[]
          notes?: string | null
          preferred_date_start?: string | null
          preferred_date_end?: string | null
          vehicle_size: 'small_van' | 'lwb' | 'tail_lift'
          status?: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          client_name?: string
          job_type?: 'delivery_only' | 'install_stand' | 'display_backdrop' | 'shelving'
          postcodes?: string[]
          notes?: string | null
          preferred_date_start?: string | null
          preferred_date_end?: string | null
          vehicle_size?: 'small_van' | 'lwb' | 'tail_lift'
          status?: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      routes: {
        Row: {
          id: string
          job_id: string
          optimized_order: string[]
          total_distance: number
          total_time: number
          route_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          optimized_order: string[]
          total_distance: number
          total_time: number
          route_data: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          optimized_order?: string[]
          total_distance?: number
          total_time?: number
          route_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      team_assignments: {
        Row: {
          id: string
          job_id: string
          assigned_to: string[]
          team_size: number
          estimated_days: number
          assignment_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          assigned_to: string[]
          team_size: number
          estimated_days: number
          assignment_date: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          assigned_to?: string[]
          team_size?: number
          estimated_days?: number
          assignment_date?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      installers: {
        Row: {
          id: string
          user_id: string
          name: string
          skills: string[]
          availability: Json
          hourly_rate: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          skills: string[]
          availability: Json
          hourly_rate?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          skills?: string[]
          availability?: Json
          hourly_rate?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      job_history: {
        Row: {
          id: string
          job_id: string
          action: string
          details: Json
          performed_by: string
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          action: string
          details: Json
          performed_by: string
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          action?: string
          details?: Json
          performed_by?: string
          created_at?: string
        }
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

// Utility types for easier use
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Job = Database['public']['Tables']['jobs']['Row']
export type Route = Database['public']['Tables']['routes']['Row']
export type TeamAssignment = Database['public']['Tables']['team_assignments']['Row']
export type Installer = Database['public']['Tables']['installers']['Row']
export type JobHistory = Database['public']['Tables']['job_history']['Row']

export type InsertJob = Database['public']['Tables']['jobs']['Insert']
export type UpdateJob = Database['public']['Tables']['jobs']['Update']
export type InsertRoute = Database['public']['Tables']['routes']['Insert']
export type InsertTeamAssignment = Database['public']['Tables']['team_assignments']['Insert']