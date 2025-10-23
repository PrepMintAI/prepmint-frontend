// src/app/evaluations/EvaluationsClient.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { 
  CheckCircle, Clock, Upload, Users, FileText,
  Filter, Search, Calendar, AlertCircle, Eye,
  TrendingUp, Award, Plus, Zap
} from 'lucide-react';
import { getEvaluationSummary } from '@/lib/mockEvaluationData';

interface EvaluationsClientProps {
  userId: string;
  userRole: string;
}

export function EvaluationsClient({ userId, userRole }: EvaluationsClientProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();
  const mockEvaluations = getEvaluationSummary();

  const filteredEvaluations = mockEvaluations.filter(evaluation => {
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'pending' && evaluation.pending > 0) ||
      (activeTab === 'completed' && evaluation.pending === 0);
    
    const matchesSearch = 
      evaluation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evaluation.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evaluation.class.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: mockEvaluations.length,
    pending: mockEvaluations.reduce((sum, e) => sum + e.pending, 0),
    completed: mockEvaluations.filter(e => e.pending === 0).length,
    avgScore: Math.round(mockEvaluations.reduce((sum, e) => sum + e.avgScore, 0) / mockEvaluations.length),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

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
            <p className="text-gray-600 mt-1">AI-powered automatic grading system</p>
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
          <p className="text-2xl font-bold text-gray-900">{stats.avgScore}%</p>
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
              onClick={() => router.push(`/evaluations/${evaluation.id}`)}
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
                          Due: {new Date(evaluation.dueDate).toLocaleDateString()}
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
                      router.push('/evaluations/new/bulk');
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
                      router.push('/evaluations/new/single');
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
