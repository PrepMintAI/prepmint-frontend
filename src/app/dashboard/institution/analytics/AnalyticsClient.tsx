'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import Card, { StatCard } from '@/components/common/Card';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import FilterPanel, { FilterOptions } from '@/components/dashboard/FilterPanel';
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  Users,
  TrendingUp,
  Award,
  BookOpen,
  AlertCircle,
  ChevronRight,
  Download,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface StudentData {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  class?: string;
  section?: string;
  xp?: number;
  level?: number;
  performance?: {
    overallPercentage?: number;
    rank?: number;
    attendance?: number;
  };
}

interface EvaluationData {
  id: string;
  userId: string;
  subject?: string;
  score?: number;
  totalMarks?: number;
  status: string;
  createdAt: string | Date;
}

interface SubjectPerformance {
  subject: string;
  avgScore: number;
  count: number;
}

interface ClassStats {
  class: string;
  section: string;
  totalStudents: number;
  avgScore: number;
  topScore: number;
  evaluationCount: number;
}

// ============================================================
// Utility Functions
// ============================================================

const getClassOptions = (students: StudentData[]): string[] => {
  const classes = new Set(students
    .filter(s => s.class)
    .map(s => s.class as string)
  );
  return Array.from(classes).sort();
};

const getSectionOptions = (): string[] => ['A', 'B', 'C', 'D'];

const getFilteredStudents = (
  students: StudentData[],
  filters: FilterOptions
): StudentData[] => {
  let filtered = [...students];

  if (filters.viewLevel !== 'school' && filters.classFilter !== 'all') {
    filtered = filtered.filter(s => s.class === filters.classFilter);
  }

  if (filters.sectionFilter !== 'all') {
    filtered = filtered.filter(s => s.section === filters.sectionFilter);
  }

  if (filters.studentId) {
    filtered = filtered.filter(s => s.uid === filters.studentId);
  }

  return filtered;
};

const getFilteredEvaluations = (
  evaluations: EvaluationData[],
  filteredStudents: StudentData[]
): EvaluationData[] => {
  const studentIds = new Set(filteredStudents.map(s => s.uid));
  return evaluations.filter(e => studentIds.has(e.userId));
};

// ============================================================
// School View Component
// ============================================================

interface SchoolViewProps {
  students: StudentData[];
  evaluations: EvaluationData[];
  filters: FilterOptions;
}

