// src/app/dashboard/student/DashboardClient.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase.client';
import { doc, getDoc } from 'firebase/firestore';
import { xpForNextLevel } from '@/lib/gamify';
import Card, { StatCard } from '@/components/common/Card';
import Button from '@/components/common/Button';
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap';
import SubjectProgress from '@/components/dashboard/SubjectProgress';
import {
  Trophy, Target, Flame, BookOpen, Award, TrendingUp,
  Sparkles, Upload, ArrowRight, ChevronRight, Calendar, Clock
} from 'lucide-react';
import {
  fetchStudentEvaluations,
  fetchActivityData,
  fetchStudentStats,
  fetchUpcomingTests,
  calculateSubjectProgress,
  type StudentEvaluation,
} from '@/lib/studentData';

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

interface StudentDashboardClientProps {
  userId: string;
}

export function StudentDashboardClient({ userId }: StudentDashboardClientProps) {
  const [userData, setUserData] = useState<any>(null);
  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [upcomingTests, setUpcomingTests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user document
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);

            // Fetch all student data in parallel
            const [evals, activity, studentStats, tests] = await Promise.all([
              fetchStudentEvaluations(user.uid, 20),
              fetchActivityData(user.uid, 90),
              fetchStudentStats(user.uid),
              fetchUpcomingTests(data.institutionId || '', 3),
            ]);

            setEvaluations(evals);
            setActivityData(activity);
            setStats(studentStats);
            setUpcomingTests(tests);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Show loading spinner while data is being fetched
  if (isLoading || !userData || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const currentXp = stats.xp;
  const currentLevel = stats.level;
  const nextLevelXp = xpForNextLevel(currentLevel);
  const xpProgress = ((currentXp % 1000) / 1000) * 100;

  // Calculate subject progress from evaluations
  const subjectProgress = calculateSubjectProgress(evaluations);

  // Recent activities from evaluations
  const recentActivities = evaluations.slice(0, 4).map((evaluation, index) => {
    const icons = ['🔥', '⚡', '🌟', '🏆'];
    const colors = [
      'from-orange-400 to-red-500',
      'from-yellow-400 to-orange-500',
      'from-purple-400 to-pink-500',
      'from-yellow-500 to-orange-600'
    ];

    const daysAgo = Math.floor((new Date().getTime() - evaluation.evaluatedAt.getTime()) / (1000 * 60 * 60 * 24));

    return {
      action: `Completed ${evaluation.topic}`,
      detail: `Score: ${Math.round(evaluation.percentage)}% 🎯`,
      time: daysAgo === 0 ? 'Today' : `${daysAgo} days ago`,
      icon: icons[index % icons.length],
      color: colors[index % colors.length],
    };
  });

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl"
      >
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
                Hey {(userData.displayName || userData.name || 'Student').split(' ')[0]}! 👋
              </h1>
              <p className="text-white text-lg mb-2 drop-shadow-sm">
                {userData.institutionName || 'PrepMint Student'}
              </p>
              <p className="text-white/90 mb-6">
                You&apos;re on fire! Keep up the amazing work 🚀
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
                  />
                </div>
                <p className="text-sm text-white">
                  {currentXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
              <button
                onClick={() => router.push('/dashboard/student/score-check')}
                className="flex-1 md:flex-none px-6 py-3 bg-white text-purple-600 hover:bg-gray-50 font-semibold shadow-lg rounded-lg transition-all flex items-center justify-center gap-2 hover:scale-105"
              >
                <Upload size={20} />
                <span>Get Score ⚡</span>
              </button>
              <button
                onClick={() => router.push('/dashboard/student/leaderboard')}
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
          label="Class Rank"
          value={`#${stats.rank || 'N/A'}`}
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
              <p className="text-sm text-gray-600">Overall Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.avgScore}%
              </p>
            </div>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.avgScore}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">Keep pushing! 💪</p>
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
              style={{ width: `${Math.min((stats.streak / 30) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {stats.streak >= 30 ? '🎉 30-day milestone reached!' : `${30 - stats.streak} days to 30-day milestone!`}
          </p>
        </Card>

        <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Calendar className="text-white" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.attendance}%</p>
            </div>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stats.attendance}%` }} />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {stats.attendance >= 90 ? 'Excellent attendance! ⭐' : 'Keep it up! 💪'}
          </p>
        </Card>
      </motion.div>

      {/* Activity Heatmap */}
      <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
        <ActivityHeatmap activity={activityData} />
      </motion.div>

      {/* Subject Progress */}
      <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
        <SubjectProgress subjectProgress={subjectProgress} />
      </motion.div>

      {/* Upcoming Tests */}
      {upcomingTests.length > 0 && (
        <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible">
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Tests 📅</h2>
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight size={16} />}>
                View All
              </Button>
            </div>

            <div className="space-y-3">
              {upcomingTests.map(test => (
                <div key={test.id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{test.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{test.subjectName}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(test.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {test.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen size={12} />
                          {test.totalMarks} marks
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {test.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Recent Activity Feed */}
      {recentActivities.length > 0 && (
        <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible">
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
                onClick={() => router.push('/dashboard/student/history')}
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
      )}

      {/* CTA Cards */}
      <motion.div
        custom={6}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <button onClick={() => router.push('/dashboard/student/score-check')} className="text-left">
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

        <button onClick={() => router.push('/dashboard/student/leaderboard')} className="text-left">
          <Card
            variant="elevated"
            padding="lg"
            hover
            className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white cursor-pointer h-full"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">Climb the Ranks! 🏆</h3>
                <p className="text-white/90 text-sm mb-4">
                  {stats.rank ? `You're rank #${stats.rank}. Beat your classmates!` : 'Compete with your classmates!'}
                </p>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-orange-600 hover:bg-gray-50 font-semibold rounded-lg transition-colors">
                  View Leaderboard →
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
