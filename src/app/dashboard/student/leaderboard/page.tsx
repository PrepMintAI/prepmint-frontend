// src/app/dashboard/student/leaderboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/common/Card';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Zap, Target, Users, Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchLeaderboard, type LeaderboardEntry } from '@/lib/studentData';
import { logger } from '@/lib/logger';
import Spinner from '@/components/common/Spinner';

interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  level: number;
  avatar: string;
  streak: number;
  school: string;
  badge: string;
}

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null);
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'alltime'>('alltime');
  const [scopeFilter, setScopeFilter] = useState<'global' | 'school'>('global');
  const [userSchool, setUserSchool] = useState<string | null>(null);
  const [userInstitutionId, setUserInstitutionId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      try {
        const institutionId = user.institutionId || user.institution_id;

        setUserSchool(institutionId || null);
        setUserInstitutionId(institutionId || null);
        setCurrentUser({
          rank: 0, // Will be calculated from leaderboard
          name: user.displayName || user.display_name || 'You',
          xp: user.xp || 0,
          level: user.level || (Math.floor(Math.sqrt((user.xp || 0) / 100)) + 1),
          school: institutionId || 'No School',
          avatar: '🎮',
          streak: user.streak || 0,
          badge: '',
        });
      } catch (error) {
        logger.error('Error setting user data:', error);
      }
    }
    setIsLoading(false);
  }, [user, authLoading]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      try {
        let data: LeaderboardEntry[];
        if (scopeFilter === 'school' && userInstitutionId) {
          data = await fetchLeaderboard('institution', userInstitutionId, 50);
        } else {
          data = await fetchLeaderboard('global', undefined, 50);
        }
        setLeaderboard(data);

        // Update current user rank
        if (currentUser) {
          const userRank = data.findIndex(u => u.xp <= currentUser.xp) + 1;
          setCurrentUser(prev => prev ? { ...prev, rank: userRank || data.length + 1 } : null);
        }
      } catch (error) {
        logger.error('Error loading leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, [scopeFilter, userInstitutionId, currentUser?.xp]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: '👑', color: 'from-yellow-400 to-yellow-600', glow: 'shadow-yellow-500/50' };
    if (rank === 2) return { icon: '🥈', color: 'from-gray-300 to-gray-500', glow: 'shadow-gray-500/50' };
    if (rank === 3) return { icon: '🥉', color: 'from-orange-400 to-orange-600', glow: 'shadow-orange-500/50' };
    return { icon: `#${rank}`, color: 'from-gray-200 to-gray-300', glow: '' };
  };

  if (authLoading || isLoading) {
    return <Spinner fullScreen label="Loading leaderboard..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-4 shadow-lg">
              <Trophy className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Leaderboard 🏆
            </h1>
            <p className="text-gray-600 text-lg">
              Compete with the best. Climb the ranks!
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Time Filter */}
            <div className="flex gap-2 justify-center flex-wrap">
              {['today', 'week', 'month', 'alltime'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter as any)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    timeFilter === filter
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {filter === 'alltime' ? 'All Time' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* Scope Filter */}
            {userSchool && (
              <div className="flex gap-2 justify-center flex-wrap">
                <button
                  onClick={() => setScopeFilter('global')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                    scopeFilter === 'global'
                      ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Globe size={18} />
                  <span>Global</span>
                </button>
                <button
                  onClick={() => setScopeFilter('school')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                    scopeFilter === 'school'
                      ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Users size={18} />
                  <span>My School</span>
                </button>
              </div>
            )}

            {scopeFilter === 'school' && userSchool && (
              <p className="text-center text-sm text-gray-600">
                Showing rankings for <span className="font-semibold text-gray-900">{userSchool}</span>
              </p>
            )}
          </motion.div>

          {/* Current User Rank */}
          {currentUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card variant="elevated" padding="lg" className="bg-gradient-to-r from-blue-500 to-purple-600">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                      🎮
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Your Current Rank</p>
                      <p className="text-2xl font-bold">#{currentUser.rank}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Total XP</p>
                    <p className="text-2xl font-bold">{currentUser.xp.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Top 3 Podium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-end justify-center gap-4 mb-8">
              {/* 2nd Place */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex-1 max-w-xs"
              >
                <Card variant="elevated" padding="lg" className="text-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="relative inline-block mb-3">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-4xl shadow-lg">
                      {leaderboard[1]?.avatar}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-xl shadow-md">
                      🥈
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    {leaderboard[1]?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{leaderboard[1]?.institutionName}</p>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {leaderboard[1]?.xp.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">XP • Level {leaderboard[1]?.level}</p>
                    <div className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                      <Zap size={12} />
                      <span>{leaderboard[1]?.streak} day streak</span>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* 1st Place */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex-1 max-w-xs transform scale-110"
              >
                <Card variant="elevated" padding="lg" className="text-center bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 shadow-2xl">
                  <div className="relative inline-block mb-3">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-5xl shadow-xl ring-4 ring-yellow-300">
                      {leaderboard[0]?.avatar}
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-2xl shadow-lg animate-bounce">
                      👑
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-xl mb-1">
                    {leaderboard[0]?.name}
                  </h3>
                  <p className="text-sm text-gray-700 mb-3 font-medium">{leaderboard[0]?.institutionName}</p>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {leaderboard[0]?.xp.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-700 font-semibold">XP • Level {leaderboard[0]?.level}</p>
                    <div className="inline-flex items-center gap-1 text-sm bg-yellow-500 text-white px-3 py-1 rounded-full font-semibold">
                      <Zap size={14} />
                      <span>{leaderboard[0]?.streak} day streak 🔥</span>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex-1 max-w-xs"
              >
                <Card variant="elevated" padding="lg" className="text-center bg-gradient-to-br from-orange-100 to-orange-200">
                  <div className="relative inline-block mb-3">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-4xl shadow-lg">
                      {leaderboard[2]?.avatar}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-xl shadow-md">
                      🥉
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    {leaderboard[2]?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{leaderboard[2]?.institutionName}</p>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {leaderboard[2]?.xp.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">XP • Level {leaderboard[2]?.level}</p>
                    <div className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                      <Zap size={12} />
                      <span>{leaderboard[2]?.streak} day streak</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Rest of Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card variant="elevated" padding="none">
              <div className="divide-y divide-gray-100">
                {leaderboard.slice(3).map((user, index) => (
                  <motion.div
                    key={user.uid}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 text-center">
                        <span className="text-lg font-bold text-gray-600">#{user.rank}</span>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl shadow-md">
                        {user.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.institutionName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{user.xp.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">Level {user.level}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Progress Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Card variant="gradient" padding="lg" className="text-center">
              <TrendingUp className="mx-auto mb-2 text-green-600" size={28} />
              <p className="text-3xl font-bold text-gray-900">+5</p>
              <p className="text-sm text-gray-600 mt-1">Ranks Up This Week</p>
            </Card>

            <Card variant="gradient" padding="lg" className="text-center">
              <Target className="mx-auto mb-2 text-blue-600" size={28} />
              <p className="text-3xl font-bold text-gray-900">42</p>
              <p className="text-sm text-gray-600 mt-1">XP to Next Rank</p>
            </Card>

            <Card variant="gradient" padding="lg" className="text-center">
              <Zap className="mx-auto mb-2 text-orange-600" size={28} />
              <p className="text-3xl font-bold text-gray-900">7</p>
              <p className="text-sm text-gray-600 mt-1">Day Streak 🔥</p>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
