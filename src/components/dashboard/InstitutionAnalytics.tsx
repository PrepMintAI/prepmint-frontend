'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import Card, { CardHeader, CardBody, StatCard } from '@/components/common/Card';
import Spinner from '@/components/common/Spinner';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Filter, ChevronDown, TrendingUp, Users, BookOpen, Award } from 'lucide-react';

// ===== Types =====

type ViewLevel = 'school' | 'class' | 'student';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'institution';
  xp: number;
  level: number;
  badges?: string[];
  class?: string;
  section?: string;
  rollNo?: string;
  institutionId?: string;
}

interface Evaluation {
  id: string;
  studentId: string;
  institutionId: string;
  testId: string;
  score: number;
  totalScore: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: any;
  updatedAt?: any;
  class?: string;
  section?: string;
}

interface FilterState {
  viewLevel: ViewLevel;
  selectedClass: string;
  selectedSection: string;
  selectedStudent: string;
  dateRange: 7 | 30 | 90 | 365;
}

interface ClassStats {
  class: string;
  totalStudents: number;
  avgScore: number;
  avgXP: number;
  avgLevel: number;
  evaluationCount: number;
  topPerformer: {
    name: string;
    score: number;
  } | null;
}

interface SectionStats {
  section: string;
  totalStudents: number;
  avgScore: number;
  avgXP: number;
  evaluationCount: number;
}

interface InstitutionAnalyticsProps {
  institutionId: string;
  userId: string;
}

// ===== Main Component =====