const SchoolView = ({ students, evaluations, filters }: SchoolViewProps) => {
  const stats = useMemo(() => {
    const avgPerformance = students.length > 0
      ? Math.round(
          students.reduce((acc, s) => acc + (s.performance?.overallPercentage || 0), 0) /
          students.length
        )
      : 0;

    const completedEvaluations = evaluations.filter(e => e.status === 'completed').length;
    const avgXp = students.length > 0
      ? Math.round(students.reduce((acc, s) => acc + (s.xp || 0), 0) / students.length)
      : 0;

    return {
      totalStudents: students.length,
      avgPerformance,
      completedEvaluations,
      avgXp,
    };
  }, [students, evaluations]);

  const classComparison = useMemo(() => {
    const classMap: Record<string, ClassStats> = {};

    students.forEach(student => {
      const key = `${student.class}${student.section}`;
      if (!classMap[key]) {
        classMap[key] = {
          class: student.class || 'N/A',
          section: student.section || 'N/A',
          totalStudents: 0,
          avgScore: 0,
          topScore: 0,
          evaluationCount: 0,
        };
      }
      classMap[key].totalStudents += 1;
    });

    evaluations.forEach(evaluation => {
      const student = students.find(s => s.uid === evaluation.userId);
      if (student && evaluation.score && evaluation.totalMarks) {
        const key = `${student.class}${student.section}`;
        const percentage = (evaluation.score / evaluation.totalMarks) * 100;
        classMap[key].avgScore += percentage;
        classMap[key].evaluationCount += 1;
        classMap[key].topScore = Math.max(classMap[key].topScore, percentage);
      }
    });

    return Object.values(classMap)
      .map(cls => ({
        ...cls,
        avgScore: cls.evaluationCount > 0 ? Math.round(cls.avgScore / cls.evaluationCount) : 0,
      }))
      .sort((a, b) => a.class.localeCompare(b.class));
  }, [students, evaluations]);

  const subjectPerformance = useMemo(() => {
    const subjects: Record<string, { total: number; count: number }> = {};

    evaluations.forEach(evaluation => {
      if (evaluation.subject && evaluation.score && evaluation.totalMarks) {
        if (!subjects[evaluation.subject]) {
          subjects[evaluation.subject] = { total: 0, count: 0 };
        }
        const percentage = (evaluation.score / evaluation.totalMarks) * 100;
        subjects[evaluation.subject].total += percentage;
        subjects[evaluation.subject].count += 1;
      }
    });

    return Object.entries(subjects)
      .map(([name, { total, count }]) => ({
        subject: name,
        avgScore: Math.round(total / count),
        count,
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
  }, [evaluations]);

  const topPerformers = useMemo(() =>
    [...students]
      .sort((a, b) => (b.performance?.overallPercentage || 0) - (a.performance?.overallPercentage || 0))
      .slice(0, 10),
    [students]
  );

  return (
    <div className="space-y-6">
      {/* School Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <StatCard
          label="Total Students"
          value={stats.totalStudents}
          icon={<Users size={24} />}
          variant="gradient"
        />
        <StatCard
          label="Avg Performance"
          value={`${stats.avgPerformance}%`}
          icon={<TrendingUp size={24} />}
          variant="gradient"
        />
        <StatCard
          label="Completed Tests"
          value={stats.completedEvaluations}
          icon={<BookOpen size={24} />}
          variant="gradient"
        />
        <StatCard
          label="Avg XP"
          value={stats.avgXp}
          icon={<Award size={24} />}
          variant="gradient"
        />
      </motion.div>

      {/* Class Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Class Performance Comparison</h3>
          {classComparison.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={classComparison}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
                  <XAxis dataKey="class" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#3b82f6" name="Avg Score" radius={[6, 6, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <p>No data available</p>
            </div>
          )}
        </Card>

        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Subject Performance</h3>
          {subjectPerformance.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
                  <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#10b981" name="Avg Score" radius={[6, 6, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <p>No data available</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Top 10 Performers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top 10 Performers</h3>
          <div className="space-y-2">
            {topPerformers.map((student, idx) => (
              <div key={student.uid} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.displayName}</p>
                    <p className="text-xs text-gray-600">Class {student.class}{student.section}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{student.performance?.overallPercentage || 0}%</p>
                  <p className="text-xs text-gray-500">Score</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

// ============================================================
// Class View Component
// ============================================================

interface ClassViewProps {
  students: StudentData[];
  evaluations: EvaluationData[];
  filters: FilterOptions;
}

const ClassView = ({ students, evaluations, filters }: ClassViewProps) => {
  const classLabel = filters.classFilter !== 'all'
    ? `Class ${filters.classFilter}${filters.sectionFilter !== 'all' ? filters.sectionFilter : ''}`
    : 'All Classes';

  const stats = useMemo(() => {
    const avgPerformance = students.length > 0
      ? Math.round(
          students.reduce((acc, s) => acc + (s.performance?.overallPercentage || 0), 0) /
          students.length
        )
      : 0;

    const completedEvaluations = evaluations.filter(e => e.status === 'completed').length;
    const avgXp = students.length > 0
      ? Math.round(students.reduce((acc, s) => acc + (s.xp || 0), 0) / students.length)
      : 0;

    return {
      totalStudents: students.length,
      avgPerformance,
      completedEvaluations,
      avgXp,
    };
  }, [students, evaluations]);

  const subjectPerformance = useMemo(() => {
    const subjects: Record<string, { total: number; count: number }> = {};

    evaluations.forEach(evaluation => {
      if (evaluation.subject && evaluation.score && evaluation.totalMarks) {
        if (!subjects[evaluation.subject]) {
          subjects[evaluation.subject] = { total: 0, count: 0 };
        }
        const percentage = (evaluation.score / evaluation.totalMarks) * 100;
        subjects[evaluation.subject].total += percentage;
        subjects[evaluation.subject].count += 1;
      }
    });

    return Object.entries(subjects)
      .map(([name, { total, count }]) => ({
        subject: name,
        avgScore: Math.round(total / count),
        count,
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
  }, [evaluations]);

  return (
    <div className="space-y-6">
      {/* Class Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6"
      >
        <h2 className="text-2xl font-bold mb-1">{classLabel}</h2>
        <p className="text-blue-100">Class-wide analytics and performance metrics</p>
      </motion.div>

      {/* Class Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <StatCard
          label="Total Students"
          value={stats.totalStudents}
          icon={<Users size={24} />}
          variant="gradient"
        />
        <StatCard
          label="Avg Performance"
          value={`${stats.avgPerformance}%`}
          icon={<TrendingUp size={24} />}
          variant="gradient"
        />
        <StatCard
          label="Tests Completed"
          value={stats.completedEvaluations}
          icon={<BookOpen size={24} />}
          variant="gradient"
        />
        <StatCard
          label="Avg XP"
          value={stats.avgXp}
          icon={<Award size={24} />}
          variant="gradient"
        />
      </motion.div>

      {/* Subject Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Subject Performance</h3>
          {subjectPerformance.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
                  <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#8b5cf6" name="Avg Score" radius={[6, 6, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <p>No evaluation data available</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Student List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Student Performance</h3>
          {students.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {students
                .sort((a, b) => (b.performance?.overallPercentage || 0) - (a.performance?.overallPercentage || 0))
                .map((student) => (
                  <div key={student.uid} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {student.displayName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.displayName}</p>
                        <p className="text-xs text-gray-600">{student.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{student.performance?.overallPercentage || 0}%</p>
                      <p className="text-xs text-gray-500">Level {student.level || 1}</p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-2 text-gray-300" />
              <p>No students in this class</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

// ============================================================
// Student View Component
// ============================================================

interface StudentViewProps {
  students: StudentData[];
  evaluations: EvaluationData[];
  filters: FilterOptions;
}

const StudentView = ({ students, evaluations, filters }: StudentViewProps) => {
  const student = students[0];

  if (!student) {
    return (
      <Card variant="elevated" padding="lg" className="text-center py-12">
        <AlertCircle size={48} className="mx-auto mb-4 text-yellow-500" />
        <p className="text-gray-600 text-lg font-medium">No student selected</p>
      </Card>
    );
  }

  const studentEvaluations = evaluations.filter(e => e.userId === student.uid);
  const subjectPerformance = useMemo(() => {
    const subjects: Record<string, { total: number; count: number }> = {};

    studentEvaluations.forEach(evaluation => {
      if (evaluation.subject && evaluation.score && evaluation.totalMarks) {
        if (!subjects[evaluation.subject]) {
          subjects[evaluation.subject] = { total: 0, count: 0 };
        }
        const percentage = (evaluation.score / evaluation.totalMarks) * 100;
        subjects[evaluation.subject].total += percentage;
        subjects[evaluation.subject].count += 1;
      }
    });

    return Object.entries(subjects)
      .map(([name, { total, count }]) => ({
        subject: name,
        avgScore: Math.round(total / count),
        count,
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
  }, [studentEvaluations]);

  return (
    <div className="space-y-6">
      {/* Student Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg p-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
            {student.displayName[0]}
          </div>
          <div>
            <h2 className="text-3xl font-bold">{student.displayName}</h2>
            <p className="text-pink-100">Class {student.class}{student.section}</p>
          </div>
        </div>
      </motion.div>

      {/* Student Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <StatCard
          label="Overall Score"
          value={`${student.performance?.overallPercentage || 0}%`}
          icon={<TrendingUp size={24} />}
          variant="gradient"
        />
        <StatCard
          label="Current Level"
          value={student.level || 1}
          icon={<Award size={24} />}
          variant="gradient"
        />
        <StatCard
          label="Total XP"
          value={student.xp || 0}
          icon={<BookOpen size={24} />}
          variant="gradient"
        />
        <StatCard
          label="Rank"
          value={`#${student.performance?.rank || '-'}`}
          icon={<Users size={24} />}
          variant="gradient"
        />
      </motion.div>

      {/* Subject Wise Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Subject Performance</h3>
          {subjectPerformance.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
                  <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#ec4899" name="Score" radius={[6, 6, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <p>No evaluation data available</p>
            </div>
          )}
        </Card>

        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Evaluations</h3>
          {studentEvaluations.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {studentEvaluations
                .sort((a, b) => {
                  const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                  const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                  return bTime - aTime;
                })
                .slice(0, 10)
                .map((evaluation) => (
                  <div key={evaluation.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900">{evaluation.subject || 'Assessment'}</p>
                      <p className="text-lg font-bold text-green-600">
                        {evaluation.score}/{evaluation.totalMarks}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{evaluation.status}</span>
                      <span>{Math.round((evaluation.score ?? 0) / (evaluation.totalMarks ?? 1) * 100)}%</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen size={48} className="mx-auto mb-2 text-gray-300" />
              <p>No evaluations yet</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

// ============================================================
// Main Analytics Client
// ============================================================

interface AnalyticsClientProps {
  institutionId: string;
}

export function InstitutionAnalyticsView({ institutionId }: AnalyticsClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    viewLevel: 'school',
    classFilter: 'all',
    sectionFilter: 'all',
    studentId: '',
    subjectFilter: 'all',
    dateRange: 30,
  });

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      if (!institutionId) return;

      try {
        setIsLoading(true);

        // Fetch all students
        const { data: studentsData, error: studentsError } = await supabase
          .from('users')
          .select('*')
          .eq('institution_id', institutionId)
          .eq('role', 'student');

        if (studentsError) throw studentsError;

        const students = ((studentsData || []) as any[]).map(doc => ({
          uid: doc.id,
          id: doc.id,
          displayName: doc.display_name || doc.email || '',
          email: doc.email,
          class: doc.class,
          section: doc.section,
          xp: doc.xp,
          level: doc.level,
        })) as StudentData[];
        setStudents(students);

        // Fetch all evaluations
        const { data: evaluationsData, error: evaluationsError } = await supabase
          .from('evaluations')
          .select('*')
          .eq('institution_id', institutionId);

        if (evaluationsError) throw evaluationsError;

        const evaluations = ((evaluationsData || []) as any[]).map(doc => ({
          id: doc.id,
          userId: doc.user_id,
          subject: doc.subject,
          score: doc.score,
          totalMarks: doc.total_marks,
          status: doc.status,
          createdAt: doc.created_at,
        })) as EvaluationData[];
        setEvaluations(evaluations);
      } catch (error) {
        logger.error('InstitutionAnalyticsView - Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [institutionId]);

  // Get filter options
  const availableClasses = useMemo(() => getClassOptions(students), [students]);
  const availableSections = getSectionOptions();
  const availableStudents = useMemo(() =>
    getFilteredStudents(students, { ...filters, viewLevel: 'student' })
      .map(s => ({
        id: s.uid,
        name: s.displayName,
        rollNo: s.email.split('@')[0],
        class: s.class || '',
        section: s.section || '',
      })),
    [students, filters]
  );

  // Filter data based on current filters
  const filteredStudents = useMemo(
    () => getFilteredStudents(students, filters),
    [students, filters]
  );

  const filteredEvaluations = useMemo(
    () => getFilteredEvaluations(evaluations, filteredStudents),
    [evaluations, filteredStudents]
  );

  if (isLoading) {
    return <Spinner fullScreen />;
  }

  if (students.length === 0) {
    return (
      <Card variant="elevated" padding="lg" className="text-center py-12">
        <AlertCircle size={48} className="mx-auto mb-4 text-yellow-500" />
        <p className="text-gray-600 text-lg font-medium">No students found</p>
        <p className="text-gray-500 text-sm mt-2">Add students to your institution to view analytics</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Institution Analytics</h1>
          <p className="text-gray-600 mt-1">Multi-level performance insights and trends</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            leftIcon={<Download size={18} />}
          >
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        availableClasses={availableClasses}
        availableSections={availableSections}
        availableStudents={availableStudents}
        availableSubjects={[
          { id: 'math', name: 'Mathematics' },
          { id: 'science', name: 'Science' },
          { id: 'english', name: 'English' },
          { id: 'history', name: 'History' },
          { id: 'geography', name: 'Geography' },
        ]}
      />

      {/* Dynamic Content Based on View Level */}
      {filters.viewLevel === 'school' && (
        <SchoolView
          students={filteredStudents}
          evaluations={filteredEvaluations}
          filters={filters}
        />
      )}

      {filters.viewLevel === 'class' && (
        <ClassView
          students={filteredStudents}
          evaluations={filteredEvaluations}
          filters={filters}
        />
      )}

      {filters.viewLevel === 'student' && (
        <StudentView
          students={filteredStudents}
          evaluations={filteredEvaluations}
          filters={filters}
        />
      )}
    </div>
  );
}
