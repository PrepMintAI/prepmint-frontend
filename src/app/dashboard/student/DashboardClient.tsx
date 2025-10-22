// src/app/dashboard/DashboardClient.tsx
'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { calculateLevel, xpForNextLevel, levelProgress } from '@/lib/gamify';
import Card, { StatCard, ProgressCard, CardHeader, CardBody } from '@/components/common/Card';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/common/Button';
import UploadForm from '@/components/upload/UploadForm';
import { 
  Trophy, Target, Flame, BookOpen, TrendingUp, Award, 
  Upload as UploadIcon, Calendar, Clock 
} from 'lucide-react';

// Lazy-load heavy components
const ActivityHeatmap = React.lazy(() => import('@/components/dashboard/ActivityHeatmap'));
const SubjectProgress = React.lazy(() => import('@/components/dashboard/SubjectProgress'));

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

interface DashboardClientProps {
  userId: string;
}

export function DashboardClient({ userId }: DashboardClientProps) {
  const { user, loading } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Calculate user stats
  const currentXp = user?.xp ?? 0;
  const currentLevel = calculateLevel(currentXp);
  const nextLevelXp = xpForNextLevel(currentLevel);
  const progress = levelProgress(currentXp);
  const xpNeeded = nextLevelXp - currentXp;

  // Mock data - replace with real API calls
  const stats = {
    testsCompleted: 23,
    avgScore: 87,
    streak: user?.streak ?? 0,
    badges: user?.badges?.length ?? 0,
  };

  if (loading) {
    return <Spinner fullScreen label="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          leftIcon={<UploadIcon size={20} />}
          onClick={() => setShowUploadModal(true)}
        >
          Upload Answer Sheet
        </Button>
        <Button variant="outline" leftIcon={<BookOpen size={20} />}>
          Start Practice Test
        </Button>
      </div>

      {/* Stats Overview */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          label="Current Level"
          value={currentLevel}
          icon={<Trophy size={24} />}
          variant="gradient"
        />
        
        <StatCard
          label="Total XP"
          value={currentXp.toLocaleString()}
          change={12}
          changeLabel="from last week"
          trend="up"
          icon={<Award size={24} />}
        />
        
        <StatCard
          label="Tests Completed"
          value={stats.testsCompleted}
          change={5}
          changeLabel="this week"
          trend="up"
          icon={<Target size={24} />}
        />
        
        <StatCard
          label="Average Score"
          value={`${stats.avgScore}%`}
          change={3}
          changeLabel="improvement"
          trend="up"
          icon={<TrendingUp size={24} />}
        />
      </motion.div>

      {/* Progress Cards */}
      <motion.div
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <ProgressCard
          title="XP to Next Level"
          current={currentXp}
          total={nextLevelXp}
          icon={<Award size={20} />}
          color="blue"
          suffix=" XP"
        />
        
        <ProgressCard
          title="Current Streak"
          current={stats.streak}
          total={30}
          icon={<Flame size={20} />}
          color="orange"
          suffix=" days"
        />
        
        <ProgressCard
          title="Weekly Goal"
          current={5}
          total={10}
          icon={<Target size={20} />}
          color="green"
          suffix=" tests"
        />
      </motion.div>

      {/* Time Range Filter */}
      <div className="flex justify-end">
        <select
          className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-10 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Activity and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Heatmap */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="Activity"
              subtitle={`Your ${timeRange} overview`}
              icon={<Calendar size={20} />}
            />
            <CardBody>
              <Suspense fallback={<Spinner size="lg" label="Loading activity..." />}>
                <ActivityHeatmap activity={{}} />
              </Suspense>
            </CardBody>
          </Card>
        </motion.div>

        {/* Subject Progress */}
        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card variant="elevated" padding="lg">
            <CardHeader
              title="Subject Progress"
              subtitle="Track your improvement"
              icon={<BookOpen size={20} />}
            />
            <CardBody>
              <Suspense fallback={<Spinner size="lg" label="Loading progress..." />}>
                <SubjectProgress subjectProgress={[]} />
              </Suspense>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        custom={4}
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
                { action: 'Completed Math Test #5', detail: 'Score: 92%', time: '2 hours ago', icon: '✅' },
                { action: 'Earned 50 XP', detail: 'Test completion bonus', time: '2 hours ago', icon: '⭐' },
                { action: 'Maintained streak', detail: '7 days in a row', time: '1 day ago', icon: '🔥' },
                { action: 'Unlocked badge', detail: 'First Perfect Score', time: '3 days ago', icon: '🏆' },
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Upload Answer Sheet</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <UploadForm
              onSuccess={(result) => {
                console.log('Upload success:', result);
                setShowUploadModal(false);
                // Optionally refresh dashboard data or show success toast
              }}
              onError={(error) => {
                console.error('Upload error:', error);
              }}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
