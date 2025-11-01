// src/app/dashboard/analytics/AnalyticsClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase.client';
import Card, { CardHeader, CardBody } from '@/components/common/Card';
import Spinner from '@/components/common/Spinner';
import {
  Trophy,
  TrendingUp,
  BookOpen,
  Award,
  Target,
  ArrowUp,
  ArrowDown,
  Calendar
} from 'lucide-react';
import { calculateLevel, levelProgress } from '@/lib/gamify';

interface AnalyticsClientProps {
  userId: string;
  role: 'student' | 'teacher' | 'admin' | 'institution' | 'dev';
  institutionId?: string;
  userName: string;
}

export default function AnalyticsClient({
  userId,
  role,
  institutionId,
  userName,
}: AnalyticsClientProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [userId]);

  if (isLoading) {
    return <Spinner fullScreen label="Loading analytics..." />;
  }

  // Render based on user role
  if (role === 'student' || role === 'dev') {
    return <StudentAnalytics userId={userId} userName={userName} />;
  }

  if (role === 'teacher') {
    return <TeacherAnalytics userId={userId} userName={userName} />;
  }

  if (role === 'institution') {
    return (
      <InstitutionAnalytics
        userId={userId}
        institutionId={institutionId}
        userName={userName}
      />
    );
  }

  if (role === 'admin') {
    return <AdminAnalytics userId={userId} userName={userName} />;
  }

  return (
    <div className="text-center py-12">
      <p className="text-gray-600">Analytics not available for your role.</p>
    </div>
  );
}

// ========== TYPE DEFINITIONS ==========

interface SubjectPerformance {
  subject: string;
  avgScore: number;
  testsCount: number;
  trend: number;
}

interface RecentTest {
  id: string;
  subject: string;
  score: number;
  marksAwarded: number;
  totalMarks: number;
  date: Date;
  topic?: string;
}

interface PerformancePoint {
  date: string;
  score: number;
}

