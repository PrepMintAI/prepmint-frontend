// src/app/dashboard/analytics/AdminAnalytics.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import Card, { CardHeader, CardBody, StatCard } from '@/components/common/Card';
import Spinner from '@/components/common/Spinner';
import {
  Users,
  Building2,
  BookOpen,
  TrendingUp,
  Award,
  UserCheck,
  GraduationCap,
  AlertCircle,
  Activity,
  Calendar,
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// ===== Types =====

interface UserData {
  id: string;
  role: 'student' | 'teacher' | 'admin' | 'institution';
  display_name: string;
  email: string;
  xp?: number;
  level?: number;
  institution_id?: string;
  created_at?: any;
  last_login_at?: any;
}

interface InstitutionData {
  id: string;
  name: string;
  student_count?: number;
  teacher_count?: number;
  created_at?: any;
}

interface EvaluationData {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  user_id: string;
  institution_id?: string;
  created_at: any;
  score?: number;
  total_marks?: number;
}

interface PlatformStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalInstitutions: number;
  totalEvaluations: number;
  completedEvaluations: number;
  avgScore: number;
  activeUsersLast7Days: number;
}

interface RoleDistribution {
  role: string;
  count: number;
  percentage: number;
}

// ===== Main Component =====

interface AdminAnalyticsProps {
  userId: string;
  userName: string;
}

