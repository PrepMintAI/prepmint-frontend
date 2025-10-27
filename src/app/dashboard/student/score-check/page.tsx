// src/app/dashboard/student/score-check/page.tsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle, Zap, Camera, FileImage, X, Sparkles } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export default function ScoreCheckPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis (replace with actual API call)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setResult({
      score: 87,
      totalMarks: 100,
      correctAnswers: 87,
      incorrectAnswers: 10,
      skipped: 3,
      xpEarned: 50,
      feedback: [
        { question: 1, status: 'correct', points: 5 },
        { question: 2, status: 'incorrect', points: 0, correction: 'The correct answer is B' },
        { question: 3, status: 'correct', points: 5 },
      ]
    });
    
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setUploadedFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <Zap className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Get Your Score! ⚡
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Upload your answer sheet and get instant AI-powered feedback
            </p>
          </motion.div>

          {!result ? (
            <>
              {/* Upload Area */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card variant="elevated" padding="none">
                  <div
                    {...getRootProps()}
                    className={`p-12 border-4 border-dashed rounded-xl transition-all cursor-pointer ${
                      isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : preview
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    
                    {!preview ? (
                      <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full">
                          <Upload size={40} className="text-blue-600" />
                        </div>
                        
                        <div>
                          <p className="text-xl font-semibold text-gray-900">
                            {isDragActive ? 'Drop it here! 🎯' : 'Drop your answer sheet here'}
                          </p>
                          <p className="text-gray-600 mt-2">
                            or click to browse your files
                          </p>
                        </div>

                        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <FileImage size={18} />
                            <span>JPG, PNG</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Camera size={18} />
                            <span>PDF</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="text-green-500" size={24} />
                            <div>
                              <p className="font-semibold text-gray-900">{uploadedFile?.name}</p>
                              <p className="text-sm text-gray-600">
                                {(uploadedFile!.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReset();
                            }}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>

                        {preview && uploadedFile?.type.startsWith('image/') && (
                          <img
                            src={preview}
                            alt="Preview"
                            className="max-h-64 mx-auto rounded-lg shadow-md"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Action Buttons */}
              {preview && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-center"
                >
                  <Button
                    onClick={handleAnalyze}
                    loading={isAnalyzing}
                    variant="primary"
                    className="px-8 py-3 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    leftIcon={<Sparkles size={20} />}
                  >
                    {isAnalyzing ? 'Analyzing Magic... ✨' : 'Analyze My Paper! 🚀'}
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="px-6 py-3"
                  >
                    Upload Different
                  </Button>
                </motion.div>
              )}

              {/* Info Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <Card variant="gradient" padding="lg" className="text-center">
                  <div className="text-3xl mb-2">⚡</div>
                  <h3 className="font-bold text-gray-900">Instant Results</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Get your score in seconds
                  </p>
                </Card>

                <Card variant="gradient" padding="lg" className="text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="font-bold text-gray-900">AI Feedback</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Detailed answer explanations
                  </p>
                </Card>

                <Card variant="gradient" padding="lg" className="text-center">
                  <div className="text-3xl mb-2">📈</div>
                  <h3 className="font-bold text-gray-900">Track Progress</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    See your improvement over time
                  </p>
                </Card>
              </motion.div>
            </>
          ) : (
            /* Results View */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Score Card */}
              <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">Your Score is Ready! 🎉</h2>
                  <div className="text-7xl font-bold">
                    {result.score}
                    <span className="text-3xl">/100</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xl">
                    <Sparkles size={24} />
                    <span>+{result.xpEarned} XP Earned!</span>
                  </div>
                </div>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card variant="elevated" padding="lg" className="text-center">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-2xl font-bold text-green-600">{result.correctAnswers}</div>
                  <div className="text-sm text-gray-600">Correct</div>
                </Card>

                <Card variant="elevated" padding="lg" className="text-center">
                  <div className="text-3xl mb-2">❌</div>
                  <div className="text-2xl font-bold text-red-600">{result.incorrectAnswers}</div>
                  <div className="text-sm text-gray-600">Incorrect</div>
                </Card>

                <Card variant="elevated" padding="lg" className="text-center">
                  <div className="text-3xl mb-2">⏭️</div>
                  <div className="text-2xl font-bold text-gray-600">{result.skipped}</div>
                  <div className="text-sm text-gray-600">Skipped</div>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => router.push('/history')}
                  variant="primary"
                >
                  View Detailed Report
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                >
                  Check Another Paper
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
