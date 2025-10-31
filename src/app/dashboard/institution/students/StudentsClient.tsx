'use client';

import { useMemo, useState } from 'react';
import { getStudentsByInstitution } from '@/lib/comprehensiveMockData';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { Users, Search, Download, Upload, PlusCircle, Filter, ChevronRight, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function StudentsClient({ institutionId }: { institutionId: string }) {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const students = useMemo(() => 
    getStudentsByInstitution(institutionId)
      .filter(s => s.name.toLowerCase().includes(search.toLowerCase())),
    [search, institutionId]
  );

  const topStudents = useMemo(() => 
    [...students].sort((a, b) => b.performance.overallPercentage - a.performance.overallPercentage).slice(0, 3),
    [students]
  );

  // Handlers for import/export
  const handleImport = () => alert('Import feature coming soon!');
  const handleExport = () => alert('Export feature coming soon!');

  return (
    <div className="space-y-8">
      {/* Header, Search and Actions */}
      <div className="flex flex-wrap md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Users size={28} />
            Students
          </h1>
          <p className="text-gray-600">Manage and view all enrolled students</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center">
            <Search size={20} className="text-gray-400 absolute left-2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search students..."
              className="pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          <Button variant="outline" leftIcon={<PlusCircle size={20} />} onClick={() => router.push('/dashboard/institution/students/add')}>
            Add New
          </Button>
          <Button variant="outline" leftIcon={<Upload size={20} />} onClick={handleImport}>
            Import
          </Button>
          <Button variant="outline" leftIcon={<Download size={20} />} onClick={handleExport}>
            Export
          </Button>
        </div>
      </div>

      {/* Top Performers */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Top Students</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {topStudents.map(student => (
            <div key={student.id} className="bg-blue-50 rounded-lg p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="h-12 w-12 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-lg">
                {student.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{student.name}</p>
                <p className="text-sm text-gray-700">Class {student.class}{student.section}</p>
                <p className="text-sm text-gray-600">Score: {student.performance.overallPercentage}%</p>
              </div>
              <Star className="text-yellow-500" size={24} />
            </div>
          ))}
        </div>
      </Card>

      {/* Full Student List Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">All Students ({students.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 font-medium border-b border-gray-300">Name</th>
                <th className="p-3 font-medium border-b border-gray-300">Class</th>
                <th className="p-3 font-medium border-b border-gray-300">Roll No</th>
                <th className="p-3 font-medium border-b border-gray-300">Performance</th>
                <th className="p-3 font-medium border-b border-gray-300">Attendance</th>
                <th className="p-3 font-medium border-b border-gray-300">XP</th>
                <th className="p-3 font-medium border-b border-gray-300"></th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr
                  key={student.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/institution/students/${student.id}`)}
                >
                  <td className="p-3 border-b border-gray-200">{student.name}</td>
                  <td className="p-3 border-b border-gray-200">{student.class}{student.section}</td>
                  <td className="p-3 border-b border-gray-200">{student.rollNo}</td>
                  <td className="p-3 border-b border-gray-200">{student.performance.overallPercentage}%</td>
                  <td className="p-3 border-b border-gray-200">{student.performance.attendance}%</td>
                  <td className="p-3 border-b border-gray-200">{student.performance.xp}</td>
                  <td className="p-3 border-b border-gray-200 text-right text-blue-600">
                    <ChevronRight size={20} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