// Student Analytics View
function StudentAnalytics({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [subjectData, setSubjectData] = useState<SubjectPerformance[]>([]);
  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const [performanceChart, setPerformanceChart] = useState<PerformancePoint[]>([]);
  const [stats, setStats] = useState({
    totalXp: 0,
    currentLevel: 1,
    rank: 0,
    testsCompleted: 0,
    avgScore: 0,
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // 1. Fetch user data
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
          console.error('User document not found');
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        const totalXp = userData.xp || 0;
        const currentLevel = calculateLevel(totalXp);

        setUserData(userData);
        setStats(prev => ({
          ...prev,
          totalXp,
          currentLevel,
          rank: userData.rank || 0,
        }));

        // 2. Fetch evaluations (last 50)
        const evaluationsRef = collection(db, 'users', userId, 'evaluations');
        const evaluationsQuery = query(
          evaluationsRef,
          orderBy('evaluatedAt', 'desc'),
          limit(50)
        );

        const evaluationsSnapshot = await getDocs(evaluationsQuery);
        const evaluations = evaluationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 3. Calculate subject-wise performance
        const subjectMap = new Map<string, { scores: number[]; count: number }>();

        evaluations.forEach((evaluation: any) => {
          const subject = evaluation.subject || 'Unknown';
          const percentage = evaluation.percentage || 0;
          const current = subjectMap.get(subject) || { scores: [], count: 0 };
          current.scores.push(percentage);
          current.count++;
          subjectMap.set(subject, current);
        });

        const subjectPerformance: SubjectPerformance[] = [];
        subjectMap.forEach((value, subject) => {
          const avgScore = Math.round(value.scores.reduce((a, b) => a + b, 0) / value.scores.length);
          const recentAvg = Math.round(value.scores.slice(0, 5).reduce((a, b) => a + b, 0) / Math.min(5, value.scores.length));
          const trend = recentAvg - avgScore;

          subjectPerformance.push({
            subject,
            avgScore,
            testsCount: value.count,
            trend,
          });
        });

        setSubjectData(subjectPerformance.sort((a, b) => b.avgScore - a.avgScore));

        // 4. Get last 10 tests for recent scores
        const recentTestsData: RecentTest[] = evaluations.slice(0, 10).map((evaluation: any) => ({
          id: evaluation.id,
          subject: evaluation.subject || 'Unknown',
          score: evaluation.percentage || 0,
          marksAwarded: evaluation.marksAwarded || 0,
          totalMarks: evaluation.totalMarks || 100,
          date: evaluation.evaluatedAt?.toDate() || new Date(),
          topic: evaluation.topic || evaluation.title,
        }));

        setRecentTests(recentTestsData);

        // 5. Calculate 30-day performance trend
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const last30Days = evaluations
          .filter((evaluation: any) => evaluation.evaluatedAt?.toDate() >= thirtyDaysAgo)
          .reverse()
          .slice(0, 30);

        const performanceData: PerformancePoint[] = [];
        const dateMap = new Map<string, number[]>();

        last30Days.forEach((evaluation: any) => {
          const dateStr = evaluation.evaluatedAt?.toDate().toISOString().split('T')[0];
          if (dateStr) {
            const scores = dateMap.get(dateStr) || [];
            scores.push(evaluation.percentage || 0);
            dateMap.set(dateStr, scores);
          }
        });

        const sortedDates = Array.from(dateMap.keys()).sort();
        sortedDates.forEach(date => {
          const scores = dateMap.get(date) || [];
          const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          performanceData.push({ date, score: avgScore });
        });

        setPerformanceChart(performanceData);

        // 6. Update stats
        const avgScore = evaluations.length > 0
          ? Math.round(evaluations.reduce((sum: number, evaluation: any) => sum + (evaluation.percentage || 0), 0) / evaluations.length)
          : 0;

        setStats(prev => ({
          ...prev,
          testsCompleted: evaluations.length,
          avgScore,
        }));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [userId]);

  if (loading) {
    return <Spinner fullScreen label="Loading your analytics..." />;
  }

  const maxChartScore = Math.max(100, Math.max(...performanceChart.map(p => p.score), 0));
  const levelProgressPercent = levelProgress(stats.totalXp);

  return (
    <div className="space-y-6">
      {/* Personal Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* XP Card */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total XP</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalXp.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">Experience Points</p>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Award className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        {/* Level Card */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Level</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.currentLevel}</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${levelProgressPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{levelProgressPercent.toFixed(0)}% to next</p>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Trophy className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        {/* Rank Card */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Class Rank</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.rank ? `#${stats.rank}` : 'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-2">Position in class</p>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </Card>

        {/* Tests Completed Card */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Tests Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.testsCompleted}</p>
              <p className="text-xs text-gray-500 mt-2">Evaluations submitted</p>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <Target className="text-orange-600" size={24} />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Overall Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Overall Performance</h3>
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Average: {stats.avgScore}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${stats.avgScore}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div>
              <p className="text-xs text-gray-600">Excellent (90+)</p>
              <p className="text-lg font-bold text-green-600">
                {recentTests.filter(t => t.score >= 90).length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Good (75-89)</p>
              <p className="text-lg font-bold text-blue-600">
                {recentTests.filter(t => t.score >= 75 && t.score < 90).length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Need Improvement</p>
              <p className="text-lg font-bold text-orange-600">
                {recentTests.filter(t => t.score < 75).length}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Subject Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Subject Performance"
            subtitle="Average score by subject"
            icon={<BookOpen size={20} />}
          />
          <CardBody>
            <div className="space-y-4">
              {subjectData.length > 0 ? (
                subjectData.map((subject) => (
                  <div key={subject.subject} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{subject.subject}</p>
                        <p className="text-xs text-gray-500">{subject.testsCount} tests</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{subject.avgScore}%</p>
                        <div className={`flex items-center gap-1 text-xs mt-1 ${
                          subject.trend >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {subject.trend >= 0 ? (
                            <ArrowUp size={12} />
                          ) : (
                            <ArrowDown size={12} />
                          )}
                          <span>{Math.abs(subject.trend).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${subject.avgScore}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No test data available yet</p>
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Performance Over Time (Last 30 Days) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Performance Trend"
            subtitle="Last 30 days (CSS-based chart)"
            icon={<TrendingUp size={20} />}
          />
          <CardBody>
            {performanceChart.length > 0 ? (
              <div className="flex items-end justify-between gap-1 h-64 bg-gray-50 rounded-lg p-4">
                {performanceChart.map((point, index) => {
                  const heightPercent = (point.score / maxChartScore) * 100;
                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-2 group"
                    >
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-blue-400 transition-all hover:from-blue-600 hover:to-blue-500 shadow-sm"
                        style={{ height: `${heightPercent}%`, minHeight: '8px' }}
                        title={`${point.date}: ${point.score}%`}
                      />
                      <p className="text-xs text-gray-500 group-hover:text-gray-900 transition-colors">
                        {new Date(point.date).getDate()}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">No performance data available</p>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Recent Test Scores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Recent Test Scores"
            subtitle={`Last ${Math.min(10, recentTests.length)} evaluations`}
            icon={<Calendar size={20} />}
          />
          <CardBody>
            <div className="space-y-3">
              {recentTests.length > 0 ? (
                recentTests.map((test) => {
                  const scoreColor =
                    test.score >= 90
                      ? 'bg-green-50 border-green-200'
                      : test.score >= 75
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-orange-50 border-orange-200';

                  const textColor =
                    test.score >= 90
                      ? 'text-green-700'
                      : test.score >= 75
                      ? 'text-blue-700'
                      : 'text-orange-700';

                  return (
                    <div key={test.id} className={`border ${scoreColor} rounded-lg p-4 flex items-center justify-between`}>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{test.subject}</p>
                        {test.topic && <p className="text-sm text-gray-600">{test.topic}</p>}
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Calendar size={12} />
                          {test.date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-3xl font-bold ${textColor}`}>{test.score}%</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {test.marksAwarded}/{test.totalMarks}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-8">No test scores available yet</p>
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Activity Summary"
            subtitle="Your learning journey"
            icon={<Award size={20} />}
          />
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.testsCompleted}</p>
                <p className="text-xs text-gray-600 mt-1">Total Tests</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{Math.round(stats.avgScore)}%</p>
                <p className="text-xs text-gray-600 mt-1">Avg Score</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{subjectData.length}</p>
                <p className="text-xs text-gray-600 mt-1">Subjects</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{stats.totalXp.toLocaleString()}</p>
                <p className="text-xs text-gray-600 mt-1">Total XP</p>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <p className="text-2xl font-bold text-pink-600">{stats.currentLevel}</p>
                <p className="text-xs text-gray-600 mt-1">Current Level</p>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">{stats.rank || '—'}</p>
                <p className="text-xs text-gray-600 mt-1">Rank</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}

// Teacher Analytics View
function TeacherAnalytics({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Teacher Analytics
        </h2>
        <div className="text-gray-600">
          <p className="mb-2">Welcome, {userName}!</p>
          <p className="text-sm">
            This section will display student performance metrics, evaluation
            statistics, class insights, and assessment analytics.
          </p>
        </div>
      </div>

      {/* Placeholder sections for Teacher Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Class Performance</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Student Progress</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">
            Assessment Insights
          </h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Evaluation Stats</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
      </div>
    </div>
  );
}

// Institution Analytics View
function InstitutionAnalytics({
  userId,
  institutionId,
  userName,
}: {
  userId: string;
  institutionId?: string;
  userName: string;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Institution Analytics
        </h2>
        <div className="text-gray-600">
          <p className="mb-2">Welcome, {userName}!</p>
          <p className="text-sm">
            This section will display institution-wide analytics, including
            student performance, teacher metrics, and institutional insights.
          </p>
          {institutionId && (
            <p className="text-sm text-gray-500 mt-2">
              Institution ID: {institutionId}
            </p>
          )}
        </div>
      </div>

      {/* Placeholder sections for Institution Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Student Overview</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Teacher Performance</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">
            Institutional Metrics
          </h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Assessment Data</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
      </div>
    </div>
  );
}

// Admin Analytics View
function AdminAnalytics({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Admin Analytics
        </h2>
        <div className="text-gray-600">
          <p className="mb-2">Welcome, {userName}!</p>
          <p className="text-sm">
            This section will display system-wide analytics, including platform
            usage, user statistics, and institutional data.
          </p>
        </div>
      </div>

      {/* Placeholder sections for Admin Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Platform Stats</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">User Analytics</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">
            Institution Overview
          </h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">System Health</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
      </div>
    </div>
  );
}
