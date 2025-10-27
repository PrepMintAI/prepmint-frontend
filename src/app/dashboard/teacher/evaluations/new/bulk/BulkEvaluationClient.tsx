// src/app/evaluations/new/bulk/BulkEvaluationClient.tsx (COMPLETE VERSION)
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { 
  Upload, FileText, Users, CheckCircle, X,
  AlertCircle, Zap, ArrowRight, Info, Sparkles,
  FileImage, BookOpen, Calendar, Edit3, Save,
  ThumbsUp, Clock, Eye
} from 'lucide-react';

interface BulkEvaluationClientProps {
  userId: string;
}

interface UploadedFile {
  file: File;
  preview?: string;
  type: 'question' | 'answer';
  studentName?: string;
  rollNo?: string;
}

interface AIEvaluation {
  studentName: string;
  rollNo: string;
  score: number;
  totalMarks: number;
  breakdown: {
    question: number;
    marks: number;
    total: number;
    aiComment: string;
    teacherComment?: string;
    teacherAdjustedMarks?: number;
  }[];
  aiSuggestions: string[];
  teacherReviewed: boolean;
  teacherApproved: boolean;
  status: 'pending' | 'reviewed' | 'approved' | 'needs-revision';
}

export function BulkEvaluationClient({ userId }: BulkEvaluationClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [evaluationName, setEvaluationName] = useState('');
  const [subject, setSubject] = useState('');
  const [classSection, setClassSection] = useState('');
  const [totalMarks, setTotalMarks] = useState('100');
  const [dueDate, setDueDate] = useState('');
  const [questionPaper, setQuestionPaper] = useState<UploadedFile | null>(null);
  const [answerSheets, setAnswerSheets] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [aiEvaluations, setAiEvaluations] = useState<AIEvaluation[]>([]);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState<number | null>(null);
  const [reviewMode, setReviewMode] = useState<'quick' | 'detailed'>('quick');

  // Question Paper Dropzone
  const onDropQuestion = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setQuestionPaper({
          file,
          preview: reader.result as string,
          type: 'question'
        });
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
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  // Answer Sheets Dropzone
  const onDropAnswers = useCallback((acceptedFiles: File[]) => {
    const newAnswers: UploadedFile[] = acceptedFiles.map((file, index) => ({
      file,
      type: 'answer',
      studentName: `Student ${answerSheets.length + index + 1}`,
      rollNo: `${answerSheets.length + index + 1}`
    }));
    setAnswerSheets([...answerSheets, ...newAnswers]);
  }, [answerSheets]);

  const { 
    getRootProps: getAnswersRootProps, 
    getInputProps: getAnswersInputProps, 
    isDragActive: isAnswersDragActive 
  } = useDropzone({
    onDrop: onDropAnswers,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const removeAnswerSheet = (index: number) => {
    setAnswerSheets(answerSheets.filter((_, i) => i !== index));
  };

  const updateStudentInfo = (index: number, field: 'studentName' | 'rollNo', value: string) => {
    const updated = [...answerSheets];
    updated[index][field] = value;
    setAnswerSheets(updated);
  };

  const handleStartEvaluation = async () => {
    setIsProcessing(true);
    
    // Simulate AI processing
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProcessingProgress(i);
    }

    // Generate mock AI evaluations
    const mockEvaluations: AIEvaluation[] = answerSheets.map((sheet) => ({
      studentName: sheet.studentName!,
      rollNo: sheet.rollNo!,
      score: Math.floor(Math.random() * 20) + 70,
      totalMarks: parseInt(totalMarks),
      breakdown: [
        {
          question: 1,
          marks: 9,
          total: 10,
          aiComment: 'Excellent understanding of the concept. Clear explanation with proper steps.',
        },
        {
          question: 2,
          marks: 8,
          total: 10,
          aiComment: 'Good approach to the problem. Formula applied correctly.',
        },
        {
          question: 3,
          marks: 10,
          total: 10,
          aiComment: 'Perfect answer! Clear, concise, and accurate.',
        },
      ],
      aiSuggestions: [
        'Student shows strong conceptual understanding',
        'Minor issues with calculation accuracy',
        'Presentation could be more structured',
      ],
      teacherReviewed: false,
      teacherApproved: false,
      status: 'pending',
    }));

    setAiEvaluations(mockEvaluations);
    setIsProcessing(false);
    setStep(5);
  };

  const handleApproveAll = () => {
    const updated = aiEvaluations.map(e => ({
      ...e,
      teacherReviewed: true,
      teacherApproved: true,
      status: 'approved' as const
    }));
    setAiEvaluations(updated);
  };

  const handleApproveStudent = (index: number) => {
    const updated = [...aiEvaluations];
    updated[index].teacherReviewed = true;
    updated[index].teacherApproved = true;
    updated[index].status = 'approved';
    setAiEvaluations(updated);
    setSelectedStudentIndex(null);
  };

  const handleReviseStudent = (index: number) => {
    const updated = [...aiEvaluations];
    updated[index].status = 'needs-revision';
    setAiEvaluations(updated);
  };

  const handleSaveForLater = () => {
    router.push('/evaluations?status=draft');
  };

  const handleFinalizeAll = () => {
    const allReviewed = aiEvaluations.every(e => e.teacherReviewed);
    
    if (!allReviewed) {
      if (confirm('Some evaluations are not reviewed. Do you want to finalize anyway?')) {
        router.push('/evaluations/1');
      }
    } else {
      router.push('/evaluations/1');
    }
  };

  const updateTeacherComment = (evalIndex: number, questionIndex: number, comment: string) => {
    const updated = [...aiEvaluations];
    updated[evalIndex].breakdown[questionIndex].teacherComment = comment;
    setAiEvaluations(updated);
  };

  const updateTeacherMarks = (evalIndex: number, questionIndex: number, marks: number) => {
    const updated = [...aiEvaluations];
    updated[evalIndex].breakdown[questionIndex].teacherAdjustedMarks = marks;
    updated[evalIndex].score = updated[evalIndex].breakdown.reduce(
      (sum, q) => sum + (q.teacherAdjustedMarks ?? q.marks), 
      0
    );
    setAiEvaluations(updated);
  };

  const approvedCount = aiEvaluations.filter(e => e.teacherApproved).length;
  const needsRevisionCount = aiEvaluations.filter(e => e.status === 'needs-revision').length;

  const canProceedToStep2 = evaluationName && subject && classSection && totalMarks && dueDate;
  const canProceedToStep3 = questionPaper;
  const canStartEvaluation = answerSheets.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
            <Zap className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Evaluation</h1>
            <p className="text-gray-600">AI-assisted grading with teacher review & approval</p>
          </div>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="elevated" padding="lg">
          <div className="flex items-center justify-between">
            {[
              { num: 1, title: 'Details', icon: Info },
              { num: 2, title: 'Question Paper', icon: FileText },
              { num: 3, title: 'Answer Sheets', icon: Users },
              { num: 4, title: 'AI Process', icon: Sparkles },
              { num: 5, title: 'Teacher Review', icon: ThumbsUp },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s.num 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > s.num ? <CheckCircle size={20} /> : s.num}
                  </div>
                  <p className={`text-xs mt-2 font-medium ${
                    step >= s.num ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {s.title}
                  </p>
                </div>
                {index < 4 && (
                  <div className={`h-1 flex-1 mx-2 rounded ${
                    step > s.num ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* STEP 1: Evaluation Details */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          <Card variant="elevated" padding="lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Evaluation Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evaluation Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={evaluationName}
                  onChange={(e) => setEvaluationName(e.target.value)}
                  placeholder="e.g., Mathematics Midterm Exam"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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
                    Class/Section <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={classSection}
                    onChange={(e) => setClassSection(e.target.value)}
                    placeholder="e.g., Class 10-A"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    placeholder="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                Next: Upload Question Paper
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* STEP 2: Question Paper Upload */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          <Card variant="elevated" padding="lg">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Question Paper</h2>
            <p className="text-gray-600 mb-4">
              Upload the question paper that students answered. Our AI will use this to grade.
            </p>

            {!questionPaper ? (
              <div
                {...getQuestionRootProps()}
                className={`p-12 border-4 border-dashed rounded-xl transition-all cursor-pointer ${
                  isQuestionDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <input {...getQuestionInputProps()} />
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full">
                    <BookOpen size={40} className="text-blue-600" />
                  </div>
                  
                  <div>
                    <p className="text-xl font-semibold text-gray-900">
                      {isQuestionDragActive ? 'Drop it here! 🎯' : 'Upload Question Paper'}
                    </p>
                    <p className="text-gray-600 mt-2">Drag and drop or click to browse</p>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <FileImage size={18} />
                      <span>JPG, PNG, PDF</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-green-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={32} />
                    <div>
                      <p className="font-semibold text-gray-900">{questionPaper.file.name}</p>
                      <p className="text-sm text-gray-600">
                        {(questionPaper.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setQuestionPaper(null)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <Button onClick={() => setStep(1)} variant="outline">← Back</Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!canProceedToStep3}
                variant="primary"
                rightIcon={<ArrowRight size={18} />}
              >
                Next: Upload Answer Sheets
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* STEP 3: Answer Sheets Upload */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="space-y-4"
        >
          <Card variant="elevated" padding="lg">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Answer Sheets</h2>
            <p className="text-gray-600 mb-4">
              Upload multiple answer sheets at once. You can upload up to 50 sheets.
            </p>

            <div
              {...getAnswersRootProps()}
              className={`p-8 border-4 border-dashed rounded-xl transition-all cursor-pointer ${
                isAnswersDragActive
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
              }`}
            >
              <input {...getAnswersInputProps()} />
              <div className="text-center space-y-3">
                <Users size={40} className="mx-auto text-purple-600" />
                <p className="text-lg font-semibold text-gray-900">
                  {isAnswersDragActive ? 'Drop here! 📄' : 'Upload Answer Sheets (Multiple)'}
                </p>
                <p className="text-sm text-gray-600">
                  {answerSheets.length > 0 
                    ? `${answerSheets.length} sheets uploaded. Drop more to add.`
                    : 'Select or drag multiple files at once'}
                </p>
              </div>
            </div>

            {answerSheets.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-gray-900">
                    Uploaded ({answerSheets.length})
                  </p>
                  <Button size="sm" variant="outline" onClick={() => setAnswerSheets([])}>
                    Clear All
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {answerSheets.map((sheet, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                      <FileText size={20} className="text-gray-600" />
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={sheet.studentName}
                          onChange={(e) => updateStudentInfo(index, 'studentName', e.target.value)}
                          placeholder="Student Name"
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                        <input
                          type="text"
                          value={sheet.rollNo}
                          onChange={(e) => updateStudentInfo(index, 'rollNo', e.target.value)}
                          placeholder="Roll No"
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                      <button
                        onClick={() => removeAnswerSheet(index)}
                        className="p-1 rounded hover:bg-red-50 text-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <Button onClick={() => setStep(2)} variant="outline">← Back</Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!canStartEvaluation}
                variant="primary"
                rightIcon={<Sparkles size={18} />}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                Start AI Evaluation
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* STEP 4: AI Processing */}
      {step === 4 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card variant="elevated" padding="lg" className="text-center">
            {!isProcessing ? (
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
                    <Sparkles className="text-white" size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Evaluate!</h2>
                  <p className="text-gray-600">
                    AI will analyze {answerSheets.length} answer sheets
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3 text-left">
                    <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">What will happen:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        <li>AI will read and understand the marking scheme</li>
                        <li>Each answer sheet will be evaluated automatically</li>
                        <li>You'll review and approve before finalizing</li>
                        <li>Results will be saved once you approve</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setStep(3)} variant="outline">← Back</Button>
                  <Button
                    onClick={handleStartEvaluation}
                    variant="primary"
                    leftIcon={<Zap size={18} />}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    Start Evaluation
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-8">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(processingProgress / 100) * 351.86} 351.86`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9333ea" />
                        <stop offset="100%" stopColor="#db2777" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{processingProgress}%</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">AI is Evaluating... ✨</h3>
                <p className="text-gray-600">Processing {answerSheets.length} answer sheets</p>
                <p className="text-sm text-gray-500 mt-2">Please don't close this page.</p>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* NEW STEP 5: Teacher Review & Approval */}
      {step === 5 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Review Mode Selector */}
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Teacher Review & Approval</h2>
                <p className="text-gray-600 text-sm">AI has evaluated {aiEvaluations.length} answer sheets. Please review and approve.</p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setReviewMode('quick')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    reviewMode === 'quick'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Quick Review
                </button>
                <button
                  onClick={() => setReviewMode('detailed')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    reviewMode === 'detailed'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Detailed Review
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{aiEvaluations.length}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                <p className="text-xs text-gray-600">Approved</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600">{aiEvaluations.length - approvedCount - needsRevisionCount}</p>
                <p className="text-xs text-gray-600">Pending</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-600">{needsRevisionCount}</p>
                <p className="text-xs text-gray-600">Needs Revision</p>
              </div>
            </div>

            {/* Info Banner */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">AI has done the heavy lifting! 🎯</p>
                <p>Review the AI's evaluation, make adjustments if needed, and approve. You can:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-blue-800">
                  <li><strong>Approve as-is</strong> if AI evaluation looks good</li>
                  <li><strong>Adjust marks</strong> or add your comments</li>
                  <li><strong>Mark for revision</strong> to review later</li>
                  <li><strong>Bulk approve</strong> if you trust AI's assessment</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button
                onClick={handleApproveAll}
                variant="primary"
                leftIcon={<ThumbsUp size={18} />}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve All ({aiEvaluations.length})
              </Button>
              <Button
                onClick={handleSaveForLater}
                variant="outline"
                leftIcon={<Clock size={18} />}
              >
                Save Draft & Review Later
              </Button>
              <Button
                onClick={handleFinalizeAll}
                variant="primary"
                disabled={approvedCount === 0}
              >
                Finalize & Publish ({approvedCount}/{aiEvaluations.length})
              </Button>
            </div>
          </Card>

                    {/* Student Evaluations List */}
          <div className="space-y-3">
            {aiEvaluations.map((evaluation, index) => (
              <Card key={index} variant="elevated" padding="lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{evaluation.studentName}</h3>
                        <p className="text-sm text-gray-600">Roll No: {evaluation.rollNo}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        evaluation.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                        evaluation.status === 'needs-revision' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }`}>
                        {evaluation.status === 'approved' ? '✓ Approved' :
                         evaluation.status === 'needs-revision' ? '⚠ Needs Revision' :
                         '⏳ Pending Review'}
                      </span>
                    </div>

                    {/* Score Display */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">{evaluation.score}</span>
                        <span className="text-gray-600">/ {evaluation.totalMarks}</span>
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                          style={{ width: `${(evaluation.score / evaluation.totalMarks) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {Math.round((evaluation.score / evaluation.totalMarks) * 100)}%
                      </span>
                    </div>

                    {/* Quick View - AI Summary */}
                    {reviewMode === 'quick' && selectedStudentIndex !== index && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <Sparkles size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900 mb-1">AI Assessment:</p>
                            <ul className="space-y-1">
                              {evaluation.aiSuggestions.map((suggestion, i) => (
                                <li key={i}>• {suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Detailed View - Question Breakdown */}
                    {(reviewMode === 'detailed' || selectedStudentIndex === index) && (
                      <div className="mt-4 space-y-3 border-t pt-4">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <FileText size={16} />
                          Question-wise Breakdown
                        </h4>
                        {evaluation.breakdown.map((question, qIndex) => (
                          <div key={qIndex} className="p-3 bg-gray-50 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">Question {question.question}</span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={question.teacherAdjustedMarks ?? question.marks}
                                  onChange={(e) => updateTeacherMarks(index, qIndex, parseFloat(e.target.value))}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm font-bold text-gray-900"
                                  min="0"
                                  max={question.total}
                                  step="0.5"
                                />
                                <span className="text-sm text-gray-600">/ {question.total}</span>
                              </div>
                            </div>

                            <div className="text-sm text-gray-700 bg-blue-50 p-2 rounded border-l-2 border-blue-400">
                              <p className="font-medium text-blue-900 mb-1">🤖 AI Comment:</p>
                              <p>{question.aiComment}</p>
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add your comment (optional)..."
                                value={question.teacherComment || ''}
                                onChange={(e) => updateTeacherComment(index, qIndex, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                              />
                            </div>

                            {question.teacherComment && (
                              <div className="text-sm text-gray-700 bg-green-50 p-2 rounded border-l-2 border-green-400">
                                <p className="font-medium text-green-900 mb-1">👨‍🏫 Your Comment:</p>
                                <p>{question.teacherComment}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    {!evaluation.teacherApproved ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => setSelectedStudentIndex(selectedStudentIndex === index ? null : index)}
                          variant="outline"
                          leftIcon={<Eye size={16} />}
                        >
                          {selectedStudentIndex === index ? 'Collapse' : 'Details'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApproveStudent(index)}
                          variant="primary"
                          leftIcon={<ThumbsUp size={16} />}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReviseStudent(index)}
                          variant="outline"
                          leftIcon={<Edit3 size={16} />}
                        >
                          Revise
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle size={40} className="text-green-600" />
                        <p className="text-xs font-medium text-green-700">Approved</p>
                        <Button
                          size="sm"
                          onClick={() => {
                            const updated = [...aiEvaluations];
                            updated[index].teacherApproved = false;
                            updated[index].status = 'pending';
                            setAiEvaluations(updated);
                          }}
                          variant="ghost"
                          className="text-xs"
                        >
                          Undo
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Bottom Action Bar - Sticky */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg rounded-t-xl">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-semibold text-gray-900">{approvedCount}</span>
                  <span className="text-gray-600"> of {aiEvaluations.length} approved</span>
                </div>
                {needsRevisionCount > 0 && (
                  <div className="text-sm text-orange-600 font-medium">
                    {needsRevisionCount} marked for revision
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSaveForLater}
                  variant="outline"
                  leftIcon={<Clock size={18} />}
                >
                  Save Draft
                </Button>
                <Button
                  onClick={handleFinalizeAll}
                  variant="primary"
                  disabled={approvedCount === 0}
                  leftIcon={<Save size={18} />}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  Finalize & Publish ({approvedCount}/{aiEvaluations.length})
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

