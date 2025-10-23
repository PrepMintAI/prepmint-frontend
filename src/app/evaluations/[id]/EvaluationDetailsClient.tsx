// src/app/evaluations/[id]/EvaluationDetailsClient.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { 
  ArrowLeft, Download, Mail, FileText, Users, 
  TrendingUp, Filter, Search, Eye, Edit, 
  MessageSquare, CheckCircle, AlertCircle, Calendar,
  BookOpen, Award, BarChart3, Grid, List
} from 'lucide-react';
import { getEvaluationById } from '@/lib/mockEvaluationData';


interface EvaluationDetailsClientProps {
  evaluationId: string;
  userId: string;
  userRole: string;
}

// Mock evaluation data
const mockEvaluation = {
  id: 1,
  title: 'Mathematics Midterm Exam',
  subject: 'Mathematics',
  class: 'Class 10-A',
  totalMarks: 100,
  totalStudents: 35,
  evaluated: 35,
  pending: 0,
  createdAt: '2025-10-20',
  dueDate: '2025-10-25',
  status: 'completed',
  avgScore: 82,
  highestScore: 98,
  lowestScore: 62,
};

const mockStudentResults = [
  {
    id: 1,
    name: 'Aarav Sharma',
    rollNo: '10A-01',
    score: 87,
    totalMarks: 100,
    percentage: 87,
    status: 'approved',
    breakdown: [
      { question: 1, marks: 9, total: 10, aiComment: 'Excellent work!', teacherComment: 'Perfect' },
      { question: 2, marks: 8, total: 10, aiComment: 'Good approach', teacherComment: '' },
      { question: 3, marks: 10, total: 10, aiComment: 'Perfect answer', teacherComment: 'Well done' },
    ],
    submittedAt: '2025-10-22 10:30 AM',
  },
  {
    id: 2,
    name: 'Priya Patel',
    rollNo: '10A-02',
    score: 92,
    totalMarks: 100,
    percentage: 92,
    status: 'approved',
    breakdown: [
      { question: 1, marks: 10, total: 10, aiComment: 'Perfect understanding', teacherComment: 'Excellent!' },
      { question: 2, marks: 9, total: 10, aiComment: 'Well explained', teacherComment: '' },
      { question: 3, marks: 10, total: 10, aiComment: 'Outstanding', teacherComment: 'Keep it up!' },
    ],
    submittedAt: '2025-10-22 11:15 AM',
  },
  {
    id: 3,
    name: 'Rohan Kumar',
    rollNo: '10A-03',
    score: 78,
    totalMarks: 100,
    percentage: 78,
    status: 'needs-revision',
    breakdown: [
      { question: 1, marks: 8, total: 10, aiComment: 'Good but needs detail', teacherComment: 'Add more steps' },
      { question: 2, marks: 7, total: 10, aiComment: 'Calculation error', teacherComment: 'Check your work' },
      { question: 3, marks: 9, total: 10, aiComment: 'Nearly perfect', teacherComment: '' },
    ],
    submittedAt: '2025-10-22 09:45 AM',
  },
];

