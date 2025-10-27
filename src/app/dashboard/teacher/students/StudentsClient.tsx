// src/app/dashboard/teacher/students/StudentsClient.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { 
  Users, Search, Filter, Download, Mail, 
  TrendingUp, TrendingDown, Eye, MessageSquare,
  CheckCircle, Clock, Award, BarChart3
} from 'lucide-react';
import { 
  getTeacherById, 
  getStudentsByClass, 
  teachers,
  students as allStudents
} from '@/lib/comprehensiveMockData';

interface StudentsClientProps {
  userId: string;
  userRole: string;
}

export function StudentsClient({ userId, userRole }: StudentsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Get teacher data if role is teacher
  const teacher = useMemo(() => {
    if (userRole === 'teacher') {
      return teachers.find(t => t.uid === userId) || teachers[0];
    }
    return null;
  }, [userId, userRole]);

  // Get students based on role
  const students = useMemo(() => {
    if (userRole === 'teacher' && teacher) {
      // Get all students from teacher's assigned classes
      const teacherStudents: any[] = [];
      teacher.assignedClasses.forEach(assignedClass => {
        const classStudents = getStudentsByClass(
          teacher.institutionId,
          assignedClass.class,
          assignedClass.section
        );
        teacherStudents.push(...classStudents);
      });
      // Remove duplicates
      return teacherStudents.filter((student, index, self) =>
        index === self.findIndex((s) => s.id === student.id)
      );
    }
    // For admin/institution - show all students
    return allStudents;
  }, [userRole, teacher]);

  // Get unique classes for filter
  const classOptions = useMemo(() => {
    const classes = new Set(students.map(s => `${s.class}${s.section}`));
    return ['all', ...Array.from(classes)];
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesClass = 
        classFilter === 'all' || 
        `${student.class}${student.section}` === classFilter;
      
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'active' && student.performance.attendance >= 85) ||
        (statusFilter === 'inactive' && student.performance.attendance < 85);
      
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, searchQuery, classFilter, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: students.length,
      active: students.filter(s => s.performance.attendance >= 85).length,
      avgPerformance: Math.round(
        students.reduce((sum, s) => sum + s.performance.overallPercentage, 0) / students.length
      ),
      avgAttendance: Math.round(
        students.reduce((sum, s) => sum + s.performance.attendance, 0) / students.length
      ),
    };
  }, [students]);

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 75) return 'text-blue-600 bg-blue-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (attendance: number) => {
    if (attendance >= 85) return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-orange-100 text-orange-700 border-orange-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-600 mt-1">
              {teacher 
                ? `Managing ${students.length} students across ${teacher.assignedClasses.length} classes`
                : `${students.length} total students`
              }
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={18} />}
            >
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Mail size={18} />}
            >
              Send Message
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card variant="elevated" padding="lg" className="text-center">
          <Users className="mx-auto mb-2 text-blue-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Students</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
          <p className="text-sm text-gray-600">Active (85%+ attendance)</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <TrendingUp className="mx-auto mb-2 text-purple-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats.avgPerformance}%</p>
          <p className="text-sm text-gray-600">Avg Performance</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <Award className="mx-auto mb-2 text-yellow-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats.avgAttendance}%</p>
          <p className="text-sm text-gray-600">Avg Attendance</p>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="elevated" padding="lg">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, roll no, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            {/* Class Filter */}
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            >
              <option value="all">All Classes</option>
              {classOptions.filter(c => c !== 'all').map(cls => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active (85%+)</option>
              <option value="inactive">Needs Attention</option>
            </select>
          </div>

          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </Card>
      </motion.div>

      {/* Students Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="elevated" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Class</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Performance</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Tests</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Attendance</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student, index) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.02 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Student Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-600">{student.rollNo}</p>
                        </div>
                      </div>
                    </td>

                    {/* Class */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 font-medium">
                        Class {student.class}{student.section}
                      </p>
                    </td>

                    {/* Performance */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getPerformanceColor(student.performance.overallPercentage)}`}>
                        {student.performance.overallPercentage}%
                      </span>
                    </td>

                    {/* Tests */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <p className="text-sm font-semibold text-gray-900">
                          {student.performance.testsCompleted}
                        </p>
                        <p className="text-xs text-gray-600">completed</p>
                      </div>
                    </td>

                    {/* Attendance */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <p className={`text-sm font-semibold ${
                          student.performance.attendance >= 85 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {student.performance.attendance}%
                        </p>
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full ${
                              student.performance.attendance >= 85 ? 'bg-green-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${student.performance.attendance}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.performance.attendance)}`}>
                        {student.performance.attendance >= 85 ? 'Active' : 'Attention'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/teacher/students/${student.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/teacher/students`)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Send Message"
                        >
                          <MessageSquare size={18} />
                        </button>
                        <button
                          onClick={() => router.push(`/analytics?student=${student.id}`)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Analytics"
                        >
                          <BarChart3 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">No students found</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