export default function AdminAnalytics({ userId, userName }: AdminAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<UserData[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionData[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([]);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*');

        if (usersError) throw usersError;
        setUsers((usersData || []) as any);

        // Fetch all institutions
        const { data: institutionsData, error: institutionsError } = await supabase
          .from('institutions')
          .select('*');

        if (institutionsError) throw institutionsError;
        setInstitutions((institutionsData || []) as any);

        // Fetch evaluations (last 1000)
        const { data: evaluationsData, error: evaluationsError } = await supabase
          .from('evaluations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000);

        if (evaluationsError) throw evaluationsError;
        setEvaluations((evaluationsData || []) as any);

        setLoading(false);
      } catch (err) {
        logger.error('Admin Analytics - Error fetching data:', err);
        setError('Failed to load analytics data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate platform stats
  const platformStats = useMemo<PlatformStats>(() => {
    const totalUsers = users.length;
    const totalStudents = users.filter((u) => u.role === 'student').length;
    const totalTeachers = users.filter((u) => u.role === 'teacher').length;
    const totalInstitutions = institutions.length;
    const totalEvaluations = evaluations.length;
    const completedEvaluations = evaluations.filter((e) => e.status === 'completed').length;

    // Calculate average score
    const completedWithScores = evaluations.filter(
      (e) => e.status === 'completed' && e.score !== undefined && e.total_marks !== undefined
    );
    const avgScore =
      completedWithScores.length > 0
        ? Math.round(
            completedWithScores.reduce(
              (sum, e) => sum + ((e.score || 0) / (e.total_marks || 1)) * 100,
              0
            ) / completedWithScores.length
          )
        : 0;

    // Active users in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsersLast7Days = users.filter((u) => {
      if (!u.last_login_at) return false;
      const lastLogin = new Date(u.last_login_at);
      return lastLogin >= sevenDaysAgo;
    }).length;

    return {
      totalUsers,
      totalStudents,
      totalTeachers,
      totalInstitutions,
      totalEvaluations,
      completedEvaluations,
      avgScore,
      activeUsersLast7Days,
    };
  }, [users, institutions, evaluations]);

  // Role distribution
  const roleDistribution = useMemo<RoleDistribution[]>(() => {
    const roleCounts: Record<string, number> = {
      student: 0,
      teacher: 0,
      admin: 0,
      institution: 0,
    };

    users.forEach((u) => {
      roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
    });

    return Object.entries(roleCounts)
      .map(([role, count]) => ({
        role: role.charAt(0).toUpperCase() + role.slice(1),
        count,
        percentage: users.length > 0 ? Math.round((count / users.length) * 100) : 0,
      }))
      .filter((r) => r.count > 0);
  }, [users]);

  // Top institutions by student count
  const topInstitutions = useMemo(() => {
    return institutions
      .map((inst) => ({
        ...inst,
        studentCount: users.filter((u) => u.institution_id === inst.id && u.role === 'student')
          .length,
        teacherCount: users.filter((u) => u.institution_id === inst.id && u.role === 'teacher')
          .length,
      }))
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, 5);
  }, [institutions, users]);

  // Evaluation timeline (last 30 days)
  const evaluationTimeline = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dateMap: Record<string, { completed: number; failed: number; pending: number }> = {};

    evaluations.forEach((evaluation) => {
      const date = evaluation.created_at
          ? new Date(evaluation.created_at)
          : new Date();

      if (date >= thirtyDaysAgo) {
        const dateStr = date.toLocaleDateString('en-US');

        if (!dateMap[dateStr]) {
          dateMap[dateStr] = { completed: 0, failed: 0, pending: 0 };
        }

        if (evaluation.status === 'completed') {
          dateMap[dateStr].completed += 1;
        } else if (evaluation.status === 'failed') {
          dateMap[dateStr].failed += 1;
        } else {
          dateMap[dateStr].pending += 1;
        }
      }
    });

    return Object.entries(dateMap)
      .map(([date, data]) => ({
        date,
        completed: data.completed,
        failed: data.failed,
        pending: data.pending,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [evaluations]);

  // Recent activity
  const recentActivity = useMemo(() => {
    return evaluations
      .sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 10)
      .map((evaluation) => {
        const user = users.find((u) => u.id === evaluation.user_id);
        const date = evaluation.created_at
            ? new Date(evaluation.created_at)
            : new Date();

        return {
          id: evaluation.id,
          userName: user?.display_name || 'Unknown User',
          status: evaluation.status,
          date,
        };
      });
  }, [evaluations, users]);

  // Render states
  if (loading) {
    return <Spinner fullScreen label="Loading admin analytics..." />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-lg p-6"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Analytics</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-1">Admin Analytics</h2>
          <p className="text-blue-100">System-wide metrics and platform insights</p>
        </div>
      </motion.div>

      {/* Platform Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          label="Total Users"
          value={platformStats.totalUsers}
          icon={<Users size={24} />}
          variant="gradient"
        />
        <StatCard
          label="Total Institutions"
          value={platformStats.totalInstitutions}
          icon={<Building2 size={24} />}
          variant="gradient"
        />
        <StatCard
          label="Total Evaluations"
          value={platformStats.totalEvaluations}
          icon={<BookOpen size={24} />}
          variant="gradient"
        />
        <StatCard
          label="Active Users (7d)"
          value={platformStats.activeUsersLast7Days}
          icon={<Activity size={24} />}
          variant="gradient"
        />
      </motion.div>

      {/* Secondary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card variant="elevated" padding="lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {platformStats.totalStudents}
              </p>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <GraduationCap className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Teachers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {platformStats.totalTeachers}
              </p>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <UserCheck className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {platformStats.totalEvaluations > 0
                  ? Math.round(
                      (platformStats.completedEvaluations / platformStats.totalEvaluations) * 100
                    )
                  : 0}
                %
              </p>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>

        <Card variant="elevated" padding="lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Avg Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{platformStats.avgScore}%</p>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <Award className="text-orange-600" size={24} />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Role Distribution */}
        <Card variant="elevated" padding="lg">
          <CardHeader title="User Distribution by Role" subtitle="Platform-wide role breakdown" />
          <CardBody>
            {roleDistribution.length > 0 ? (
              <div className="flex items-center justify-between gap-8">
                <ResponsiveContainer width="60%" height={250}>
                  <PieChart>
                    <Pie
                      data={roleDistribution as any}
                      dataKey="count"
                      nameKey="role"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry: any) => `${entry.role}: ${entry.count}`}
                    >
                      {roleDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {roleDistribution.map((role, index) => (
                    <div key={role.role} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-gray-700">{role.role}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {role.count} ({role.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-sm text-center py-8">No data available</p>
            )}
          </CardBody>
        </Card>

        {/* Evaluation Timeline */}
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Evaluation Activity"
            subtitle="Last 30 days"
            icon={<Calendar size={20} />}
          />
          <CardBody>
            {evaluationTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsLineChart data={evaluationTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    name="Completed"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="failed"
                    stroke="#ef4444"
                    name="Failed"
                    strokeWidth={2}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600 text-sm text-center py-8">No evaluation data available</p>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Top Institutions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Top Institutions"
            subtitle="By student enrollment"
            icon={<Building2 size={20} />}
          />
          <CardBody>
            {topInstitutions.length > 0 ? (
              <div className="space-y-3">
                {topInstitutions.map((institution, index) => (
                  <div
                    key={institution.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{institution.name}</p>
                        <p className="text-xs text-gray-600">
                          {institution.teacherCount} teachers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{institution.studentCount}</p>
                      <p className="text-xs text-gray-500">students</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm text-center py-8">No institutions found</p>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Recent Activity"
            subtitle="Latest evaluations"
            icon={<Activity size={20} />}
          />
          <CardBody>
            {recentActivity.length > 0 ? (
              <div className="space-y-2">
                {recentActivity.map((activity) => {
                  const statusColor =
                    activity.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : activity.status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700';

                  return (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.userName}</p>
                        <p className="text-xs text-gray-500">
                          {activity.date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
                      >
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600 text-sm text-center py-8">No recent activity</p>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
