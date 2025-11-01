// src/app/dashboard/teacher/analytics/InstitutionAnalytics.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import FilterPanel, { FilterOptions } from '@/components/dashboard/FilterPanel';
import {
  TrendingUp, TrendingDown, Award, Target, Users, BookOpen,
  GraduationCap, School, Download, BarChart3, Activity
} from 'lucide-react';
import {
  getStudentsByInstitution,
  getTeachersByInstitution,
  getInstitutionById,
  schoolSubjects,
  collegeSubjects,
  type Student,
  type Teacher,
  type Institution
} from '@/lib/comprehensiveMockData';

interface InstitutionAnalyticsProps {
  institutionId: string;
}

export function InstitutionAnalytics({ institutionId }: InstitutionAnalyticsProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    viewLevel: 'school',
    classFilter: 'all',
    sectionFilter: 'all',
    studentId: '',
    subjectFilter: 'all',
    dateRange: 30,
  });

  // Get institution data
  const institution = useMemo(() => getInstitutionById(institutionId), [institutionId]);
  const allStudents = useMemo(() => getStudentsByInstitution(institutionId), [institutionId]);
  const allTeachers = useMemo(() => getTeachersByInstitution(institutionId), [institutionId]);
  const subjects = useMemo(
    () => (institution?.type === 'school' ? schoolSubjects : collegeSubjects),
    [institution]
  );

  // Apply filters to get filtered students
  const filteredStudents = useMemo(() => {
    let result = allStudents;

    if (filters.classFilter !== 'all') {
      result = result.filter(s => s.class === filters.classFilter);
    }

    if (filters.sectionFilter !== 'all') {
      result = result.filter(s => s.section === filters.sectionFilter);
    }

    if (filters.studentId) {
      result = result.filter(s => s.id === filters.studentId);
    }

    return result;
  }, [allStudents, filters]);

  // School-wide metrics
  const schoolMetrics = useMemo(() => {
    const totalStudents = filteredStudents.length;
    const avgPerformance = filteredStudents.reduce((sum, s) => sum + s.performance.overallPercentage, 0) / totalStudents;
    const avgAttendance = filteredStudents.reduce((sum, s) => sum + s.performance.attendance, 0) / totalStudents;
    const totalTests = filteredStudents.reduce((sum, s) => sum + s.performance.testsCompleted, 0);

    return {
      totalStudents,
      avgPerformance: Math.round(avgPerformance),
      avgAttendance: Math.round(avgAttendance),
      totalTests,
      activeTeachers: allTeachers.length,
    };
  }, [filteredStudents, allTeachers]);

  // Class comparison data
  const classComparison = useMemo(() => {
    if (!institution) return [];

    const classData = institution.classes.map(cls => {
      const classStudents = allStudents.filter(s => s.class === cls);
      const avgScore = classStudents.reduce((sum, s) => sum + s.performance.overallPercentage, 0) / classStudents.length;
      const avgAttendance = classStudents.reduce((sum, s) => sum + s.performance.attendance, 0) / classStudents.length;

      return {
        class: `Class ${cls}`,
        performance: Math.round(avgScore),
        attendance: Math.round(avgAttendance),
        students: classStudents.length,
      };
    });

    return classData;
  }, [institution, allStudents]);

  // Subject performance matrix
  const subjectPerformance = useMemo(() => {
    const subjectData = subjects.map(subject => {
      let studentsWithSubject = filteredStudents;

      // Filter by subject if specified
      if (filters.subjectFilter !== 'all') {
        studentsWithSubject = studentsWithSubject.filter(s =>
          s.subjectScores.some(ss => ss.subjectId === filters.subjectFilter)
        );
      }

      const subjectScores = studentsWithSubject
        .map(s => s.subjectScores.find(ss => ss.subjectId === subject.id))
        .filter(Boolean)
        .map(ss => ss!.averageScore);

      const avgScore = subjectScores.length > 0
        ? subjectScores.reduce((sum, score) => sum + score, 0) / subjectScores.length
        : 0;

      const topScore = subjectScores.length > 0 ? Math.max(...subjectScores) : 0;

      return {
        subject: subject.name,
        avgScore: Math.round(avgScore),
        topScore: Math.round(topScore),
        students: subjectScores.length,
      };
    });

    return subjectData.filter(s => s.students > 0);
  }, [subjects, filteredStudents, filters.subjectFilter]);

  // Teacher performance metrics
  const teacherPerformance = useMemo(() => {
    return allTeachers.slice(0, 5).map(teacher => {
      const teacherStudents = allStudents.filter(s =>
        s.subjectScores.some(ss => ss.teacherId === teacher.id)
      );

      const avgPerformance = teacherStudents.length > 0
        ? teacherStudents.reduce((sum, s) => sum + s.performance.overallPercentage, 0) / teacherStudents.length
        : 0;

      return {
        name: teacher.name,
        students: teacherStudents.length,
        avgPerformance: Math.round(avgPerformance),
        subjects: teacher.subjects.length,
      };
    });
  }, [allTeachers, allStudents]);

  // Student growth tracking (top performers)
  const topPerformers = useMemo(() => {
    return [...filteredStudents]
      .sort((a, b) => b.performance.overallPercentage - a.performance.overallPercentage)
      .slice(0, 10)
      .map(student => ({
        id: student.id,
        name: student.name,
        class: student.class,
        section: student.section,
        score: student.performance.overallPercentage,
        rank: student.performance.rank,
        trend: Math.random() > 0.5 ? 'up' : 'down',
      }));
  }, [filteredStudents]);

  // Growth trends (simulated monthly data)
  const growthTrends = useMemo(() => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct'];
    return months.map((month, index) => {
      const baseScore = schoolMetrics.avgPerformance;
      const variation = (Math.random() - 0.5) * 10;
      return {
        month,
        avgScore: Math.round(baseScore + variation),
        attendance: Math.round(schoolMetrics.avgAttendance + (Math.random() - 0.5) * 5),
      };
    });
  }, [schoolMetrics]);

  if (!institution) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Institution not found</p>
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {institution.name} Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              {institution.location} • {institution.type === 'school' ? 'School' : 'College'} • Est. {institution.established}
            </p>
          </div>

          <Button variant="outline" size="sm" leftIcon={<Download size={16} />}>
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        availableClasses={institution.classes}
        availableSections={institution.sections}
        availableStudents={allStudents.map(s => ({
          id: s.id,
          name: s.name,
          rollNo: s.rollNo,
          class: s.class,
          section: s.section,
        }))}
        availableSubjects={subjects.map(s => ({ id: s.id, name: s.name }))}
      />

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        <Card variant="elevated" padding="lg" className="text-center">
          <Users className="mx-auto mb-2 text-blue-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{schoolMetrics.totalStudents}</p>
          <p className="text-xs text-gray-600">Total Students</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <Target className="mx-auto mb-2 text-green-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{schoolMetrics.avgPerformance}%</p>
          <p className="text-xs text-gray-600">Avg Performance</p>
          <p className="text-xs text-green-600 mt-1">↑ 2.5%</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <Activity className="mx-auto mb-2 text-purple-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{schoolMetrics.avgAttendance}%</p>
          <p className="text-xs text-gray-600">Avg Attendance</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <GraduationCap className="mx-auto mb-2 text-orange-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{schoolMetrics.activeTeachers}</p>
          <p className="text-xs text-gray-600">Active Teachers</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <BookOpen className="mx-auto mb-2 text-pink-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{schoolMetrics.totalTests}</p>
          <p className="text-xs text-gray-600">Tests Completed</p>
        </Card>
      </motion.div>

      {/* Charts Row 1: Class Comparison & Subject Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Class Comparison */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Class Comparison</h3>
            <BarChart3 className="text-blue-600" size={20} />
          </div>

          <div className="space-y-4">
            {classComparison.map((data, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{data.class}</span>
                  <div className="flex gap-3 text-xs">
                    <span className="text-blue-600">Perf: {data.performance}%</span>
                    <span className="text-gray-500">Att: {data.attendance}%</span>
                    <span className="text-gray-500">{data.students} students</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      style={{ width: `${data.performance}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Subject Performance Matrix */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Subject Performance</h3>
            <School className="text-purple-600" size={20} />
          </div>

          <div className="space-y-3">
            {subjectPerformance.slice(0, 6).map((data, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium text-gray-700 truncate">
                  {data.subject}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Avg: {data.avgScore}%</span>
                    <span className="text-xs text-green-600">Top: {data.topScore}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        data.avgScore >= 80
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : data.avgScore >= 60
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                      style={{ width: `${data.avgScore}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Charts Row 2: Growth Trends & Teacher Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Growth Trends */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Performance Trends</h3>
            <TrendingUp className="text-green-600" size={20} />
          </div>

          <div className="space-y-4">
            {growthTrends.map((data, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{data.month}</span>
                  <div className="flex gap-3 text-xs">
                    <span className="text-blue-600">Score: {data.avgScore}%</span>
                    <span className="text-purple-600">Att: {data.attendance}%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${data.avgScore}%` }}
                    />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${data.attendance}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Teacher Performance */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Teacher Performance</h3>
            <GraduationCap className="text-orange-600" size={20} />
          </div>

          <div className="space-y-3">
            {teacherPerformance.map((teacher, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold">
                    {teacher.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{teacher.name}</p>
                    <p className="text-xs text-gray-600">
                      {teacher.students} students • {teacher.subjects} subjects
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{teacher.avgPerformance}%</p>
                  <p className="text-xs text-gray-600">Avg Score</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Top Performers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="text-yellow-600" size={20} />
            Top Performers
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Class</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Score</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topPerformers.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {index < 3 ? (
                          <Award size={16} className="text-yellow-600" />
                        ) : (
                          <span className="text-sm font-semibold text-gray-600">#{index + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">
                      {student.class}{student.section}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                        {student.score}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {student.trend === 'up' ? (
                        <span className="text-green-600 flex items-center justify-center gap-1">
                          <TrendingUp size={16} />
                          Up
                        </span>
                      ) : (
                        <span className="text-orange-600 flex items-center justify-center gap-1">
                          <TrendingDown size={16} />
                          Down
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
    </div>
  );
}
