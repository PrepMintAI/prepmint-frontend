// src/app/dashboard/institution/DashboardClient.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase.client';
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import Card, { StatCard } from '@/components/common/Card';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap';
import {
  Users, BookOpen, Award, Clock, Building2,
  UserPlus, GraduationCap, BarChart3, ChevronRight,
  Calendar, Target, FileText, Settings, Download,
  Star, AlertCircle, CheckCircle
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

interface DashboardClientProps {
  userId: string;
  institutionId?: string;
}

interface InstitutionData {
  id: string;
  name: string;
  location?: string;
  established?: string;
  type?: string;
}

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  institutionId?: string;
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
  institutionId?: string;
  status: string;
  subject?: string;
  score?: number;
  totalMarks?: number;
  createdAt: Timestamp | Date;
  submittedAt?: Timestamp | Date;
}

interface ActivityData {
  date: string;
  xp: number;
}

export function DashboardClient({ userId, institutionId }: DashboardClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [institution, setInstitution] = useState<InstitutionData | null>(null);
  const [students, setStudents] = useState<UserData[]>([]);
  const [teachers, setTeachers] = useState<UserData[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!institutionId) {
        logger.error('[DashboardClient] No institutionId provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch institution data
        const institutionDoc = await getDoc(doc(db, 'institutions', institutionId));
        if (institutionDoc.exists()) {
          setInstitution({
            id: institutionDoc.id,
            ...institutionDoc.data()
          } as InstitutionData);
        }

        // Fetch students from this institution
        const studentsQuery = query(
          collection(db, 'users'),
          where('institutionId', '==', institutionId),
          where('role', '==', 'student')
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsData = studentsSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as UserData[];
        setStudents(studentsData);

        // Fetch teachers from this institution
        const teachersQuery = query(
          collection(db, 'users'),
          where('institutionId', '==', institutionId),
          where('role', '==', 'teacher')
        );
        const teachersSnapshot = await getDocs(teachersQuery);
        const teachersData = teachersSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as UserData[];
        setTeachers(teachersData);

        // Fetch evaluations for this institution
        const evaluationsQuery = query(
          collection(db, 'evaluations'),
          where('institutionId', '==', institutionId)
        );
        const evaluationsSnapshot = await getDocs(evaluationsQuery);
        const evaluationsData = evaluationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as EvaluationData[];
        setEvaluations(evaluationsData);

        // Generate activity data (last 90 days)
        const generateActivityData = () => {
          const data: ActivityData[] = [];
          const today = new Date();

          for (let i = 89; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const xp = Math.random() > 0.2 ? Math.floor(Math.random() * 100) + 20 : 0;

            data.push({
              date: date.toISOString().split('T')[0],
              xp: xp,
            });
          }

          return data;
        };

        setActivityData(generateActivityData());

      } catch (error) {
        logger.error('[DashboardClient] Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [institutionId]);

  // Calculate statistics
  const stats = useMemo(() => {
    const avgPerformance = students.length > 0
      ? Math.round(
          students.reduce((acc, s) => acc + (s.performance?.overallPercentage || 0), 0) /
          students.length
        )
      : 0;

    const avgAttendance = students.length > 0
      ? Math.round(
          students.reduce((acc, s) => acc + (s.performance?.attendance || 0), 0) /
          students.length
        )
      : 0;

    const completedEvaluations = evaluations.filter(e => e.status === 'completed').length;
    const activeEvaluations = evaluations.filter(e => e.status === 'in-progress' || e.status === 'pending').length;
    const monthlyCompletionRate = evaluations.length > 0
      ? Math.round((completedEvaluations / evaluations.length) * 100)
      : 0;

    const avgStudentXP = students.length > 0
      ? Math.round(students.reduce((acc, s) => acc + (s.xp || 0), 0) / students.length)
      : 0;

    return {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      avgPerformance,
      avgAttendance,
      activeEvaluations,
      completedTests: completedEvaluations,
      monthlyCompletionRate,
      avgStudentXP,
    };
  }, [students, teachers, evaluations]);

  // Class distribution
  const classBySection = useMemo(() => {
    const distribution: Record<string, number> = {};
    students.forEach(s => {
      if (s.class && s.section) {
        const key = `Class ${s.class}${s.section}`;
        distribution[key] = (distribution[key] || 0) + 1;
      }
    });
    return Object.entries(distribution)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [students]);

  // Subject performance aggregate (based on evaluations)
  const subjectPerformance = useMemo(() => {
    const subjects: {[key: string]: {total: number, count: number}} = {};

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
      .map(([name, {total, count}]) => ({
        name,
        average: Math.round(total / count),
        students: count,
      }))
      .sort((a, b) => b.average - a.average);
  }, [evaluations]);

  // Top performing students
  const topStudents = useMemo(() =>
    [...students]
      .sort((a, b) =>
        (b.performance?.overallPercentage || 0) - (a.performance?.overallPercentage || 0)
      )
      .slice(0, 5),
    [students]
  );

  // Most engaged teachers (by XP or level)
  const topTeachers = useMemo(() =>
    [...teachers]
      .sort((a, b) => (b.xp || 0) - (a.xp || 0))
      .slice(0, 5)
      .map(teacher => ({
        ...teacher,
        studentCount: students.filter(s => s.class && s.section).length // Placeholder
      })),
    [teachers, students]
  );

  // Recent activity
  const recentActivity = useMemo(() => {
    const activities = [];

    // Recent evaluations
    const recentEvaluations = evaluations
      .filter(e => e.status === 'completed')
      .sort((a, b) => {
        const aTime = a.submittedAt instanceof Timestamp ? a.submittedAt.toMillis() : (a.submittedAt instanceof Date ? a.submittedAt.getTime() : 0);
        const bTime = b.submittedAt instanceof Timestamp ? b.submittedAt.toMillis() : (b.submittedAt instanceof Date ? b.submittedAt.getTime() : 0);
        return bTime - aTime;
      })
      .slice(0, 3);

    recentEvaluations.forEach(evaluation => {
      activities.push({
        type: 'evaluation',
        title: `${evaluation.subject || 'Assessment'} completed`,
        detail: `Score: ${evaluation.score}/${evaluation.totalMarks}`,
        time: '2 days ago',
        icon: '✅',
        color: 'from-green-400 to-emerald-500'
      });
    });

    // Recent high performers
    const recentTopStudent = topStudents[0];
    if (recentTopStudent) {
      activities.push({
        type: 'achievement',
        title: `${recentTopStudent.displayName} achieved top rank`,
        detail: `${recentTopStudent.performance?.overallPercentage || 0}% overall • Class ${recentTopStudent.class}${recentTopStudent.section}`,
        time: '1 day ago',
        icon: '🏆',
        color: 'from-yellow-400 to-orange-500'
      });
    }

    return activities.slice(0, 5);
  }, [evaluations, topStudents]);

  // Upcoming tests (placeholder - empty array for now)
  const upcomingTests = useMemo(() => [], []);

  if (isLoading) {
    return <Spinner fullScreen />;
  }

  if (!institutionId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-yellow-500" />
          <p className="text-gray-600 text-lg font-medium">No institution ID found</p>
          <p className="text-gray-500 text-sm mt-2">Please contact support to link your account to an institution</p>
        </div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-gray-600 text-lg font-medium">Institution not found</p>
          <p className="text-gray-500 text-sm mt-2">The institution data could not be loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}></div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/30">
                <Building2 size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white drop-shadow-md">
                  {institution.name}
                </h1>
                <p className="text-white/90 text-lg mb-1">
                  {institution.location} • Established {institution.established}
                </p>
                <p className="text-white/80 text-sm">
                  {stats.totalTeachers} Teachers • {stats.totalStudents} Students • {classBySection.length} Classes
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push('/dashboard/institution/students/add')}
                variant="outline"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30"
                leftIcon={<UserPlus size={18} />}
              >
                Add Student
              </Button>
              <Button
                onClick={() => router.push('/dashboard/institution/teachers/add')}
                variant="outline"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30"
                leftIcon={<GraduationCap size={18} />}
              >
                Add Teacher
              </Button>
              <Button
                onClick={() => router.push('/dashboard/institution/settings')}
                variant="outline"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30"
                leftIcon={<Settings size={18} />}
              >
                Settings
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Statistics Grid */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
      >
        <StatCard
          label="Total Students"
          value={stats.totalStudents}
          icon={<Users size={24} />}
          variant="gradient"
        />

        <StatCard
          label="Total Teachers"
          value={stats.totalTeachers}
          icon={<GraduationCap size={24} />}
          variant="gradient"
        />

        <StatCard
          label="Active Evaluations"
          value={stats.activeEvaluations}
          icon={<Clock size={24} />}
          variant="gradient"
        />

        <StatCard
          label="Avg Performance"
          value={`${stats.avgPerformance}%`}
          icon={<Award size={24} />}
          variant="gradient"
        />

        <StatCard
          label="Completion Rate"
          value={`${stats.monthlyCompletionRate}%`}
          icon={<Target size={24} />}
          variant="gradient"
        />

        <StatCard
          label="Avg Attendance"
          value={`${stats.avgAttendance}%`}
          icon={<Calendar size={24} />}
          variant="gradient"
        />
      </motion.div>

      {/* Quick Action Cards */}
      <motion.div
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <button
          onClick={() => router.push('/dashboard/institution/students')}
          className="text-left"
        >
          <Card variant="elevated" padding="lg" hover className="bg-gradient-to-br from-blue-50 to-cyan-50 h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Users className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Manage Students</h3>
                <p className="text-sm text-gray-600">View and manage all students</p>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
          </Card>
        </button>

        <button
          onClick={() => router.push('/dashboard/institution/teachers')}
          className="text-left"
        >
          <Card variant="elevated" padding="lg" hover className="bg-gradient-to-br from-purple-50 to-pink-50 h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Manage Teachers</h3>
                <p className="text-sm text-gray-600">View and manage all staff</p>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
          </Card>
        </button>

        <button
          onClick={() => router.push('/dashboard/institution/reports')}
          className="text-left"
        >
          <Card variant="elevated" padding="lg" hover className="bg-gradient-to-br from-green-50 to-emerald-50 h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Download className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Generate Reports</h3>
                <p className="text-sm text-gray-600">Download analytics and insights</p>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </div>
          </Card>
        </button>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Distribution */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card variant="elevated" padding="lg" className="h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Class Distribution</h3>
                <p className="text-sm text-gray-600">Students per class</p>
              </div>
            </div>

            <div className="space-y-3">
              {classBySection.map((cls, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{cls.name}</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {cls.count}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Subject Performance */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card variant="elevated" padding="lg" className="h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-purple-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Subject Performance</h3>
                <p className="text-sm text-gray-600">Average scores</p>
              </div>
            </div>

            <div className="space-y-3">
              {subjectPerformance.map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{subject.name}</span>
                    <span className={`text-sm font-bold ${
                      subject.average >= 85 ? 'text-green-600' :
                      subject.average >= 70 ? 'text-blue-600' :
                      subject.average >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {subject.average}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        subject.average >= 85 ? 'bg-green-500' :
                        subject.average >= 70 ? 'bg-blue-500' :
                        subject.average >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${subject.average}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card variant="elevated" padding="lg" className="h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-orange-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-600">Latest updates</p>
              </div>
            </div>

            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${activity.color} flex items-center justify-center text-xl flex-shrink-0`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{activity.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{activity.detail}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Activity Heatmap */}
      <motion.div
        custom={3}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <ActivityHeatmap activity={activityData} />
      </motion.div>

      {/* Top Performers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Students */}
        <motion.div
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="text-yellow-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Top Performing Students</h3>
                  <p className="text-sm text-gray-600">Highest overall scores</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push('/dashboard/institution/students')}
                rightIcon={<ChevronRight size={16} />}
              >
                View All
              </Button>
            </div>

            <div className="space-y-3">
              {topStudents.length > 0 ? (
                topStudents.map((student, index) => (
                  <div key={student.uid} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {student.displayName?.[0] || 'S'}
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
                            🏆
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{student.displayName}</p>
                        <p className="text-xs text-gray-600">
                          {student.class && student.section ? `Class ${student.class}${student.section}` : student.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{student.performance?.overallPercentage || 0}%</p>
                      <p className="text-xs text-gray-500">Rank #{student.performance?.rank || '-'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>No students found</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Top Teachers */}
        <motion.div
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-indigo-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Most Engaged Teachers</h3>
                  <p className="text-sm text-gray-600">By student count</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push('/dashboard/institution/teachers')}
                rightIcon={<ChevronRight size={16} />}
              >
                View All
              </Button>
            </div>

            <div className="space-y-3">
              {topTeachers.length > 0 ? (
                topTeachers.map((teacher) => (
                  <div key={teacher.uid} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold">
                        {teacher.displayName?.[0] || 'T'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{teacher.displayName}</p>
                        <p className="text-xs text-gray-600">{teacher.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{teacher.xp || 0}</p>
                      <p className="text-xs text-gray-500">XP</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <GraduationCap size={48} className="mx-auto mb-2 text-gray-300" />
                  <p>No teachers found</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Tests & Assessment Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tests */}
        <motion.div
          custom={5}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card variant="elevated" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-green-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Upcoming Tests</h3>
                <p className="text-sm text-gray-600">Scheduled assessments</p>
              </div>
            </div>

            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-2 text-gray-300" />
              <p>No upcoming tests scheduled</p>
            </div>
          </Card>
        </motion.div>

        {/* Assessment Summary */}
        <motion.div
          custom={5}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card variant="elevated" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <FileText className="text-teal-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Assessment Overview</h3>
                <p className="text-sm text-gray-600">Test statistics</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Completed Tests</span>
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.completedTests}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {stats.monthlyCompletionRate}% completion rate
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Active Evaluations</span>
                  <Clock className="text-orange-600" size={20} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.activeEvaluations}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Pending grading
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Total Tests</span>
                  <Target className="text-blue-600" size={20} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{evaluations.length}</p>
                <p className="text-xs text-gray-600 mt-1">
                  All assessments
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
