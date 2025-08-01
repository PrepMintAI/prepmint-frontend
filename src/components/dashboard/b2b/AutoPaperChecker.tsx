// src/components/dashboard/b2b/AutoPaperChecker.tsx
'use client';

import React, { useState, useRef } from 'react';

interface EvaluationResult {
  score: number;
  feedback: {
    strengths: string[];
    weaknesses: string[];
  };
  suggestedGrade: string;
  remarks: string;
}

const AutoPaperChecker: React.FC = () => {
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
        setError('Please upload a PDF or image file');
      }
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    console.log(file.name);
    // Later, you can use `file` to send it to backend OCR
    return new Promise((resolve) =>
      setTimeout(() => resolve('Simulated OCR extracted answer text.'), 1000)
    );
  };

  const evaluateAnswer = async (): Promise<EvaluationResult> => {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve({
          score: Math.floor(Math.random() * 40) + 60,
          feedback: {
            strengths: ['Clear understanding of core concepts', 'Good structure'],
            weaknesses: ['Needs more elaboration on examples', 'Minor language issues'],
          },
          suggestedGrade: 'B+',
          remarks: 'Solid response, but could benefit from deeper technical analysis.',
        });
      }, 2000)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEvaluationResult(null);

    if (inputMode === 'file' && !uploadedFile) return setError('Please upload a file');
    if (inputMode === 'text' && !studentAnswer.trim()) return setError('Please enter the student answer');
    if (!referenceAnswer.trim()) return setError('Please enter the reference answer');

    setIsEvaluating(true);

    try {
      let answerText = studentAnswer;

      if (inputMode === 'file' && uploadedFile) {
        answerText = await extractTextFromFile(uploadedFile);
        setStudentAnswer(answerText);
      }

      const result = await evaluateAnswer();
      setEvaluationResult(result);
    } catch {
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadSampleData = () => {
    setStudentAnswer('Photosynthesis is...');
    setReferenceAnswer('Photosynthesis is a biological process...');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <h1 className="text-2xl font-bold text-white">Auto Paper Checker</h1>
          <p className="text-blue-100 mt-2">Automatically evaluate student responses using AI</p>
        </div>

        <div className="p-6">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="isTestMode"
              checked={isTestMode}
              onChange={() => setIsTestMode((prev) => !prev)}
              className="mr-2"
            />
            <label htmlFor="isTestMode" className="text-sm font-medium text-gray-700">
              Enable Test Evaluation Mode
            </label>
          </div>

          <div className="flex mb-6">
            <button
              className={`flex-1 py-3 px-4 rounded-l-lg font-medium transition-colors ${
                inputMode === 'file' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => setInputMode('file')}
            >
              Upload File
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-r-lg font-medium transition-colors ${
                inputMode === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => setInputMode('text')}
            >
              Type Answer
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {inputMode === 'file' && (
              <div className="mb-6">
                <label className="block font-medium text-gray-700 mb-2">Upload PDF or Image</label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="block w-full"
                />
              </div>
            )}

            {inputMode === 'text' && (
              <div className="mb-6">
                <label className="block font-medium text-gray-700 mb-2">Student Answer</label>
                <textarea
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  rows={6}
                  className="w-full border px-4 py-2 rounded-lg"
                  placeholder="Enter the student's written answer here..."
                />
              </div>
            )}

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700 font-medium">Reference Answer</label>
                <button type="button" onClick={loadSampleData} className="text-blue-600 text-sm font-medium">
                  Load Sample
                </button>
              </div>
              <textarea
                value={referenceAnswer}
                onChange={(e) => setReferenceAnswer(e.target.value)}
                rows={6}
                className="w-full border px-4 py-2 rounded-lg"
                placeholder="Enter reference answer"
              />
            </div>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isEvaluating}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg disabled:opacity-60"
              >
                {isEvaluating ? 'Evaluating...' : 'Evaluate Answer'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="border border-gray-300 text-gray-700 py-2 px-6 rounded-lg"
              >
                Reset
              </button>
            </div>
          </form>

          {evaluationResult && (
            <div className="mt-8 border-t pt-8">
              <h2 className="text-lg font-semibold">Result</h2>
              <p className="text-gray-800 mt-2">Score: {evaluationResult.score}</p>
              <p className="text-gray-800">Grade: {evaluationResult.suggestedGrade}</p>
              <p className="mt-4 text-sm text-gray-600">{evaluationResult.remarks}</p>

              <div className="mt-4">
                <h3 className="font-medium">Strengths</h3>
                <ul className="list-disc list-inside text-green-700">
                  {evaluationResult.feedback.strengths.map((s, i) => (
                    <li key={`s-${i}`}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-2">
                <h3 className="font-medium">Weaknesses</h3>
                <ul className="list-disc list-inside text-red-700">
                  {evaluationResult.feedback.weaknesses.map((w, i) => (
                    <li key={`w-${i}`}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoPaperChecker;
