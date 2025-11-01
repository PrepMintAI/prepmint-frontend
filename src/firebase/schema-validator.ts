/**
 * Firestore Schema Validator
 *
 * This file provides TypeScript type definitions and validation utilities
 * based on the firestore_schema.json file.
 *
 * Usage:
 *   import { UserDocument, validateUser } from '@/firebase/schema-validator';
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// Type Definitions (Generated from firestore_schema.json)
// ============================================================================

export type UserRole = 'student' | 'teacher' | 'admin' | 'institution' | 'dev';

export type AccountType = 'individual' | 'institution';

export interface UserDocument {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  xp?: number;
  level?: number;
  badges?: string[];
  institutionId?: string;
  accountType?: AccountType;
  photoURL?: string;
  streak?: number;
  lastActive?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  lastLoginAt?: Timestamp;
  xpLog?: Array<{
    amount: number;
    reason: string;
    timestamp: Timestamp;
  }>;
  badgeLog?: Array<{
    badgeId: string;
    awardedAt: Timestamp;
  }>;
  lastXpAwardedAt?: Timestamp;
}

export type InstitutionType = 'school' | 'university' | 'training_center';

export type InstitutionStatus = 'active' | 'inactive';

export interface InstitutionDocument {
  name: string;
  cityId?: string;
  type?: InstitutionType;
  location?: string;
  status?: InstitutionStatus;
  createdAt: Timestamp;
}

export type EvaluationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface EvaluationDocument {
  userId: string;
  subject: string;
  status: EvaluationStatus;
  teacherId?: string;
  institutionId?: string;
  testId?: string;
  qpId?: string;
  marksAwarded?: number;
  obtainedMarks?: number;
  totalMarks?: number;
  feedback?: string;
  remarks?: string;
  fileUrl?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  evaluatedAt?: Timestamp;
}

export type TestStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface TestDocument {
  qpId?: string;
  subject: string;
  createdBy: string;
  institutionId?: string;
  isBulkEvaluated?: boolean;
  totalMarks: number;
  status?: TestStatus;
  title?: string;
  description?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface SubjectDocument {
  name: string;
  createdBy?: string;
  description?: string;
  code?: string;
  createdAt?: Timestamp;
}

export interface BadgeDocument {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  icon?: string;
  xpRequired?: number;
  category?: string;
  createdAt?: Timestamp;
}

export type ActivityType = 'login' | 'evaluation' | 'upload' | 'badge_earned' | 'xp_awarded' | 'test_created';

export interface ActivityDocument {
  userId: string;
  type: ActivityType;
  timestamp: Timestamp;
  metadata?: Record<string, unknown>;
  description?: string;
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all-time';

export interface LeaderboardDocument {
  userId: string;
  xp: number;
  rank: number;
  period: LeaderboardPeriod;
  institutionId?: string;
  updatedAt: Timestamp;
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type JobType = 'evaluation' | 'bulk_evaluation' | 'report_generation' | 'data_export';

export interface JobQueueDocument {
  userId: string;
  status: JobStatus;
  type: JobType;
  result?: Record<string, unknown>;
  error?: string;
  progress?: number;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  completedAt?: Timestamp;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationDocument {
  userId: string;
  title: string;
  message: string;
  read?: boolean;
  type?: NotificationType;
  actionUrl?: string;
  createdAt: Timestamp;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate a user document against the schema
 */
export function validateUser(data: unknown): data is UserDocument {
  if (!data || typeof data !== 'object') return false;

  const user = data as Partial<UserDocument>;

  // Required fields
  if (!user.uid || typeof user.uid !== 'string') return false;
  if (!user.email || typeof user.email !== 'string') return false;
  if (!user.role || !['student', 'teacher', 'admin', 'institution', 'dev'].includes(user.role)) return false;
  if (!user.createdAt) return false;

  return true;
}

/**
 * Validate an evaluation document against the schema
 */
