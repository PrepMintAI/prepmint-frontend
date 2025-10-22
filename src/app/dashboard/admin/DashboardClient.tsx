// src/app/dashboard/admin/DashboardClient.tsx
'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card, { StatCard, CardHeader, CardBody, CardFooter } from '@/components/common/Card';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/common/Button';
import {
  Users, Building, TrendingUp, Activity, Shield, AlertTriangle,
  UserPlus, Search, Filter, MoreVertical, Edit, Trash2, Eye,
  CheckCircle, XCircle, Clock
} from 'lucide-react';

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

interface AdminDashboardClientProps {
  userId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'institution';
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

export function AdminDashboardClient({ userId }: AdminDashboardClientProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'institutions'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');

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

  if (loading) {
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
            { id: 'overview', label: 'Overview', icon: <Activity size={18} /> },
            { id: 'users', label: 'Users', icon: <Users size={18} /> },
            { id: 'institutions', label: 'Institutions', icon: <Building size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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
          {/* Quick Actions */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Card variant="bordered" hover clickable onClick={() => setActiveTab('users')}>
              <CardBody className="text-center py-6">
                <UserPlus size={32} className="mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold text-gray-900 mb-1">Add New User</h3>
                <p className="text-sm text-gray-600">Create student, teacher, or admin account</p>
              </CardBody>
            </Card>

            <Card variant="bordered" hover clickable onClick={() => setActiveTab('institutions')}>
              <CardBody className="text-center py-6">
                <Building size={32} className="mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold text-gray-900 mb-1">Add Institution</h3>
                <p className="text-sm text-gray-600">Register a new school or training center</p>
              </CardBody>
            </Card>

            <Card variant="bordered" hover clickable>
              <CardBody className="text-center py-6">
                <Shield size={32} className="mx-auto mb-3 text-purple-600" />
                <h3 className="font-semibold text-gray-900 mb-1">System Settings</h3>
                <p className="text-sm text-gray-600">Configure platform settings</p>
              </CardBody>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card variant="elevated" padding="lg">
              <CardHeader
                title="Recent Activity"
                icon={<Clock size={20} />}
                action={<Button size="sm" variant="ghost">View All</Button>}
              />
              <CardBody>
                <div className="space-y-3">
                  {[
                    { action: 'New user registered', detail: 'Alice Johnson (Student)', time: '5 mins ago', icon: '👤' },
                    { action: 'Institution activated', detail: 'Tech Training Academy', time: '30 mins ago', icon: '🏢' },
                    { action: 'User suspended', detail: 'David Brown (Teacher)', time: '1 hour ago', icon: '🚫' },
                    { action: 'System update completed', detail: 'Version 2.1.0', time: '2 hours ago', icon: '✅' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{item.action}</p>
                        <p className="text-xs text-gray-500">{item.detail}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{item.time}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
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
                onChange={(e) => setFilterRole(e.target.value as any)}
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                <option value="admin">Admins</option>
              </select>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
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
