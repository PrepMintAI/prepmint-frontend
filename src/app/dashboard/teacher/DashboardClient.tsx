// src/app/dashboard/teacher/DashboardClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase.client';
import { doc, getDoc } from 'firebase/firestore';
import Card, { StatCard } from '@/components/common/Card';
import Button from '@/components/common/Button';
import { 
  Users, CheckCircle, Clock, TrendingUp, 
  BookOpen, AlertCircle, Calendar,
  ChevronRight, FileText, MessageSquare,
  BarChart3, ClipboardList, Bell, Filter
} from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

interface TeacherDashboardClientProps {
  userId: string;
}

export function TeacherDashboardClient({ userId }: TeacherDashboardClientProps) {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData({ ...userDoc.data(), uid: user.uid });
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

  // Mock data - Replace with real Firestore queries
  const stats = {
    totalStudents: 150,
    pendingEvaluations: 23,
    completedThisWeek: 89,
    avgClassScore: 87,
    activeClasses: 4,
    attendanceRate: 94,
  };

  const classes = [
    { id: 'all', name: 'All Classes', students: 150 },
    { id: '10a', name: 'Class 10-A Mathematics', students: 35 },
    { id: '10b', name: 'Class 10-B Mathematics', students: 38 },
    { id: '11a', name: 'Class 11-A Physics', students: 40 },
    { id: '11b', name: 'Class 11-B Physics', students: 37 },
  ];

  const pendingEvaluations = [
    { 
      id: 1, 
      student: 'Aarav Sharma',
      rollNo: '10A-23',
      test: 'Mathematics Midterm Exam', 
      subject: 'Mathematics',
      class: 'Class 10-A',
      submittedAt: '2 hours ago',
      maxMarks: 100,
      priority: 'high'
    },
    { 
      id: 2, 
      student: 'Priya Patel',
      rollNo: '10B-15',
      test: 'Physics Unit Test - Chapter 5', 
      subject: 'Physics',
      class: 'Class 11-A',
      submittedAt: '3 hours ago',
      maxMarks: 50,
      priority: 'medium'
    },
    { 
      id: 3, 
      student: 'Rohan Kumar',
      rollNo: '11A-08',
      test: 'Chemistry Lab Report', 
      subject: 'Chemistry',
      class: 'Class 11-B',
      submittedAt: '5 hours ago',
      maxMarks: 30,
      priority: 'low'
    },
  ];

  const upcomingDeadlines = [
    { title: 'Physics Midterm', class: 'Class 11-A', date: 'Oct 28, 2025', type: 'Exam' },
    { title: 'Math Assignment #5', class: 'Class 10-B', date: 'Oct 26, 2025', type: 'Assignment' },
    { title: 'Lab Report Submission', class: 'Class 11-B', date: 'Oct 25, 2025', type: 'Assignment' },
  ];

  const recentActivity = [
    { 
      action: 'Graded Mathematics Midterm', 
      detail: 'Class 10-A • 35 students', 
      time: '1 hour ago', 
      type: 'evaluation'
    },
    { 
      action: 'Created Physics Quiz', 
      detail: 'Chapter 5: Thermodynamics', 
      time: '3 hours ago', 
      type: 'creation'
    },
    { 
      action: 'Published Results', 
      detail: 'Chemistry Test - Class 11-B', 
      time: '5 hours ago', 
      type: 'publication'
    },
    { 
      action: 'Sent Class Announcement', 
      detail: 'Upcoming test schedule', 
      time: '1 day ago', 
      type: 'communication'
    },
  ];

  const classPerformance = [
    { class: 'Class 10-A', subject: 'Mathematics', average: 87, students: 35, trend: 'up' },
    { class: 'Class 10-B', subject: 'Mathematics', average: 82, students: 38, trend: 'up' },
    { class: 'Class 11-A', subject: 'Physics', average: 79, students: 40, trend: 'down' },
    { class: 'Class 11-B', subject: 'Physics', average: 85, students: 37, trend: 'up' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
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
              Welcome back, {userData?.displayName || 'Teacher'}
            </h1>
            <p className="text-gray-600 mt-1">
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
              onClick={() => router.push('/evaluations')}
              variant="primary"
              leftIcon={<CheckCircle size={18} />}
            >
              Review Submissions ({stats.pendingEvaluations})
            </Button>
            <Button
              onClick={() => router.push('/students')}
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
              {classes.map((cls) => (
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
        {/* Pending Evaluations - Priority */}
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
                onClick={() => router.push('/evaluations')}
              >
                View All ({stats.pendingEvaluations})
              </Button>
            </div>

            <div className="space-y-3">
              {pendingEvaluations.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="group p-4 rounded-lg hover:bg-gray-50 transition-all cursor-pointer border border-gray-200 hover:shadow-sm"
                  onClick={() => router.push(`/evaluations/${item.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{item.student}</p>
                        <span className="text-xs text-gray-500">({item.rollNo})</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 font-medium">{item.test}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <BookOpen size={14} />
                          {item.subject}
                        </span>
                        <span>•</span>
                        <span>{item.class}</span>
                        <span>•</span>
                        <span>Max: {item.maxMarks} marks</span>
                        <span>•</span>
                        <span className="text-orange-600">{item.submittedAt}</span>
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

            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/evaluations')}
                rightIcon={<ChevronRight size={16} />}
              >
                View All Pending Submissions
              </Button>
            </div>
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
                <h3 className="text-lg font-bold text-gray-900">Upcoming</h3>
                <p className="text-sm text-gray-600">Next 7 days</p>
              </div>
            </div>

            <div className="space-y-3">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{deadline.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{deadline.class}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {deadline.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock size={12} />
                    <span>{deadline.date}</span>
                  </div>
                </div>
              ))}
            </div>
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
    </div>
  );
}
