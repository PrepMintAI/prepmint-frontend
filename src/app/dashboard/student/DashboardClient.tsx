// src/app/dashboard/student/DashboardClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase.client';
import { doc, getDoc } from 'firebase/firestore';
import { calculateLevel, xpForNextLevel } from '@/lib/gamify';
import Card, { StatCard, ProgressCard } from '@/components/common/Card';
import Button from '@/components/common/Button';
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap';
import SubjectProgress from '@/components/dashboard/SubjectProgress';
import { 
  Trophy, Target, Flame, BookOpen, TrendingUp, Award, 
  Zap, Sparkles, Upload, ArrowRight, ChevronRight
} from 'lucide-react';

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

interface StudentDashboardClientProps {
  userId: string;
}

export function StudentDashboardClient({ userId }: StudentDashboardClientProps) {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData({ ...userDoc.data(), uid: user.uid });
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const currentXp = userData?.xp || 2500;
  const currentLevel = calculateLevel(currentXp);
  const nextLevelXp = xpForNextLevel(currentLevel);
  const xpProgress = ((currentXp % 100) / 100) * 100;

  const stats = {
    testsCompleted: 23,
    avgScore: 87,
    streak: userData?.streak || 7,
    badges: userData?.badges?.length || 5,
    rank: 42,
    weeklyXP: 350,
  };

  // Generate mock activity data (last 90 days)
  const generateActivityData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const xp = Math.random() > 0.3 ? Math.floor(Math.random() * 50) : 0;
      
      data.push({
        date: date.toISOString().split('T')[0],
        xp: xp,
      });
    }
    
    return data;
  };

  const activityData = generateActivityData();

  // Mock subject progress
  const subjectProgress = [
    { subject: 'Mathematics', percent: 85, color: '#3B82F6' },
    { subject: 'Physics', percent: 72, color: '#8B5CF6' },
    { subject: 'Chemistry', percent: 68, color: '#10B981' },
    { subject: 'Biology', percent: 90, color: '#EF4444' },
    { subject: 'English', percent: 78, color: '#F59E0B' },
  ];

  const recentActivities = [
    { 
      action: 'Crushed Math Test #5', 
      detail: 'Score: 92% 🎯', 
      time: '2 hours ago', 
      icon: '🔥',
      color: 'from-orange-400 to-red-500'
    },
    { 
      action: 'Level Up! Earned 50 XP', 
      detail: 'Test completion bonus', 
      time: '2 hours ago', 
      icon: '⚡',
      color: 'from-yellow-400 to-orange-500'
    },
    { 
      action: 'Streak Power! 🔥', 
      detail: '7 days in a row', 
      time: '1 day ago', 
      icon: '🌟',
      color: 'from-purple-400 to-pink-500'
    },
    { 
      action: 'New Badge Unlocked!', 
      detail: 'First Perfect Score', 
      time: '3 days ago', 
      icon: '🏆',
      color: 'from-yellow-500 to-orange-600'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Hero - FIXED TEXT VISIBILITY */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl"
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white drop-shadow-md">
                Hey {userData?.displayName?.split(' ')[0] || 'Champion'}! 👋
              </h1>
              <p className="text-white text-lg mb-6 drop-shadow-sm">
                You're on fire! Keep up the amazing work 🚀
              </p>
              
              {/* Level Progress */}
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 max-w-md border border-white/30">
                <div className="flex items-center justify-between mb-2 text-white">
                  <span className="font-semibold">Level {currentLevel}</span>
                  <span className="text-sm">Level {currentLevel + 1}</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-3 mb-2">
                  <motion.div
                    className="bg-white h-3 rounded-full shadow-sm"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-sm text-white">
                  {currentXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
                </p>
              </div>
            </div>

            {/* Quick Actions - FIXED BUTTON STYLES */}
            <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
              <button
                onClick={() => router.push('/score-check')}
                className="flex-1 md:flex-none px-6 py-3 bg-white text-purple-600 hover:bg-gray-50 font-semibold shadow-lg rounded-lg transition-all flex items-center justify-center gap-2 hover:scale-105"
              >
                <Upload size={20} />
                <span>Get Score ⚡</span>
              </button>
              <button
                onClick={() => router.push('/leaderboard')}
                className="flex-1 md:flex-none px-6 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 hover:scale-105"
              >
                <Trophy size={20} />
                <span>Leaderboard</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StatCard
          label="Current Level"
          value={currentLevel}
          icon={<Trophy size={24} />}
          variant="gradient"
        />
        
        <StatCard
          label="Global Rank"
          value={`#${stats.rank}`}
          change={5}
          changeLabel="this week"
          trend="up"
          icon={<TrendingUp size={24} />}
          variant="gradient"
        />
        
        <StatCard
          label="Streak Fire"
          value={`${stats.streak} 🔥`}
          icon={<Flame size={24} />}
          variant="gradient"
        />
        
        <StatCard
          label="Tests Done"
          value={stats.testsCompleted}
          change={5}
          changeLabel="this week"
          trend="up"
          icon={<Target size={24} />}
          variant="gradient"
        />
      </motion.div>

      {/* Progress Trackers */}
      <motion.div
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Award className="text-white" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">XP to Level Up</p>
              <p className="text-2xl font-bold text-gray-900">
                {(nextLevelXp - currentXp).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">{xpProgress.toFixed(0)}% Complete</p>
        </Card>

        <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-orange-50 to-red-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Flame className="text-white" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Daily Streak</p>
              <p className="text-2xl font-bold text-gray-900">{stats.streak} days</p>
            </div>
          </div>
          <div className="w-full bg-orange-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full"
              style={{ width: `${(stats.streak / 30) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">{30 - stats.streak} days to 30-day milestone!</p>
        </Card>

        <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Target className="text-white" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Weekly Goal</p>
              <p className="text-2xl font-bold text-gray-900">7/10</p>
            </div>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: '70%' }} />
          </div>
          <p className="text-xs text-gray-600 mt-2">3 more tests to crush it! 💪</p>
        </Card>
      </motion.div>

      {/* Activity Heatmap */}
      <motion.div 
        custom={2} 
        variants={cardVariants} 
        initial="hidden" 
        animate="visible"
      >
        <ActivityHeatmap activity={activityData} />
      </motion.div>

      {/* Subject Progress - FIXED BUTTON */}
      <motion.div 
        custom={3} 
        variants={cardVariants} 
        initial="hidden" 
        animate="visible"
      >
        <SubjectProgress subjectProgress={subjectProgress} />
      </motion.div>

      {/* Recent Activity Feed */}
      <motion.div 
        custom={4} 
        variants={cardVariants} 
        initial="hidden" 
        animate="visible"
      >
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Sparkles className="text-purple-600" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Recent Wins 🎉</h3>
                <p className="text-sm text-gray-600">Your latest achievements</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/history')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>View All</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="space-y-3">
            {recentActivities.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="group relative overflow-hidden rounded-xl p-4 hover:shadow-md transition-all cursor-pointer bg-white border border-gray-100 hover:border-gray-200"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                    {item.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-base mb-1">
                      {item.action}
                    </p>
                    <p className="text-sm text-gray-600">{item.detail}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {item.time}
                    </span>
                    <ChevronRight 
                      className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" 
                      size={16} 
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* CTA Cards */}
      <motion.div
        custom={5}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <button
          onClick={() => router.push('/score-check')}
          className="text-left"
        >
          <Card 
            variant="elevated" 
            padding="lg"
            hover
            className="bg-gradient-to-br from-purple-500 to-pink-600 text-white cursor-pointer h-full"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">Ready for More? ⚡</h3>
                <p className="text-white/90 text-sm mb-4">
                  Upload your answer sheet and get instant AI feedback!
                </p>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-600 hover:bg-gray-50 font-semibold rounded-lg transition-colors">
                  Get Score Now →
                </span>
              </div>
              <Upload size={64} className="opacity-20" />
            </div>
          </Card>
        </button>

        <button
          onClick={() => router.push('/rewards')}
          className="text-left"
        >
          <Card 
            variant="elevated" 
            padding="lg"
            hover
            className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white cursor-pointer h-full"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">Claim Rewards! 🎁</h3>
                <p className="text-white/90 text-sm mb-4">
                  {stats.badges} badges earned. Unlock more achievements!
                </p>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-600 hover:bg-gray-50 font-semibold rounded-lg transition-colors">
                  View Rewards →
                </span>
              </div>
              <Trophy size={64} className="opacity-20" />
            </div>
          </Card>
        </button>
      </motion.div>
    </div>
  );
}
