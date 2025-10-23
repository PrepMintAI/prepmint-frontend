// src/app/students/StudentsClient.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { 
  Users, Search, Filter, Download, Mail, 
  TrendingUp, Award, Clock, ChevronRight,
  MoreVertical, Eye, MessageSquare
} from 'lucide-react';

interface StudentsClientProps {
  userId: string;
  userRole: string;
}

// Mock student data
const mockStudents = [
  { 
    id: 1, 
    name: 'Aarav Sharma', 
    rollNo: '10A-23',
    email: 'aarav@example.com',
    class: 'Class 10-A',
    avgScore: 87,
    testsCompleted: 15,
    lastActive: '2 hours ago',
    status: 'active',
    avatar: '🦁'
  },
  { 
    id: 2, 
    name: 'Priya Patel', 
    rollNo: '10B-15',
    email: 'priya@example.com',
    class: 'Class 10-B',
    avgScore: 92,
    testsCompleted: 18,
    lastActive: '1 hour ago',
    status: 'active',
    avatar: '🦄'
  },
  { 
    id: 3, 
    name: 'Rohan Kumar', 
    rollNo: '11A-08',
    email: 'rohan@example.com',
    class: 'Class 11-A',
    avgScore: 78,
    testsCompleted: 12,
    lastActive: '3 days ago',
    status: 'inactive',
    avatar: '🚀'
  },
];

export function StudentsClient({ userId, userRole }: StudentsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = filterClass === 'all' || student.class === filterClass;
    
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-600 mt-1">Manage and monitor student progress</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" leftIcon={<Download size={18} />}>
              Export
            </Button>
            <Button variant="outline" leftIcon={<Mail size={18} />}>
              Send Message
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card variant="elevated" padding="lg" className="text-center">
          <Users className="mx-auto mb-2 text-blue-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{mockStudents.length}</p>
          <p className="text-sm text-gray-600">Total Students</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <TrendingUp className="mx-auto mb-2 text-green-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">87%</p>
          <p className="text-sm text-gray-600">Avg Performance</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <Award className="mx-auto mb-2 text-yellow-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">{mockStudents.filter(s => s.status === 'active').length}</p>
          <p className="text-sm text-gray-600">Active Students</p>
        </Card>

        <Card variant="elevated" padding="lg" className="text-center">
          <Clock className="mx-auto mb-2 text-purple-600" size={24} />
          <p className="text-2xl font-bold text-gray-900">15</p>
          <p className="text-sm text-gray-600">Avg Tests/Student</p>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="elevated" padding="lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, roll number, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            >
              <option value="all">All Classes</option>
              <option value="Class 10-A">Class 10-A</option>
              <option value="Class 10-B">Class 10-B</option>
              <option value="Class 11-A">Class 11-A</option>
              <option value="Class 11-B">Class 11-B</option>
            </select>
          </div>
        </Card>
      </motion.div>

      {/* Students Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="elevated" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Class</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Avg Score</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Tests</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Last Active</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">
                          {student.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.rollNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.class}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-semibold ${
                        student.avgScore >= 85 ? 'text-green-600' : 
                        student.avgScore >= 70 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {student.avgScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">{student.testsCompleted}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.lastActive}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        student.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="View Profile">
                          <Eye size={16} className="text-gray-600" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Send Message">
                          <MessageSquare size={16} className="text-gray-600" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="More">
                          <MoreVertical size={16} className="text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">No students found matching your criteria</p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
