// src/app/dashboard/teacher/DashboardClient.tsx
'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card, { StatCard, CardHeader, CardBody, CardFooter } from '@/components/common/Card';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/common/Button';
import { 
  Users, FileCheck, Clock, TrendingUp, AlertCircle, 
  CheckCircle, Eye, Download, Filter, Search
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

interface TeacherDashboardClientProps {
  userId: string;
}

// Mock data types
interface PendingEvaluation {
  id: string;
  studentName: string;
  studentId: string;
  testName: string;
  submittedAt: string;
  status: 'pending' | 'processing' | 'ready';
  priority: 'high' | 'medium' | 'low';
}

interface RecentActivity {
  id: string;
  type: 'graded' | 'submitted' | 'reviewed';
  studentName: string;
  testName: string;
  score?: number;
  timestamp: string;
}

export function TeacherDashboardClient({ userId }: TeacherDashboardClientProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'ready'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - TODO: Replace with real API calls
  const stats = {
    totalStudents: 156,
    pendingEvaluations: 23,
    evaluatedToday: 12,
    avgProcessingTime: '3.5 min',
  };

  const pendingEvaluations: PendingEvaluation[] = [
    {
      id: '1',
      studentName: 'John Doe',
      studentId: 'STU001',
      testName: 'Math Test #5',
      submittedAt: '10 mins ago',
      status: 'ready',
      priority: 'high',
    },
    {
      id: '2',
      studentName: 'Jane Smith',
      studentId: 'STU002',
      testName: 'Science Test #3',
      submittedAt: '25 mins ago',
      status: 'processing',
      priority: 'medium',
    },
    {
      id: '3',
      studentName: 'Alex Johnson',
      studentId: 'STU003',
      testName: 'English Test #7',
      submittedAt: '1 hour ago',
      status: 'ready',
      priority: 'high',
    },
    {
      id: '4',
      studentName: 'Sarah Williams',
      studentId: 'STU004',
      testName: 'History Test #2',
      submittedAt: '2 hours ago',
      status: 'pending',
      priority: 'low',
    },
  ];

  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'graded',
      studentName: 'Mike Brown',
      testName: 'Math Test #4',
      score: 92,
      timestamp: '30 mins ago',
    },
    {
      id: '2',
      type: 'submitted',
      studentName: 'Emily Davis',
      testName: 'Science Test #2',
      timestamp: '1 hour ago',
    },
    {
      id: '3',
      type: 'reviewed',
      studentName: 'Chris Wilson',
      testName: 'English Test #6',
      score: 88,
      timestamp: '2 hours ago',
    },
  ];

  const filteredEvaluations = pendingEvaluations.filter(eval => {
    if (filterStatus !== 'all' && eval.status !== filterStatus) return false;
    if (searchQuery && !eval.studentName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return <Spinner fullScreen label="Loading dashboard..." />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600 bg-green-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          label="Total Students"
          value={stats.totalStudents}
          icon={<Users size={24} />}
          variant="gradient"
        />
        
        <StatCard
          label="Pending Evaluations"
          value={stats.pendingEvaluations}
          change={-15}
          changeLabel="from yesterday"
          trend="up"
          icon={<Clock size={24} />}
        />
        
        <StatCard
          label="Evaluated Today"
          value={stats.evaluatedToday}
          change={8}
          changeLabel="from yesterday"
          trend="up"
          icon={<CheckCircle size={24} />}
        />
        
        <StatCard
          label="Avg Processing Time"
          value={stats.avgProcessingTime}
          change={-12}
          changeLabel="improvement"
          trend="up"
          icon={<TrendingUp size={24} />}
        />
      </motion.div>

      {/* Pending Evaluations Section */}
      <motion.div
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Pending Evaluations"
            subtitle={`${filteredEvaluations.length} evaluations waiting`}
            icon={<FileCheck size={20} />}
            action={
              <Button 
                size="sm" 
                variant="outline"
                leftIcon={<Download size={16} />}
              >
                Export
              </Button>
            }
          />

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by student name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="ready">Ready</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <CardBody>
            <div className="space-y-3">
              {filteredEvaluations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileCheck size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No evaluations found</p>
                </div>
              ) : (
                filteredEvaluations.map((evaluation) => (
                  <div
                    key={evaluation.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => router.push(`/teacher/evaluations/${evaluation.id}`)}
                  >
                    {/* Priority Indicator */}
                    <div className={`w-1 h-16 rounded-full ${getPriorityColor(evaluation.priority).replace('bg-', 'bg-').split(' ')[0]}`} />

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{evaluation.studentName}</h4>
                        <span className="text-xs text-gray-500">({evaluation.studentId})</span>
                      </div>
                      <p className="text-sm text-gray-600">{evaluation.testName}</p>
                      <p className="text-xs text-gray-400 mt-1">{evaluation.submittedAt}</p>
                    </div>

                    {/* Status Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluation.status)}`}>
                      {evaluation.status.charAt(0).toUpperCase() + evaluation.status.slice(1)}
                    </div>

                    {/* Priority Badge */}
                    <div className={`px-3 py-1 rounded border text-xs font-medium ${getPriorityColor(evaluation.priority)}`}>
                      {evaluation.priority.toUpperCase()}
                    </div>

                    {/* Action Button */}
                    <Button
                      size="sm"
                      variant={evaluation.status === 'ready' ? 'primary' : 'outline'}
                      leftIcon={<Eye size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/teacher/evaluations/${evaluation.id}`);
                      }}
                    >
                      {evaluation.status === 'ready' ? 'Review' : 'View'}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardBody>

          {filteredEvaluations.length > 0 && (
            <CardFooter>
              <Button variant="outline" fullWidth>
                Load More Evaluations
              </Button>
            </CardFooter>
          )}
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
              {recentActivity.map((activity) => {
                const icons = {
                  graded: '✅',
                  submitted: '📤',
                  reviewed: '👁️',
                };

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-2xl">{icons[activity.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.type === 'graded' && `Graded ${activity.testName} for ${activity.studentName}`}
                        {activity.type === 'submitted' && `${activity.studentName} submitted ${activity.testName}`}
                        {activity.type === 'reviewed' && `Reviewed ${activity.testName} for ${activity.studentName}`}
                      </p>
                      {activity.score !== undefined && (
                        <p className="text-xs text-gray-500">Score: {activity.score}%</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{activity.timestamp}</span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        custom={3}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card 
          variant="bordered" 
          hover 
          clickable
          onClick={() => router.push('/teacher/students')}
        >
          <CardBody className="text-center py-6">
            <Users size={32} className="mx-auto mb-3 text-blue-600" />
            <h3 className="font-semibold text-gray-900 mb-1">Manage Students</h3>
            <p className="text-sm text-gray-600">View and manage your students</p>
          </CardBody>
        </Card>

        <Card 
          variant="bordered" 
          hover 
          clickable
          onClick={() => router.push('/teacher/analytics')}
        >
          <CardBody className="text-center py-6">
            <TrendingUp size={32} className="mx-auto mb-3 text-green-600" />
            <h3 className="font-semibold text-gray-900 mb-1">Analytics</h3>
            <p className="text-sm text-gray-600">View performance insights</p>
          </CardBody>
        </Card>

        <Card 
          variant="bordered" 
          hover 
          clickable
          onClick={() => router.push('/teacher/tests')}
        >
          <CardBody className="text-center py-6">
            <FileCheck size={32} className="mx-auto mb-3 text-purple-600" />
            <h3 className="font-semibold text-gray-900 mb-1">Create Test</h3>
            <p className="text-sm text-gray-600">Set up new assessments</p>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
