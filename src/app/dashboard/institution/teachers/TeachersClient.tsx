'use client';

import { useMemo, useState, useEffect } from 'react';
import { db } from '@/lib/firebase.client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import { GraduationCap, Search, Download, Upload, PlusCircle, ChevronRight, Award, Mail, Calendar, BookOpen, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';

interface TeacherData {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  institutionId?: string;
  subjects?: string[];
  assignedClasses?: string[];
  yearsOfExperience?: number;
  joiningDate?: string;
  createdAt?: any;
}

export function TeachersClient({ institutionId }: { institutionId: string }) {
  const [search, setSearch] = useState('');
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTeachers = async () => {
      if (!institutionId) {
        logger.error('[TeachersClient] No institutionId provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const teachersQuery = query(
          collection(db, 'users'),
          where('institutionId', '==', institutionId),
          where('role', '==', 'teacher')
        );
        const teachersSnapshot = await getDocs(teachersQuery);
        const teachersData = teachersSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as TeacherData[];
        setTeachers(teachersData);
      } catch (error) {
        logger.error('[TeachersClient] Error fetching teachers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, [institutionId]);

  const filteredTeachers = useMemo(() =>
    teachers.filter(t =>
      t.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase())
    ),
    [search, teachers]
  );

  const topTeachers = useMemo(() =>
    [...filteredTeachers]
      .sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0))
      .slice(0, 3),
    [filteredTeachers]
  );

  // Calculate stats per teacher
  const teachersWithStats = useMemo(() =>
    filteredTeachers.map(teacher => {
      const classCount = teacher.assignedClasses?.length || 0;
      const subjectNames = teacher.subjects || [];

      return {
        ...teacher,
        classCount,
        subjectNames,
      };
    }),
    [filteredTeachers]
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
            <GraduationCap size={28} />
            Teachers
          </h1>
          <p className="text-gray-600">Manage and view all teaching staff</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center">
            <Search size={20} className="text-gray-400 absolute left-2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search teachers..."
              className="pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          <Button variant="outline" leftIcon={<PlusCircle size={20} />} onClick={() => router.push('/dashboard/institution/teachers/add')}>
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

      {/* Most Experienced Teachers */}
      {topTeachers.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Most Experienced Teachers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {topTeachers.map(teacher => (
              <div key={teacher.uid} className="bg-purple-50 rounded-lg p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="h-12 w-12 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center text-lg">
                  {teacher.displayName?.[0] || 'T'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{teacher.displayName}</p>
                  <p className="text-sm text-gray-700">{teacher.subjects?.length || 0} subjects</p>
                  <p className="text-sm text-gray-600">{teacher.yearsOfExperience || 0} years exp.</p>
                </div>
                <Award className="text-yellow-500" size={24} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Full Teacher List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">All Teachers ({teachersWithStats.length})</h2>
        {teachersWithStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 font-medium border-b border-gray-300">Name</th>
                  <th className="p-3 font-medium border-b border-gray-300">Email</th>
                  <th className="p-3 font-medium border-b border-gray-300">Subjects</th>
                  <th className="p-3 font-medium border-b border-gray-300">Classes</th>
                  <th className="p-3 font-medium border-b border-gray-300">Experience</th>
                  <th className="p-3 font-medium border-b border-gray-300">Joined</th>
                  <th className="p-3 font-medium border-b border-gray-300"></th>
                </tr>
              </thead>
              <tbody>
                {teachersWithStats.map(teacher => (
                  <tr
                    key={teacher.uid}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/dashboard/institution/teachers/${teacher.uid}`)}
                  >
                    <td className="p-3 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white font-bold flex items-center justify-center text-sm">
                          {teacher.displayName?.[0] || 'T'}
                        </div>
                        <span className="font-medium">{teacher.displayName}</span>
                      </div>
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} />
                        {teacher.email}
                      </div>
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-blue-600" />
                        <span className="text-sm">{teacher.subjectNames.length > 0 ? teacher.subjectNames.join(', ') : 'No subjects assigned'}</span>
                      </div>
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {teacher.classCount} classes
                      </span>
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <span className="text-sm">{teacher.yearsOfExperience || 0} years</span>
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} />
                        {teacher.joiningDate
                          ? new Date(teacher.joiningDate).toLocaleDateString()
                          : teacher.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'
                        }
                      </div>
                    </td>
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
            <GraduationCap size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No teachers found</p>
            <p className="text-sm mt-2">
              {search ? 'Try adjusting your search query' : 'Add teachers to get started'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
