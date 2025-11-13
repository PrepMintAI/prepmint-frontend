'use client';

import { useMemo, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import { Users, Search, Download, Upload, PlusCircle, ChevronRight, Star, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  institutionId?: string;
  class?: string;
  section?: string;
  rollNo?: string;
  xp?: number;
  level?: number;
  performance?: {
    overallPercentage?: number;
    rank?: number;
    attendance?: number;
  };
}

export function StudentsClient({ institutionId }: { institutionId?: string }) {
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStudents = async () => {
      if (!institutionId) {
        logger.error('[StudentsClient] No institutionId provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('institution_id', institutionId)
          .eq('role', 'student');

        if (error) throw error;

        const studentsData = ((data || []) as any[]).map(doc => ({
          uid: doc.id,
          email: doc.email,
          displayName: doc.display_name,
          role: doc.role,
          institutionId: doc.institution_id,
          class: doc.class,
          section: doc.section,
          rollNo: doc.roll_no,
          xp: doc.xp,
          level: doc.level,
          performance: {
            overallPercentage: doc.overall_percentage || 0,
            rank: doc.rank,
            attendance: doc.attendance,
          }
        })) as UserData[];
        setStudents(studentsData);
      } catch (error) {
        logger.error('[StudentsClient] Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [institutionId]);

  const filteredStudents = useMemo(() =>
    students.filter(s =>
      s.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
    ),
    [search, students]
  );

  const topStudents = useMemo(() =>
    [...filteredStudents]
      .sort((a, b) => (b.performance?.overallPercentage || 0) - (a.performance?.overallPercentage || 0))
      .slice(0, 3),
    [filteredStudents]
  );

  // Handlers for import/export
  const handleImport = () => alert('Import feature coming soon!');
  const handleExport = () => alert('Export feature coming soon!');

  if (isLoading) {
    return <Spinner fullScreen />;
  }

  if (!institutionId) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-yellow-500" />
          <p className="text-gray-600 text-lg font-medium">No institution ID found</p>
          <p className="text-gray-500 text-sm mt-2">Please contact support to link your account to an institution</p>
        </div>
      </div>
    );
  }

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
      {topStudents.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Top Students</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {topStudents.map(student => (
              <div
                key={student.uid}
                onClick={() => router.push(`/dashboard/institution/students/${student.uid}`)}
                className="bg-blue-50 rounded-lg p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="h-12 w-12 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-lg">
                  {student.displayName?.[0] || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{student.displayName}</p>
                  <p className="text-sm text-gray-700">
                    {student.class && student.section ? `Class ${student.class}${student.section}` : student.email}
                  </p>
                  <p className="text-sm text-gray-600">Score: {student.performance?.overallPercentage || 0}%</p>
                </div>
                <Star className="text-yellow-500" size={24} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Full Student List Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">All Students ({filteredStudents.length})</h2>
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 font-medium border-b border-gray-300">Name</th>
                  <th className="p-3 font-medium border-b border-gray-300">Email</th>
                  <th className="p-3 font-medium border-b border-gray-300">Class</th>
                  <th className="p-3 font-medium border-b border-gray-300">Performance</th>
                  <th className="p-3 font-medium border-b border-gray-300">Attendance</th>
                  <th className="p-3 font-medium border-b border-gray-300">XP</th>
                  <th className="p-3 font-medium border-b border-gray-300"></th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr
                    key={student.uid}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/dashboard/institution/students/${student.uid}`)}
                  >
                    <td className="p-3 border-b border-gray-200">{student.displayName}</td>
                    <td className="p-3 border-b border-gray-200 text-sm text-gray-600">{student.email}</td>
                    <td className="p-3 border-b border-gray-200">
                      {student.class && student.section ? `${student.class}${student.section}` : '-'}
                    </td>
                    <td className="p-3 border-b border-gray-200">{student.performance?.overallPercentage || 0}%</td>
                    <td className="p-3 border-b border-gray-200">{student.performance?.attendance || 0}%</td>
                    <td className="p-3 border-b border-gray-200">{student.xp || 0}</td>
                    <td className="p-3 border-b border-gray-200 text-right text-blue-600">
                      <ChevronRight size={20} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No students found</p>
            <p className="text-sm mt-2">
              {search ? 'Try adjusting your search query' : 'Add students to get started'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
