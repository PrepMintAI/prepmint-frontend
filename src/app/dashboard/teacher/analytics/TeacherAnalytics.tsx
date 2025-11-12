'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import Card, { CardHeader, CardBody } from '@/components/common/Card';
import Spinner from '@/components/common/Spinner';
import { logger } from '@/lib/logger';
import {
  Users,
  TrendingUp,
  BookOpen,
  Award,
  Target,
  ArrowUp,
  ArrowDown,
  Calendar,
  BarChart3
} from 'lucide-react';
import { calculateLevel, levelProgress } from '@/lib/gamify';

// ========== TYPE DEFINITIONS ==========

interface Student {
  uid: string;
  displayName: string;
  email: string;
  xp: number;
  level: number;
  avgScore?: number;
  testsCount?: number;
}

interface ClassStats {
  avgPerformance: number;
  topStudents: Student[];
  bottomStudents: Student[];
  subjectDistribution: Record<string, number>;
  completionRate: number;
  totalStudents: number;
  totalEvaluations: number;
}

interface SubjectPerformance {
  subject: string;
  avgScore: number;
  testsCount: number;
  trend: number;
}

interface RecentTest {
  id: string;
  subject: string;
  score: number;
  marksAwarded: number;
  totalMarks: number;
  date: Date;
  studentName: string;
  topic?: string;
}

interface StudentAnalytics {
  student: Student;
  avgScore: number;
  testsCompleted: number;
  subjectPerformance: SubjectPerformance[];
  recentTests: RecentTest[];
  totalXp: number;
  currentLevel: number;
  classAvgScore: number;
}

// ========== MAIN COMPONENT ==========

interface TeacherAnalyticsProps {
  userId: string;
  userName: string;
}

