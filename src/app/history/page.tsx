// src/app/history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase.client';
import { doc, getDoc } from 'firebase/firestore';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/common/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, TrendingUp, Award, Target, 
  CheckCircle, XCircle, AlertCircle, Eye, Download,
  Filter, Search
} from 'lucide-react';

// Mock history data
const mockHistory = [
  {
    id: 1,
    date: '2025-10-23',
    subject: 'Mathematics',
    topic: 'Calculus - Integration',
    score: 92,
    totalMarks: 100,
    timeTaken: '45 min',
    xpEarned: 50,
    correct: 23,
    incorrect: 2,
    status: 'excellent',
    badge: '🏆'
  },
  {
    id: 2,
    date: '2025-10-22',
    subject: 'Physics',
    topic: 'Thermodynamics',
    score: 78,
    totalMarks: 100,
    timeTaken: '38 min',
    xpEarned: 40,
    correct: 19,
    incorrect: 6,
    status: 'good',
    badge: '⭐'
  },
  {
    id: 3,
    date: '2025-10-21',
    subject: 'Chemistry',
    topic: 'Organic Chemistry',
    score: 85,
    totalMarks: 100,
    timeTaken: '42 min',
    xpEarned: 45,
    correct: 21,
    incorrect: 4,
    status: 'good',
    badge: '⭐'
  },
  {
    id: 4,
    date: '2025-10-20',
    subject: 'Mathematics',
    topic: 'Trigonometry',
    score: 100,
    totalMarks: 100,
    timeTaken: '35 min',
    xpEarned: 100,
    correct: 25,
    incorrect: 0,
    status: 'perfect',
    badge: '💯'
  },
];

export default function HistoryPage() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState<any>(null);
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
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const filteredHistory = mockHistory.filter(test => {
    const matchesSubject = filterSubject === 'all' || test.subject === filterSubject;
    const matchesSearch = test.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const stats = {
    totalTests: mockHistory.length,
    avgScore: Math.round(mockHistory.reduce((acc, t) => acc + t.score, 0) / mockHistory.length),
    totalXP: mockHistory.reduce((acc, t) => acc + t.xpEarned, 0),
    perfectScores: mockHistory.filter(t => t.score === 100).length,
  };

  const getStatusColor = (status: string) => {
    if (status === 'perfect') return 'from-yellow-400 to-orange-500';
    if (status === 'excellent') return 'from-green-400 to-emerald-500';
    if (status === 'good') return 'from-blue-400 to-cyan-500';
    return 'from-gray-400 to-gray-500';
  };

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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
              <Clock className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              My Journey 🚀
            </h1>
            <p className="text-gray-600 text-lg">
              Track your progress and review past performances
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <Card variant="gradient" padding="lg" className="text-center">
              <div className="text-3xl mb-2">📝</div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTests}</p>
              <p className="text-sm text-gray-600">Total Tests</p>
            </Card>

            <Card variant="gradient" padding="lg" className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-2xl font-bold text-gray-900">{stats.avgScore}%</p>
              <p className="text-sm text-gray-600">Avg Score</p>
            </Card>

            <Card variant="gradient" padding="lg" className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalXP}</p>
              <p className="text-sm text-gray-600">Total XP</p>
            </Card>

            <Card variant="gradient" padding="lg" className="text-center">
              <div className="text-3xl mb-2">💯</div>
              <p className="text-2xl font-bold text-gray-900">{stats.perfectScores}</p>
              <p className="text-sm text-gray-600">Perfect Scores</p>
            </Card>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4"
          >
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by subject or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Subject Filter */}
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-6 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
            </select>
          </motion.div>

          {/* Test History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {filteredHistory.map((test, index) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <Card 
                  variant="elevated" 
                  padding="lg"
                  hover
                  clickable
                  onClick={() => setSelectedTest(test)}
                  className="cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Status Badge */}
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getStatusColor(test.status)} flex items-center justify-center text-3xl shadow-lg`}>
                      {test.badge}
                    </div>

                    {/* Test Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{test.topic}</h3>
                          <p className="text-sm text-gray-600">{test.subject}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-gray-900">{test.score}%</p>
                          <p className="text-xs text-gray-600">{test.score}/{test.totalMarks}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar size={16} />
                          <span>{new Date(test.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock size={16} />
                          <span>{test.timeTaken}</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle size={16} />
                          <span>{test.correct} Correct</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-600">
                          <XCircle size={16} />
                          <span>{test.incorrect} Incorrect</span>
                        </div>
                        <div className="flex items-center gap-1 text-purple-600 font-semibold">
                          <Award size={16} />
                          <span>+{test.xpEarned} XP</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <Eye size={20} className="text-gray-600" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}

            {filteredHistory.length === 0 && (
              <Card variant="elevated" padding="lg">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-600">No tests found matching your filters</p>
                </div>
              </Card>
            )}
          </motion.div>

          {/* Detailed View Modal */}
          <AnimatePresence>
            {selectedTest && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                  onClick={() => setSelectedTest(null)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  onClick={() => setSelectedTest(null)}
                >
                  <div 
                    className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Test Details</h2>
                      <button
                        onClick={() => setSelectedTest(null)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className={`p-6 rounded-xl bg-gradient-to-br ${getStatusColor(selectedTest.status)} text-white`}>
                        <div className="text-center">
                          <div className="text-5xl mb-2">{selectedTest.badge}</div>
                          <h3 className="text-2xl font-bold mb-1">{selectedTest.topic}</h3>
                          <p className="opacity-90">{selectedTest.subject}</p>
                          <p className="text-4xl font-bold mt-4">{selectedTest.score}%</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
                          <p className="text-2xl font-bold text-green-600">{selectedTest.correct}</p>
                          <p className="text-sm text-gray-600">Correct Answers</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <XCircle className="mx-auto mb-2 text-red-600" size={24} />
                          <p className="text-2xl font-bold text-red-600">{selectedTest.incorrect}</p>
                          <p className="text-sm text-gray-600">Incorrect Answers</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                          View Full Report
                        </button>
                        <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Download size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
}
