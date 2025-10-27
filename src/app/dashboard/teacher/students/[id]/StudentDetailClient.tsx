// src/app/dashboard/teacher/students/[id]/StudentDetailClient.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { 
  ArrowLeft, Mail, Phone, Calendar, MapPin, Award,
  TrendingUp, TrendingDown, Target, BookOpen, Clock,
  FileText, CheckCircle, AlertCircle, User, Users,
  BarChart3, MessageSquare, Download
} from 'lucide-react';
import { 
  getStudentById,
  getTestsByClass,
  students
} from '@/lib/comprehensiveMockData';

interface StudentDetailClientProps {
  studentId: string;
  userId: string;
  userRole: string;
}

export function StudentDetailClient({ studentId, userId, userRole }: StudentDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'attendance' | 'tests'>('overview');

  // Get student data
  const student = useMemo(() => {
    return students.find(s => s.id === studentId);
  }, [studentId]);

  // Get tests for student's class
  const classTests = useMemo(() => {
    if (!student) return [];
    return getTestsByClass(student.institutionId, student.class, student.section)
      .filter(t => t.status === 'completed')
      .slice(0, 5);
  }, [student]);

  if (!student) {
    return (
      <div className="text-center py-12">
        <User size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-gray-600 mb-4">Student not found</p>
        <Button onClick={() => router.push('/students')} variant="primary">
          Back to Students
        </Button>
      </div>
    );
  }

  // Generate attendance data (mock)
  const attendanceData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(day => ({
      day,
      present: Math.random() > 0.15 // 85% attendance rate
    }));
  }, []);

  // Get top 3 and bottom 3 subjects
  const topSubjects = [...student.subjectScores]
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 3);
  
  const weakSubjects = [...student.subjectScores]
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 3);

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 75) return 'text-blue-600 bg-blue-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp size={16} className="text-green-600" />;
    if (trend === 'down') return <TrendingDown size={16} className="text-red-600" />;
    return <div className="w-4 h-0.5 bg-gray-400"></div>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} />
          Back to Students
        </button>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Student Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
            {student.name.charAt(0)}
          </div>

          {/* Student Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <User size={16} />
                    {student.rollNo}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users size={16} />
                    Class {student.class}{student.section}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={16} />
                    DOB: {new Date(student.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Mail size={16} />
                    {student.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone size={16} />
                    {student.parentContact}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" leftIcon={<MessageSquare size={16} />}>
                  Message
                </Button>
                <Button variant="outline" size="sm" leftIcon={<Download size={16} />}>
                  Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        <Card variant="elevated" padding="lg" className="text-center">
          <Award className="mx-auto mb-2 text-yellow-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">#{student.performance.rank}</p>
          <p className="text-xs text-gray-600">Class Rank</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <Target className="mx-auto mb-2 text-blue-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{student.performance.overallPercentage}%</p>
          <p className="text-xs text-gray-600">Overall</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <FileText className="mx-auto mb-2 text-purple-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{student.performance.testsCompleted}</p>
          <p className="text-xs text-gray-600">Tests</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{student.performance.attendance}%</p>
          <p className="text-xs text-gray-600">Attendance</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <Clock className="mx-auto mb-2 text-orange-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{student.performance.streak}</p>
          <p className="text-xs text-gray-600">Day Streak</p>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="elevated" padding="lg">
          <div className="flex gap-2">
            {(['overview', 'performance', 'attendance', 'tests'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject Performance */}
            <Card variant="elevated" padding="lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Subject Performance</h3>
              <div className="space-y-4">
                {student.subjectScores.map((subject) => (
                  <div key={subject.subjectId}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{subject.subjectName}</span>
                        {getTrendIcon(subject.trend)}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getPerformanceColor(subject.averageScore)}`}>
                        {subject.averageScore}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          subject.averageScore >= 85 ? 'bg-green-500' :
                          subject.averageScore >= 70 ? 'bg-blue-500' :
                          subject.averageScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${subject.averageScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {subject.testsCompleted} tests • Last: {subject.lastTestScore}%
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Strengths & Weaknesses */}
            <div className="space-y-6">
              {/* Top Subjects */}
              <Card variant="elevated" padding="lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="text-green-600" size={20} />
                  Strengths
                </h3>
                <div className="space-y-3">
                  {topSubjects.map((subject, index) => (
                    <div key={subject.subjectId} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{subject.subjectName}</p>
                        <p className="text-xs text-gray-600">{subject.averageScore}% average</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Needs Improvement */}
              <Card variant="elevated" padding="lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="text-orange-600" size={20} />
                  Needs Improvement
                </h3>
                <div className="space-y-3">
                  {weakSubjects.map((subject, index) => (
                    <div key={subject.subjectId} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{subject.subjectName}</p>
                        <p className="text-xs text-gray-600">{subject.averageScore}% average</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Detailed Performance Analysis</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Subject</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Average</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Tests</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Last Score</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {student.subjectScores.map((subject) => (
                    <tr key={subject.subjectId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{subject.subjectName}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPerformanceColor(subject.averageScore)}`}>
                          {subject.averageScore}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-700">{subject.testsCompleted}</td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">{subject.lastTestScore}%</td>
                      <td className="px-4 py-3 text-center">{getTrendIcon(subject.trend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Attendance Record</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{student.performance.attendance}%</p>
                <p className="text-sm text-gray-600 mt-1">Overall</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{Math.floor(student.performance.attendance * 0.9)}</p>
                <p className="text-sm text-gray-600 mt-1">Days Present</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-600">{Math.floor((100 - student.performance.attendance) * 0.9)}</p>
                <p className="text-sm text-gray-600 mt-1">Days Absent</p>
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 mb-3">This Week</h4>
            <div className="grid grid-cols-6 gap-2">
              {attendanceData.map((day, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg text-center ${
                    day.present ? 'bg-green-100 border-2 border-green-300' : 'bg-red-100 border-2 border-red-300'
                  }`}
                >
                  <p className="text-xs font-medium text-gray-700">{day.day}</p>
                  <p className="text-2xl mt-2">
                    {day.present ? '✓' : '✗'}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tests Tab */}
        {activeTab === 'tests' && (
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Tests</h3>
            <div className="space-y-3">
              {classTests.map((test) => {
                // Generate mock score for this student
                const mockScore = Math.floor(student.performance.overallPercentage + (Math.random() * 20 - 10));
                
                return (
                  <div key={test.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{test.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{test.subjectName}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(test.date).toLocaleDateString()} • {test.totalMarks} marks
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getPerformanceColor(mockScore)}`}>
                          {mockScore}%
                        </span>
                        <p className="text-xs text-gray-600 mt-1">
                          {Math.floor((mockScore / 100) * test.totalMarks)}/{test.totalMarks}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
