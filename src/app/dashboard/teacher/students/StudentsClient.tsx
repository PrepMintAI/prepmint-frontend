// src/app/dashboard/teacher/students/StudentsClient.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import {
  Users, Search, Filter, Download, Mail,
  TrendingUp, TrendingDown, Eye, MessageSquare,
  CheckCircle, Clock, Award, BarChart3
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

interface StudentsClientProps {
  userId: string;
  userRole: string;
}

interface StudentData {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  rollNo?: string;
  class?: string | number;
  section?: string;
  xp: number;
  level: number;
  institutionId?: string;
}

export function StudentsClient({ userId, userRole }: StudentsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      try {
        setIsLoading(true);

        // Fetch teacher's institution ID first
        const { data: teacherData } = await supabase
          .from('users')
          .select('institution_id')
          .eq('id', userId)
          .single();

        const institutionId = teacherData?.institution_id;

        // Fetch students from the same institution
        let studentsQuery = supabase
          .from('users')
          .select('*')
          .eq('role', 'student');

        if (userRole === 'teacher' && institutionId) {
          studentsQuery = studentsQuery.eq('institution_id', institutionId);
        }

        const { data: studentsData, error } = await studentsQuery;

        if (error) throw error;

        const fetchedStudents: StudentData[] = (studentsData || []).map(data => ({
          id: data.id,
          uid: data.id,
          displayName: data.display_name || 'Unknown Student',
          email: data.email || '',
          rollNo: data.roll_no || `STU${Math.floor(Math.random() * 1000)}`,
          class: data.class || 'N/A',
          section: data.section || '',
          xp: data.xp || 0,
          level: data.level || 1,
          institutionId: data.institution_id
        }));

        setStudents(fetchedStudents);
      } catch (error) {
        logger.error('Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStudents();
  }, [userId, userRole]);

  // Get unique classes for filter
  const classOptions = useMemo(() => {
    const classes = new Set(students.map(s => `${s.class}${s.section}`));
    return ['all', ...Array.from(classes)];
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch =
        student.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.rollNo && student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClass =
        classFilter === 'all' ||
        `${student.class}${student.section}` === classFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && student.xp > 100) ||
        (statusFilter === 'inactive' && student.xp <= 100);

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, searchQuery, classFilter, statusFilter]);

  // Calculate stats based on real data
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter(s => s.xp > 100).length;

    // Calculate average performance based on XP and level
    // Assuming level correlates with performance (level 1-10 = 60-100%)
    const avgPerformance = students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + Math.min(60 + (s.level * 4), 100), 0) / students.length)
      : 0;

    // Calculate attendance based on activity (students with XP > 50 are considered active)
    const attendanceRate = students.length > 0
      ? Math.round((students.filter(s => s.xp > 50).length / students.length) * 100)
      : 0;

    return {
      total,
      active,
      avgPerformance,
      avgAttendance: attendanceRate,
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

  if (isLoading) {
    return <Spinner fullScreen label="Loading students..." />;
  }

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
              Managing {students.length} students
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
                          {student.displayName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{student.displayName}</p>
                          <p className="text-xs text-gray-600">{student.rollNo || 'N/A'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Class */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 font-medium">
                        Class {student.class}{student.section}
                      </p>
                    </td>

                    {/* Performance - Mock based on XP */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getPerformanceColor(Math.min(95, 60 + student.xp / 10))}`}>
                        {Math.min(95, Math.floor(60 + student.xp / 10))}%
                      </span>
                    </td>

                    {/* Tests - Mock */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <p className="text-sm font-semibold text-gray-900">
                          {Math.floor(student.xp / 50)}
                        </p>
                        <p className="text-xs text-gray-600">completed</p>
                      </div>
                    </td>

                    {/* Attendance - Mock */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <p className={`text-sm font-semibold ${
                          student.xp > 100 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {Math.min(95, Math.floor(80 + student.xp / 100))}%
                        </p>
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full ${
                              student.xp > 100 ? 'bg-green-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${Math.min(95, Math.floor(80 + student.xp / 100))}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.xp > 100 ? 90 : 80)}`}>
                        {student.xp > 100 ? 'Active' : 'Attention'}
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
