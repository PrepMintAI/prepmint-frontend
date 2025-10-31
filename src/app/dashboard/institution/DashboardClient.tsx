// src/app/dashboard/institution/DashboardClient.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase.client';
import { doc, getDoc } from 'firebase/firestore';
import Card, { StatCard } from '@/components/common/Card';
import Button from '@/components/common/Button';
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap';
import {
  Users, BookOpen, Award, TrendingUp, Clock, Building2,
  UserPlus, GraduationCap, BarChart3, ChevronRight,
  Calendar, Target, FileText, Settings, Download,
  Filter, Search, Star, AlertCircle, CheckCircle
} from 'lucide-react';
import {
  institutions,
  getStudentsByInstitution,
  getTeachersByInstitution,
  getTestsByInstitution,
  type Institution,
  type Student,
  type Teacher,
  type Test
} from '@/lib/comprehensiveMockData';

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
}

export function DashboardClient({ userId }: DashboardClientProps) {
  const [_firebaseUser, _setFirebaseUser] = useState<{ uid?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'active'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            // Firebase user data loaded
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // For demo, use first institution - in production, match by userId
  const institutionId = useMemo(() => {
    // TODO: In production, derive from userId/firebaseUser
    return 'inst_001';
  }, []);

  // Fetch institution data
  const institution = useMemo<Institution | undefined>(() =>
    institutions.find(i => i.id === institutionId),
    [institutionId]
  );

  const schoolStudents = useMemo<Student[]>(() =>
    getStudentsByInstitution(institutionId),
    [institutionId]
  );

  const schoolTeachers = useMemo<Teacher[]>(() =>
    getTeachersByInstitution(institutionId),
    [institutionId]
  );

  const schoolTests = useMemo<Test[]>(() =>
    getTestsByInstitution(institutionId),
    [institutionId]
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const avgPerformance = Math.round(
      schoolStudents.reduce((acc, s) => acc + s.performance.overallPercentage, 0) /
      Math.max(1, schoolStudents.length)
    );

    const avgAttendance = Math.round(
      schoolStudents.reduce((acc, s) => acc + s.performance.attendance, 0) /
      Math.max(1, schoolStudents.length)
    );

    const completedTests = schoolTests.filter(t => t.status === 'completed').length;
    const activeEvaluations = schoolTests.filter(t => t.status === 'in-progress').length;
    const monthlyCompletionRate = Math.round((completedTests / Math.max(1, schoolTests.length)) * 100);
    const avgStudentXP = Math.round(
      schoolStudents.reduce((acc, s) => acc + s.performance.xp, 0) /
      Math.max(1, schoolStudents.length)
    );

    return {
      totalStudents: schoolStudents.length,
      totalTeachers: schoolTeachers.length,
      avgPerformance,
      avgAttendance,
      activeEvaluations,
      completedTests,
      monthlyCompletionRate,
      avgStudentXP,
    };
  }, [schoolStudents, schoolTeachers, schoolTests]);

  // Class distribution
  const classBySection = useMemo(() => {
    const distribution: Record<string, number> = {};
    schoolStudents.forEach(s => {
      const key = `Class ${s.class}${s.section}`;
      distribution[key] = (distribution[key] || 0) + 1;
    });
    return Object.entries(distribution)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [schoolStudents]);

  // Subject performance aggregate
  const subjectPerformance = useMemo(() => {
    const subjects: {[key: string]: {total: number, count: number}} = {};

    schoolStudents.forEach(student => {
      student.subjectScores.forEach(score => {
        if (!subjects[score.subjectName]) {
          subjects[score.subjectName] = { total: 0, count: 0 };
        }
        subjects[score.subjectName].total += score.averageScore;
        subjects[score.subjectName].count += 1;
      });
    });

    return Object.entries(subjects)
      .map(([name, {total, count}]) => ({
        name,
        average: Math.round(total / count),
        students: count,
      }))
      .sort((a, b) => b.average - a.average);
  }, [schoolStudents]);

  // Top performing students
  const topStudents = useMemo(() =>
    [...schoolStudents]
      .sort((a, b) => b.performance.overallPercentage - a.performance.overallPercentage)
      .slice(0, 5),
    [schoolStudents]
  );

  // Most engaged teachers (by assigned classes)
  const topTeachers = useMemo(() =>
    [...schoolTeachers]
      .map(teacher => {
        const studentCount = teacher.assignedClasses.reduce((acc, cls) => {
          const students = schoolStudents.filter(
            s => s.class === cls.class && s.section === cls.section
          );
          return acc + students.length;
        }, 0);

        return { ...teacher, studentCount };
      })
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, 5),
    [schoolTeachers, schoolStudents]
  );

  // Recent activity
  const recentActivity = useMemo(() => {
    const activities = [];

    // Recent test completions
    const recentTests = schoolTests
      .filter(t => t.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

    recentTests.forEach(test => {
      const teacher = schoolTeachers.find(t => t.id === test.teacherId);
      activities.push({
        type: 'evaluation',
        title: `${test.title} completed`,
        detail: `${teacher?.name || 'Teacher'} • Class ${test.class}${test.section}`,
        time: `${Math.floor((new Date().getTime() - new Date(test.date).getTime()) / (1000 * 60 * 60 * 24))} days ago`,
        icon: '✅',
        color: 'from-green-400 to-emerald-500'
      });
    });

    // Recent high performers
    const recentTopStudent = topStudents[0];
    if (recentTopStudent) {
      activities.push({
        type: 'achievement',
        title: `${recentTopStudent.name} achieved top rank`,
        detail: `${recentTopStudent.performance.overallPercentage}% overall • Class ${recentTopStudent.class}${recentTopStudent.section}`,
        time: '1 day ago',
        icon: '🏆',
        color: 'from-yellow-400 to-orange-500'
      });
    }

    return activities.slice(0, 5);
  }, [schoolTests, schoolTeachers, topStudents]);

  // Upcoming tests
  const upcomingTests = useMemo(() =>
    schoolTests
      .filter(t => t.status === 'scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5),
    [schoolTests]
  );

  // Generate activity heatmap data
  const generateActivityData = () => {
    const data = [];
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

  const activityData = generateActivityData();

  if (!institution) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Institution not found</p>
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
              {topStudents.map((student, index) => (
                <div key={student.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {student.name[0]}
                      </div>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
                          🏆
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{student.name}</p>
                      <p className="text-xs text-gray-600">
                        Class {student.class}{student.section} • Roll {student.rollNo}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{student.performance.overallPercentage}%</p>
                    <p className="text-xs text-gray-500">Rank #{student.performance.rank}</p>
                  </div>
                </div>
              ))}
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
              {topTeachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold">
                      {teacher.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{teacher.name}</p>
                      <p className="text-xs text-gray-600">{teacher.yearsOfExperience} years experience</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{teacher.studentCount}</p>
                    <p className="text-xs text-gray-500">students</p>
                  </div>
                </div>
              ))}
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

            {upcomingTests.length > 0 ? (
              <div className="space-y-3">
                {upcomingTests.map((test) => (
                  <div key={test.id} className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{test.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{test.subjectName}</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {test.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <BookOpen size={12} />
                        Class {test.class}{test.section}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(test.date).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>{test.totalMarks} marks</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={48} className="mx-auto mb-2 text-gray-300" />
                <p>No upcoming tests scheduled</p>
              </div>
            )}
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
                <p className="text-3xl font-bold text-gray-900">{schoolTests.length}</p>
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
