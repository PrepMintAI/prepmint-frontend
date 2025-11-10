// src/lib/studentData.ts
// Firebase data fetching utilities for student dashboard

import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase.client';
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

// ==================== FIREBASE FETCHING FUNCTIONS ====================

/**
 * Fetch student's recent evaluations from Firestore
 */
export async function fetchStudentEvaluations(userId: string, limitCount: number = 10): Promise<StudentEvaluation[]> {
  try {
    const evaluationsRef = collection(db, 'users', userId, 'evaluations');
    const q = query(
      evaluationsRef,
      orderBy('evaluatedAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      const marksAwarded = data.marksAwarded || 0;
      const totalMarks = data.totalMarks || 100;
      const percentage = totalMarks > 0 ? (marksAwarded / totalMarks) * 100 : 0;

      return {
        id: doc.id,
        testId: data.testId,
        qpId: data.qpId,
        subject: data.subject || 'Unknown Subject',
        topic: data.topic || data.title || 'Unknown Topic',
        marksAwarded,
        totalMarks,
        percentage,
        evaluatedAt: data.evaluatedAt?.toDate() || new Date(),
        remarks: data.remarks || data.comments,
        xpEarned: data.xpEarned || Math.floor(percentage / 2), // Default XP calculation
      };
    });
  } catch (error) {
    logger.error('Error fetching student evaluations:', error);
    return [];
  }
}

/**
 * Generate activity heatmap data from user activity collection
 * Falls back to mock data if no activity exists
 */
export async function fetchActivityData(userId: string, days: number = 90): Promise<ActivityData[]> {
  try {
    const activityRef = collection(db, 'users', userId, 'activity');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const q = query(
      activityRef,
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      orderBy('timestamp', 'asc')
    );

    const snapshot = await getDocs(q);

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
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const timestamp = data.timestamp?.toDate();
      if (timestamp) {
        const dateStr = timestamp.toISOString().split('T')[0];
        const currentXp = activityMap.get(dateStr) || 0;
        activityMap.set(dateStr, currentXp + (data.xp || 0));
      }
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
    const usersRef = collection(db, 'users');

    let q;
    if (scope === 'institution' && institutionId) {
      q = query(
        usersRef,
        where('institutionId', '==', institutionId),
        where('role', '==', 'student'),
        orderBy('xp', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(
        usersRef,
        where('role', '==', 'student'),
        orderBy('xp', 'desc'),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc, index) => {
      const data = doc.data();
      const xp = data.xp || 0;
      const level = Math.floor(Math.sqrt(xp / 100)) + 1;

      return {
        uid: doc.id,
        name: data.displayName || data.name || 'Anonymous',
        xp,
        level,
        avatar: data.avatar || '🎮',
        streak: data.streak || 0,
        institutionName: data.institutionName || 'Unknown',
        rank: index + 1,
      };
    });
  } catch (error) {
    logger.error('Error fetching leaderboard:', error);
    return [];
  }
}

/**
 * Fetch upcoming tests for a student (from institution's tests subcollection)
 */
export async function fetchUpcomingTests(institutionId: string, limitCount: number = 5) {
  try {
    if (!institutionId) return [];

    const testsRef = collection(db, 'institutions', institutionId, 'tests');
    const q = query(
      testsRef,
      where('status', '==', 'scheduled'),
      orderBy('scheduledDate', 'asc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Test',
        subject: data.subject || 'Unknown',
        scheduledDate: data.scheduledDate?.toDate() || new Date(),
        duration: data.duration || 60,
        totalMarks: data.totalMarks || 100,
        type: data.type || 'test',
      };
    });
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
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    const xp = userData.xp || 0;
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;

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
