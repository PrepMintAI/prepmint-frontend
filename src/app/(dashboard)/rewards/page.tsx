// src/app/rewards/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase.client';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import Card, { BadgeCard } from '@/components/common/Card';
import Spinner from '@/components/common/Spinner';
import { Award, Trophy, Star, Zap, Target, Gift } from 'lucide-react';
import { calculateLevel } from '@/lib/gamify';
import { logger } from '@/lib/logger';

// Available badges/rewards
const allBadges = [
  { id: 'first_test', name: 'First Steps', description: 'Complete your first test', icon: Star, xpRequired: 0 },
  { id: 'perfect_score', name: 'Perfect Score', description: 'Score 100% on a test', icon: Trophy, xpRequired: 100 },
  { id: 'week_streak', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: Zap, xpRequired: 200 },
  { id: 'month_streak', name: 'Month Master', description: 'Maintain a 30-day streak', icon: Target, xpRequired: 500 },
  { id: 'level_5', name: 'Rising Star', description: 'Reach Level 5', icon: Award, xpRequired: 2500 },
  { id: 'level_10', name: 'Expert', description: 'Reach Level 10', icon: Trophy, xpRequired: 10000 },
  { id: 'top_10', name: 'Leaderboard Elite', description: 'Reach Top 10', icon: Star, xpRequired: 5000 },
  { id: '100_tests', name: 'Century Club', description: 'Complete 100 tests', icon: Gift, xpRequired: 5000 },
];

export default function RewardsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<{ uid?: string; badges?: string[]; xp?: number; role?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData({ ...userDoc.data(), uid: user.uid });
        }
      } catch (error) {
        logger.error('Error loading rewards:', error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <AppLayout>
        <Spinner fullScreen label="Loading rewards..." />
      </AppLayout>
    );
  }

  const userBadges = userData?.badges || [];
  const currentXp = userData?.xp || 0;
  const currentLevel = calculateLevel(currentXp);

  // Show different content based on role
  const isStudent = userData?.role === 'student';

  return (
    <AppLayout>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">
              {isStudent ? 'My Rewards' : 'Rewards System'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isStudent 
                ? 'Track your achievements and unlock rewards'
                : 'View reward system and user achievements'}
            </p>
          </motion.div>

          {/* Stats for Students */}
          {isStudent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Card variant="gradient" padding="lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Level</p>
                    <p className="text-2xl font-bold text-gray-900">{currentLevel}</p>
                  </div>
                </div>
              </Card>

              <Card variant="gradient" padding="lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center text-white">
                    <Star size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total XP</p>
                    <p className="text-2xl font-bold text-gray-900">{currentXp.toLocaleString()}</p>
                  </div>
                </div>
              </Card>

              <Card variant="gradient" padding="lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Badges Earned</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userBadges.length}/{allBadges.length}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Badges Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="elevated" padding="lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {isStudent ? 'Available Badges' : 'All Badges'}
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allBadges.map((badge) => {
                  const Icon = badge.icon;
                  const earned = userBadges.includes(badge.id);
                  const canEarn = currentXp >= badge.xpRequired;
                  
                  return (
                    <div
                      key={badge.id}
                      className={`relative ${!earned && !isStudent ? 'opacity-60' : ''}`}
                    >
                      <BadgeCard
                        name={badge.name}
                        description={badge.description}
                        icon={<Icon size={32} />}
                        earned={earned}
                      />
                      
                      {/* Show XP requirement if not earned */}
                      {!earned && isStudent && (
                        <div className="mt-2 text-center">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            canEarn 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {canEarn ? (
                              <>✓ Ready to unlock!</>
                            ) : (
                              <>{badge.xpRequired - currentXp} XP needed</>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Show badge info for teachers/admins */}
                      {!isStudent && (
                        <div className="mt-2 text-center text-xs text-gray-600">
                          {badge.xpRequired} XP required
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* How to Earn More (Students Only) */}
          {isStudent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card variant="elevated" padding="lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  How to Earn More XP
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
                      <Target size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Complete Tests</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Earn 50 XP for each test completion
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Perfect Scores</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Earn 100 XP bonus for 100% scores
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white flex-shrink-0">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Daily Streaks</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Earn 25 XP daily for maintaining streaks
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white flex-shrink-0">
                      <Award size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Earn Badges</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Earn 75 XP for each badge unlocked
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
