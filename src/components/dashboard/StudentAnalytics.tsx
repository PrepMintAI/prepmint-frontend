'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
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
  Calendar,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { calculateLevel, levelProgress } from '@/lib/gamify';

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

interface StudentStats {
  totalXp: number;
  currentLevel: number;
  rank: number;
  testsCompleted: number;
  avgScore: number;
}

interface StudentAnalyticsProps {
  userId: string;
  userName?: string;
}

// ========== MAIN COMPONENT ==========

export default function StudentAnalytics({
  userId,
  userName = 'Student',
}: StudentAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [subjectData, setSubjectData] = useState<SubjectPerformance[]>([]);
  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const [performanceChart, setPerformanceChart] = useState<PerformancePoint[]>([]);
  const [stats, setStats] = useState<StudentStats>({
    totalXp: 0,
    currentLevel: 1,
    rank: 0,
    testsCompleted: 0,
    avgScore: 0,
  });

  // ===== DATA FETCHING =====

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (userError || !userData) {
          setError('User document not found');
          setLoading(false);
          return;
        }

        const totalXp = userData.xp || 0;
        const currentLevel = calculateLevel(totalXp);

        setUserData(userData);
        setStats((prev) => ({
          ...prev,
          totalXp,
          currentLevel,
          rank: userData.rank || 0,
        }));

        // 2. Fetch evaluations (last 50)
        const { data: evaluations, error: evalsError } = await supabase
          .from('evaluations')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (evalsError) {
          logger.error('Error fetching evaluations:', evalsError);
        }

        const evaluationsData = evaluations || [];

        // 3. Calculate subject-wise performance
        const subjectMap = new Map<string, { scores: number[]; count: number }>();

        evaluationsData.forEach((evaluation: any) => {
          const subject = evaluation.subject || 'Unknown';
          // Calculate percentage from score and total_marks
          const percentage = evaluation.total_marks > 0
            ? Math.round((evaluation.score / evaluation.total_marks) * 100)
            : 0;
          const current = subjectMap.get(subject) || { scores: [], count: 0 };
          current.scores.push(percentage);
          current.count++;
          subjectMap.set(subject, current);
        });

        const subjectPerformance: SubjectPerformance[] = [];
        subjectMap.forEach((value, subject) => {
          const avgScore = Math.round(
            value.scores.reduce((a, b) => a + b, 0) / value.scores.length
          );
          const recentAvg = Math.round(
            value.scores.slice(0, 5).reduce((a, b) => a + b, 0) /
              Math.min(5, value.scores.length)
          );
          const trend = recentAvg - avgScore;

          subjectPerformance.push({
            subject,
            avgScore,
            testsCount: value.count,
            trend,
          });
        });

        setSubjectData(subjectPerformance.sort((a, b) => b.avgScore - a.avgScore));

        // 4. Get last 5 tests for recent evaluations
        const recentTestsData: RecentTest[] = evaluationsData.slice(0, 5).map((evaluation: any) => {
          const percentage = evaluation.total_marks > 0
            ? Math.round((evaluation.score / evaluation.total_marks) * 100)
            : 0;
          return {
            id: evaluation.id,
            subject: evaluation.subject || 'Unknown',
            score: percentage,
            marksAwarded: evaluation.score || 0,
            totalMarks: evaluation.total_marks || 100,
            date: evaluation.created_at ? new Date(evaluation.created_at) : new Date(),
            topic: evaluation.topic || evaluation.title,
          };
        });

        setRecentTests(recentTestsData);

        // 5. Calculate 30-day performance trend
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const last30Days = evaluationsData
          .filter((evaluation: any) => {
            const evalDate = evaluation.created_at ? new Date(evaluation.created_at) : null;
            return evalDate && evalDate >= thirtyDaysAgo;
          })
          .reverse()
          .slice(0, 30);

        const performanceData: PerformancePoint[] = [];
        const dateMap = new Map<string, number[]>();

        last30Days.forEach((evaluation: any) => {
          const dateStr = evaluation.created_at
            ? new Date(evaluation.created_at).toISOString().split('T')[0]
            : null;
          if (dateStr) {
            const percentage = evaluation.total_marks > 0
              ? Math.round((evaluation.score / evaluation.total_marks) * 100)
              : 0;
            const scores = dateMap.get(dateStr) || [];
            scores.push(percentage);
            dateMap.set(dateStr, scores);
          }
        });

        const sortedDates = Array.from(dateMap.keys()).sort();
        sortedDates.forEach((date) => {
          const scores = dateMap.get(date) || [];
          const avgScore = Math.round(
            scores.reduce((a, b) => a + b, 0) / scores.length
          );
          performanceData.push({ date, score: avgScore });
        });

        setPerformanceChart(performanceData);

        // 6. Update final stats
        const avgScore =
          evaluationsData.length > 0
            ? Math.round(
                evaluationsData.reduce(
                  (sum: number, evaluation: any) => {
                    const percentage = evaluation.total_marks > 0
                      ? Math.round((evaluation.score / evaluation.total_marks) * 100)
                      : 0;
                    return sum + percentage;
                  },
                  0
                ) / evaluationsData.length
              )
            : 0;

        setStats((prev) => ({
          ...prev,
          testsCompleted: evaluationsData.length,
          avgScore,
        }));

        setLoading(false);
      } catch (error) {
        logger.error('Error fetching analytics data:', error);
        setError('Failed to load analytics data. Please try again.');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [userId]);

  // ===== RENDER STATES =====

  if (loading) {
    return <Spinner fullScreen label="Loading your analytics..." />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-lg p-6"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Analytics</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const maxChartScore = Math.max(
    100,
    Math.max(...performanceChart.map((p) => p.score), 0)
  );
  const levelProgressPercent = levelProgress(stats.totalXp);

  // ===== RENDER COMPONENT =====

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
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.totalXp.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-2">Experience Points</p>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Zap className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        {/* Level Card */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Level</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.currentLevel}
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${levelProgressPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {levelProgressPercent.toFixed(0)}% to next
              </p>
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
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.testsCompleted}
              </p>
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
                {recentTests.filter((t) => t.score >= 90).length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Good (75-89)</p>
              <p className="text-lg font-bold text-blue-600">
                {recentTests.filter((t) => t.score >= 75 && t.score < 90).length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Need Improvement</p>
              <p className="text-lg font-bold text-orange-600">
                {recentTests.filter((t) => t.score < 75).length}
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
            {subjectData.length > 0 ? (
              <div className="space-y-4">
                {subjectData.map((subject) => (
                  <div
                    key={subject.subject}
                    className="border-b border-gray-200 pb-4 last:border-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {subject.subject}
                        </p>
                        <p className="text-xs text-gray-500">{subject.testsCount} tests</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {subject.avgScore}%
                        </p>
                        <div
                          className={`flex items-center justify-end gap-1 text-xs mt-1 ${
                            subject.trend >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
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
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-500">No test data available yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Submit your first evaluation to see performance data
                </p>
              </div>
            )}
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
            subtitle="Last 30 days"
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
                        className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-blue-400 transition-all hover:from-blue-600 hover:to-blue-500 shadow-sm cursor-pointer"
                        style={{
                          height: `${heightPercent}%`,
                          minHeight: '8px',
                        }}
                        title={`${point.date}: ${point.score}%`}
                        role="img"
                        aria-label={`${point.date}: ${point.score}%`}
                      />
                      <p className="text-xs text-gray-500 group-hover:text-gray-900 transition-colors">
                        {new Date(point.date).getDate()}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center">
                <TrendingUp className="text-gray-400 mb-2" size={32} />
                <p className="text-gray-500">No performance data available</p>
                <p className="text-xs text-gray-400 mt-1">
                  Data will appear once you complete evaluations
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Recent Evaluations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Recent Evaluations"
            subtitle={`Last ${Math.min(5, recentTests.length)} tests`}
            icon={<Calendar size={20} />}
          />
          <CardBody>
            {recentTests.length > 0 ? (
              <div className="space-y-3">
                {recentTests.map((test) => {
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
                    <div
                      key={test.id}
                      className={`border ${scoreColor} rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow`}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {test.subject}
                        </p>
                        {test.topic && (
                          <p className="text-sm text-gray-600">{test.topic}</p>
                        )}
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
                        <p className={`text-3xl font-bold ${textColor}`}>
                          {test.score}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {test.marksAwarded}/{test.totalMarks}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-500">No evaluations yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Your evaluation history will appear here
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Strengths & Weaknesses Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Analysis"
            subtitle="Strengths and areas for improvement"
            icon={<Award size={20} />}
          />
          <CardBody>
            {subjectData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-green-600">✓</span> Strengths
                  </h4>
                  {subjectData.slice(0, 2).length > 0 ? (
                    <div className="space-y-2">
                      {subjectData.slice(0, 2).map((subject) => (
                        <div
                          key={subject.subject}
                          className="bg-green-50 rounded-lg p-3 border border-green-200"
                        >
                          <p className="font-medium text-green-900">
                            {subject.subject}
                          </p>
                          <p className="text-sm text-green-700 mt-1">
                            {subject.avgScore >= 90
                              ? 'Outstanding performance'
                              : subject.avgScore >= 75
                                ? 'Strong performance'
                                : 'Good foundation'}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Average: {subject.avgScore}%
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No data yet</p>
                  )}
                </div>

                {/* Areas for Improvement */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-orange-600">!</span> Areas to Improve
                  </h4>
                  {subjectData.slice(-2).length > 0 ? (
                    <div className="space-y-2">
                      {subjectData.slice(-2).map((subject) => (
                        <div
                          key={subject.subject}
                          className="bg-orange-50 rounded-lg p-3 border border-orange-200"
                        >
                          <p className="font-medium text-orange-900">
                            {subject.subject}
                          </p>
                          <p className="text-sm text-orange-700 mt-1">
                            {subject.avgScore < 60
                              ? 'Needs focused practice'
                              : subject.avgScore < 75
                                ? 'Continue improving'
                                : 'Room for growth'}
                          </p>
                          <p className="text-xs text-orange-600 mt-1">
                            Average: {subject.avgScore}%
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No data yet</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-500">Insights coming soon</p>
                <p className="text-xs text-gray-400 mt-1">
                  Complete more evaluations to unlock insights
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Quick Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Quick Summary"
            subtitle="Your learning journey at a glance"
            icon={<Zap size={20} />}
          />
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.testsCompleted}
                </p>
                <p className="text-xs text-gray-600 mt-1">Tests Completed</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(stats.avgScore)}%
                </p>
                <p className="text-xs text-gray-600 mt-1">Avg Score</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-2xl font-bold text-purple-600">
                  {subjectData.length}
                </p>
                <p className="text-xs text-gray-600 mt-1">Subjects</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-2xl font-bold text-orange-600">
                  {stats.totalXp.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 mt-1">Total XP</p>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-lg border border-pink-100">
                <p className="text-2xl font-bold text-pink-600">
                  {stats.currentLevel}
                </p>
                <p className="text-xs text-gray-600 mt-1">Current Level</p>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <p className="text-2xl font-bold text-indigo-600">
                  {stats.rank || '—'}
                </p>
                <p className="text-xs text-gray-600 mt-1">Rank</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
