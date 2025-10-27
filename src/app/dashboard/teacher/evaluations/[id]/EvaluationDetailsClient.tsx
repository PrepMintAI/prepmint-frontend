// src/app/dashboard/teacher/evaluations/[id]/EvaluationDetailsClient.tsx
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
import { 
  tests, 
  getStudentsByClass,
  schoolSubjects,
  collegeSubjects
} from '@/lib/comprehensiveMockData';

interface EvaluationDetailsClientProps {
  evaluationId: string;
  userId: string;
  userRole: string;
}

export function EvaluationDetailsClient({ evaluationId, userId, userRole }: EvaluationDetailsClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'student' | 'question'>('student');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Get test data
  const test = useMemo(() => {
    return tests.find(t => t.id === evaluationId);
  }, [evaluationId]);

  // Get students for this test
  const students = useMemo(() => {
    if (!test) return [];
    return getStudentsByClass(test.institutionId, test.class, test.section);
  }, [test]);

  // Generate mock student results based on real students
  const studentResults = useMemo(() => {
    if (!test || students.length === 0) return [];
    
    return students.map((student, index) => {
      // Generate random but realistic scores
      const baseScore = student.performance.overallPercentage;
      const variance = Math.random() * 20 - 10; // -10 to +10
      const finalPercentage = Math.max(40, Math.min(100, baseScore + variance));
      const score = Math.round((finalPercentage / 100) * test.totalMarks);
      
      // Generate question breakdown (assuming 3 questions)
      const q1Total = Math.round(test.totalMarks * 0.3);
      const q2Total = Math.round(test.totalMarks * 0.35);
      const q3Total = test.totalMarks - q1Total - q2Total;
      
      const q1Marks = Math.round((finalPercentage / 100) * q1Total);
      const q2Marks = Math.round((finalPercentage / 100) * q2Total);
      const q3Marks = score - q1Marks - q2Marks;
      
      return {
        id: student.id,
        name: student.name,
        rollNo: student.rollNo,
        score: score,
        totalMarks: test.totalMarks,
        percentage: Math.round(finalPercentage),
        status: finalPercentage >= 75 ? 'approved' as const : 
                finalPercentage >= 60 ? 'needs-revision' as const : 
                'pending' as const,
        breakdown: [
          { 
            question: 1, 
            marks: q1Marks, 
            total: q1Total, 
            aiComment: q1Marks >= q1Total * 0.9 
              ? 'Excellent understanding of concepts. Clear explanation with proper steps.'
              : q1Marks >= q1Total * 0.7
              ? 'Good approach but minor calculation errors. Overall good understanding.'
              : 'Needs improvement. Review the basic concepts and practice more.',
            teacherComment: q1Marks >= q1Total * 0.9 ? 'Perfect!' : ''
          },
          { 
            question: 2, 
            marks: q2Marks, 
            total: q2Total, 
            aiComment: q2Marks >= q2Total * 0.9 
              ? 'Outstanding work! Clear, concise, and accurate solution.'
              : q2Marks >= q2Total * 0.7
              ? 'Solid understanding shown. Formula applied correctly.'
              : 'Incomplete solution. More practice needed.',
            teacherComment: ''
          },
          { 
            question: 3, 
            marks: q3Marks, 
            total: q3Total, 
            aiComment: q3Marks >= q3Total * 0.9 
              ? 'Perfect answer with logical reasoning and proper steps.'
              : q3Marks >= q3Total * 0.7
              ? 'Good attempt. Minor gaps in explanation.'
              : 'Needs significant improvement. Practice similar problems.',
            teacherComment: q3Marks >= q3Total * 0.9 ? 'Excellent work!' : ''
          },
        ],
        submittedAt: new Date(test.date).toLocaleDateString() + ' ' + 
                     (9 + Math.floor(Math.random() * 3)) + ':' + 
                     (Math.floor(Math.random() * 60)).toString().padStart(2, '0') + ' AM',
      };
    });
  }, [test, students]);

  if (!test) {
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

  // Calculate stats
  const stats = useMemo(() => {
    if (studentResults.length === 0) return { avg: 0, highest: 0, lowest: 0 };
    
    const percentages = studentResults.map(s => s.percentage);
    return {
      avg: Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length),
      highest: Math.max(...percentages),
      lowest: Math.min(...percentages),
    };
  }, [studentResults]);

  const filteredResults = useMemo(() => {
    return studentResults.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' || 
        student.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [studentResults, searchQuery, statusFilter]);

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

  // Question-wise stats
  const questionStats = useMemo(() => {
    if (studentResults.length === 0) return [];
    
    return [0, 1, 2].map(qIndex => {
      const scores = studentResults.map(s => s.breakdown[qIndex]);
      const percentages = scores.map(q => (q.marks / q.total) * 100);
      
      return {
        questionNum: qIndex + 1,
        average: Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length),
        highest: Math.max(...scores.map(q => q.marks)),
        lowest: Math.min(...scores.map(q => q.marks)),
        total: scores[0].total,
        completion: Math.round((scores.filter(q => q.marks > 0).length / scores.length) * 100),
      };
    });
  }, [studentResults]);

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
            <h1 className="text-3xl font-bold text-gray-900">{test.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <BookOpen size={16} />
                {test.subjectName}
              </span>
              <span>•</span>
              <span>Class {test.class}{test.section}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                {new Date(test.date).toLocaleDateString()}
              </span>
              <span>•</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                test.status === 'completed' ? 'bg-green-100 text-green-700' :
                test.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {test.status}
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
              onClick={() => router.push(`/analytics?test=${test.id}`)}
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
          <p className="text-2xl font-bold text-gray-900">{studentResults.length}</p>
          <p className="text-xs text-gray-600">Students</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{studentResults.length}</p>
          <p className="text-xs text-gray-600">Evaluated</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <TrendingUp className="mx-auto mb-2 text-purple-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats.avg}%</p>
          <p className="text-xs text-gray-600">Average</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <Award className="mx-auto mb-2 text-yellow-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats.highest}%</p>
          <p className="text-xs text-gray-600">Highest</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <AlertCircle className="mx-auto mb-2 text-red-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{stats.lowest}%</p>
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

          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredResults.length} of {studentResults.length} students
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
          {filteredResults.map((student) => (
            <Card key={student.id} variant="elevated" padding="lg" hover clickable>
              <div 
                className="cursor-pointer"
                onClick={() => setSelectedStudent(selectedStudent === parseInt(student.id) ? null : parseInt(student.id))}
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
                {selectedStudent === parseInt(student.id) && (
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
          {questionStats.map((qStat) => (
            <Card key={qStat.questionNum} variant="elevated" padding="lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Question {qStat.questionNum} - Performance Analysis
              </h3>

              {/* Question Stats */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{qStat.average}%</p>
                  <p className="text-xs text-gray-600">Average</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{qStat.highest}/{qStat.total}</p>
                  <p className="text-xs text-gray-600">Highest</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{qStat.lowest}/{qStat.total}</p>
                  <p className="text-xs text-gray-600">Lowest</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{qStat.completion}%</p>
                  <p className="text-xs text-gray-600">Completion</p>
                </div>
              </div>

              {/* Student Responses */}
              <div className="space-y-2">
                {filteredResults.map((student) => {
                  const question = student.breakdown[qStat.questionNum - 1];
                  return (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-medium text-gray-900 w-48 truncate">{student.name}</span>
                        <div className="flex-1">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500"
                              style={{ width: `${(question.marks / question.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900 ml-4">
                        {question.marks}/{question.total}
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
