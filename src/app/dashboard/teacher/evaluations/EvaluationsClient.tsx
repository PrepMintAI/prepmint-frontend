// src/app/dashboard/teacher/evaluations/EvaluationsClient.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import {
  CheckCircle, Clock, Users, FileText,
  Search, Calendar, AlertCircle, Eye,
  TrendingUp, Award, Plus, Zap
} from 'lucide-react';
import { db } from '@/lib/firebase.client';
import { logger } from '@/lib/logger';
import { collection, query, where, getDocs, orderBy, limit as firestoreLimit } from 'firebase/firestore';

interface EvaluationsClientProps {
  userId: string;
  userRole: string;
}

interface EvaluationData {
  id: string;
  title?: string;
  subject?: string;
  class?: string;
  section?: string;
  type: string;
  totalSubmissions: number;
  evaluated: number;
  pending: number;
  createdAt: any;
  dueDate: any;
  status: string;
  avgScore: number;
  institutionId?: string;
}

export function EvaluationsClient({ userId, userRole }: EvaluationsClientProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teacherInstitutionId, setTeacherInstitutionId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchEvaluations() {
      try {
        setIsLoading(true);

        // Fetch teacher's institution ID first
        const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', userId), firestoreLimit(1)));
        let institutionId = '';
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          institutionId = userData.institutionId || '';
          setTeacherInstitutionId(institutionId);
        }

        // Fetch evaluations
        let evaluationsQuery;
        if (userRole === 'teacher' && institutionId) {
          evaluationsQuery = query(
            collection(db, 'evaluations'),
            where('institutionId', '==', institutionId),
            orderBy('createdAt', 'desc'),
            firestoreLimit(100)
          );
        } else {
          // Admin or institution - show all
          evaluationsQuery = query(
            collection(db, 'evaluations'),
            orderBy('createdAt', 'desc'),
            firestoreLimit(100)
          );
        }

        const evaluationsSnapshot = await getDocs(evaluationsQuery);
        const fetchedEvaluations: EvaluationData[] = evaluationsSnapshot.docs.map(doc => {
          const data = doc.data();
          // Mock some fields that might not exist yet
          const totalSubs = 30;
          const mockEvaluated = data.status === 'completed' ? totalSubs :
                                data.status === 'in-progress' ? Math.floor(totalSubs / 2) : 0;

          return {
            id: doc.id,
            title: data.title || 'Evaluation',
            subject: data.subject || 'N/A',
            class: data.class ? `Class ${data.class}${data.section || ''}` : 'N/A',
            section: data.section || '',
            type: data.type || 'bulk',
            totalSubmissions: totalSubs,
            evaluated: mockEvaluated,
            pending: totalSubs - mockEvaluated,
            createdAt: data.createdAt,
            dueDate: data.dueDate || data.createdAt,
            status: data.status || 'pending',
            avgScore: data.status === 'completed' ? Math.floor(70 + Math.random() * 20) : 0,
            institutionId: data.institutionId
          };
        });

        setEvaluations(fetchedEvaluations);
      } catch (error) {
        logger.error('Error fetching evaluations:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvaluations();
  }, [userId, userRole]);

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(evaluation => {
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'pending' && evaluation.pending > 0) ||
        (activeTab === 'completed' && evaluation.pending === 0);

      const matchesSearch =
        (evaluation.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (evaluation.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (evaluation.class?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      return matchesTab && matchesSearch;
    });
  }, [evaluations, activeTab, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: evaluations.length,
      pending: evaluations.reduce((sum, e) => sum + e.pending, 0),
      completed: evaluations.filter(e => e.pending === 0).length,
      avgScore: evaluations.filter(e => e.avgScore > 0).length > 0
        ? Math.round(evaluations.filter(e => e.avgScore > 0).reduce((sum, e) => sum + e.avgScore, 0) / evaluations.filter(e => e.avgScore > 0).length)
        : 0,
    };
  }, [evaluations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return <Spinner fullScreen label="Loading evaluations..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Evaluations</h1>
            <p className="text-gray-600 mt-1">
              AI-powered automatic grading system
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            leftIcon={<Plus size={18} />}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            New Evaluation
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card variant="elevated" padding="lg" className="text-center">
          <FileText className="mx-auto mb-2 text-blue-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Evaluations</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <Clock className="mx-auto mb-2 text-orange-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-sm text-gray-600">Pending Reviews</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <TrendingUp className="mx-auto mb-2 text-purple-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats.avgScore > 0 ? `${stats.avgScore}%` : 'N/A'}</p>
          <p className="text-sm text-gray-600">Average Score</p>
        </Card>
      </motion.div>

      {/* Tabs & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="elevated" padding="lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex gap-2">
              {(['all', 'pending', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="w-full md:w-auto md:min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search evaluations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredEvaluations.length} of {evaluations.length} evaluations
          </div>
        </Card>
      </motion.div>

      {/* Evaluations List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {filteredEvaluations.map((evaluation, index) => (
          <motion.div
            key={evaluation.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.05 }}
          >
            <Card 
              variant="elevated" 
              padding="lg"
              hover
              clickable
              onClick={() => router.push(`/dashboard/teacher/evaluations/${evaluation.id}`)}
              className="cursor-pointer"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`mt-1 p-2 rounded-lg ${
                      evaluation.type === 'bulk' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      {evaluation.type === 'bulk' ? (
                        <Users size={20} className="text-purple-600" />
                      ) : (
                        <FileText size={20} className="text-blue-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{evaluation.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FileText size={14} />
                          {evaluation.subject}
                        </span>
                        <span>•</span>
                        <span>{evaluation.class}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${getStatusColor(evaluation.status)}`}>
                          {evaluation.status.replace('-', ' ')}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(evaluation.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Progress */}
                  <div className="text-center">
                    <div className="relative w-16 h-16">
                      <svg className="transform -rotate-90 w-16 h-16">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#e5e7eb"
                          strokeWidth="6"
                          fill="none"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke={evaluation.pending === 0 ? '#10b981' : '#f59e0b'}
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={`${(evaluation.evaluated / evaluation.totalSubmissions) * 175.93} 175.93`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-900">
                          {Math.round((evaluation.evaluated / evaluation.totalSubmissions) * 100)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {evaluation.evaluated}/{evaluation.totalSubmissions}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:block text-right">
                    {evaluation.evaluated > 0 && (
                      <div className="mb-2">
                        <p className="text-2xl font-bold text-gray-900">{evaluation.avgScore}%</p>
                        <p className="text-xs text-gray-600">Avg Score</p>
                      </div>
                    )}
                    {evaluation.pending > 0 && (
                      <div className="flex items-center gap-1 text-orange-600 text-sm">
                        <AlertCircle size={16} />
                        <span>{evaluation.pending} pending</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {filteredEvaluations.length === 0 && (
          <Card variant="elevated" padding="lg">
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">No evaluations found</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
            </div>
          </Card>
        )}
      </motion.div>

      {/* Create Evaluation Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <div 
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Evaluation Type</h2>
                <p className="text-gray-600 mb-6">Select how you want to evaluate submissions</p>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      router.push('/dashboard/teacher/evaluations/new/bulk');
                    }}
                    className="w-full p-4 rounded-xl border-2 border-purple-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <Users size={24} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">Bulk Evaluation</h3>
                        <p className="text-sm text-gray-600">
                          Upload 1 question paper + multiple answer sheets for entire class
                        </p>
                        <p className="text-xs text-purple-600 mt-2 font-medium">
                          ✨ Recommended for teachers
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      router.push('/dashboard/teacher/evaluations/new/single');
                    }}
                    className="w-full p-4 rounded-xl border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <FileText size={24} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">Single Evaluation</h3>
                        <p className="text-sm text-gray-600">
                          Evaluate one student's answer sheet at a time
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-full mt-4 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