export function validateEvaluation(data: unknown): data is EvaluationDocument {
  if (!data || typeof data !== 'object') return false;

  const evaluation = data as Partial<EvaluationDocument>;

  // Required fields
  if (!evaluation.userId || typeof evaluation.userId !== 'string') return false;
  if (!evaluation.subject || typeof evaluation.subject !== 'string') return false;
  if (!evaluation.status || !['pending', 'processing', 'completed', 'failed'].includes(evaluation.status)) return false;
  if (!evaluation.createdAt) return false;

  return true;
}

/**
 * Validate a test document against the schema
 */
export function validateTest(data: unknown): data is TestDocument {
  if (!data || typeof data !== 'object') return false;

  const test = data as Partial<TestDocument>;

  // Required fields
  if (!test.subject || typeof test.subject !== 'string') return false;
  if (!test.createdBy || typeof test.createdBy !== 'string') return false;
  if (test.totalMarks === undefined || typeof test.totalMarks !== 'number') return false;
  if (!test.createdAt) return false;

  return true;
}

/**
 * Validate an activity document against the schema
 */
export function validateActivity(data: unknown): data is ActivityDocument {
  if (!data || typeof data !== 'object') return false;

  const activity = data as Partial<ActivityDocument>;

  // Required fields
  if (!activity.userId || typeof activity.userId !== 'string') return false;
  if (!activity.type || !['login', 'evaluation', 'upload', 'badge_earned', 'xp_awarded', 'test_created'].includes(activity.type)) return false;
  if (!activity.timestamp) return false;

  return true;
}

/**
 * Validate a notification document against the schema
 */
export function validateNotification(data: unknown): data is NotificationDocument {
  if (!data || typeof data !== 'object') return false;

  const notification = data as Partial<NotificationDocument>;

  // Required fields
  if (!notification.userId || typeof notification.userId !== 'string') return false;
  if (!notification.title || typeof notification.title !== 'string') return false;
  if (!notification.message || typeof notification.message !== 'string') return false;
  if (!notification.createdAt) return false;

  return true;
}

// ============================================================================
// Schema Metadata
// ============================================================================

export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  INSTITUTIONS: 'institutions',
  EVALUATIONS: 'evaluations',
  TESTS: 'tests',
  SUBJECTS: 'subjects',
  BADGES: 'badges',
  ACTIVITY: 'activity',
  LEADERBOARDS: 'leaderboards',
  JOB_QUEUES: 'jobQueues',
  NOTIFICATIONS: 'notifications',
} as const;

export const USER_ROLES: readonly UserRole[] = ['student', 'teacher', 'admin', 'institution', 'dev'] as const;

export const EVALUATION_STATUSES: readonly EvaluationStatus[] = ['pending', 'processing', 'completed', 'failed'] as const;

export const TEST_STATUSES: readonly TestStatus[] = ['draft', 'active', 'completed', 'archived'] as const;

export const ACTIVITY_TYPES: readonly ActivityType[] = ['login', 'evaluation', 'upload', 'badge_earned', 'xp_awarded', 'test_created'] as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a role has admin-level permissions
 */
export function hasAdminPermissions(role: UserRole): boolean {
  return role === 'admin' || role === 'dev';
}

/**
 * Check if a role can access teacher features
 */
export function hasTeacherPermissions(role: UserRole): boolean {
  return role === 'teacher' || hasAdminPermissions(role);
}

/**
 * Get a human-readable role name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    student: 'Student',
    teacher: 'Teacher',
    admin: 'Administrator',
    institution: 'Institution',
    dev: 'Developer',
  };
  return roleNames[role] || role;
}

/**
 * Get a color class for a role badge (Tailwind CSS)
 */
export function getRoleColorClass(role: UserRole): string {
  const roleColors: Record<UserRole, string> = {
    admin: 'text-purple-600 bg-purple-50 border-purple-200',
    dev: 'text-pink-600 bg-pink-50 border-pink-200',
    teacher: 'text-blue-600 bg-blue-50 border-blue-200',
    student: 'text-green-600 bg-green-50 border-green-200',
    institution: 'text-orange-600 bg-orange-50 border-orange-200',
  };
  return roleColors[role] || 'text-gray-600 bg-gray-50 border-gray-200';
}
