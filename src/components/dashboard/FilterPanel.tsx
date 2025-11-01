// src/components/dashboard/FilterPanel.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/common/Card';
import { Filter, ChevronDown } from 'lucide-react';

export interface FilterOptions {
  viewLevel: 'school' | 'class' | 'student';
  classFilter: string;
  sectionFilter: string;
  studentId: string;
  subjectFilter: string;
  dateRange: 7 | 30 | 90 | 365;
}

interface FilterPanelProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  availableClasses: string[];
  availableSections: string[];
  availableStudents: { id: string; name: string; rollNo: string; class: string; section: string }[];
  availableSubjects: { id: string; name: string }[];
}

export default function FilterPanel({
  filters,
  onFilterChange,
  availableClasses,
  availableSections,
  availableStudents,
  availableSubjects,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Cascading effect: Reset dependent filters when parent changes
  useEffect(() => {
    if (filters.viewLevel === 'school') {
      onFilterChange({
        ...filters,
        classFilter: 'all',
        sectionFilter: 'all',
        studentId: '',
      });
    } else if (filters.viewLevel === 'class') {
      onFilterChange({
        ...filters,
        studentId: '',
      });
    }
  }, [filters.viewLevel]);

  useEffect(() => {
    if (filters.classFilter === 'all') {
      onFilterChange({
        ...filters,
        sectionFilter: 'all',
        studentId: '',
      });
    }
  }, [filters.classFilter]);

  useEffect(() => {
    if (filters.sectionFilter === 'all') {
      onFilterChange({
        ...filters,
        studentId: '',
      });
    }
  }, [filters.sectionFilter]);

  // Filter students based on selected class and section
  const filteredStudents = availableStudents.filter(student => {
    if (filters.classFilter !== 'all' && student.class !== filters.classFilter) return false;
    if (filters.sectionFilter !== 'all' && student.section !== filters.sectionFilter) return false;
    return true;
  });

  return (
    <Card variant="elevated" padding="lg" className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Analytics Filters</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ChevronDown
            size={20}
            className={`text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* View Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View Level
            </label>
            <select
              value={filters.viewLevel}
              onChange={(e) => onFilterChange({ ...filters, viewLevel: e.target.value as FilterOptions['viewLevel'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value="school">School-wide</option>
              <option value="class">Class Level</option>
              <option value="student">Student Level</option>
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <select
              value={filters.classFilter}
              onChange={(e) => onFilterChange({ ...filters, classFilter: e.target.value })}
              disabled={filters.viewLevel === 'school'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="all">All Classes</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <select
              value={filters.sectionFilter}
              onChange={(e) => onFilterChange({ ...filters, sectionFilter: e.target.value })}
              disabled={filters.viewLevel === 'school' || filters.classFilter === 'all'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="all">All Sections</option>
              {availableSections.map((section) => (
                <option key={section} value={section}>
                  Section {section}
                </option>
              ))}
            </select>
          </div>

          {/* Student Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student
            </label>
            <select
              value={filters.studentId}
              onChange={(e) => onFilterChange({ ...filters, studentId: e.target.value })}
              disabled={filters.viewLevel !== 'student' || filters.sectionFilter === 'all'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select Student</option>
              {filteredStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.rollNo})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={filters.subjectFilter}
              onChange={(e) => onFilterChange({ ...filters, subjectFilter: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value="all">All Subjects</option>
              {availableSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => onFilterChange({ ...filters, dateRange: Number(e.target.value) as FilterOptions['dateRange'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last 365 days</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {filters.viewLevel === 'school' ? 'School-wide' : filters.viewLevel === 'class' ? 'Class Level' : 'Student Level'}
            </span>
            {filters.classFilter !== 'all' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                Class {filters.classFilter}
              </span>
            )}
            {filters.sectionFilter !== 'all' && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Section {filters.sectionFilter}
              </span>
            )}
            {filters.studentId && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                {availableStudents.find(s => s.id === filters.studentId)?.name}
              </span>
            )}
            {filters.subjectFilter !== 'all' && (
              <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
                {availableSubjects.find(s => s.id === filters.subjectFilter)?.name}
              </span>
            )}
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              Last {filters.dateRange} days
            </span>
          </div>
        </div>
      </motion.div>
    </Card>
  );
}
