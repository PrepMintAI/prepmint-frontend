// src/components/dashboard/b2b/BulkPaperChecker.tsx
'use client';

import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Trash2,
} from 'lucide-react';

interface EvaluationResult {
  studentName: string;
  score: number;
  suggestedGrade: string;
  remarks: string;
}

const BulkPaperChecker = () => {
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [answerSheets, setAnswerSheets] = useState<File[]>([]);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'results'>('upload');
  const qpInputRef = useRef<HTMLInputElement>(null);
  const asInputRef = useRef<HTMLInputElement>(null);

  const handleQPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setQuestionPaper(file);
        setError(null);
      } else {
        setError('Question paper must be a PDF file.');
      }
    }
  };

  const handleASChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles = Array.from(files).filter(
        (file) => file.type === 'application/pdf' || file.type.startsWith('image/')
      );
      if (validFiles.length !== files.length) {
        setError('Some files were skipped. Only PDF and images are allowed.');
      }
      setAnswerSheets((prev) => [...prev, ...validFiles]);
    }
  };

  const removeAnswerSheet = (index: number) => {
    setAnswerSheets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setQuestionPaper(null);
    setAnswerSheets([]);
    setResults([]);
    setError(null);
    setActiveTab('upload');
    if (qpInputRef.current) qpInputRef.current.value = '';
    if (asInputRef.current) asInputRef.current.value = '';
  };

  const extractTextFromFiles = async (files: File[]): Promise<string[]> => {
    return new Promise((resolve) =>
      setTimeout(
        () =>
          files.map((file, i) => `Extracted text from ${file.name}. Student performed well on Q1 and Q3.`),
        1500
      )
    );
  };

  const evaluateBulkAnswers = async (
    extractedAnswers: string[],
    qpText: string
  ): Promise<EvaluationResult[]> => {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(
          answerSheets.map((file, i) => {
            const score = Math.floor(Math.random() * 40) + 60;
            const grade = ['A', 'A-', 'B+', 'B', 'C+'][Math.floor(Math.random() * 5)];
            return {
              studentName: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
              score,
              suggestedGrade: grade,
              remarks:
                score > 75
                  ? 'Strong understanding of concepts. Minor improvements needed in explanation clarity.'
                  : 'Meets expectations. Focus on deeper analysis and structured responses.',
            };
          })
        );
      }, 2500)
    );
  };

  const handleEvaluate = async () => {
    setError(null);
    if (!questionPaper) return setError('Please upload the question paper.');
    if (answerSheets.length === 0) return setError('Please upload at least one answer sheet.');

    setIsEvaluating(true);
    setResults([]);

    try {
      const extractedAnswers = await extractTextFromFiles(answerSheets);
      const qpText = 'Simulated question paper content with expected answers...';
      const evaluationResults = await evaluateBulkAnswers(extractedAnswers, qpText);
      setResults(evaluationResults);
      setActiveTab('results');
    } catch (err: any) {
      setError(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const exportResults = () => {
    const headers = ['Student Name', 'Score', 'Grade', 'Remarks'];
    const csvContent =
      [headers.join(','), ...results.map((r) => `"${r.studentName}",${r.score},${r.suggestedGrade},"${r.remarks}"`)]
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `evaluation-results-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-6 py-8 text-white rounded-t-2xl">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <FileText size={28} />
          Bulk Answer Sheet Evaluator
        </h1>
        <p className="text-emerald-100 mt-2 text-sm md:text-base">
          Upload one question paper and multiple student answer sheets for AI-powered batch evaluation
        </p>
      </div>

      <div className="p-6">
        {activeTab === 'upload' ? (
          <div className="space-y-6">
            {/* Question Paper Upload */}
            <div>
              <label className="block font-semibold text-gray-800 mb-2">Upload Question Paper (PDF)</label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  questionPaper
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  ref={qpInputRef}
                  onChange={handleQPChange}
                  className="hidden"
                  id="qp-upload"
                />
                <label htmlFor="qp-upload" className="flex flex-col items-center cursor-pointer">
                  <Upload className="text-gray-500 mb-2" size={32} />
                  <span className="text-gray-600 font-medium">
                    {questionPaper ? questionPaper.name : 'Click to upload question paper'}
                  </span>
                  <span className="text-sm text-gray-500 mt-1">PDF only</span>
                </label>
              </div>
            </div>

            {/* Answer Sheets Upload */}
            <div>
              <label className="block font-semibold text-gray-800 mb-2">
                Upload Student Answer Sheets (PDF/Images)
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  answerSheets.length > 0
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  ref={asInputRef}
                  onChange={handleASChange}
                  className="hidden"
                  id="as-upload"
                  multiple
                />
                <label htmlFor="as-upload" className="flex flex-col items-center cursor-pointer">
                  <Upload className="text-gray-500 mb-2" size={32} />
                  <span className="text-gray-600 font-medium">
                    {answerSheets.length > 0
                      ? `${answerSheets.length} files added`
                      : 'Click to upload or drag and drop'}
                  </span>
                  <span className="text-sm text-gray-500 mt-1">PDF, JPG, PNG (Multiple allowed)</span>
                </label>
              </div>

              {answerSheets.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {answerSheets.map((file, i) => (
                    <li key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                      <span className="text-gray-800">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAnswerSheet(i)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-4">
              <button
                type="button"
                disabled={isEvaluating || !questionPaper || answerSheets.length === 0}
                onClick={handleEvaluate}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2.5 px-6 rounded-lg font-medium transition"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Evaluate All Answer Sheets'
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
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Evaluation Results</h2>
              <button
                onClick={exportResults}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
              >
                <Download size={16} />
                Export as CSV
              </button>
            </div>

            {results.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Student Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Score</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Grade</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {results.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800">{r.studentName}</td>
                        <td className="px-4 py-3 text-sm text-emerald-600 font-medium">{r.score}/100</td>
                        <td className="px-4 py-3 text-sm text-teal-600 font-semibold">{r.suggestedGrade}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{r.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No results to display.</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('upload')}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg text-sm"
              >
                Back to Upload
              </button>
              <button
                onClick={handleReset}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg text-sm"
              >
                Evaluate New Batch
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BulkPaperChecker;