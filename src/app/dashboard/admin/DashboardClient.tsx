// src/app/dashboard/admin/DashboardClient.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase.client';
import { doc, getDoc } from 'firebase/firestore';
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
  status: 'active' | 'suspended' | 'pending';
  institution?: string;
  joinedAt: string;
  lastActive: string;
}

interface Institution {
  id: string;
  name: string;
  type: 'school' | 'university' | 'training_center';
  location: string;
  studentCount: number;
  teacherCount: number;
  status: 'active' | 'inactive';
  joinedAt: string;
}

interface AdminDashboardClientProps {
  userId: string;
}

export function AdminDashboardClient({ userId }: AdminDashboardClientProps) {
  const [_firebaseUser, _setFirebaseUser] = useState<{ uid?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'institutions'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'teacher' | 'admin' | 'dev'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            // Firebase user data loaded
          }
        } catch (error) {
          logger.error('Error loading user data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Mock data - TODO: Replace with real API calls
  const stats = {
    totalUsers: 1542,
    activeUsers: 1398,
    totalInstitutions: 23,
    evaluationsToday: 347,
    systemHealth: 98,
  };

  const recentUsers: User[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'student',
      status: 'active',
      institution: 'Stanford University',
      joinedAt: '2025-10-20',
      lastActive: '2 hours ago',
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      role: 'teacher',
      status: 'active',
      institution: 'MIT',
      joinedAt: '2025-10-19',
      lastActive: '1 hour ago',
    },
    {
      id: '3',
      name: 'Carol White',
      email: 'carol@example.com',
      role: 'student',
      status: 'pending',
      institution: 'Harvard',
      joinedAt: '2025-10-22',
      lastActive: '30 mins ago',
    },
    {
      id: '4',
      name: 'David Brown',
      email: 'david@example.com',
      role: 'teacher',
      status: 'suspended',
      institution: 'Oxford',
      joinedAt: '2025-09-15',
      lastActive: '3 days ago',
    },
  ];

  const institutions: Institution[] = [
    {
      id: '1',
      name: 'Stanford University',
      type: 'university',
      location: 'California, USA',
      studentCount: 256,
      teacherCount: 12,
      status: 'active',
      joinedAt: '2025-01-15',
    },
    {
      id: '2',
      name: 'MIT',
      type: 'university',
      location: 'Massachusetts, USA',
      studentCount: 189,
      teacherCount: 8,
      status: 'active',
      joinedAt: '2025-02-20',
    },
    {
      id: '3',
      name: 'Tech Training Academy',
      type: 'training_center',
      location: 'New York, USA',
      studentCount: 78,
      teacherCount: 5,
      status: 'active',
      joinedAt: '2025-03-10',
    },
  ];

  const filteredUsers = recentUsers.filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (filterStatus !== 'all' && u.status !== filterStatus) return false;
    if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !u.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
    return <Spinner fullScreen label="Loading admin dashboard..." />;
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

  return (
    <div className="space-y-6">
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
          change={8}
          changeLabel="from last month"
          trend="up"
          icon={<Users size={24} />}
          variant="gradient"
        />
        
        <StatCard
          label="Active Users"
          value={stats.activeUsers.toLocaleString()}
          change={5}
          changeLabel="from last month"
          trend="up"
          icon={<Activity size={24} />}
        />
        
        <StatCard
          label="Institutions"
          value={stats.totalInstitutions}
          change={2}
          changeLabel="this month"
          trend="up"
          icon={<Building size={24} />}
        />
        
        <StatCard
          label="Evaluations Today"
          value={stats.evaluationsToday}
          change={12}
          changeLabel="from yesterday"
          trend="up"
          icon={<TrendingUp size={24} />}
        />
        
        <StatCard
          label="System Health"
          value={`${stats.systemHealth}%`}
          icon={<Shield size={24} />}
          variant="gradient"
        />
      </motion.div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview' as const, label: 'Overview', icon: <Activity size={18} /> },
            { id: 'users' as const, label: 'Users', icon: <Users size={18} /> },
            { id: 'institutions' as const, label: 'Institutions', icon: <Building size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Action Cards */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <button onClick={() => setActiveTab('users')} className="text-left">
              <Card variant="elevated" padding="lg" hover className="bg-gradient-to-br from-blue-50 to-cyan-50 h-full">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <UserPlus className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">Add User</h3>
                    <p className="text-sm text-gray-600">Create new account</p>
                  </div>
                  <ChevronRight className="text-gray-400" size={20} />
                </div>
              </Card>
            </button>

            <button onClick={() => setActiveTab('institutions')} className="text-left">
              <Card variant="elevated" padding="lg" hover className="bg-gradient-to-br from-green-50 to-emerald-50 h-full">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <Building className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">Add Institution</h3>
                    <p className="text-sm text-gray-600">Register new school</p>
                  </div>
                  <ChevronRight className="text-gray-400" size={20} />
                </div>
              </Card>
            </button>

            <button onClick={() => router.push('/settings')} className="text-left">
              <Card variant="elevated" padding="lg" hover className="bg-gradient-to-br from-purple-50 to-pink-50 h-full">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Settings className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">System Settings</h3>
                    <p className="text-sm text-gray-600">Configure platform</p>
                  </div>
                  <ChevronRight className="text-gray-400" size={20} />
                </div>
              </Card>
            </button>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <motion.div
              custom={2}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card variant="elevated" padding="lg" className="h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                    <p className="text-sm text-gray-600">Latest platform events</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      action: 'New user registered',
                      detail: 'Alice Johnson (Student)',
                      time: '5 mins ago',
                      icon: <UserPlus size={18} className="text-blue-600" />,
                      color: 'from-blue-400 to-cyan-500'
                    },
                    {
                      action: 'Institution activated',
                      detail: 'Tech Training Academy',
                      time: '30 mins ago',
                      icon: <Building size={18} className="text-green-600" />,
                      color: 'from-green-400 to-emerald-500'
                    },
                    {
                      action: 'User suspended',
                      detail: 'David Brown (Teacher)',
                      time: '1 hour ago',
                      icon: <XCircle size={18} className="text-red-600" />,
                      color: 'from-red-400 to-rose-500'
                    },
                    {
                      action: 'System update completed',
                      detail: 'Version 2.1.0 deployed',
                      time: '2 hours ago',
                      icon: <CheckCircle size={18} className="text-green-600" />,
                      color: 'from-green-400 to-emerald-500'
                    },
                    {
                      action: 'Database backup completed',
                      detail: 'All collections backed up',
                      time: '3 hours ago',
                      icon: <Database size={18} className="text-purple-600" />,
                      color: 'from-purple-400 to-pink-500'
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{item.action}</p>
                        <p className="text-xs text-gray-600 mt-1">{item.detail}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* System Status */}
            <motion.div
              custom={2}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card variant="elevated" padding="lg" className="h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="text-green-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">System Status</h3>
                    <p className="text-sm text-gray-600">Infrastructure health</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Server className="text-green-600" size={18} />
                        <span className="text-sm font-medium text-gray-700">Server Status</span>
                      </div>
                      <CheckCircle className="text-green-600" size={18} />
                    </div>
                    <p className="text-xs text-gray-600">All systems operational</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-full bg-green-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-green-600">98%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Database className="text-blue-600" size={18} />
                        <span className="text-sm font-medium text-gray-700">Database</span>
                      </div>
                      <CheckCircle className="text-green-600" size={18} />
                    </div>
                    <p className="text-xs text-gray-600">Connected and responsive</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-blue-600">95%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="text-purple-600" size={18} />
                        <span className="text-sm font-medium text-gray-700">API Performance</span>
                      </div>
                      <CheckCircle className="text-green-600" size={18} />
                    </div>
                    <p className="text-xs text-gray-600">Average response: 120ms</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-full bg-purple-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-purple-600">96%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Globe className="text-orange-600" size={18} />
                        <span className="text-sm font-medium text-gray-700">CDN Network</span>
                      </div>
                      <CheckCircle className="text-green-600" size={18} />
                    </div>
                    <p className="text-xs text-gray-600">Global edge nodes active</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-full bg-orange-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: '99%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-orange-600">99%</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="User Management"
              subtitle={`${filteredUsers.length} users`}
              icon={<Users size={20} />}
              action={
                <Button size="sm" variant="primary" leftIcon={<UserPlus size={16} />}>
                  Add User
                </Button>
              }
            />

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as 'all' | 'student' | 'teacher' | 'admin' | 'dev')}
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                <option value="admin">Admins</option>
                <option value="dev">Developers</option>
              </select>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'suspended' | 'pending')}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <CardBody>
              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Institution
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded border text-xs font-medium capitalize ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.institution || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.lastActive}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button className="text-blue-600 hover:text-blue-800" title="View">
                              <Eye size={16} />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800" title="Edit">
                              <Edit size={16} />
                            </button>
                            <button className="text-red-600 hover:text-red-800" title="Delete">
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

            <CardFooter>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {filteredUsers.length} of {recentUsers.length} users
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Previous</Button>
                  <Button size="sm" variant="outline">Next</Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* Institutions Tab */}
      {activeTab === 'institutions' && (
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="Institutions"
              subtitle={`${institutions.length} registered`}
              icon={<Building size={20} />}
              action={
                <Button size="sm" variant="primary" leftIcon={<Building size={16} />}>
                  Add Institution
                </Button>
              }
            />

            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {institutions.map((institution) => (
                  <Card key={institution.id} variant="bordered" hover>
                    <CardBody>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{institution.name}</h3>
                          <p className="text-xs text-gray-500 capitalize">{institution.type.replace('_', ' ')}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(institution.status)}`}>
                          {institution.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <p>📍 {institution.location}</p>
                        <p>👥 {institution.studentCount} students</p>
                        <p>👨‍🏫 {institution.teacherCount} teachers</p>
                        <p className="text-xs text-gray-400">Joined: {institution.joinedAt}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" fullWidth leftIcon={<Eye size={14} />}>
                          View
                        </Button>
                        <Button size="sm" variant="ghost" fullWidth leftIcon={<Edit size={14} />}>
                          Edit
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
