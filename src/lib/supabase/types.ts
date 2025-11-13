/**
 * Supabase Database TypeScript Types
 *
 * Auto-generated types for type-safe database queries.
 * These types match the PostgreSQL schema defined in supabase/schema.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'student' | 'teacher' | 'admin' | 'institution' | 'dev'
export type AccountType = 'individual' | 'institution'
export type InstitutionType = 'school' | 'university' | 'training_center'
export type InstitutionStatus = 'active' | 'inactive'
export type EvaluationStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type TestStatus = 'draft' | 'active' | 'completed' | 'archived'
export type ActivityType = 'login' | 'evaluation' | 'upload' | 'badge_earned' | 'xp_awarded' | 'test_created'
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all-time'
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type JobType = 'evaluation' | 'bulk_evaluation' | 'report_generation' | 'data_export'
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          role: UserRole
          xp: number
          level: number
          institution_id: string | null
          account_type: AccountType | null
          photo_url: string | null
          streak: number | null
          last_active: string | null
          created_at: string
          updated_at: string | null
          last_login_at: string | null
          last_xp_awarded_at: string | null
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          role?: UserRole
          xp?: number
          level?: number
          institution_id?: string | null
          account_type?: AccountType | null
          photo_url?: string | null
          streak?: number | null
          last_active?: string | null
          created_at?: string
          updated_at?: string | null
          last_login_at?: string | null
          last_xp_awarded_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          role?: UserRole
          xp?: number
          level?: number
          institution_id?: string | null
          account_type?: AccountType | null
          photo_url?: string | null
          streak?: number | null
          last_active?: string | null
          created_at?: string
          updated_at?: string | null
          last_login_at?: string | null
          last_xp_awarded_at?: string | null
        }
      }
      institutions: {
        Row: {
          id: string
          name: string
          city_id: string | null
          type: InstitutionType | null
          location: string | null
          status: InstitutionStatus | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          city_id?: string | null
          type?: InstitutionType | null
          location?: string | null
          status?: InstitutionStatus | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          city_id?: string | null
          type?: InstitutionType | null
          location?: string | null
          status?: InstitutionStatus | null
          created_at?: string
          updated_at?: string | null
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          code: string | null
          description: string | null
          created_by: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          code?: string | null
          description?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          code?: string | null
          description?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      tests: {
        Row: {
          id: string
          qp_id: string | null
          subject_id: string | null
          subject: string
          title: string | null
          description: string | null
          created_by: string
          institution_id: string | null
          is_bulk_evaluated: boolean | null
          total_marks: number
          status: TestStatus | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          qp_id?: string | null
          subject_id?: string | null
          subject: string
          title?: string | null
          description?: string | null
          created_by: string
          institution_id?: string | null
          is_bulk_evaluated?: boolean | null
          total_marks: number
          status?: TestStatus | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          qp_id?: string | null
          subject_id?: string | null
          subject?: string
          title?: string | null
          description?: string | null
          created_by?: string
          institution_id?: string | null
          is_bulk_evaluated?: boolean | null
          total_marks?: number
          status?: TestStatus | null
          created_at?: string
          updated_at?: string | null
        }
      }
      evaluations: {
        Row: {
          id: string
          user_id: string
          subject: string
          status: EvaluationStatus
          teacher_id: string | null
          institution_id: string | null
          test_id: string | null
          qp_id: string | null
          marks_awarded: number | null
          obtained_marks: number | null
          total_marks: number | null
          feedback: string | null
          remarks: string | null
          file_url: string | null
          created_at: string
          updated_at: string | null
          evaluated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          status?: EvaluationStatus
          teacher_id?: string | null
          institution_id?: string | null
          test_id?: string | null
          qp_id?: string | null
          marks_awarded?: number | null
          obtained_marks?: number | null
          total_marks?: number | null
          feedback?: string | null
          remarks?: string | null
          file_url?: string | null
          created_at?: string
          updated_at?: string | null
          evaluated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          status?: EvaluationStatus
          teacher_id?: string | null
          institution_id?: string | null
          test_id?: string | null
          qp_id?: string | null
          marks_awarded?: number | null
          obtained_marks?: number | null
          total_marks?: number | null
          feedback?: string | null
          remarks?: string | null
          file_url?: string | null
          created_at?: string
          updated_at?: string | null
          evaluated_at?: string | null
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string
          icon_url: string | null
          icon: string | null
          xp_required: number | null
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon_url?: string | null
          icon?: string | null
          xp_required?: number | null
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon_url?: string | null
          icon?: string | null
          xp_required?: number | null
          category?: string | null
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          awarded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          awarded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          awarded_at?: string
        }
      }
      xp_log: {
        Row: {
          id: string
          user_id: string
          amount: number
          reason: string
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          reason: string
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          reason?: string
          timestamp?: string
        }
      }
      activity: {
        Row: {
          id: string
          user_id: string
          type: ActivityType
          description: string | null
          metadata: Json
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          type: ActivityType
          description?: string | null
          metadata?: Json
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: ActivityType
          description?: string | null
          metadata?: Json
          timestamp?: string
        }
      }
      leaderboards: {
        Row: {
          id: string
          user_id: string
          xp: number
          rank: number
          period: LeaderboardPeriod
          institution_id: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          xp?: number
          rank: number
          period: LeaderboardPeriod
          institution_id?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          xp?: number
          rank?: number
          period?: LeaderboardPeriod
          institution_id?: string | null
          updated_at?: string
        }
      }
      job_queues: {
        Row: {
          id: string
          user_id: string
          status: JobStatus
          type: JobType
          result: Json | null
          error: string | null
          progress: number | null
          created_at: string
          updated_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          status?: JobStatus
          type: JobType
          result?: Json | null
          error?: string | null
          progress?: number | null
          created_at?: string
          updated_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: JobStatus
          type?: JobType
          result?: Json | null
          error?: string | null
          progress?: number | null
          created_at?: string
          updated_at?: string | null
          completed_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          read: boolean | null
          type: NotificationType | null
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          read?: boolean | null
          type?: NotificationType | null
          action_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          read?: boolean | null
          type?: NotificationType | null
          action_url?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_level: {
        Args: {
          xp_amount: number
        }
        Returns: number
      }
      xp_for_next_level: {
        Args: {
          current_level: number
        }
        Returns: number
      }
      get_user_role: {
        Args: {
          user_uuid: string
        }
        Returns: UserRole
      }
      belongs_to_institution: {
        Args: {
          user_uuid: string
          inst_id: string
        }
        Returns: boolean
      }
      award_xp: {
        Args: {
          target_user_id: string
          xp_amount: number
          xp_reason: string
        }
        Returns: {
          new_xp: number
          new_level: number
        }[]
      }
      award_badge: {
        Args: {
          target_user_id: string
          target_badge_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
      account_type: AccountType
      institution_type: InstitutionType
      institution_status: InstitutionStatus
      evaluation_status: EvaluationStatus
      test_status: TestStatus
      activity_type: ActivityType
      leaderboard_period: LeaderboardPeriod
      job_status: JobStatus
      job_type: JobType
      notification_type: NotificationType
    }
  }
}

// Helper types for common queries
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Institution = Database['public']['Tables']['institutions']['Row']
export type InstitutionInsert = Database['public']['Tables']['institutions']['Insert']
export type InstitutionUpdate = Database['public']['Tables']['institutions']['Update']

export type Subject = Database['public']['Tables']['subjects']['Row']
export type SubjectInsert = Database['public']['Tables']['subjects']['Insert']
export type SubjectUpdate = Database['public']['Tables']['subjects']['Update']

export type Test = Database['public']['Tables']['tests']['Row']
export type TestInsert = Database['public']['Tables']['tests']['Insert']
export type TestUpdate = Database['public']['Tables']['tests']['Update']

export type Evaluation = Database['public']['Tables']['evaluations']['Row']
export type EvaluationInsert = Database['public']['Tables']['evaluations']['Insert']
export type EvaluationUpdate = Database['public']['Tables']['evaluations']['Update']

export type Badge = Database['public']['Tables']['badges']['Row']
export type BadgeInsert = Database['public']['Tables']['badges']['Insert']
export type BadgeUpdate = Database['public']['Tables']['badges']['Update']

export type UserBadge = Database['public']['Tables']['user_badges']['Row']
export type UserBadgeInsert = Database['public']['Tables']['user_badges']['Insert']
export type UserBadgeUpdate = Database['public']['Tables']['user_badges']['Update']

export type XpLog = Database['public']['Tables']['xp_log']['Row']
export type XpLogInsert = Database['public']['Tables']['xp_log']['Insert']
export type XpLogUpdate = Database['public']['Tables']['xp_log']['Update']

export type Activity = Database['public']['Tables']['activity']['Row']
export type ActivityInsert = Database['public']['Tables']['activity']['Insert']
export type ActivityUpdate = Database['public']['Tables']['activity']['Update']

export type Leaderboard = Database['public']['Tables']['leaderboards']['Row']
export type LeaderboardInsert = Database['public']['Tables']['leaderboards']['Insert']
export type LeaderboardUpdate = Database['public']['Tables']['leaderboards']['Update']

export type JobQueue = Database['public']['Tables']['job_queues']['Row']
export type JobQueueInsert = Database['public']['Tables']['job_queues']['Insert']
export type JobQueueUpdate = Database['public']['Tables']['job_queues']['Update']

export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

// Extended user type with populated relationships
export type UserWithBadges = User & {
  user_badges: Array<UserBadge & { badges: Badge }>
}

// Evaluation with populated relationships
export type EvaluationWithRelations = Evaluation & {
  user?: User
  teacher?: User
  test?: Test
  institution?: Institution
}

// Test with populated relationships
export type TestWithRelations = Test & {
  creator?: User
  subject_info?: Subject
  institution?: Institution
}
