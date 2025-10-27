// src/app/dashboard/teacher/analytics/AnalyticsClient.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Award, Target,
  Calendar, BarChart3, PieChart, Activity, Download,
  Filter, Users, BookOpen, Clock, AlertCircle, CheckCircle
} from 'lucide-react';
import { 
  getStudentById,
  getTestsByClass,
  getTeacherById,
  getStudentsByClass,
  students,
  teachers
} from '@/lib/comprehensiveMockData';

interface AnalyticsClientProps {
  userId: string;
  userRole: string;
  studentId?: string;
  testId?: string;
}

export function AnalyticsClient({ userId, userRole, studentId, testId }: AnalyticsClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'semester'>('month');

  // For teacher, if no studentId is selected, show a picker
  const [searchQuery, setSearchQuery] = useState('');


  // Get student data if studentId is provided
  const student = useMemo(() => {
    if (studentId) {
      return students.find(s => s.id === studentId);
    }
    return null;
  }, [studentId]);

  // Get teacher data
  const teacher = useMemo(() => {
    if (userRole === 'teacher') {
      return teachers.find(t => t.uid === userId) || teachers[0];
    }
    return null;
  }, [userId, userRole]);

  // Get class tests if student is selected
  const classTests = useMemo(() => {
    if (!student) return [];
    return getTestsByClass(student.institutionId, student.class, student.section)
      .filter(t => t.status === 'completed')
      .slice(0, 10);
  }, [student]);

  // Generate performance trend data
  const performanceTrend = useMemo(() => {
    if (!student) return [];
    
    const months = ['Aug', 'Sep', 'Oct'];
    return months.map((month, index) => ({
      month,
      score: student.performance.overallPercentage + (Math.random() * 10 - 5),
      attendance: student.performance.attendance + (Math.random() * 5 - 2.5),
    }));
  }, [student]);

  // Subject comparison data
  const subjectComparison = useMemo(() => {
    if (!student) return [];
    
    return student.subjectScores.map(subject => ({
      name: subject.subjectName.substring(0, 8),
      student: subject.averageScore,
      classAvg: Math.max(40, subject.averageScore - 5 + Math.random() * 10),
    }));
  }, [student]);

  // Test performance over time
  const testPerformance = useMemo(() => {
    if (!student || classTests.length === 0) return [];
    
    return classTests.slice(0, 6).reverse().map(test => ({
      name: test.title.substring(0, 15) + '...',
      score: Math.floor(student.performance.overallPercentage + (Math.random() * 20 - 10)),
    }));
  }, [student, classTests]);

  // Grade distribution
  const gradeDistribution = useMemo(() => {
    if (!student) return [];
    
    const subjects = student.subjectScores;
    const gradeA = subjects.filter(s => s.averageScore >= 90).length;
    const gradeB = subjects.filter(s => s.averageScore >= 75 && s.averageScore < 90).length;
    const gradeC = subjects.filter(s => s.averageScore >= 60 && s.averageScore < 75).length;
    const gradeD = subjects.filter(s => s.averageScore < 60).length;
    
    return [
      { grade: 'A (90-100%)', count: gradeA, color: '#10b981' },
      { grade: 'B (75-89%)', count: gradeB, color: '#3b82f6' },
      { grade: 'C (60-74%)', count: gradeC, color: '#f59e0b' },
      { grade: 'D (<60%)', count: gradeD, color: '#ef4444' },
    ].filter(g => g.count > 0);
  }, [student]);

  // Weekly activity
  const weeklyActivity = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(day => ({
      day,
      hours: Math.floor(Math.random() * 4) + 1,
    }));
  }, []);

      if (userRole === 'teacher' && !studentId) {
    const teacherObj = teachers.find(t => t.uid === userId) || teachers[0];
    const teacherStudents: any[] = [];
    teacherObj.assignedClasses.forEach(assignedClass => {
      const classStudents = getStudentsByClass(
        teacherObj.institutionId,
        assignedClass.class,
        assignedClass.section
      );
      teacherStudents.push(...classStudents);
    });
    const studentsList = teacherStudents.filter(
      (student, index, self) => index === self.findIndex(s => s.id === student.id)
    );
    const filteredStudents = studentsList.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Student Analytics
        </h1>
        <Card variant="elevated" padding="lg">
          <p className="mb-4 text-gray-600">
            Select a student to view detailed analytics and trends.
          </p>
          <input
            className="w-full mb-4 p-2 border border-gray-300 rounded-lg"
            placeholder="Search by name or roll no..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.map(student => (
              <button
                key={student.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition"
                onClick={() => router.push(`/dashboard/teacher/analytics?student=${student.id}`)}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">{student.name.charAt(0)}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-500">
                    Class {student.class}{student.section} &bull; {student.rollNo}
                  </p>
                </div>
                <ArrowLeft size={16} className="text-gray-400" />
              </button>
            ))}
          </div>
          {filteredStudents.length === 0 && (
            <div className="text-center text-gray-500 mt-8">No students found</div>
          )}
        </Card>
      </div>
    );
  }


  if (!student) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {teacher 
                ? `Viewing analytics for ${teacher.assignedClasses.length} classes`
                : 'Select a student to view detailed analytics'
              }
            </p>
          </div>
        </div>

        <Card variant="elevated" padding="lg">
          <div className="text-center py-12">
            <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 mb-4">Select a student to view detailed analytics</p>
            <Button onClick={() => router.push('/dashboard/teacher/students')} variant="primary">
              Go to Students
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
          Back
        </button>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics: {student.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Class {student.class}{student.section} • Roll No: {student.rollNo}
            </p>
          </div>

          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="semester">This Semester</option>
            </select>
            <Button variant="outline" size="sm" leftIcon={<Download size={16} />}>
              Export Report
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
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
          <p className="text-xs text-green-600 mt-1">↑ 2 positions</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <Target className="mx-auto mb-2 text-blue-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{student.performance.overallPercentage}%</p>
          <p className="text-xs text-gray-600">Overall Score</p>
          <p className="text-xs text-green-600 mt-1">↑ 3.5%</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{student.performance.testsCompleted}</p>
          <p className="text-xs text-gray-600">Tests Completed</p>
          <p className="text-xs text-gray-500 mt-1">+5 this month</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <Calendar className="mx-auto mb-2 text-purple-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{student.performance.attendance}%</p>
          <p className="text-xs text-gray-600">Attendance</p>
          <p className="text-xs text-green-600 mt-1">Excellent</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <Activity className="mx-auto mb-2 text-orange-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{student.performance.streak}</p>
          <p className="text-xs text-gray-600">Day Streak</p>
          <p className="text-xs text-orange-600 mt-1">Keep going!</p>
        </Card>
      </motion.div>

      {/* Charts Row 1 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Performance Trend */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Performance Trend</h3>
            <TrendingUp className="text-green-600" size={20} />
          </div>
          
          <div className="space-y-4">
            {performanceTrend.map((data, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{data.month}</span>
                  <span className="text-sm font-bold text-gray-900">{Math.round(data.score)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all"
                    style={{ width: `${data.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Subject Comparison */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Subject Comparison</h3>
            <BarChart3 className="text-blue-600" size={20} />
          </div>
          
          <div className="space-y-4">
            {subjectComparison.slice(0, 5).map((data, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{data.name}</span>
                  <div className="flex gap-2">
                    <span className="text-xs text-blue-600">You: {Math.round(data.student)}%</span>
                    <span className="text-xs text-gray-500">Avg: {Math.round(data.classAvg)}%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${data.student}%` }}
                    />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-400 rounded-full"
                      style={{ width: `${data.classAvg}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Charts Row 2 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Grade Distribution */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Grade Distribution</h3>
            <PieChart className="text-purple-600" size={20} />
          </div>
          
          <div className="space-y-3">
            {gradeDistribution.map((data, index) => (
              <div key={index} className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: data.color }}
                >
                  {data.count}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{data.grade}</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ 
                        backgroundColor: data.color,
                        width: `${(data.count / student.subjectScores.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {Math.round((data.count / student.subjectScores.length) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Activity */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Weekly Study Hours</h3>
            <Clock className="text-orange-600" size={20} />
          </div>
          
          <div className="flex items-end justify-between gap-2 h-48">
            {weeklyActivity.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center h-40">
                  <div
                    className="w-full bg-gradient-to-t from-orange-500 to-yellow-400 rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${(data.hours / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600">{data.day}</span>
                <span className="text-xs text-gray-500">{data.hours}h</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Total: <span className="font-bold text-gray-900">
                {weeklyActivity.reduce((sum, d) => sum + d.hours, 0)} hours
              </span> this week
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Recent Tests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Test Performance</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Test</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Subject</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Score</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Class Avg</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {classTests.slice(0, 5).map((test) => {
                  const studentScore = Math.floor(student.performance.overallPercentage + (Math.random() * 20 - 10));
                  const classAvg = Math.max(50, studentScore - 10 + Math.random() * 15);
                  
                  return (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{test.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{test.subjectName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-center">
                        {new Date(test.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          studentScore >= 90 ? 'bg-green-100 text-green-700' :
                          studentScore >= 75 ? 'bg-blue-100 text-blue-700' :
                          studentScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {studentScore}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-center">
                        {Math.round(classAvg)}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        {studentScore > classAvg ? (
                          <span className="text-green-600 flex items-center justify-center gap-1">
                            <TrendingUp size={16} />
                            Above
                          </span>
                        ) : (
                          <span className="text-orange-600 flex items-center justify-center gap-1">
                            <TrendingDown size={16} />
                            Below
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Insights & Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Strengths */}
        <Card variant="elevated" padding="lg" className="bg-green-50 border-2 border-green-200">
          <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
            <CheckCircle size={20} />
            Strengths
          </h3>
          <ul className="space-y-2">
            {student.subjectScores
              .filter(s => s.averageScore >= 85)
              .slice(0, 3)
              .map((subject, index) => (
                <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Excellent performance in <strong>{subject.subjectName}</strong> ({subject.averageScore}%)</span>
                </li>
              ))}
            <li className="text-sm text-green-800 flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Consistent attendance at {student.performance.attendance}%</span>
            </li>
          </ul>
        </Card>

        {/* Areas for Improvement */}
        <Card variant="elevated" padding="lg" className="bg-orange-50 border-2 border-orange-200">
          <h3 className="text-lg font-bold text-orange-900 mb-3 flex items-center gap-2">
            <AlertCircle size={20} />
            Focus Areas
          </h3>
          <ul className="space-y-2">
            {student.subjectScores
              .filter(s => s.averageScore < 75)
              .slice(0, 3)
              .map((subject, index) => (
                <li key={index} className="text-sm text-orange-800 flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">!</span>
                  <span>Needs improvement in <strong>{subject.subjectName}</strong> ({subject.averageScore}%)</span>
                </li>
              ))}
            <li className="text-sm text-orange-800 flex items-start gap-2">
              <span className="text-orange-600 mt-0.5">!</span>
              <span>Consider additional practice tests to boost confidence</span>
            </li>
          </ul>
        </Card>
      </motion.div>
    </div>
  );
}