export function EvaluationDetailsClient({ evaluationId, userId, userRole }: EvaluationDetailsClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'student' | 'question'>('student');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const evaluationData = useMemo(() => {
    return getEvaluationById(parseInt(evaluationId));
  }, [evaluationId]);

  if (!evaluationData) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 mb-4">Evaluation not found</p>
        <Button onClick={() => router.push('/evaluations')} variant="primary">
          Back to Evaluations
        </Button>
      </div>
    );
  }

  const filteredResults = evaluationData.students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 75) return 'text-blue-600 bg-blue-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'needs-revision':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} />
          Back to Evaluations
        </button>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{mockEvaluation.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <BookOpen size={16} />
                {mockEvaluation.subject}
              </span>
              <span>•</span>
              <span>{mockEvaluation.class}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                {new Date(mockEvaluation.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={16} />}
            >
              Export Results
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Mail size={16} />}
            >
              Notify Students
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<BarChart3 size={16} />}
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              Analytics
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        <Card variant="elevated" padding="lg" className="text-center">
          <Users className="mx-auto mb-2 text-blue-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{mockEvaluation.totalStudents}</p>
          <p className="text-xs text-gray-600">Students</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{mockEvaluation.evaluated}</p>
          <p className="text-xs text-gray-600">Evaluated</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <TrendingUp className="mx-auto mb-2 text-purple-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{mockEvaluation.avgScore}%</p>
          <p className="text-xs text-gray-600">Average</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <Award className="mx-auto mb-2 text-yellow-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{mockEvaluation.highestScore}%</p>
          <p className="text-xs text-gray-600">Highest</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <AlertCircle className="mx-auto mb-2 text-red-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{mockEvaluation.lowestScore}%</p>
          <p className="text-xs text-gray-600">Lowest</p>
        </Card>
      </motion.div>

      {/* Filters & View Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="elevated" padding="lg">
          <div className="flex flex-col md:flex-row gap-4">
            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('student')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'student'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Users size={16} className="inline mr-2" />
                By Student
              </button>
              <button
                onClick={() => setViewMode('question')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'question'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText size={16} className="inline mr-2" />
                By Question
              </button>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="needs-revision">Needs Revision</option>
              <option value="pending">Pending</option>
            </select>

            {/* Layout Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setLayoutMode('list')}
                className={`p-2 rounded-lg ${
                  layoutMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-2 rounded-lg ${
                  layoutMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Grid size={20} />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Student View */}
      {viewMode === 'student' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={layoutMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}
        >
          {filteredResults.map((student, index) => (
            <Card key={student.id} variant="elevated" padding="lg" hover clickable>
              <div 
                className="cursor-pointer"
                onClick={() => setSelectedStudent(selectedStudent === student.id ? null : student.id)}
              >
                {/* Student Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.rollNo}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(student.status)}`}>
                    {student.status === 'approved' ? '✓' : student.status === 'needs-revision' ? '⚠' : '⏳'}
                  </span>
                </div>

                {/* Score */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-gray-900">{student.score}</span>
                    <span className="text-gray-600">/ {student.totalMarks}</span>
                    <span className={`ml-auto px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(student.percentage)}`}>
                      {student.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        student.percentage >= 90 ? 'bg-green-500' :
                        student.percentage >= 75 ? 'bg-blue-500' :
                        student.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${student.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Breakdown (Expanded) */}
                {selectedStudent === student.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t pt-3 space-y-3"
                  >
                    <h4 className="font-semibold text-gray-900 text-sm">Question-wise Breakdown:</h4>
                    {student.breakdown.map((q, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">Q{q.question}</span>
                          <span className="font-bold text-gray-900">{q.marks}/{q.total}</span>
                        </div>
                        
                        <div className="text-xs text-gray-700 bg-blue-50 p-2 rounded border-l-2 border-blue-400">
                          <p className="font-medium text-blue-900">🤖 AI: {q.aiComment}</p>
                        </div>
                        
                        {q.teacherComment && (
                          <div className="text-xs text-gray-700 bg-green-50 p-2 rounded border-l-2 border-green-400">
                            <p className="font-medium text-green-900">👨‍🏫 Teacher: {q.teacherComment}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <Button size="sm" variant="outline" leftIcon={<Eye size={14} />}>
                    View Sheet
                  </Button>
                  <Button size="sm" variant="outline" leftIcon={<MessageSquare size={14} />}>
                    Feedback
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Question View */}
      {viewMode === 'question' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {[1, 2, 3].map((questionNum) => (
            <Card key={questionNum} variant="elevated" padding="lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Question {questionNum} - Performance Analysis
              </h3>

              {/* Question Stats */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">8.5</p>
                  <p className="text-xs text-gray-600">Average</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">10</p>
                  <p className="text-xs text-gray-600">Highest</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">7</p>
                  <p className="text-xs text-gray-600">Lowest</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">85%</p>
                  <p className="text-xs text-gray-600">Completion</p>
                </div>
              </div>

              {/* Student Responses */}
              <div className="space-y-2">
                {mockStudentResults.map((student) => {
                  const question = student.breakdown.find(q => q.question === questionNum);
                  return (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-medium text-gray-900 w-32">{student.name}</span>
                        <div className="flex-1">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500"
                              style={{ width: `${question ? (question.marks / question.total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900 ml-4">
                        {question?.marks}/{question?.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </motion.div>
      )}
    </div>
  );
}
