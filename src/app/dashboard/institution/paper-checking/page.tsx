// src/app/dashboard/institution/paper-checking/page.tsx

'use client';

import AutoPaperChecker from "@/components/dashboard/institution/AutoPaperChecker";
import BulkPaperChecker from "@/components/dashboard/institution/BulkPaperChecker";
import { useState } from "react";
import { BookOpen, Upload } from "lucide-react";

export default function PaperCheckingPage() {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
  {/* Page Header */}
  <div className="mb-8  text-center">
    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Paper Checking</h1>
  </div>

  {/* Tabs - Full Width, Aligned */}
  <div className="flex flex-col sm:flex-row gap-1 mb-8 bg-gray-100 rounded-lg p-1 w-full">
    <button
      type="button"
      className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition ${
        activeTab === 'single'
          ? 'bg-white text-emerald-700 shadow-sm'
          : 'text-gray-700 hover:bg-gray-200'
      }`}
      onClick={() => setActiveTab('single')}
      aria-pressed={activeTab === 'single'}
    >
      <BookOpen size={18} />
      Single Evaluation
    </button>

    <button
      type="button"
      className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition ${
        activeTab === 'bulk'
          ? 'bg-white text-emerald-700 shadow-sm'
          : 'text-gray-700 hover:bg-gray-200'
      }`}
      onClick={() => setActiveTab('bulk')}
      aria-pressed={activeTab === 'bulk'}
    >
      <Upload size={18} />
      Bulk Evaluation
    </button>
  </div>

  {/* Tab Content */}
<div className="animate-fade-in">
  {activeTab === 'single' ? (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <AutoPaperChecker />
      </div>
    </div>
  ) : (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6">
        <BulkPaperChecker />
      </div>
    </div>
  )}
</div>
</div>
  );
}