export default function TeacherAnalytics({
  userId,
  userName
}: TeacherAnalyticsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [classStats, setClassStats] = useState<ClassStats | null>(null);
  const [studentAnalytics, setStudentAnalytics] = useState<StudentAnalytics | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filterError, setFilterError] = useState<string>('');

  const institutionId = user?.institutionId;

  // Fetch all students in teacher's institution
  useEffect(() => {
    const fetchStudents = async () => {
      if (!institutionId) {
        logger.warn('No institution ID found for teacher');
        setLoading(false);
        return;
      }

      try {
        const { data: studentsData, error: studentsError } = await supabase
          .from('users')
          .select('*')
          .eq('institution_id', institutionId)
          .eq('role', 'student')
          .order('display_name', { ascending: true });

        if (studentsError) {
          throw studentsError;
        }

        const studentsList = ((studentsData || []) as any[]).map(doc => ({
          uid: doc.id,
          displayName: doc.display_name || 'Unknown',
          email: doc.email || '',
          xp: doc.xp || 0,
          level: doc.level || 1,
        }));

        setStudents(studentsList);
      } catch (error) {
        logger.error('Error fetching students:', error);
        setFilterError('Failed to load students');
      }
    };

    fetchStudents();
  }, [institutionId]);

  // Fetch class stats when no student selected
  useEffect(() => {
    if (selectedStudentId || !institutionId || students.length === 0) {
      return;
    }

    const fetchClassStats = async () => {
      try {
        setLoading(true);

        // Fetch all evaluations for institution
        const { data: evaluations, error: evalsError } = await supabase
          .from('evaluations')
          .select('*')
          .eq('institution_id', institutionId);

        if (evalsError) {
          logger.error('Error fetching evaluations:', evalsError);
        }

        const evaluationsData = evaluations || [];

        // Calculate class-wide metrics
        const studentPerformance = new Map<string, { scores: number[]; subjects: Set<string> }>();
        const subjectMap = new Map<string, number>();
        let totalSubjects = 0;

        evaluationsData.forEach((evaluation: any) => {
          const studentId = evaluation.user_id;
          const subject = evaluation.subject || 'Unknown';
          const percentage = ((evaluation.total_marks > 0) ? Math.round((evaluation.score / evaluation.total_marks) * 100) : 0) || 0;

          // Track student performance
          const current = studentPerformance.get(studentId) || { scores: [], subjects: new Set() };
          current.scores.push(percentage);
          current.subjects.add(subject);
          studentPerformance.set(studentId, current);

          // Track subject distribution
          subjectMap.set(subject, (subjectMap.get(subject) || 0) + 1);
          totalSubjects++;
        });

        // Calculate average performance
        const allScores: number[] = [];
        studentPerformance.forEach(perf => {
          allScores.push(...perf.scores);
        });
        const avgPerformance = allScores.length > 0
          ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
          : 0;

        // Get top and bottom 3 students
        const studentStats = Array.from(studentPerformance.entries())
          .map(([studentId, perf]) => {
            const student = students.find(s => s.uid === studentId);
            const avgScore = Math.round(perf.scores.reduce((a, b) => a + b, 0) / perf.scores.length);
            return {
              ...student,
              avgScore,
              testsCount: perf.scores.length,
            } as Student;
          })
          .filter(s => s.uid) // Remove undefined students
          .sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0));

        const topStudents = studentStats.slice(0, 3);
        const bottomStudents = studentStats.slice(-3).reverse();

        // Convert subject distribution to percentages
        const subjectDistribution: Record<string, number> = {};
        subjectMap.forEach((count, subject) => {
          subjectDistribution[subject] = Math.round((count / totalSubjects) * 100);
        });

        // Calculate completion rate
        const completionRate = students.length > 0
          ? Math.round((studentPerformance.size / students.length) * 100)
          : 0;

        setClassStats({
          avgPerformance,
          topStudents,
          bottomStudents,
          subjectDistribution,
          completionRate,
          totalStudents: students.length,
          totalEvaluations: evaluationsData.length,
        });

        setLoading(false);
      } catch (error) {
        logger.error('Error fetching class stats:', error);
        setFilterError('Failed to load class analytics');
        setLoading(false);
      }
    };

    fetchClassStats();
  }, [selectedStudentId, institutionId, students]);

  // Fetch individual student analytics
  useEffect(() => {
    if (!selectedStudentId || !institutionId) {
      setStudentAnalytics(null);
      return;
    }

    const fetchStudentAnalytics = async () => {
      try {
        setLoading(true);

        // Get student data
        const { data: studentData, error: studentError } = await supabase
          .from('users')
          .select('*')
          .eq('id', selectedStudentId)
          .single();

        if (studentError || !studentData) {
          setFilterError('Student not found');
          setLoading(false);
          return;
        }

        const sData = studentData as any;
        const student: Student = {
          uid: selectedStudentId,
          displayName: sData.display_name || 'Unknown',
          email: sData.email || '',
          xp: sData.xp || 0,
          level: sData.level || 1,
        };

        // Fetch student's evaluations
        const { data: evaluations, error: evalError } = await supabase
          .from('evaluations')
          .select('*')
          .eq('user_id', selectedStudentId)
          .eq('institution_id', institutionId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (evalError) {
          logger.error('Error fetching student evaluations:', evalError);
        }

        const evaluationsData = evaluations || [];

        // Calculate subject-wise performance
        const subjectMap = new Map<string, { scores: number[]; count: number }>();

        evaluationsData.forEach((evaluation: any) => {
          const subject = evaluation.subject || 'Unknown';
          const percentage = ((evaluation.total_marks > 0) ? Math.round((evaluation.score / evaluation.total_marks) * 100) : 0) || 0;
          const current = subjectMap.get(subject) || { scores: [], count: 0 };
          current.scores.push(percentage);
          current.count++;
          subjectMap.set(subject, current);
        });

        const subjectPerformance: SubjectPerformance[] = [];
        subjectMap.forEach((value, subject) => {
          const avgScore = Math.round(value.scores.reduce((a, b) => a + b, 0) / value.scores.length);
          const recentAvg = Math.round(value.scores.slice(0, 5).reduce((a, b) => a + b, 0) / Math.min(5, value.scores.length));
          const trend = recentAvg - avgScore;

          subjectPerformance.push({
            subject,
            avgScore,
            testsCount: value.count,
            trend,
          });
        });

        // Get recent tests
        const recentTestsData: RecentTest[] = evaluationsData.slice(0, 10).map((evaluation: any) => ({
          id: evaluation.id,
          subject: evaluation.subject || 'Unknown',
          score: ((evaluation.total_marks > 0) ? Math.round((evaluation.score / evaluation.total_marks) * 100) : 0) || 0,
          marksAwarded: evaluation.marksAwarded || 0,
          totalMarks: evaluation.totalMarks || 100,
          date: (evaluation.created_at ? new Date(evaluation.created_at) : new Date()) || new Date(),
          studentName: student.displayName,
          topic: evaluation.topic || evaluation.title,
        }));

        // Calculate overall average
        const avgScore = evaluationsData.length > 0
          ? Math.round(evaluationsData.reduce((sum: number, evaluation: any) => sum + (((evaluation.total_marks > 0) ? Math.round((evaluation.score / evaluation.total_marks) * 100) : 0) || 0), 0) / evaluationsData.length)
          : 0;

        // Fetch class average for comparison
        const { data: classEvaluationsData } = await supabase
          .from('evaluations')
          .select('score, total_marks')
          .eq('institution_id', institutionId || '');

        const classEvaluations = (classEvaluationsData || []) as any[];
        const classAvgScore = classEvaluations.length > 0
          ? Math.round(classEvaluations.reduce((sum: number, ev: any) => sum + (((ev.total_marks > 0) ? Math.round((ev.score / ev.total_marks) * 100) : 0) || 0), 0) / classEvaluations.length)
          : 0;

        setStudentAnalytics({
          student,
          avgScore,
          testsCompleted: evaluationsData.length,
          subjectPerformance: subjectPerformance.sort((a, b) => b.avgScore - a.avgScore),
          recentTests: recentTestsData,
          totalXp: student.xp,
          currentLevel: student.level,
          classAvgScore,
        });

        setLoading(false);
      } catch (error) {
        logger.error('Error fetching student analytics:', error);
        setFilterError('Failed to load student analytics');
        setLoading(false);
      }
    };

    fetchStudentAnalytics();
  }, [selectedStudentId, institutionId]);

  if (loading) {
    return <Spinner fullScreen label="Loading analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card variant="elevated" padding="lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Student
              </label>
              <select
                value={selectedStudentId || ''}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value || null);
                  setFilterError('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Students (Class Overview)</option>
                {students.map(student => (
                  <option key={student.uid} value={student.uid}>
                    {student.displayName} ({student.level})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {selectedStudentId
                  ? `Viewing ${students.find(s => s.uid === selectedStudentId)?.displayName}'s analytics`
                  : `Viewing class overview (${students.length} students)`}
              </p>
            </div>

            {filterError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{filterError}</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Class Overview */}
      {!selectedStudentId && classStats && (
        <ClassOverview classStats={classStats} />
      )}

      {/* Individual Student View */}
      {selectedStudentId && studentAnalytics && (
        <StudentDetailView
          analytics={studentAnalytics}
          allStudents={students}
        />
      )}

      {/* Empty State */}
      {!selectedStudentId && students.length === 0 && (
        <Card variant="elevated" padding="lg">
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 font-medium">No students found</p>
            <p className="text-sm text-gray-500 mt-1">
              You don\'t have any students in your institution yet.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

// ========== CLASS OVERVIEW COMPONENT ==========

interface ClassOverviewProps {
  classStats: ClassStats;
}

function ClassOverview({ classStats }: ClassOverviewProps) {
  return (
    <>
      {/* Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card variant="elevated" padding="lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Avg Performance</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{classStats.avgPerformance}%</p>
              <p className="text-xs text-gray-500 mt-2">Class wide</p>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <BarChart3 className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{classStats.totalStudents}</p>
              <p className="text-xs text-gray-500 mt-2">In class</p>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{classStats.completionRate}%</p>
              <p className="text-xs text-gray-500 mt-2">Evaluated</p>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Target className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Evaluations</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{classStats.totalEvaluations}</p>
              <p className="text-xs text-gray-500 mt-2">Submitted</p>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <Award className="text-orange-600" size={24} />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Top Students */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Top 3 Performers"
            subtitle="Highest average scores"
            icon={<Trophy size={20} />}
          />
          <CardBody>
            <div className="space-y-3">
              {classStats.topStudents.length > 0 ? (
                classStats.topStudents.map((student, index) => (
                  <div key={student.uid} className="border-b border-gray-200 pb-3 last:border-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          #{index + 1} {student.displayName}
                        </p>
                        <p className="text-xs text-gray-500">Level {student.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{student.avgScore}%</p>
                        <p className="text-xs text-gray-500">{student.testsCount} tests</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No data available</p>
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Bottom Students */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Students Needing Support"
            subtitle="Lowest average scores"
            icon={<TrendingUp size={20} />}
          />
          <CardBody>
            <div className="space-y-3">
              {classStats.bottomStudents.length > 0 ? (
                classStats.bottomStudents.map((student, index) => (
                  <div key={student.uid} className="border-b border-gray-200 pb-3 last:border-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {student.displayName}
                        </p>
                        <p className="text-xs text-gray-500">Level {student.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">{student.avgScore}%</p>
                        <p className="text-xs text-gray-500">{student.testsCount} tests</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No data available</p>
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Subject Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Subject Distribution"
            subtitle="Evaluation breakdown by subject"
            icon={<BookOpen size={20} />}
          />
          <CardBody>
            <div className="space-y-4">
              {Object.entries(classStats.subjectDistribution).length > 0 ? (
                Object.entries(classStats.subjectDistribution).map(([subject, percentage]) => (
                  <div key={subject}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900">{subject}</p>
                      <p className="text-sm font-medium text-gray-600">{percentage}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No subject data available</p>
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </>
  );
}

// ========== STUDENT DETAIL VIEW COMPONENT ==========

interface StudentDetailViewProps {
  analytics: StudentAnalytics;
  allStudents: Student[];
}

function StudentDetailView({ analytics, allStudents }: StudentDetailViewProps) {
  const performanceDiff = analytics.avgScore - analytics.classAvgScore;
  const performanceStatus = performanceDiff > 0 ? 'above' : performanceDiff < 0 ? 'below' : 'at';
  const levelProgressPercent = levelProgress(analytics.totalXp);

  return (
    <>
      {/* Student Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card variant="gradient" padding="lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{analytics.student.displayName}</h2>
              <p className="text-sm text-gray-600 mt-1">{analytics.student.email}</p>
              <div className="flex items-center gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-600">Level</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.currentLevel}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total XP</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.totalXp.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-4xl font-bold text-blue-600">{analytics.avgScore}%</p>
              <p className="text-xs text-gray-600 mt-1">Average Score</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Comparison with Class Average */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Card variant="elevated" padding="lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Student Average</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.avgScore}%</p>
              <p className="text-xs text-gray-500 mt-2">{analytics.testsCompleted} tests</p>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Target className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Class Average</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.classAvgScore}%</p>
              <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                performanceDiff > 0 ? 'text-green-600' : performanceDiff < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {performanceDiff > 0 ? (
                  <ArrowUp size={12} />
                ) : performanceDiff < 0 ? (
                  <ArrowDown size={12} />
                ) : null}
                <span>{Math.abs(performanceDiff).toFixed(1)}% {performanceStatus} average</span>
              </div>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <BarChart3 className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* XP and Level Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Level Progress"
            subtitle={`${levelProgressPercent.toFixed(0)}% to next level`}
            icon={<Award size={20} />}
          />
          <CardBody>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-4">
              {analytics.totalXp.toLocaleString()} XP earned
            </p>
          </CardBody>
        </Card>
      </motion.div>

      {/* Subject Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Subject Performance"
            subtitle="Breakdown by subject"
            icon={<BookOpen size={20} />}
          />
          <CardBody>
            <div className="space-y-4">
              {analytics.subjectPerformance.length > 0 ? (
                analytics.subjectPerformance.map((subject) => (
                  <div key={subject.subject} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{subject.subject}</p>
                        <p className="text-xs text-gray-500">{subject.testsCount} tests</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{subject.avgScore}%</p>
                        <div className={`flex items-center gap-1 text-xs mt-1 ${
                          subject.trend >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {subject.trend >= 0 ? (
                            <ArrowUp size={12} />
                          ) : (
                            <ArrowDown size={12} />
                          )}
                          <span>{Math.abs(subject.trend).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${subject.avgScore}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No subject data available</p>
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Recent Test Scores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Recent Test Scores"
            subtitle={`Last ${Math.min(10, analytics.recentTests.length)} evaluations`}
            icon={<Calendar size={20} />}
          />
          <CardBody>
            <div className="space-y-3">
              {analytics.recentTests.length > 0 ? (
                analytics.recentTests.map((test) => {
                  const scoreColor =
                    test.score >= 90
                      ? 'bg-green-50 border-green-200'
                      : test.score >= 75
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-orange-50 border-orange-200';

                  const textColor =
                    test.score >= 90
                      ? 'text-green-700'
                      : test.score >= 75
                      ? 'text-blue-700'
                      : 'text-orange-700';

                  return (
                    <div key={test.id} className={`border ${scoreColor} rounded-lg p-4 flex items-center justify-between`}>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{test.subject}</p>
                        {test.topic && <p className="text-sm text-gray-600">{test.topic}</p>}
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Calendar size={12} />
                          {test.date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-3xl font-bold ${textColor}`}>{test.score}%</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {test.marksAwarded}/{test.totalMarks}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">No test scores available</p>
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </>
  );
}

// Icon Import
function Trophy(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M6 9H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2m-4-3V5a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v1m4 3a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1"></path>
    </svg>
  );
}
