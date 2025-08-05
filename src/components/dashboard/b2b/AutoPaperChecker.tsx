// src/components/dashboard/b2b/AutoPaperChecker.tsx

'use client';
import React, { useState, useRef } from 'react';
import { FileText, MessageSquare, CheckCircle, XCircle, Loader2, Upload, AlertCircle } from 'lucide-react';

interface EvaluationResult {
  score: number;
  feedback: {
    strengths: string[];
    weaknesses: string[];
  };
  suggestedGrade: string;
  remarks: string;
}

const AutoPaperChecker = () => { 
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [studentAnswer, setStudentAnswer] = useState<string>('');
  const [referenceAnswer, setReferenceAnswer] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        setUploadedFile(file);
        setError(null);
      } else {
        setError('Please upload a PDF or image file (JPG, PNG, or PDF)');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const extractTextFromFile = async (_file: File): Promise<string> => {
    return new Promise((resolve) => {
      // Simulate OCR processing
      setTimeout(() => {
        resolve('Simulated OCR extracted answer text based on the uploaded document.');
      }, 1000);
    });
  };

  const evaluateAnswer = async (_studentText: string, _referenceText: string): Promise<EvaluationResult> => {
    return new Promise((resolve) => {
      // Simulate AI evaluation process
      setTimeout(() => {
        const scores = [60, 70, 80, 90];
        const randomScore = scores[Math.floor(Math.random() * scores.length)] + Math.floor(Math.random() * 10);
        
        const grades = ['A', 'A-', 'B+', 'B'];
        const randomGrade = grades[Math.floor(Math.random() * grades.length)];
        
        resolve({
          score: randomScore,
          feedback: {
            strengths: [
              'Clear understanding of core concepts',
              'Well-structured response with logical flow',
              'Accurate use of technical terms',
            ],
            weaknesses: [
              'Needs more elaboration on examples',
              'Minor grammar and language issues',
              'Conclusion could be stronger',
            ],
          },
          suggestedGrade: randomGrade,
          remarks: 'Solid response overall. Demonstrates good knowledge but could benefit from deeper analysis and more detailed examples.',
        });
      }, 2000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEvaluationResult(null);
    
    if (inputMode === 'file' && !uploadedFile) {
      setError('Please upload a file');
      return;
    }
    
    if (inputMode === 'text' && !studentAnswer.trim()) {
      setError('Please enter the student answer');
      return;
    }
    
    if (!referenceAnswer.trim()) {
      setError('Please enter the reference answer');
      return;
    }
    
    setIsEvaluating(true);
    
    try {
      let answerText = studentAnswer;
      
      if (inputMode === 'file' && uploadedFile) {
        answerText = await extractTextFromFile(uploadedFile);
        setStudentAnswer(answerText);
      }
      
      const result = await evaluateAnswer(answerText, referenceAnswer);
      setEvaluationResult(result);
    } catch (_err) {
      setError('Evaluation failed. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setStudentAnswer('');
    setReferenceAnswer('');
    setEvaluationResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const loadSampleData = () => {
    setStudentAnswer('Photosynthesis is the process by which green plants use sunlight to synthesize nutrients from carbon dioxide and water. It involves the green pigment chlorophyll and generates oxygen as a byproduct.');
    setReferenceAnswer('Photosynthesis is a biological process used by plants, algae, and some bacteria to convert light energy into chemical energy. It occurs in chloroplasts, uses chlorophyll, and produces glucose and oxygen from CO₂ and H₂O. The process has two stages: light-dependent and light-independent reactions.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-6 py-8 text-white rounded-t-2xl">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <FileText size={28} />
          Auto Paper Checker
        </h1>
        <p className="text-emerald-100 mt-2 text-sm md:text-base">
          AI-powered evaluation of student responses against reference answers
        </p>
      </div>
      
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Test Mode Toggle */}
        <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <input
            type="checkbox"
            id="isTestMode"
            checked={isTestMode}
            onChange={() => setIsTestMode((prev) => !prev)}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="isTestMode" className="text-sm font-medium text-gray-700">
            Enable Test Evaluation Mode (Simulated Results)
          </label>
        </div>
        
        {/* Input Mode Tabs */}
        <div className="flex rounded-lg border border-gray-300 overflow-hidden bg-gray-50">
          <button
            className={`flex-1 py-3 px-4 font-medium transition-colors flex items-center justify-center gap-2 ${
              inputMode === 'file'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setInputMode('file')}
            type="button"
          >
            <Upload size={16} />
            Upload File
          </button>
          <button
            className={`flex-1 py-3 px-4 font-medium transition-colors flex items-center justify-center gap-2 ${
              inputMode === 'text'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setInputMode('text')}
            type="button"
          >
            <MessageSquare size={16} />
            Type Answer
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          {inputMode === 'file' && (
            <div>
              <label className="block font-semibold text-gray-800 mb-2">Upload Student Response</label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  uploadedFile
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
                  <Upload className="text-gray-500 mb-2" size={32} />
                  <span className="text-gray-600 font-medium">
                    {uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop'}
                  </span>
                  <span className="text-sm text-gray-500 mt-1">PDF or image (JPG, PNG)</span>
                </label>
              </div>
            </div>
          )}
          
          {/* Text Input */}
          {inputMode === 'text' && (
            <div>
              <label className="block font-semibold text-gray-800 mb-2">Student Answer</label>
              <textarea
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-3
                  text-gray-900 placeholder-gray-500
                  focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                  transition-colors duration-200 text-base leading-relaxed"
                placeholder="Paste or type the student's written response here..."
              />
            </div>
          )}
          
          {/* Reference Answer */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block font-semibold text-gray-800">Reference Answer</label>
              <button
                type="button"
                onClick={loadSampleData}
                className="text-emerald-600 hover:text-emerald-800 text-sm font-medium transition"
              >
                Load Sample
              </button>
            </div>
            <textarea
              value={referenceAnswer}
              onChange={(e) => setReferenceAnswer(e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-3
                text-gray-900 placeholder-gray-500
                focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                transition-colors duration-200 text-base leading-relaxed"
              placeholder="Enter the model or expected answer for comparison..."
            />
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={isEvaluating}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-6 rounded-lg font-medium disabled:opacity-70 disabled:cursor-not-allowed transition"
            >
              {isEvaluating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Evaluating...
                </>
              ) : (
                'Evaluate Answer'
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 py-2.5 px-6 rounded-lg font-medium transition"
            >
              Reset
            </button>
          </div>
        </form>
        
        {/* Evaluation Result */}
        {evaluationResult && (
          <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle size={24} className="text-emerald-600" />
              Evaluation Result
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-2xl font-bold text-emerald-600 mb-1">{evaluationResult.score}/100</p>
                <p className="text-gray-600 text-sm font-medium">Final Score</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-2xl font-bold text-teal-600 mb-1">{evaluationResult.suggestedGrade}</p>
                <p className="text-gray-600 text-sm font-medium">Suggested Grade</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-gray-700 leading-snug">{evaluationResult.remarks}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-green-800 mb-3 flex items-center gap-1">
                  <CheckCircle size={16} className="text-green-600" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {evaluationResult.feedback.strengths.map((s, i) => (
                    <li key={`s-${i}`} className="text-gray-700 text-sm flex items-start gap-2">
                      <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-red-800 mb-3 flex items-center gap-1">
                  <XCircle size={16} className="text-red-600" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {evaluationResult.feedback.weaknesses.map((w, i) => (
                    <li key={`w-${i}`} className="text-gray-700 text-sm flex items-start gap-2">
                      <XCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoPaperChecker;