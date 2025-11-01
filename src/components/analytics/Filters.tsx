// src/components/analytics/Filters.tsx
'use client';

import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface StudentFilterProps {
  students: FilterOption[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  label?: string;
  placeholder?: string;
}

export function StudentFilter({
  students,
  selected,
  onSelect,
  label = 'Student',
  placeholder = 'All Students'
}: StudentFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedStudent = students.find(s => s.value === selected);

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      >
        <span className={selectedStudent ? 'text-gray-900' : 'text-gray-500'}>
          {selectedStudent?.label || placeholder}
        </span>
        <div className="flex items-center gap-2">
          {selected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(null);
                setIsOpen(false);
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X size={14} className="text-gray-600" />
            </button>
          )}
          <ChevronDown size={16} className={`text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            <div className="p-2">
              <button
                onClick={() => {
                  onSelect(null);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left rounded-md hover:bg-gray-100 ${!selected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
              >
                {placeholder}
              </button>
              {students.map(student => (
                <button
                  key={student.value}
                  onClick={() => {
                    onSelect(student.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left rounded-md hover:bg-gray-100 ${selected === student.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                >
                  {student.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface SubjectFilterProps {
  subjects: FilterOption[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  label?: string;
  placeholder?: string;
}

export function SubjectFilter({
  subjects,
  selected,
  onSelect,
  label = 'Subject',
  placeholder = 'All Subjects'
}: SubjectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedSubject = subjects.find(s => s.value === selected);

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      >
        <span className={selectedSubject ? 'text-gray-900' : 'text-gray-500'}>
          {selectedSubject?.label || placeholder}
        </span>
        <div className="flex items-center gap-2">
          {selected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(null);
                setIsOpen(false);
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X size={14} className="text-gray-600" />
            </button>
          )}
          <ChevronDown size={16} className={`text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            <div className="p-2">
              <button
                onClick={() => {
                  onSelect(null);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left rounded-md hover:bg-gray-100 ${!selected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
              >
                {placeholder}
              </button>
              {subjects.map(subject => (
                <button
                  key={subject.value}
                  onClick={() => {
                    onSelect(subject.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left rounded-md hover:bg-gray-100 ${selected === subject.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                >
                  {subject.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface DateRangeFilterProps {
  selected: '7' | '30' | '90';
  onSelect: (value: '7' | '30' | '90') => void;
  label?: string;
}

export function DateRangeFilter({
  selected,
  onSelect,
  label = 'Date Range'
}: DateRangeFilterProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => onSelect('7')}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            selected === '7'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
          }`}
        >
          7 Days
        </button>
        <button
          onClick={() => onSelect('30')}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            selected === '30'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
          }`}
        >
          30 Days
        </button>
        <button
          onClick={() => onSelect('90')}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            selected === '90'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
          }`}
        >
          90 Days
        </button>
      </div>
    </div>
  );
}

interface ClassFilterProps {
  classes: FilterOption[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  label?: string;
  placeholder?: string;
}

export function ClassFilter({
  classes,
  selected,
  onSelect,
  label = 'Class/Section',
  placeholder = 'All Classes'
}: ClassFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedClass = classes.find(c => c.value === selected);

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      >
        <span className={selectedClass ? 'text-gray-900' : 'text-gray-500'}>
          {selectedClass?.label || placeholder}
        </span>
        <div className="flex items-center gap-2">
          {selected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(null);
                setIsOpen(false);
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X size={14} className="text-gray-600" />
            </button>
          )}
          <ChevronDown size={16} className={`text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            <div className="p-2">
              <button
                onClick={() => {
                  onSelect(null);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left rounded-md hover:bg-gray-100 ${!selected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
              >
                {placeholder}
              </button>
              {classes.map(cls => (
                <button
                  key={cls.value}
                  onClick={() => {
                    onSelect(cls.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left rounded-md hover:bg-gray-100 ${selected === cls.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                >
                  {cls.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
