// src/app/dashboard/teacher/DashboardClient.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { authInstance as auth, db } from '@/lib/firebase.client';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import {
  Users, CheckCircle, Clock, TrendingUp,
  BookOpen, AlertCircle, Calendar,
  ChevronRight, BarChart3,
  ClipboardList, Filter
} from 'lucide-react';
import { logger } from '@/lib/logger';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

interface TeacherDashboardClientProps {
  userId: string;
}

interface TeacherData {
  uid: string;
  displayName: string;
  email: string;
  institutionId: string;
  subjects?: string[];
  subjectNames?: string[];
  classTeacher?: string;
  className?: string;
  xp?: number;
  level?: number;
}

interface InstitutionData {
  name: string;
  location?: string;
  establishedYear?: number;
}

interface StudentData {
  uid: string;
  displayName: string;
  email: string;
  class?: number | string;
  section?: string;
  xp: number;
  level: number;
}

interface EvaluationData {
  id: string;
  title?: string;
  subject?: string;
  class?: string;
  section?: string;
  status: string;
  createdAt: any;
  userId?: string;
  totalMarks?: number;
}

export function TeacherDashboardClient({ userId }: TeacherDashboardClientProps) {
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [institution, setInstitution] = useState<InstitutionData | null>(null);
  const [allStudents, setAllStudents] = useState<StudentData[]>([]);
  const [allEvaluations, setAllEvaluations] = useState<EvaluationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('all');
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch teacher data
        const teacherDoc = await getDoc(doc(db, 'users', userId));
        if (!teacherDoc.exists()) {
          logger.error('Teacher not found');
          return;
        }
        const teacherData = teacherDoc.data() as TeacherData;
        setTeacher(teacherData);

        // Fetch institution data
        if (teacherData.institutionId) {
          const institutionDoc = await getDoc(doc(db, 'institutions', teacherData.institutionId));
          if (institutionDoc.exists()) {
            setInstitution(institutionDoc.data() as InstitutionData);
          }
        }

        // Fetch students from the same institution
        const studentsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'student'),
          where('institutionId', '==', teacherData.institutionId)
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        const students: StudentData[] = studentsSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        } as StudentData));
        setAllStudents(students);

        // Fetch evaluations for this institution
        const evaluationsQuery = query(
          collection(db, 'evaluations'),
          where('institutionId', '==', teacherData.institutionId),
          orderBy('createdAt', 'desc'),
          firestoreLimit(50)
        );
        const evaluationsSnapshot = await getDocs(evaluationsQuery);
        const evaluations: EvaluationData[] = evaluationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as EvaluationData));
        setAllEvaluations(evaluations);
      } catch (error) {
        logger.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  // Pending evaluations
  const pendingEvaluations = useMemo(() => {
    return allEvaluations.filter(e => e.status === 'pending' || e.status === 'in-progress');
  }, [allEvaluations]);

  // Completed evaluations this week
  const completedThisWeek = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return allEvaluations.filter(e => {
      const createdAt = e.createdAt?.toDate ? e.createdAt.toDate() : new Date(e.createdAt);
      return e.status === 'completed' && createdAt >= oneWeekAgo;
    }).length;
  }, [allEvaluations]);

  // Calculate overall average (based on completed evaluations)
  const overallAverage = useMemo(() => {
    const completed = allEvaluations.filter(e => e.status === 'completed' && e.totalMarks);
    if (completed.length === 0) return 0;
    // Mock calculation - in real app, you'd sum actual scores
    return Math.floor(75 + Math.random() * 15); // 75-90%
  }, [allEvaluations]);

  // Calculate average attendance (mock - would come from activity collection)
  const avgAttendance = useMemo(() => {
    if (allStudents.length === 0) return 0;
    return Math.floor(85 + Math.random() * 10); // 85-95%
  }, [allStudents]);

  // Upcoming tests (scheduled status)
  const upcomingTests = useMemo(() => {
    return allEvaluations
      .filter(e => e.status === 'scheduled')
      .slice(0, 5);
  }, [allEvaluations]);

  // Recent activity
  const recentActivity = useMemo(() => {
    return allEvaluations
      .filter(e => e.status === 'completed')
      .slice(0, 4)
      .map(evaluation => {
        const createdAt = evaluation.createdAt?.toDate ? evaluation.createdAt.toDate() : new Date(evaluation.createdAt);
        const daysAgo = Math.floor((new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return {
          action: `Graded ${evaluation.title || 'Evaluation'}`,
          detail: `${evaluation.subject || 'N/A'} • Class ${evaluation.class || 'N/A'}${evaluation.section || ''}`,
          time: `${daysAgo} days ago`,
          type: 'evaluation'
        };
      });
  }, [allEvaluations]);

  // Class performance data (simplified)
  const classPerformance = useMemo(() => {
    // Group students by class
    const classCounts: Record<string, number> = {};
    allStudents.forEach(student => {
      if (student.class && student.section) {
        const key = `${student.class}${student.section}`;
        classCounts[key] = (classCounts[key] || 0) + 1;
      }
    });

    return Object.entries(classCounts).map(([classKey, count]) => ({
      class: `Class ${classKey}`,
      subject: teacher?.subjectNames?.[0] || 'N/A',
      average: Math.floor(70 + Math.random() * 20), // Mock average
      students: count,
      trend: (Math.random() > 0.5 ? 'up' : 'down') as 'up' | 'down'
    }));
  }, [allStudents, teacher]);

  // Class options for filter
  const classOptions = useMemo(() => {
    const uniqueClasses = new Set<string>();
    allStudents.forEach(student => {
      if (student.class && student.section) {
        uniqueClasses.add(`${student.class}${student.section}`);
      }
    });

    return [
      { id: 'all', name: 'All Classes', students: allStudents.length },
      ...Array.from(uniqueClasses).map(cls => ({
        id: cls,
        name: `Class ${cls}`,
        students: allStudents.filter(s => `${s.class}${s.section}` === cls).length
      }))
    ];
  }, [allStudents]);

  if (isLoading) {
    return <Spinner fullScreen label="Loading dashboard..." />;
  }

  if (!teacher) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Teacher data not found</p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const stats = {
    totalStudents: allStudents.length,
    pendingEvaluations: pendingEvaluations.length,
    completedThisWeek,
    avgClassScore: overallAverage,
    activeClasses: classPerformance.length,
    attendanceRate: avgAttendance,
  };

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {teacher.displayName}
            </h1>
            <p className="text-gray-600 mt-1">
              {institution?.name || 'PrepMint'} • Level {teacher.level || 1}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/dashboard/teacher/evaluations')}
              variant="primary"
              leftIcon={<CheckCircle size={18} />}
            >
              Review Submissions ({stats.pendingEvaluations})
            </Button>
            <Button
              onClick={() => router.push('/dashboard/teacher/students')}
              variant="outline"
              leftIcon={<Users size={18} />}
            >
              Manage Students
            </Button>
          </div>
        </div>

        {/* Class Filter */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 bg-white"
            >
              {classOptions.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.students} students)
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <Card variant="elevated" padding="lg" className="text-center">
          <Users className="mx-auto mb-2 text-blue-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
          <p className="text-xs text-gray-600 mt-1">Total Students</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <Clock className="mx-auto mb-2 text-orange-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats.pendingEvaluations}</p>
          <p className="text-xs text-gray-600 mt-1">Pending Reviews</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats.completedThisWeek}</p>
          <p className="text-xs text-gray-600 mt-1">Graded This Week</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <TrendingUp className="mx-auto mb-2 text-purple-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats.avgClassScore}%</p>
          <p className="text-xs text-gray-600 mt-1">Class Average</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <BookOpen className="mx-auto mb-2 text-indigo-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats.activeClasses}</p>
          <p className="text-xs text-gray-600 mt-1">Active Classes</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <Users className="mx-auto mb-2 text-teal-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats.attendanceRate}%</p>
          <p className="text-xs text-gray-600 mt-1">Attendance Rate</p>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Evaluations */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2"
        >
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="text-red-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Pending Evaluations</h3>
                  <p className="text-sm text-gray-600">Requires immediate attention</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => router.push('/dashboard/teacher/evaluations')}
              >
                View All ({stats.pendingEvaluations})
              </Button>
            </div>

            {pendingEvaluations.length > 0 ? (
              <div className="space-y-3">
                {pendingEvaluations.slice(0, 3).map((evaluation) => (
                  <motion.div
                    key={evaluation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group p-4 rounded-lg hover:bg-gray-50 transition-all cursor-pointer border border-gray-200 hover:shadow-sm"
                    onClick={() => router.push(`/dashboard/teacher/evaluations/${evaluation.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{evaluation.title || 'Evaluation'}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <BookOpen size={14} />
                            {evaluation.subject || 'N/A'}
                          </span>
                          <span>•</span>
                          <span>Class {evaluation.class || 'N/A'}{evaluation.section || ''}</span>
                          {evaluation.totalMarks && (
                            <>
                              <span>•</span>
                              <span>Max: {evaluation.totalMarks} marks</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight
                        className="text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 ml-4"
                        size={20}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle size={48} className="mx-auto mb-2 text-gray-300" />
                <p>All caught up! No pending evaluations 🎉</p>
              </div>
            )}

            {pendingEvaluations.length > 3 && (
              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/dashboard/teacher/evaluations')}
                  rightIcon={<ChevronRight size={16} />}
                >
                  View All Pending Submissions
                </Button>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card variant="elevated" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Upcoming Tests</h3>
                <p className="text-sm text-gray-600">Scheduled</p>
              </div>
            </div>

            {upcomingTests.length > 0 ? (
              <div className="space-y-3">
                {upcomingTests.slice(0, 3).map((test) => {
                  const testDate = test.createdAt?.toDate ? test.createdAt.toDate() : new Date(test.createdAt);
                  return (
                    <div key={test.id} className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{test.title || 'Evaluation'}</p>
                          <p className="text-xs text-gray-600 mt-1">Class {test.class || 'N/A'}{test.section || ''}</p>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {test.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock size={12} />
                        <span>{testDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={48} className="mx-auto mb-2 text-gray-300" />
                <p>No upcoming tests</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Class Performance Overview */}
      <motion.div
        custom={3}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-purple-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Class Performance Overview</h3>
                <p className="text-sm text-gray-600">Average scores by class</p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => router.push('/analytics')}
            >
              Detailed Analytics
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Subject</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Students</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Average</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {classPerformance.map((cls, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{cls.class}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{cls.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">{cls.students}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-semibold ${
                        cls.average >= 85 ? 'text-green-600' : 
                        cls.average >= 70 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {cls.average}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {cls.trend === 'up' ? (
                        <span className="inline-flex items-center text-green-600">
                          <TrendingUp size={16} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-600">
                          <TrendingUp size={16} className="rotate-180" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <motion.div
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card variant="elevated" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="text-gray-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-600">Your latest actions</p>
              </div>
            </div>

            <div className="space-y-2">
              {recentActivity.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{item.action}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{item.detail}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
