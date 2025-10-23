// src/app/evaluations/new/single/SingleEvaluationClient.tsx (UPDATED)
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { 
  Upload, FileText, CheckCircle, X, Sparkles,
  FileImage, ArrowRight, Zap, Info, Edit3,
  ThumbsUp, Save, Eye, MessageSquare, Clock
} from 'lucide-react';

interface SingleEvaluationClientProps {
  userId: string;
  userRole: string;
}

interface UploadedFile {
  file: File;
  preview?: string;
}

interface QuestionBreakdown {
  question: number;
  marks: number;
  total: number;
  aiComment: string;
  teacherComment?: string;
  teacherAdjustedMarks?: number;
}

interface AIResult {
  score: number;
  totalMarks: number;
  breakdown: QuestionBreakdown[];
  aiSuggestions: string[];
  overallComment: string;
}

export function SingleEvaluationClient({ userId, userRole }: SingleEvaluationClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [studentName, setStudentName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [subject, setSubject] = useState('');
  const [totalMarks, setTotalMarks] = useState('100');
  const [questionPaper, setQuestionPaper] = useState<UploadedFile | null>(null);
  const [answerSheet, setAnswerSheet] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [teacherApproved, setTeacherApproved] = useState(false);
  const [teacherRejected, setTeacherRejected] = useState(false);
  const [overallTeacherComment, setOverallTeacherComment] = useState('');

  // Question Paper Dropzone
  const onDropQuestion = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setQuestionPaper({ file, preview: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { 
    getRootProps: getQuestionRootProps, 
    getInputProps: getQuestionInputProps, 
    isDragActive: isQuestionDragActive 
  } = useDropzone({
    onDrop: onDropQuestion,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'], 'application/pdf': ['.pdf'] },
    maxFiles: 1
  });

  // Answer Sheet Dropzone
  const onDropAnswer = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAnswerSheet({ file, preview: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { 
    getRootProps: getAnswerRootProps, 
    getInputProps: getAnswerInputProps, 
    isDragActive: isAnswerDragActive 
  } = useDropzone({
    onDrop: onDropAnswer,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'], 'application/pdf': ['.pdf'] },
    maxFiles: 1
  });

  const handleEvaluate = async () => {
    setIsProcessing(true);
    
    // Simulate AI evaluation with progress
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setProcessingProgress(i);
    }
    
    // Mock AI result
    const mockResult: AIResult = {
      score: 87,
      totalMarks: parseInt(totalMarks),
      breakdown: [
        { 
          question: 1, 
          marks: 9, 
          total: 10, 
          aiComment: 'Excellent understanding of the concept. Clear explanation with proper steps. Minor calculation error in final answer.',
        },
        { 
          question: 2, 
          marks: 8, 
          total: 10, 
          aiComment: 'Good approach to the problem. Formula applied correctly but presentation could be improved.',
        },
        { 
          question: 3, 
          marks: 10, 
          total: 10, 
          aiComment: 'Perfect answer! Clear, concise, and accurate. Shows deep understanding of the topic.',
        },
      ],
      aiSuggestions: [
        'Strong conceptual understanding',
        'Clear explanation of steps',
        'Minor calculation errors need attention',
        'Overall excellent performance',
      ],
      overallComment: 'Student demonstrates strong understanding of the subject matter with excellent problem-solving skills.',
    };
    
    setAiResult(mockResult);
    setIsProcessing(false);
    setStep(3);
  };

  const updateTeacherComment = (questionIndex: number, comment: string) => {
    if (!aiResult) return;
    const updated = { ...aiResult };
    updated.breakdown[questionIndex].teacherComment = comment;
    setAiResult(updated);
  };

  const updateTeacherMarks = (questionIndex: number, marks: number) => {
    if (!aiResult) return;
    const updated = { ...aiResult };
    updated.breakdown[questionIndex].teacherAdjustedMarks = marks;
    // Recalculate total
    updated.score = updated.breakdown.reduce(
      (sum, q) => sum + (q.teacherAdjustedMarks ?? q.marks), 
      0
    );
    setAiResult(updated);
  };

  const handleApprove = () => {
    setTeacherApproved(true);
    setTeacherRejected(false);
  };

  const handleReject = () => {
    setTeacherRejected(true);
    setTeacherApproved(false);
  };

  const handleSaveForLater = () => {
    router.push('/evaluations?status=draft');
  };

  const handleFinalize = () => {
    if (!teacherApproved && !teacherRejected) {
      alert('Please approve or reject the evaluation before finalizing.');
      return;
    }
    router.push('/evaluations');
  };

  const canProceedToStep2 = studentName && rollNo && subject && totalMarks;
  const canEvaluate = questionPaper && answerSheet;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2 text-sm"
        >
          ← Back to Evaluations
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
            <FileText className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Single Evaluation</h1>
            <p className="text-gray-600">AI-assisted grading with teacher review</p>
          </div>
        </div>
      </motion.div>

      {/* Progress */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center justify-between">
          {[
            { num: 1, title: 'Student Info' },
            { num: 2, title: 'Upload Files' },
            { num: 3, title: 'Teacher Review' },
          ].map((s, index) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s.num 
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > s.num ? '✓' : s.num}
                </div>
                <p className={`text-xs mt-2 font-medium ${
                  step >= s.num ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {s.title}
                </p>
              </div>
              {index < 2 && (
                <div className={`h-1 flex-1 mx-2 rounded ${
                  step > s.num ? 'bg-gradient-to-r from-blue-500 to-cyan-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Step 1: Student Info */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card variant="elevated" padding="lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Student Information</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter student name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Roll Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g., 10A-23"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    placeholder="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedToStep2}
                variant="primary"
                rightIcon={<ArrowRight size={18} />}
              >
                Next: Upload Files
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Step 2: Upload Files */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Question Paper */}
          <Card variant="elevated" padding="lg">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Question Paper</h2>
            <p className="text-sm text-gray-600 mb-4">Upload the question paper</p>

            {!questionPaper ? (
              <div {...getQuestionRootProps()} className={`p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isQuestionDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
              }`}>
                <input {...getQuestionInputProps()} />
                <div className="text-center">
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-sm text-gray-600">Drop question paper or click to upload</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-sm text-gray-900">{questionPaper.file.name}</span>
                </div>
                <button onClick={() => setQuestionPaper(null)} className="text-red-600">
                  <X size={20} />
                </button>
              </div>
            )}
          </Card>

          {/* Answer Sheet */}
          <Card variant="elevated" padding="lg">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Answer Sheet</h2>
            <p className="text-sm text-gray-600 mb-4">Upload student's answer sheet</p>

            {!answerSheet ? (
              <div {...getAnswerRootProps()} className={`p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isAnswerDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
              }`}>
                <input {...getAnswerInputProps()} />
                <div className="text-center">
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-sm text-gray-600">Drop answer sheet or click to upload</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-sm text-gray-900">{answerSheet.file.name}</span>
                </div>
                <button onClick={() => setAnswerSheet(null)} className="text-red-600">
                  <X size={20} />
                </button>
              </div>
            )}
          </Card>

          {/* Processing or Evaluate */}
          {!isProcessing ? (
            <div className="flex justify-between">
              <Button onClick={() => setStep(1)} variant="outline">← Back</Button>
              <Button
                onClick={handleEvaluate}
                disabled={!canEvaluate}
                variant="primary"
                leftIcon={<Zap size={18} />}
                className="bg-gradient-to-r from-blue-600 to-cyan-600"
              >
                Start AI Evaluation
              </Button>
            </div>
          ) : (
            <Card variant="elevated" padding="lg" className="text-center">
              <div className="py-8">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="transform -rotate-90 w-24 h-24">
                    <circle cx="48" cy="48" r="42" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(processingProgress / 100) * 263.89} 263.89`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{processingProgress}%</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">AI is Evaluating... ✨</h3>
                <p className="text-sm text-gray-600">Please wait a moment</p>
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* Step 3: Teacher Review & Approval */}
      {step === 3 && aiResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {/* Header Card with Student Info */}
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Teacher Review Required</h2>
                <p className="text-sm text-gray-600">AI has evaluated the answer sheet. Please review and approve.</p>
              </div>
              <div className={`px-4 py-2 rounded-full font-medium ${
                teacherApproved ? 'bg-green-100 text-green-700' :
                teacherRejected ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {teacherApproved ? '✓ Approved' : teacherRejected ? '✗ Rejected' : '⏳ Pending Review'}
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                {studentName.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{studentName}</h3>
                <p className="text-sm text-gray-600">Roll No: {rollNo} • {subject}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{aiResult.score}</div>
                <div className="text-sm text-gray-600">/ {aiResult.totalMarks}</div>
              </div>
            </div>
          </Card>

          {/* AI Overall Assessment */}
          <Card variant="elevated" padding="lg" className="bg-blue-50 border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <Sparkles size={24} className="text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">AI Overall Assessment</h3>
                <p className="text-blue-800 mb-3">{aiResult.overallComment}</p>
                <div className="space-y-1">
                  {aiResult.aiSuggestions.map((suggestion, i) => (
                    <p key={i} className="text-sm text-blue-700">• {suggestion}</p>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Question-wise Breakdown */}
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Question-wise Breakdown
            </h3>

            <div className="space-y-4">
              {aiResult.breakdown.map((question, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">Question {question.question}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={question.teacherAdjustedMarks ?? question.marks}
                        onChange={(e) => updateTeacherMarks(index, parseFloat(e.target.value))}
                        className="w-20 px-3 py-1 border border-gray-300 rounded text-center font-bold text-gray-900 focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max={question.total}
                        step="0.5"
                        disabled={teacherApproved || teacherRejected}
                      />
                      <span className="text-gray-600">/ {question.total}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                    <p className="font-semibold text-blue-900 mb-1">🤖 AI Comment:</p>
                    <p>{question.aiComment}</p>
                  </div>

                  <div>
                    <textarea
                      placeholder="Add your comment (optional)..."
                      value={question.teacherComment || ''}
                      onChange={(e) => updateTeacherComment(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 resize-none"
                      rows={2}
                      disabled={teacherApproved || teacherRejected}
                    />
                  </div>

                  {question.teacherComment && (
                    <div className="text-sm text-gray-700 bg-green-50 p-3 rounded border-l-4 border-green-400">
                      <p className="font-semibold text-green-900 mb-1">👨‍🏫 Your Comment:</p>
                      <p>{question.teacherComment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Overall Teacher Feedback */}
          <Card variant="elevated" padding="lg">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare size={20} />
              Overall Teacher Feedback
            </h3>
            <textarea
              placeholder="Add overall feedback for the student..."
              value={overallTeacherComment}
              onChange={(e) => setOverallTeacherComment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
              rows={4}
              disabled={teacherApproved || teacherRejected}
            />
          </Card>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white border-t-4 border-gray-200 p-6 shadow-2xl rounded-t-xl">
            {!teacherApproved && !teacherRejected ? (
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveForLater}
                  variant="outline"
                  leftIcon={<Clock size={18} />}
                  className="flex-1"
                >
                  Save Draft
                </Button>
                <Button
                  onClick={handleReject}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  Reject & Revise
                </Button>
                <Button
                  onClick={handleApprove}
                  variant="primary"
                  leftIcon={<ThumbsUp size={18} />}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Approve & Continue
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setTeacherApproved(false);
                    setTeacherRejected(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Undo
                </Button>
                <Button
                  onClick={handleFinalize}
                  variant="primary"
                  leftIcon={<Save size={18} />}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  Finalize & Save
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
