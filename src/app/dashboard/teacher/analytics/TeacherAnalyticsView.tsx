'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  collection, query, where, getDocs, Timestamp, QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase.client';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import {
  Filter, Download, Users, Target, CheckCircle, Award,
  BarChart3, PieChart, TrendingUp, TrendingDown, Calendar,
  Activity, AlertCircle, ChevronDown
} from 'lucide-react';
import { logger } from '@/lib/logger';

interface Student {
  id: string;
  displayName: string;
  email: string;
  role: 'student';
  institutionId: string;
}

interface Evaluation {
  id: string;
  userId: string;
  institutionId: string;
  subject: string;
  score: number;
  totalMarks: number;
  percentage: number;
  status: 'completed' | 'pending' | 'submitted';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

interface FilterState {
  studentId: string | null;
  dateRange: 7 | 30 | 90 | 365;
  subject: string | null;
}

interface ClassStats {
  totalStudents: number;
  averageScore: number;
  totalEvaluations: number;
  completionRate: number;
  topPerformers: Array<{ id: string; name: string; score: number }>;
  subjectBreakdown: Array<{ subject: string; average: number; count: number }>;
}

interface StudentStats {
  overallPercentage: number;
  testsCompleted: number;
  averageScore: number;
  subjectPerformance: Array<{ subject: string; percentage: number; count: number }>;
  recentScores: Array<{ subject: string; score: number; date: Date }>;
}

export default function TeacherAnalyticsView() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterState>({
    studentId: null,
    dateRange: 30,
    subject: null,
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  // Fetch students in teacher's institution
  useEffect(() => {
    const fetchStudents = async () => {
      if (!user?.institutionId) {
        setLoading(false);
        return;
      }

      try {
        const studentsQuery = query(
          collection(db, 'users'),
          where('institutionId', '==', user.institutionId),
          where('role', '==', 'student')
        );

        const snapshot = await getDocs(studentsQuery);
        const studentsList = snapshot.docs.map(doc => ({
          id: doc.id,
          displayName: doc.data().displayName || 'Unknown',
          email: doc.data().email || '',
          role: doc.data().role,
          institutionId: doc.data().institutionId,
        } as Student));

        setStudents(studentsList);
      } catch (err) {
        logger.error('[TeacherAnalytics] Failed to fetch students:', err);
        setError('Failed to load students');
      }
    };

    fetchStudents();
  }, [user?.institutionId]);

  // Fetch evaluations
  useEffect(() => {
    const fetchEvaluations = async () => {
      if (!user?.institutionId) {
        setLoading(false);
        return;
      }

      try {
        const constraints: QueryConstraint[] = [
          where('institutionId', '==', user.institutionId),
          where('status', '==', 'completed'),
        ];

        // Add student filter if selected
        if (filters.studentId) {
          constraints.push(where('userId', '==', filters.studentId));
        }

        const evaluationsQuery = query(
          collection(db, 'evaluations'),
          ...constraints
        );

        const snapshot = await getDocs(evaluationsQuery);
        let evalsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Evaluation));

        // Filter by date range
        const now = new Date();
        const cutoffDate = new Date(now.getTime() - filters.dateRange * 24 * 60 * 60 * 1000);

        evalsList = evalsList.filter(e => {
          const createdDate = e.createdAt.toDate?.() || new Date(e.createdAt as any);
          return createdDate >= cutoffDate;
        });

        // Filter by subject if specified
        if (filters.subject) {
          evalsList = evalsList.filter(e => e.subject === filters.subject);
        }

        setEvaluations(evalsList);
        setError(null);
      } catch (err) {
        logger.error('[TeacherAnalytics] Failed to fetch evaluations:', err);
        setError('Failed to load evaluations');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [user?.institutionId, filters]);

  // Calculate class-level statistics
  const classStats = useMemo<ClassStats>(() => {
    if (evaluations.length === 0) {
      return {
        totalStudents: students.length,
        averageScore: 0,
        totalEvaluations: 0,
        completionRate: 0,
        topPerformers: [],
        subjectBreakdown: [],
      };
    }

    const totalEvals = evaluations.length;
    const avgScore = evaluations.reduce((sum, e) => sum + e.percentage, 0) / totalEvals;

    // Calculate per-student stats
    const studentStats = new Map<string, { scores: number[]; count: number }>();
    evaluations.forEach(e => {
      if (!studentStats.has(e.userId)) {
        studentStats.set(e.userId, { scores: [], count: 0 });
      }
      const stats = studentStats.get(e.userId)!;
      stats.scores.push(e.percentage);
      stats.count += 1;
    });

    // Get top performers
    const topPerformers = Array.from(studentStats.entries())
      .map(([studentId, stats]) => ({
        id: studentId,
        name: students.find(s => s.id === studentId)?.displayName || 'Unknown',
        score: stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Subject breakdown
    const subjectMap = new Map<string, { scores: number[]; count: number }>();
    evaluations.forEach(e => {
      if (!subjectMap.has(e.subject)) {
        subjectMap.set(e.subject, { scores: [], count: 0 });
      }
      const stats = subjectMap.get(e.subject)!;
      stats.scores.push(e.percentage);
      stats.count += 1;
    });

    const subjectBreakdown = Array.from(subjectMap.entries()).map(([subject, stats]) => ({
      subject,
      average: stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length,
      count: stats.count,
    }));

    return {
      totalStudents: students.length,
      averageScore: avgScore,
      totalEvaluations: totalEvals,
      completionRate: (studentStats.size / students.length) * 100,
      topPerformers,
      subjectBreakdown,
    };
  }, [evaluations, students]);

  // Calculate student-specific statistics
  const studentStats = useMemo<StudentStats | null>(() => {
    if (!filters.studentId) return null;

    const studentEvals = evaluations.filter(e => e.userId === filters.studentId);
    if (studentEvals.length === 0) {
      return {
        overallPercentage: 0,
        testsCompleted: 0,
        averageScore: 0,
        subjectPerformance: [],
        recentScores: [],
      };
    }

    const overallPercentage = studentEvals.reduce((sum, e) => sum + e.percentage, 0) / studentEvals.length;

    // Subject performance
    const subjectMap = new Map<string, { scores: number[]; count: number }>();
    studentEvals.forEach(e => {
      if (!subjectMap.has(e.subject)) {
        subjectMap.set(e.subject, { scores: [], count: 0 });
      }
      const stats = subjectMap.get(e.subject)!;
      stats.scores.push(e.percentage);
      stats.count += 1;
    });

    const subjectPerformance = Array.from(subjectMap.entries()).map(([subject, stats]) => ({
      subject,
      percentage: stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length,
      count: stats.count,
    }));

    // Recent scores
    const recentScores = studentEvals
      .sort((a, b) => (b.createdAt.toDate?.() || new Date(b.createdAt as any)).getTime() -
                       (a.createdAt.toDate?.() || new Date(a.createdAt as any)).getTime())
      .slice(0, 10)
      .map(e => ({
        subject: e.subject,
        score: e.percentage,
        date: e.createdAt.toDate?.() || new Date(e.createdAt as any),
      }));

    return {
      overallPercentage,
      testsCompleted: studentEvals.length,
      averageScore: studentEvals.reduce((sum, e) => sum + e.score, 0) / studentEvals.length,
      subjectPerformance,
      recentScores,
    };
  }, [filters.studentId, evaluations]);

  // Get unique subjects for filter
  const availableSubjects = useMemo(() => {
    const subjects = new Set(evaluations.map(e => e.subject));
    return Array.from(subjects).sort();
  }, [evaluations]);

  const selectedStudent = students.find(s => s.id === filters.studentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner label="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card variant="elevated" padding="lg" className="border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-bold text-red-900">Error Loading Analytics</h3>
              <p className="text-red-800 mt-1">{error}</p>
              <Button
                variant="danger"
                size="sm"
                className="mt-3"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!user?.institutionId) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">Unable to load institution data</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {filters.studentId ? `Student Analytics: ${selectedStudent?.displayName}` : 'Class Analytics'}
            </h1>
            <p className="text-gray-600 mt-1">
              {filters.studentId
                ? `Individual performance over ${filters.dateRange} days`
                : `Overview of ${students.length} student${students.length !== 1 ? 's' : ''} with ${evaluations.length} evaluation${evaluations.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Filter size={16} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </motion.div>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card variant="bordered" padding="lg" className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} className="text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Analytics Filters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Student Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Student
                </label>
                <select
                  value={filters.studentId || ''}
                  onChange={(e) => setFilters({ ...filters, studentId: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value="">All Students (Class View)</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: Number(e.target.value) as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                  <option value={365}>Last 365 days</option>
                </select>
              </div>

              {/* Subject Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={filters.subject || ''}
                  onChange={(e) => setFilters({ ...filters, subject: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  <option value="">All Subjects</option>
                  {availableSubjects.map(subject => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ studentId: null, dateRange: 30, subject: null })}
                  className="w-full"
                >
                  Reset Filters
                </Button>
              </div>
            </div>

            {/* Active Filters Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filters.studentId && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {selectedStudent?.displayName || 'Unknown'}
                  </span>
                )}
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  Last {filters.dateRange} days
                </span>
                {filters.subject && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {filters.subject}
                  </span>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats Cards - Conditional Rendering */}
      {filters.studentId && studentStats ? (
        // Student View - Individual Stats
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card variant="elevated" padding="lg" className="text-center">
            <Target className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="text-2xl font-bold text-gray-900">{Math.round(studentStats.overallPercentage)}%</p>
            <p className="text-xs text-gray-600">Overall Score</p>
          </Card>

          <Card variant="elevated" padding="lg" className="text-center">
            <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
            <p className="text-2xl font-bold text-gray-900">{studentStats.testsCompleted}</p>
            <p className="text-xs text-gray-600">Tests Completed</p>
          </Card>

          <Card variant="elevated" padding="lg" className="text-center">
            <BarChart3 className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="text-2xl font-bold text-gray-900">{Math.round(studentStats.averageScore)}</p>
            <p className="text-xs text-gray-600">Average Marks</p>
          </Card>

          <Card variant="elevated" padding="lg" className="text-center">
            <Award className="mx-auto mb-2 text-orange-600" size={24} />
            <p className="text-2xl font-bold text-gray-900">{studentStats.subjectPerformance.length}</p>
            <p className="text-xs text-gray-600">Subjects</p>
          </Card>
        </motion.div>
      ) : (
        // Class View - Aggregate Stats
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          <Card variant="elevated" padding="lg" className="text-center">
            <Users className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="text-2xl font-bold text-gray-900">{classStats.totalStudents}</p>
            <p className="text-xs text-gray-600">Total Students</p>
          </Card>

          <Card variant="elevated" padding="lg" className="text-center">
            <Target className="mx-auto mb-2 text-green-600" size={24} />
            <p className="text-2xl font-bold text-gray-900">{Math.round(classStats.averageScore)}%</p>
            <p className="text-xs text-gray-600">Class Average</p>
          </Card>

          <Card variant="elevated" padding="lg" className="text-center">
            <CheckCircle className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="text-2xl font-bold text-gray-900">{classStats.totalEvaluations}</p>
            <p className="text-xs text-gray-600">Evaluations</p>
          </Card>

          <Card variant="elevated" padding="lg" className="text-center">
            <Activity className="mx-auto mb-2 text-orange-600" size={24} />
            <p className="text-2xl font-bold text-gray-900">{Math.round(classStats.completionRate)}%</p>
            <p className="text-xs text-gray-600">Participation</p>
          </Card>

          <Card variant="elevated" padding="lg" className="text-center">
            <BarChart3 className="mx-auto mb-2 text-pink-600" size={24} />
            <p className="text-2xl font-bold text-gray-900">{classStats.subjectBreakdown.length}</p>
            <p className="text-xs text-gray-600">Subjects</p>
          </Card>
        </motion.div>
      )}

      {/* Content Area - Conditional Rendering Based on Selection */}
      {filters.studentId && studentStats ? (
        // Individual Student View
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Subject Performance */}
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Subject Performance</h3>
              <PieChart className="text-purple-600" size={20} />
            </div>
            <div className="space-y-4">
              {studentStats.subjectPerformance.map((subject, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{subject.subject}</span>
                    <span className="text-sm font-bold text-gray-900">{Math.round(subject.percentage)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                      style={{ width: `${subject.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{subject.count} test{subject.count !== 1 ? 's' : ''}</p>
                </div>
              ))}
              {studentStats.subjectPerformance.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No subject data available</p>
              )}
            </div>
          </Card>

          {/* Recent Scores */}
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Scores</h3>
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div className="space-y-3">
              {studentStats.recentScores.map((score, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{score.subject}</p>
                    <p className="text-xs text-gray-500">{score.date.toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      score.score >= 80 ? 'text-green-600' :
                      score.score >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {Math.round(score.score)}%
                    </p>
                  </div>
                </div>
              ))}
              {studentStats.recentScores.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No recent scores</p>
              )}
            </div>
          </Card>
        </motion.div>
      ) : (
        // Class View
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Subject Performance Breakdown */}
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Subject Performance</h3>
              <BarChart3 className="text-blue-600" size={20} />
            </div>
            <div className="space-y-4">
              {classStats.subjectBreakdown.map((subject, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{subject.subject}</span>
                    <span className="text-sm font-bold text-gray-900">{Math.round(subject.average)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all"
                      style={{ width: `${subject.average}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{subject.count} evaluation{subject.count !== 1 ? 's' : ''}</p>
                </div>
              ))}
              {classStats.subjectBreakdown.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No data available</p>
              )}
            </div>
          </Card>

          {/* Top Performers */}
          <Card variant="elevated" padding="lg" className="bg-green-50 border-2 border-green-200">
            <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
              <Award size={20} className="text-green-600" />
              Top Performers
            </h3>
            <div className="space-y-3">
              {classStats.topPerformers.map((student, index) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{student.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-700">{Math.round(student.score)}%</p>
                  </div>
                </div>
              ))}
              {classStats.topPerformers.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No data available</p>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="bordered" padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download size={16} />}
            >
              Export Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Filter size={16} />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
