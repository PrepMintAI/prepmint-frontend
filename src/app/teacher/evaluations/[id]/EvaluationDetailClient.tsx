// src/app/teacher/evaluations/[id]/EvaluationDetailClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card, { CardHeader, CardBody, CardFooter } from '@/components/common/Card';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import { awardXp, XP_REWARDS } from '@/lib/gamify';
import {
  ArrowLeft, Download, Check, X, AlertCircle, User, Calendar,
  Clock, FileText, MessageSquare, ThumbsUp, ThumbsDown, Eye, ZoomIn, ZoomOut
} from 'lucide-react';

interface EvaluationDetailClientProps {
  evaluationId: string;
  teacherId: string;
}

interface EvaluationData {
  id: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  testName: string;
  testId: string;
  submittedAt: string;
  imageUrl: string;
  aiScore: number;
  aiConfidence: number;
  aiResults: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unanswered: number;
    detailedResults: Array<{
      questionNumber: number;
      isCorrect: boolean;
      confidence: number;
      aiAnswer: string;
      expectedAnswer?: string;
    }>;
  };
  status: 'pending' | 'processing' | 'ready' | 'approved' | 'rejected';
  teacherNotes?: string;
  finalScore?: number;
}

export function EvaluationDetailClient({ evaluationId, teacherId }: EvaluationDetailClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [teacherNotes, setTeacherNotes] = useState('');
  const [manualScore, setManualScore] = useState<number | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [imageZoom, setImageZoom] = useState(100);

  useEffect(() => {
    fetchEvaluation();
  }, [evaluationId]);

  const fetchEvaluation = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      // const response = await fetch(`/api/evaluations/${evaluationId}`);
      // const data = await response.json();

      // Mock data
      const mockData: EvaluationData = {
        id: evaluationId,
        studentName: 'John Doe',
        studentId: 'STU001',
        studentEmail: 'john.doe@example.com',
        testName: 'Math Test #5 - Algebra',
        testId: 'TEST001',
        submittedAt: new Date().toISOString(),
        imageUrl: '/placeholder-answer-sheet.jpg',
        aiScore: 87,
        aiConfidence: 92,
        aiResults: {
          totalQuestions: 20,
          correctAnswers: 17,
          incorrectAnswers: 2,
          unanswered: 1,
          detailedResults: Array.from({ length: 20 }, (_, i) => ({
            questionNumber: i + 1,
            isCorrect: i < 17,
            confidence: 85 + Math.random() * 15,
            aiAnswer: i < 17 ? 'Correct' : i < 19 ? 'Incorrect' : 'Not answered',
            expectedAnswer: `Answer ${i + 1}`,
          })),
        },
        status: 'ready',
      };

      setEvaluation(mockData);
      setManualScore(mockData.aiScore);
      setTeacherNotes(mockData.teacherNotes || '');
    } catch (error) {
      console.error('Failed to fetch evaluation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!evaluation) return;

    setSubmitting(true);
    try {
      // TODO: Call API to approve evaluation
      // await fetch(`/api/evaluations/${evaluationId}/approve`, {
      //   method: 'POST',
      //   body: JSON.stringify({ finalScore: manualScore, teacherNotes }),
      // });

      // Award XP to student
      await awardXp(
        evaluation.studentId,
        XP_REWARDS.EVALUATION_COMPLETE,
        `Evaluation approved: ${evaluation.testName}`
      );

      // Bonus XP for high scores
      if ((manualScore || evaluation.aiScore) >= 90) {
        await awardXp(evaluation.studentId, 50, 'High score bonus');
      }

      console.log('✅ Evaluation approved');
      router.push('/dashboard/teacher');
    } catch (error) {
      console.error('Failed to approve evaluation:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!evaluation || !teacherNotes.trim()) {
      alert('Please provide rejection notes');
      return;
    }

    setSubmitting(true);
    try {
      // TODO: Call API to reject evaluation
      // await fetch(`/api/evaluations/${evaluationId}/reject`, {
      //   method: 'POST',
      //   body: JSON.stringify({ teacherNotes }),
      // });

      console.log('❌ Evaluation rejected');
      router.push('/dashboard/teacher');
    } catch (error) {
      console.error('Failed to reject evaluation:', error);
    } finally {
      setSubmitting(false);
      setShowRejectDialog(false);
    }
  };

  if (loading) {
    return <Spinner fullScreen label="Loading evaluation..." />;
  }

  if (!evaluation) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Evaluation Not Found</h3>
          <p className="text-gray-600 mb-4">The evaluation you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/dashboard/teacher')}>
            Back to Dashboard
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft size={20} />}
          onClick={() => router.back()}
        >
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            leftIcon={<Download size={20} />}
            onClick={() => window.open(evaluation.imageUrl, '_blank')}
          >
            Download
          </Button>
        </div>
      </div>

      {/* Student & Test Info */}
      <Card variant="elevated" padding="lg">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{evaluation.studentName}</h2>
                <p className="text-sm text-gray-500">{evaluation.studentEmail}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <FileText size={16} />
                <span className="font-medium">Test:</span>
                <span>{evaluation.testName}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} />
                <span className="font-medium">Submitted:</span>
                <span>{new Date(evaluation.submittedAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={16} />
                <span className="font-medium">Status:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  evaluation.status === 'ready' ? 'bg-green-100 text-green-700' :
                  evaluation.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {evaluation.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* AI Score Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center min-w-[200px]">
            <p className="text-sm text-blue-700 mb-1">AI Evaluated Score</p>
            <p className="text-4xl font-bold text-blue-900">{evaluation.aiScore}%</p>
            <p className="text-xs text-blue-600 mt-2">
              Confidence: {evaluation.aiConfidence}%
            </p>
          </div>
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Answer Sheet Image */}
        <Card variant="elevated" padding="lg">
          <CardHeader
            title="Answer Sheet"
            action={
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setImageZoom(Math.max(50, imageZoom - 10))}
                >
                  <ZoomOut size={16} />
                </Button>
                <span className="text-sm text-gray-600">{imageZoom}%</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setImageZoom(Math.min(200, imageZoom + 10))}
                >
                  <ZoomIn size={16} />
                </Button>
              </div>
            }
          />
          <CardBody>
            <div className="overflow-auto max-h-[600px] border border-gray-200 rounded-lg">
              <img
                src={evaluation.imageUrl}
                alt="Answer Sheet"
                className="w-full transition-transform"
                style={{ transform: `scale(${imageZoom / 100})`, transformOrigin: 'top left' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x1000?text=Answer+Sheet';
                }}
              />
            </div>
          </CardBody>
        </Card>

        {/* Right Column: Evaluation Details */}
        <div className="space-y-6">
          {/* AI Results Summary */}
          <Card variant="elevated" padding="lg">
            <CardHeader title="AI Evaluation Results" icon={<FileText size={20} />} />
            <CardBody>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">
                    {evaluation.aiResults.correctAnswers}
                  </p>
                  <p className="text-xs text-green-600">Correct</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-700">
                    {evaluation.aiResults.incorrectAnswers}
                  </p>
                  <p className="text-xs text-red-600">Incorrect</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-700">
                    {evaluation.aiResults.unanswered}
                  </p>
                  <p className="text-xs text-gray-600">Unanswered</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700">
                    {evaluation.aiResults.totalQuestions}
                  </p>
                  <p className="text-xs text-blue-600">Total</p>
                </div>
              </div>

              {/* Question-by-Question Results */}
              <div className="max-h-[300px] overflow-y-auto">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Question Details:</h4>
                <div className="space-y-2">
                  {evaluation.aiResults.detailedResults.map((result) => (
                    <div
                      key={result.questionNumber}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        result.isCorrect ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">Q{result.questionNumber}</span>
                        {result.isCorrect ? (
                          <Check size={16} className="text-green-600" />
                        ) : (
                          <X size={16} className="text-red-600" />
                        )}
                      </div>
                      <span className="text-xs text-gray-600">
                        {result.confidence.toFixed(0)}% confident
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Manual Score Override */}
          <Card variant="elevated" padding="lg">
            <CardHeader title="Final Score" icon={<FileText size={20} />} />
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adjust Score (if needed)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={manualScore || evaluation.aiScore}
                      onChange={(e) => setManualScore(Number(e.target.value))}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={manualScore || evaluation.aiScore}
                      onChange={(e) => setManualScore(Number(e.target.value))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-lg font-bold text-gray-700">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teacher Notes
                  </label>
                  <textarea
                    value={teacherNotes}
                    onChange={(e) => setTeacherNotes(e.target.value)}
                    placeholder="Add feedback or notes for the student..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="success"
              fullWidth
              size="lg"
              leftIcon={<ThumbsUp size={20} />}
              loading={submitting}
              onClick={handleApprove}
            >
              Approve Evaluation
            </Button>
            <Button
              variant="danger"
              fullWidth
              size="lg"
              leftIcon={<ThumbsDown size={20} />}
              onClick={() => setShowRejectDialog(true)}
            >
              Reject
            </Button>
          </div>
        </div>
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Evaluation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this evaluation. This will be sent to the student.
            </p>
            <textarea
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              placeholder="Reason for rejection..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowRejectDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                fullWidth
                loading={submitting}
                onClick={handleReject}
                disabled={!teacherNotes.trim()}
              >
                Confirm Reject
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
