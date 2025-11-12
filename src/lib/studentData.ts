// src/lib/studentData.ts
// Supabase data fetching utilities for student dashboard

import { supabase } from './supabase/client';
import { logger } from './logger';

// ==================== TYPE DEFINITIONS ====================

export interface StudentEvaluation {
  id: string;
  testId?: string;
  qpId?: string;
  subject: string;
  topic: string;
  marksAwarded: number;
  totalMarks: number;
  percentage: number;
  evaluatedAt: Date;
  remarks?: string;
  xpEarned: number;
}

export interface ActivityData {
  date: string; // YYYY-MM-DD format
  xp: number;
}

export interface SubjectProgressData {
  subject: string;
  percent: number;
  color: string;
}

export interface LeaderboardEntry {
  uid: string;
  name: string;
  xp: number;
  level: number;
  avatar: string;
  streak: number;
  institutionName?: string;
  rank?: number;
}

// ==================== SUPABASE FETCHING FUNCTIONS ====================

/**
 * Fetch student's recent evaluations from Supabase
 */
export async function fetchStudentEvaluations(userId: string, limitCount: number = 10): Promise<StudentEvaluation[]> {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('user_id', userId)
      .order('evaluated_at', { ascending: false })
      .limit(limitCount);

    if (error) throw error;

    return (data || []).map(row => {
      const marksAwarded = row.marks_awarded || 0;
      const totalMarks = row.total_marks || 100;
      const percentage = totalMarks > 0 ? (marksAwarded / totalMarks) * 100 : 0;

      return {
        id: row.id,
        testId: row.test_id,
        qpId: row.qp_id,
        subject: row.subject || 'Unknown Subject',
        topic: row.topic || row.title || 'Unknown Topic',
        marksAwarded,
        totalMarks,
        percentage,
        evaluatedAt: new Date(row.evaluated_at || row.created_at),
        remarks: row.remarks || row.comments,
        xpEarned: row.xp_earned || Math.floor(percentage / 2), // Default XP calculation
      };
    });
  } catch (error) {
    logger.error('Error fetching student evaluations:', error);
    return [];
  }
}

/**
 * Generate activity heatmap data from activity table
 * Falls back to empty data if no activity exists
 */
export async function fetchActivityData(userId: string, days: number = 90): Promise<ActivityData[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('activity')
      .select('timestamp, xp')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true });

    if (error) throw error;

    // Create a map to aggregate XP by date
    const activityMap = new Map<string, number>();

    // Initialize all dates with 0 XP
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      activityMap.set(dateStr, 0);
    }

    // Aggregate XP from activity documents
    (data || []).forEach(row => {
      const timestamp = new Date(row.timestamp);
      const dateStr = timestamp.toISOString().split('T')[0];
      const currentXp = activityMap.get(dateStr) || 0;
      activityMap.set(dateStr, currentXp + (row.xp || 0));
    });

    // Convert map to array
    return Array.from(activityMap.entries()).map(([date, xp]) => ({
      date,
      xp,
    }));
  } catch (error) {
    logger.error('Error fetching activity data:', error);
    // Return empty data array on error
    return generateEmptyActivityData(days);
  }
}

/**
 * Generate empty activity data (fallback)
 */
function generateEmptyActivityData(days: number): ActivityData[] {
  const data: ActivityData[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      xp: 0,
    });
  }
  return data;
}

/**
 * Calculate subject progress from evaluations
 */
export function calculateSubjectProgress(evaluations: StudentEvaluation[]): SubjectProgressData[] {
  const subjectMap = new Map<string, { total: number; count: number }>();

  evaluations.forEach(evaluation => {
    const subject = evaluation.subject;
    const current = subjectMap.get(subject) || { total: 0, count: 0 };
    subjectMap.set(subject, {
      total: current.total + evaluation.percentage,
      count: current.count + 1,
    });
  });

  const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#EF4444', '#F59E0B', '#EC4899', '#14B8A6'];
  let colorIndex = 0;

  const progressData: SubjectProgressData[] = [];
  subjectMap.forEach((value, subject) => {
    progressData.push({
      subject,
      percent: Math.round(value.total / value.count),
      color: colors[colorIndex % colors.length],
    });
    colorIndex++;
  });

  // Sort by percentage descending
  return progressData.sort((a, b) => b.percent - a.percent).slice(0, 5);
}

/**
 * Fetch leaderboard data (global or institution-specific)
 */
export async function fetchLeaderboard(scope: 'global' | 'institution', institutionId?: string, limitCount: number = 20): Promise<LeaderboardEntry[]> {
  try {
    let query = supabase
      .from('users')
      .select('id, display_name, xp, level, avatar, streak, institution_id')
      .eq('role', 'student')
      .order('xp', { ascending: false })
      .limit(limitCount);

    if (scope === 'institution' && institutionId) {
      query = query.eq('institution_id', institutionId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((row, index) => {
      const xp = row.xp || 0;
      const level = row.level || (Math.floor(Math.sqrt(xp / 100)) + 1);

      return {
        uid: row.id,
        name: row.display_name || 'Anonymous',
        xp,
        level,
        avatar: row.avatar || '🎮',
        streak: row.streak || 0,
        institutionName: 'Unknown', // Would need to join with institutions table
        rank: index + 1,
      };
    });
  } catch (error) {
    logger.error('Error fetching leaderboard:', error);
    return [];
  }
}

/**
 * Fetch upcoming tests for a student (from tests table)
 */
export async function fetchUpcomingTests(institutionId: string, limitCount: number = 5) {
  try {
    if (!institutionId) return [];

    const { data, error } = await supabase
      .from('tests')
      .select('id, title, subject, scheduled_date, duration, total_marks, type')
      .eq('institution_id', institutionId)
      .eq('status', 'scheduled')
      .order('scheduled_date', { ascending: true })
      .limit(limitCount);

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      title: row.title || 'Test',
      subject: row.subject || 'Unknown',
      scheduledDate: new Date(row.scheduled_date || new Date()),
      duration: row.duration || 60,
      totalMarks: row.total_marks || 100,
      type: row.type || 'test',
    }));
  } catch (error) {
    logger.error('Error fetching upcoming tests:', error);
    return [];
  }
}

/**
 * Fetch student stats from their evaluations and user document
 */
export async function fetchStudentStats(userId: string) {
  try {
    // Fetch user document
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('xp, level, streak, attendance, rank')
      .eq('id', userId)
      .single();

    if (userError) throw userError;
    if (!userData) return null;

    const xp = userData.xp || 0;
    const level = userData.level || (Math.floor(Math.sqrt(xp / 100)) + 1);

    // Fetch recent evaluations to calculate average
    const evaluations = await fetchStudentEvaluations(userId, 50);
    const avgScore = evaluations.length > 0
      ? evaluations.reduce((sum, e) => sum + e.percentage, 0) / evaluations.length
      : 0;

    return {
      xp,
      level,
      streak: userData.streak || 0,
      testsCompleted: evaluations.length,
      avgScore: Math.round(avgScore),
      attendance: userData.attendance || 0,
      rank: userData.rank || 0,
    };
  } catch (error) {
    logger.error('Error fetching student stats:', error);
    return null;
  }
}
