// src/app/dashboard/admin/DashboardClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import Card, { StatCard, CardHeader, CardBody, CardFooter } from '@/components/common/Card';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/common/Button';
import {
  Users, Building, TrendingUp, Activity, Shield,
  UserPlus, Search, Edit, Trash2, Eye,
  Clock, Settings, CheckCircle, AlertCircle, XCircle,
  Database, Zap, Globe, Server, ChevronRight
} from 'lucide-react';
import { logger } from '@/lib/logger';

// Animation variants
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

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'institution' | 'dev';
  status?: 'active' | 'suspended' | 'pending';
  institutionId?: string;
  institutionName?: string;
  createdAt?: any;
  lastActive?: string;
}

interface Institution {
  id: string;
  name: string;
  type?: 'school' | 'university' | 'training_center';
  location?: string;
  studentCount?: number;
  teacherCount?: number;
  status?: 'active' | 'inactive';
  createdAt?: any;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalInstitutions: number;
  evaluationsToday: number;
  systemHealth: number;
}

interface AdminDashboardClientProps {
  userId: string;
}

export function AdminDashboardClient({ userId }: AdminDashboardClientProps) {
  // Use AuthContext instead of Firebase auth
  const { user: authUser, loading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalInstitutions: 0,
    evaluationsToday: 0,
    systemHealth: 100,
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'institutions'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'teacher' | 'admin' | 'dev'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');

  useEffect(() => {
    async function loadDashboard() {
      if (authLoading) return; // Wait for auth to complete

      if (!authUser) {
        router.replace('/login');
        return;
      }

      try {
        await fetchDashboardData();
      } catch (error) {
        logger.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [authLoading, authUser, router]);

  const fetchDashboardData = async () => {
    try {
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, display_name, email, role, status, institution_id, created_at, last_active, last_login_at');

      if (usersError) throw usersError;

      const users: User[] = ((usersData || []) as any[]).map(data => ({
        id: data.id,
        name: data.display_name || data.email || 'Unknown',
        email: data.email || '',
        role: data.role || 'student',
        status: data.status || 'active',
        institutionId: data.institution_id,
        institutionName: undefined, // Would need to join with institutions table
        createdAt: data.created_at,
        lastActive: data.last_active || data.last_login_at,
      }));

      // Fetch institutions
      const { data: institutionsData, error: institutionsError } = await supabase
        .from('institutions')
        .select('id, name, type, location, student_count, teacher_count, status, created_at');

      if (institutionsError) throw institutionsError;

      const institutions: Institution[] = ((institutionsData || []) as any[]).map(data => ({
        id: data.id,
        name: data.name || 'Unnamed Institution',
        type: data.type || 'school',
        location: data.location,
        studentCount: data.student_count || 0,
        teacherCount: data.teacher_count || 0,
        status: data.status || 'active',
        createdAt: data.created_at,
      }));

      // Fetch today's evaluations
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: evaluationsData, error: evaluationsError } = await supabase
        .from('evaluations')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Calculate stats
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.status === 'active').length;
      const totalInstitutions = institutions.length;
      const evaluationsToday = evaluationsError ? 0 : (evaluationsData as any)?.count || 0;

      setStats({
        totalUsers,
        activeUsers,
        totalInstitutions,
        evaluationsToday,
        systemHealth: 98, // Can be calculated based on system metrics
      });

      // Get recent users (last 10)
      const sortedUsers = users.sort((a, b) => {
        const aTime = new Date(a.createdAt || 0);
        const bTime = new Date(b.createdAt || 0);
        return bTime.getTime() - aTime.getTime();
      }).slice(0, 10);

      setRecentUsers(sortedUsers);
      setInstitutions(institutions);

    } catch (error) {
      logger.error('Error fetching dashboard data:', error);
    }
  };

  const filteredUsers = recentUsers.filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (filterStatus !== 'all' && u.status !== filterStatus) return false;
    if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !u.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (authLoading || isLoading) {
    return <Spinner fullScreen label="Loading admin dashboard..." />;
  }

  if (!authUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to access the admin dashboard</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'suspended': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'dev': return 'text-pink-600 bg-pink-50 border-pink-200';
      case 'teacher': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'student': return 'text-green-600 bg-green-50 border-green-200';
      case 'institution': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const formatLastActive = (lastActive: any) => {
    if (!lastActive) return 'Never';
    const date = lastActive.toDate ? lastActive.toDate() : new Date(lastActive);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">System overview and management</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Settings size={18} />}
          onClick={() => router.push('/settings')}
        >
          System Settings
        </Button>
      </div>

      {/* Stats Overview */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <StatCard
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<Users size={24} />}
          variant="gradient"
        />

        <StatCard
          label="Active Users"
          value={stats.activeUsers.toLocaleString()}
          icon={<Activity size={24} />}
        />

        <StatCard
          label="Institutions"
          value={stats.totalInstitutions}
          icon={<Building size={24} />}
        />

        <StatCard
          label="Evaluations Today"
          value={stats.evaluationsToday}
          icon={<TrendingUp size={24} />}
        />

        <StatCard
          label="System Health"
          value={`${stats.systemHealth}%`}
          icon={<Shield size={24} />}
        />
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-cyan-600 border-b-2 border-cyan-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'users'
              ? 'text-cyan-600 border-b-2 border-cyan-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('institutions')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'institutions'
              ? 'text-cyan-600 border-b-2 border-cyan-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Institutions
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader
              title="Recent Users"
              subtitle={`${recentUsers.length} new users`}
              action={
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('users')}>
                  View All
                </Button>
              }
            />
            <CardBody>
              <div className="space-y-3">
                {recentUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader title="System Status" subtitle="Real-time monitoring" />
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Database</span>
                  </div>
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle size={16} /> Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-green-600" />
                    <span className="font-medium">API Server</span>
                  </div>
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle size={16} /> Running
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    <span className="font-medium">AI Service</span>
                  </div>
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle size={16} /> Active
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <Card>
          <CardHeader title="User Management" subtitle={`${stats.totalUsers} total users`} />
          <CardBody>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
                <option value="dev">Dev</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institution</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status || 'active')}`}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.institutionName || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatLastActive(user.lastActive)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button className="p-1 text-gray-400 hover:text-cyan-600">
                            <Eye size={16} />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-blue-600">
                            <Edit size={16} />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'institutions' && (
        <Card>
          <CardHeader title="Institutions" subtitle={`${stats.totalInstitutions} active institutions`} />
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {institutions.map((institution) => (
                <div key={institution.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                        <Building size={24} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{institution.name}</div>
                        <div className="text-xs text-gray-500">{institution.type}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{institution.studentCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Teachers:</span>
                      <span className="font-medium">{institution.teacherCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(institution.status || 'active')}`}>
                        {institution.status || 'active'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default AdminDashboardClient;