export default function InstitutionAnalytics({ institutionId, userId }: InstitutionAnalyticsProps) {
  // State Management
  const [filters, setFilters] = useState<FilterState>({
    viewLevel: 'school',
    selectedClass: 'all',
    selectedSection: 'all',
    selectedStudent: '',
    dateRange: 30,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [filterExpanded, setFilterExpanded] = useState(true);

  // Data State
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [institution, setInstitution] = useState<any>(null);

  // ===== Data Fetching =====

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch institution data
        const institutionDoc = await getDoc(doc(db, 'institutions', institutionId));
        if (institutionDoc.exists()) {
          setInstitution(institutionDoc.data());
        }

        // Fetch all students in institution
        const studentsQuery = query(
          supabase.from('users'),
          where('institutionId', '==', institutionId),
          where('role', '==', 'student')
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsData = studentsSnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        } as UserProfile));
        setStudents(studentsData);

        // Fetch all evaluations for institution
        const evaluationsQuery = query(
          supabase.from('evaluations'),
          where('institutionId', '==', institutionId)
        );
        const evaluationsSnapshot = await getDocs(evaluationsQuery);
        const evaluationsData = evaluationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Evaluation));
        setEvaluations(evaluationsData);
      } catch (error) {
        logger.error('Failed to fetch institution analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [institutionId]);

  // ===== Data Processing & Filtering =====

  // Get unique classes and sections
  const uniqueClasses = useMemo(() => {
    const classes = [...new Set(students.map((s) => s.class).filter(Boolean))].sort();
    return classes as string[];
  }, [students]);

  const uniqueSections = useMemo(() => {
    const sections = [...new Set(students.map((s) => s.section).filter(Boolean))].sort();
    return sections as string[];
  }, [students]);

  // Filter students by class and section
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (filters.selectedClass !== 'all' && student.class !== filters.selectedClass) return false;
      if (filters.selectedSection !== 'all' && student.section !== filters.selectedSection) return false;
      return true;
    });
  }, [students, filters.selectedClass, filters.selectedSection]);

  // Filter evaluations by date range and class
  const filteredEvaluations = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filters.dateRange);

    const filtered = evaluations.filter((evaluation) => {
      const evalDate = evaluation.created_at?.toDate?.() || new Date(evaluation.created_at);
      if (evalDate < cutoffDate) return false;

      // Filter by student if viewing single student
      if (filters.viewLevel === 'student' && filters.selectedStudent) {
        if (evaluation.user_id !== filters.selectedStudent) return false;
      } else if (filters.viewLevel === 'class' || filters.viewLevel === 'school') {
        // Filter by class if selected
        if (filters.selectedClass !== 'all') {
          const student = students.find((s) => s.uid === evaluation.user_id);
          if (student?.class !== filters.selectedClass) return false;
        }

        // Filter by section if selected
        if (filters.selectedSection !== 'all') {
          const student = students.find((s) => s.uid === evaluation.user_id);
          if (student?.section !== filters.selectedSection) return false;
        }
      }

      return true;
    });

    return filtered;
  }, [evaluations, students, filters.dateRange, filters.viewLevel, filters.selectedClass, filters.selectedSection, filters.selectedStudent]);

  // Calculate class-level statistics
  const classStats = useMemo(() => {
    const stats: Record<string, ClassStats> = {};

    uniqueClasses.forEach((cls) => {
      const classStudents = students.filter((s) => s.class === cls);
      const classEvals = filteredEvaluations.filter((e) => {
        const student = students.find((s) => s.uid === e.user_id);
        return student?.class === cls;
      });

      const avgScore = classEvals.length > 0 ? classEvals.reduce((sum, e) => sum + e.score, 0) / classEvals.length : 0;
      const avgXP = classStudents.length > 0 ? classStudents.reduce((sum, s) => sum + (s.xp || 0), 0) / classStudents.length : 0;
      const avgLevel = classStudents.length > 0 ? classStudents.reduce((sum, s) => sum + (s.level || 0), 0) / classStudents.length : 0;

      // Find top performer
      let topPerformer = null;
      if (classEvals.length > 0) {
        const bestEval = classEvals.reduce((best, curr) => (curr.score > best.score ? curr : best));
        const student = students.find((s) => s.uid === bestEval.user_id);
        if (student) {
          topPerformer = {
            name: student.display_name,
            score: bestEval.score,
          };
        }
      }

      stats[cls] = {
        class: cls,
        totalStudents: classStudents.length,
        avgScore: Math.round(avgScore * 100) / 100,
        avgXP: Math.round(avgXP * 100) / 100,
        avgLevel: Math.round(avgLevel * 100) / 100,
        evaluationCount: classEvals.length,
        topPerformer,
      };
    });

    return stats;
  }, [uniqueClasses, students, filteredEvaluations]);

  // Calculate section-level statistics
  const sectionStats = useMemo(() => {
    const stats: Record<string, SectionStats> = {};

    if (filters.selectedClass !== 'all') {
      uniqueSections.forEach((section) => {
        const sectionStudents = students.filter((s) => s.class === filters.selectedClass && s.section === section);
        const sectionEvals = filteredEvaluations.filter((e) => {
          const student = students.find((s) => s.uid === e.user_id);
          return student?.class === filters.selectedClass && student?.section === section;
        });

        const avgScore = sectionEvals.length > 0 ? sectionEvals.reduce((sum, e) => sum + e.score, 0) / sectionEvals.length : 0;
        const avgXP = sectionStudents.length > 0 ? sectionStudents.reduce((sum, s) => sum + (s.xp || 0), 0) / sectionStudents.length : 0;

        stats[section] = {
          section,
          totalStudents: sectionStudents.length,
          avgScore: Math.round(avgScore * 100) / 100,
          avgXP: Math.round(avgXP * 100) / 100,
          evaluationCount: sectionEvals.length,
        };
      });
    }

    return stats;
  }, [uniqueSections, students, filteredEvaluations, filters.selectedClass]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const validEvals = filteredEvaluations.filter((e) => e.status === 'completed');
    const avgScore = validEvals.length > 0 ? validEvals.reduce((sum, e) => sum + e.score, 0) / validEvals.length : 0;
    const avgXP = filteredStudents.length > 0 ? filteredStudents.reduce((sum, s) => sum + (s.xp || 0), 0) / filteredStudents.length : 0;
    const avgLevel = filteredStudents.length > 0 ? filteredStudents.reduce((sum, s) => sum + (s.level || 0), 0) / filteredStudents.length : 0;

    return {
      totalStudents: filteredStudents.length,
      totalEvaluations: filteredEvaluations.length,
      avgScore: Math.round(avgScore * 100) / 100,
      avgXP: Math.round(avgXP * 100) / 100,
      avgLevel: Math.round(avgLevel * 100) / 100,
      completedEvals: validEvals.length,
    };
  }, [filteredStudents, filteredEvaluations]);

  // Prepare chart data for class comparison
  const classChartData = useMemo(() => {
    return uniqueClasses.map((cls) => ({
      class: `Class ${cls}`,
      avgScore: classStats[cls]?.avgScore || 0,
      avgXP: classStats[cls]?.avgXP || 0,
      students: classStats[cls]?.totalStudents || 0,
    }));
  }, [uniqueClasses, classStats]);

  // Prepare chart data for section comparison
  const sectionChartData = useMemo(() => {
    return Object.values(sectionStats).map((stat) => ({
      section: `Section ${stat.section}`,
      avgScore: stat.avgScore,
      avgXP: stat.avgXP,
      students: stat.totalStudents,
    }));
  }, [sectionStats]);

  // Prepare student list with scores
  const studentListData = useMemo(() => {
    return filteredStudents
      .map((student) => {
        const studentEvals = filteredEvaluations.filter((e) => e.user_id === student.uid);
        const avgScore = studentEvals.length > 0 ? studentEvals.reduce((sum, e) => sum + e.score, 0) / studentEvals.length : 0;

        return {
          uid: student.uid,
          name: student.display_name,
          class: student.class || '-',
          section: student.section || '-',
          rollNo: student.rollNo || '-',
          xp: student.xp || 0,
          level: student.level || 1,
          avgScore: Math.round(avgScore * 100) / 100,
          evaluationCount: studentEvals.length,
        };
      })
      .sort((a, b) => b.xp - a.xp);
  }, [filteredStudents, filteredEvaluations]);

  // Prepare evaluation timeline data
  const timelineData = useMemo(() => {
    const dayMap: Record<string, { completed: number; failed: number }> = {};

    filteredEvaluations.forEach((evaluation) => {
      const date = evaluation.created_at?.toDate?.() || new Date(evaluation.created_at);
      const dayKey = date.toLocaleDateString('en-US');

      if (!dayMap[dayKey]) {
        dayMap[dayKey] = { completed: 0, failed: 0 };
      }

      if (evaluation.status === 'completed') {
        dayMap[dayKey].completed += 1;
      } else if (evaluation.status === 'failed') {
        dayMap[dayKey].failed += 1;
      }
    });

    return Object.entries(dayMap)
      .map(([date, data]) => ({
        date,
        completed: data.completed,
        failed: data.failed,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredEvaluations]);

  // Performance distribution data
  const performanceDistribution = useMemo(() => {
    const ranges = [
      { range: '0-20%', count: 0 },
      { range: '20-40%', count: 0 },
      { range: '40-60%', count: 0 },
      { range: '60-80%', count: 0 },
      { range: '80-100%', count: 0 },
    ];

    filteredEvaluations.forEach((evaluation) => {
      const percentage = evaluation.totalScore > 0 ? (evaluation.score / evaluation.totalScore) * 100 : 0;

      if (percentage < 20) ranges[0].count += 1;
      else if (percentage < 40) ranges[1].count += 1;
      else if (percentage < 60) ranges[2].count += 1;
      else if (percentage < 80) ranges[3].count += 1;
      else ranges[4].count += 1;
    });

    return ranges;
  }, [filteredEvaluations]);

  // ===== Filter Handlers =====

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };

    // Cascading filter logic
    if (updated.viewLevel === 'school') {
      updated.selectedClass = 'all';
      updated.selectedSection = 'all';
      updated.selectedStudent = '';
    } else if (updated.viewLevel === 'class') {
      updated.selectedSection = 'all';
      updated.selectedStudent = '';
    }

    if (updated.selectedClass === 'all') {
      updated.selectedSection = 'all';
      updated.selectedStudent = '';
    }

    if (updated.selectedSection === 'all') {
      updated.selectedStudent = '';
    }

    setFilters(updated);
  };

  // ===== Render Helpers =====

  const renderSchoolView = () => (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* School-wide Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={overallStats.totalStudents}
          icon={<Users size={20} />}
          variant="default"
        />
        <StatCard
          label="Total Evaluations"
          value={overallStats.totalEvaluations}
          icon={<BookOpen size={20} />}
          variant="default"
        />
        <StatCard
          label="Avg. Score"
          value={`${overallStats.avgScore.toFixed(1)}%`}
          icon={<TrendingUp size={20} />}
          variant="default"
        />
        <StatCard
          label="Avg. XP"
          value={Math.round(overallStats.avgXP)}
          icon={<Award size={20} />}
          variant="default"
        />
      </div>

      {/* Class Comparison Charts */}
      <Card variant="elevated" padding="lg">
        <CardHeader title="Class Performance Comparison" subtitle="Average score and XP by class" />
        <CardBody>
          {classChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgScore" fill="#3b82f6" name="Avg Score (%)" />
                <Bar dataKey="avgXP" fill="#10b981" name="Avg XP" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-sm">No data available</p>
          )}
        </CardBody>
      </Card>

      {/* Top Performers by Class */}
      <Card variant="elevated" padding="lg">
        <CardHeader title="Top Performers by Class" />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uniqueClasses.map((cls) => {
              const stats = classStats[cls];
              return (
                <div key={cls} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Class {cls}</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Students: <span className="font-medium text-gray-900">{stats.totalStudents}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Avg Score: <span className="font-medium text-gray-900">{stats.avgScore}%</span>
                    </p>
                    {stats.topPerformer && (
                      <p className="text-sm text-gray-600">
                        Top: <span className="font-medium text-green-600">{stats.topPerformer.name}</span> ({stats.topPerformer.score}%)
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Performance Distribution */}
      <Card variant="elevated" padding="lg">
        <CardHeader title="Performance Distribution" subtitle="Percentage of students in each score range" />
        <CardBody>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={performanceDistribution}
                dataKey="count"
                nameKey="range"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {performanceDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'][index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Evaluation Timeline */}
      <Card variant="elevated" padding="lg">
        <CardHeader title="Evaluation Timeline" subtitle={`Last ${filters.dateRange} days`} />
        <CardBody>
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed" />
                <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Failed" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-sm">No evaluation data available</p>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );

  const renderClassView = () => (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {filters.selectedClass !== 'all' && classStats[filters.selectedClass] && (
        <>
          {/* Class Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Students"
              value={classStats[filters.selectedClass].totalStudents}
              icon={<Users size={20} />}
              variant="default"
            />
            <StatCard
              label="Evaluations"
              value={classStats[filters.selectedClass].evaluationCount}
              icon={<BookOpen size={20} />}
              variant="default"
            />
            <StatCard
              label="Avg. Score"
              value={`${classStats[filters.selectedClass].avgScore.toFixed(1)}%`}
              icon={<TrendingUp size={20} />}
              variant="default"
            />
            <StatCard
              label="Avg. Level"
              value={classStats[filters.selectedClass].avgLevel.toFixed(1)}
              icon={<Award size={20} />}
              variant="default"
            />
          </div>

          {/* Section Comparison */}
          {sectionChartData.length > 0 && (
            <Card variant="elevated" padding="lg">
              <CardHeader title="Section Performance Comparison" subtitle={`Class ${filters.selectedClass}`} />
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sectionChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="section" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgScore" fill="#3b82f6" name="Avg Score (%)" />
                    <Bar dataKey="students" fill="#8b5cf6" name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          )}

          {/* Student List */}
          <Card variant="elevated" padding="lg">
            <CardHeader title="Student Rankings" subtitle={`Class ${filters.selectedClass}`} />
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold text-gray-900">Name</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-900">Roll No</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-900">Section</th>
                      <th className="text-right py-2 px-3 font-semibold text-gray-900">XP</th>
                      <th className="text-right py-2 px-3 font-semibold text-gray-900">Level</th>
                      <th className="text-right py-2 px-3 font-semibold text-gray-900">Avg Score</th>
                      <th className="text-right py-2 px-3 font-semibold text-gray-900">Evaluations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {studentListData.map((student, index) => (
                      <tr key={student.uid} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-2 px-3 text-gray-900">{student.name}</td>
                        <td className="py-2 px-3 text-gray-600">{student.rollNo}</td>
                        <td className="py-2 px-3 text-gray-600">{student.section}</td>
                        <td className="py-2 px-3 text-right font-medium text-blue-600">{student.xp}</td>
                        <td className="py-2 px-3 text-right font-medium text-purple-600">{student.level}</td>
                        <td className="py-2 px-3 text-right font-medium text-green-600">{student.avgScore.toFixed(1)}%</td>
                        <td className="py-2 px-3 text-right text-gray-600">{student.evaluationCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </motion.div>
  );

  const renderStudentView = () => {
    const selectedStudent = students.find((s) => s.uid === filters.selectedStudent);
    const studentEvals = filteredEvaluations.filter((e) => e.user_id === filters.selectedStudent);
    const avgScore = studentEvals.length > 0 ? studentEvals.reduce((sum, e) => sum + e.score, 0) / studentEvals.length : 0;

    return (
      <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {selectedStudent && (
          <>
            {/* Student Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                label="Current XP"
                value={selectedStudent.xp || 0}
                icon={<Award size={20} />}
                variant="default"
              />
              <StatCard
                label="Level"
                value={selectedStudent.level || 1}
                icon={<TrendingUp size={20} />}
                variant="default"
              />
              <StatCard
                label="Avg. Score"
                value={`${avgScore.toFixed(1)}%`}
                icon={<BookOpen size={20} />}
                variant="default"
              />
              <StatCard
                label="Total Evaluations"
                value={studentEvals.length}
                icon={<Users size={20} />}
                variant="default"
              />
            </div>

            {/* Student Info */}
            <Card variant="elevated" padding="lg">
              <CardHeader title={`${selectedStudent.display_name}'s Profile`} subtitle={`${selectedStudent.class}-${selectedStudent.section} (Roll No: ${selectedStudent.rollNo})`} />
              <CardBody>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Badges Earned</p>
                    <p className="font-medium text-gray-900">{selectedStudent.badges?.length || 0}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Evaluation Performance */}
            <Card variant="elevated" padding="lg">
              <CardHeader title="Recent Evaluations" />
              <CardBody>
                {studentEvals.length > 0 ? (
                  <div className="space-y-3">
                    {studentEvals.slice(0, 10).map((evaluation) => (
                      <div key={evaluation.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Test ID: {evaluation.testId.substring(0, 8)}...</p>
                          <p className="text-sm text-gray-600">
                            {evaluation.created_at?.toDate?.()?.toLocaleDateString() || new Date(evaluation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{evaluation.score}/{evaluation.totalScore}</p>
                          <p className={`text-sm font-medium ${evaluation.status === 'completed' ? 'text-green-600' : evaluation.status === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>
                            {evaluation.status.charAt(0).toUpperCase() + evaluation.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No evaluations yet</p>
                )}
              </CardBody>
            </Card>
          </>
        )}
      </motion.div>
    );
  };

  // ===== Main Render =====

  if (isLoading) {
    return <Spinner fullScreen label="Loading institution analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Filter Panel */}
      <Card variant="elevated" padding="lg" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Analytics Filters</h3>
          </div>
          <button
            onClick={() => setFilterExpanded(!filterExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronDown
              size={20}
              className={`text-gray-600 transition-transform ${filterExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        <AnimatePresence>
          {filterExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* View Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">View Level</label>
                  <select
                    value={filters.viewLevel}
                    onChange={(e) => handleFilterChange({ viewLevel: e.target.value as ViewLevel })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    <option value="school">School-wide</option>
                    <option value="class">Class Level</option>
                    <option value="student">Student Level</option>
                  </select>
                </div>

                {/* Class Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <select
                    value={filters.selectedClass}
                    onChange={(e) => handleFilterChange({ selectedClass: e.target.value })}
                    disabled={filters.viewLevel === 'school'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="all">All Classes</option>
                    {uniqueClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                  <select
                    value={filters.selectedSection}
                    onChange={(e) => handleFilterChange({ selectedSection: e.target.value })}
                    disabled={filters.viewLevel === 'school' || filters.selectedClass === 'all'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="all">All Sections</option>
                    {uniqueSections.map((section) => (
                      <option key={section} value={section}>
                        Section {section}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Student Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                  <select
                    value={filters.selectedStudent}
                    onChange={(e) => handleFilterChange({ selectedStudent: e.target.value })}
                    disabled={filters.viewLevel !== 'student' || filters.selectedSection === 'all'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Student</option>
                    {filteredStudents.map((student) => (
                      <option key={student.uid} value={student.uid}>
                        {student.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange({ dateRange: Number(e.target.value) as 7 | 30 | 90 | 365 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                    <option value={365}>Last 365 days</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {filters.viewLevel === 'school' ? 'School-wide' : filters.viewLevel === 'class' ? 'Class Level' : 'Student Level'}
                  </span>
                  {filters.selectedClass !== 'all' && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      Class {filters.selectedClass}
                    </span>
                  )}
                  {filters.selectedSection !== 'all' && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Section {filters.selectedSection}
                    </span>
                  )}
                  {filters.selectedStudent && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                      {students.find((s) => s.uid === filters.selectedStudent)?.display_name}
                    </span>
                  )}
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    Last {filters.dateRange} days
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* View Content */}
      {filters.viewLevel === 'school' && renderSchoolView()}
      {filters.viewLevel === 'class' && renderClassView()}
      {filters.viewLevel === 'student' && renderStudentView()}
    </div>
  );
}
