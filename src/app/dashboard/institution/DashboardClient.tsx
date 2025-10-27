// src/app/dashboard/institution/DashboardClient.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { 
  Users, BookOpen, Award, TrendingUp, Clock, Calendar, BarChart3, Building2, School2
} from 'lucide-react';
import {
  institutions,
  students,
  teachers,
  tests,
  getStudentsByInstitution,
  getTeachersByInstitution,
  getTestsByInstitution
} from '@/lib/comprehensiveMockData';

interface DashboardClientProps {
  userId: string;
}

export function DashboardClient({ userId }: DashboardClientProps) {
  const router = useRouter();
  // For this view, assume institution id can be derived from userId or props
  // Replace 'inst_001' with real logic as needed
  const institutionId = 'inst_001';
  
  // Fetch relevant data
  const institution = useMemo(() => 
    institutions.find(i => i.id === institutionId), [institutionId]);
  const schoolStudents = useMemo(() => getStudentsByInstitution(institutionId), [institutionId]);
  const schoolTeachers = useMemo(() => getTeachersByInstitution(institutionId), [institutionId]);
  const schoolTests = useMemo(() => getTestsByInstitution(institutionId), [institutionId]);

  // Compute stats
  const byClass = useMemo(() => {
    const result: Record<string, number> = {};
    schoolStudents.forEach(s => {
      const klass = `${s.class}${s.section}`;
      result[klass] = (result[klass] || 0) + 1;
    });
    return result;
  }, [schoolStudents]);

  const avgAttendance = useMemo(() => (
    Math.round(
      schoolStudents.reduce((acc, s) => acc + (s.performance.attendance || 0), 0) / 
      Math.max(1, schoolStudents.length)
    )
  ), [schoolStudents]);

  const avgPerformance = useMemo(() => (
    Math.round(
      schoolStudents.reduce((acc, s) => acc + (s.performance.overallPercentage || 0), 0) /
      Math.max(1, schoolStudents.length)
    )
  ), [schoolStudents]);
  
  const totalTests = schoolTests.length;
  const completedTests = schoolTests.filter(t => t.status === 'completed').length;

  // Aggregate per subject
  const subjectStats = useMemo(() => {
    const subjects: {[key: string]: {count: number, total: number}} = {};
    schoolStudents.forEach(s => {
      s.subjectScores.forEach(sub => {
        if (!subjects[sub.subjectName]) subjects[sub.subjectName] = { count: 0, total: 0 };
        subjects[sub.subjectName].count += 1;
        subjects[sub.subjectName].total += sub.averageScore;
      });
    });
    // Average per subject
    return Object.entries(subjects).map(([name, {count, total}]) => ({
      name,
      avg: Math.round(total / count),
    }));
  }, [schoolStudents]);

  // Top performers (students)
  const topStudents = useMemo(() =>
    [...schoolStudents].sort((a, b) =>
      b.performance.overallPercentage - a.performance.overallPercentage
    ).slice(0, 5)
  , [schoolStudents]);

  // Teachers by number of students assigned
  const topTeachers = useMemo(() =>
    [...schoolTeachers].map(t => ({
      ...t,
      studentCount: t.assignedClasses.reduce((acc, cls) => 
        acc + getStudentsByInstitution(institutionId).filter(
          s => s.class === cls.class && s.section === cls.section
        ).length, 0),
    }))
    .sort((a, b) => b.studentCount - a.studentCount)
    .slice(0, 5)
  , [schoolTeachers, institutionId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-2">
          <Building2 size={40} className="text-blue-700" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {institution?.name || 'Institution Dashboard'}
            </h1>
            <p className="text-gray-600">{schoolTeachers.length} teachers • {schoolStudents.length} students • {Object.keys(byClass).length} classes</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card variant="elevated" padding="lg" className="text-center">
          <Users className="mx-auto mb-2 text-blue-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{schoolStudents.length}</p>
          <p className="text-xs text-gray-600">Students</p>
        </Card>
        <Card variant="elevated" padding="lg" className="text-center">
          <BookOpen className="mx-auto mb-2 text-indigo-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{schoolTeachers.length}</p>
          <p className="text-xs text-gray-600">Teachers</p>
        </Card>
        <Card variant="elevated" padding="lg" className="text-center">
          <Award className="mx-auto mb-2 text-yellow-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{avgPerformance}%</p>
          <p className="text-xs text-gray-600">Avg Performance</p>
        </Card>
        <Card variant="elevated" padding="lg" className="text-center">
          <Clock className="mx-auto mb-2 text-green-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{avgAttendance}%</p>
          <p className="text-xs text-gray-600">Avg Attendance</p>
        </Card>
      </motion.div>

      {/* Classes distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Classes & Enrolment</h3>
          <div className="space-y-2">
            {Object.keys(byClass).sort().map(key => (
              <div key={key} className="flex justify-between text-sm">
                <span>Class {key}</span>
                <span className="font-bold">{byClass[key]}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Subject Performance (Avg %)</h3>
          <div className="space-y-2">
            {subjectStats.map(subject => (
              <div key={subject.name} className="flex justify-between text-sm">
                <span>{subject.name}</span>
                <span className={`font-bold ${
                  subject.avg >= 85 ? 'text-green-700'
                    : subject.avg >= 70 ? 'text-blue-700'
                    : subject.avg >= 60 ? 'text-yellow-700'
                    : 'text-red-700'
                }`}>{subject.avg}%</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Top Students and Top Teachers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Students</h3>
          <div className="space-y-2">
            {topStudents.map(student => (
              <div key={student.id} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">{student.name[0]}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-500">
                    Class {student.class}{student.section} • {student.rollNo}
                  </p>
                </div>
                <span className="px-3 py-1 text-sm font-bold bg-green-100 text-green-700 rounded-full">{student.performance.overallPercentage}%</span>
              </div>
            ))}
          </div>
        </Card>
        <Card variant="elevated" padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Most Engaged Teachers</h3>
          <div className="space-y-2">
            {topTeachers.map(teacher => (
              <div key={teacher.id} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white font-bold">{teacher.name[0]}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{teacher.name}</p>
                  <p className="text-xs text-gray-500">{teacher.studentCount} students</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {teacher.assignedClasses.length} classes
                </span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Tests/Exams Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-4 mb-4">
            <BarChart3 className="text-purple-700" size={20} />
            <h3 className="text-lg font-bold text-gray-900">Assessment Overview</h3>
            <span className="ml-auto text-sm text-gray-600">{completedTests}/{totalTests} completed</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full mt-2">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs text-gray-700 font-semibold">Test</th>
                  <th className="px-4 py-2 text-left text-xs text-gray-700 font-semibold">Subject</th>
                  <th className="px-4 py-2 text-center text-xs text-gray-700 font-semibold">Class</th>
                  <th className="px-4 py-2 text-center text-xs text-gray-700 font-semibold">Date</th>
                  <th className="px-4 py-2 text-center text-xs text-gray-700 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schoolTests.slice(0, 10).map(test => (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{test.title}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{test.subjectName}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 text-center">{test.class}{test.section}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 text-center">{new Date(test.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        test.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : test.status === 'in-progress'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-orange-100 text-orange-700'
                        }`
                      }>
                        {test.status}
                      </span>
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
