// src/app/dashboard/admin/students/StudentsManagementClient.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, AlertCircle } from 'lucide-react';
import { where } from 'firebase/firestore';
import TableManager, { ColumnDef } from '@/components/admin/TableManager';
import UserFormModal, { UserFormData } from '@/components/admin/UserFormModal';
import { useFirestoreCRUD, FirestoreDocument } from '@/hooks/useFirestoreCRUD';
import { logger } from '@/lib/logger';
import { useAuth } from '@/context/AuthContext';

interface StudentDocument extends FirestoreDocument {
  email: string;
  displayName: string;
  role: 'student';
  xp?: number;
  level?: number;
  institutionId?: string;
  streak?: number;
  badges?: string[];
  createdAt: any;
}

export default function StudentsManagementClient() {
  const { user, loading: authLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentDocument | null>(null);

  const {
    documents: students,
    loading,
    error,
    hasMore,
    updateDocument,
    deleteDocument,
    bulkDelete,
    loadMore,
    refresh,
    search,
  } = useFirestoreCRUD<StudentDocument>({
    collectionName: 'users',
    pageSize: 20,
    orderByField: 'xp',
    orderDirection: 'desc',
    realtime: true,
    filters: [where('role', '==', 'student')],
  });

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if current user is admin or dev
  if (user?.role !== 'admin' && user?.role !== 'dev') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-red-900">Access Denied</h3>
            <p className="text-sm text-red-700 mt-1">
              You don&apos;t have permission to access this page. Current role: {user?.role || 'none'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const columns: ColumnDef<StudentDocument>[] = [
    {
      key: 'displayName',
      label: 'Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value || '-'}</div>
          <div className="text-xs text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'xp',
      label: 'XP',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              style={{ width: `${Math.min((Number(value) / 1000) * 100, 100)}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-900">{value || 0}</span>
        </div>
      ),
    },
    {
      key: 'level',
      label: 'Level',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
          Lv {value || 1}
        </span>
      ),
    },
    {
      key: 'streak',
      label: 'Streak',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-medium text-orange-600">{value || 0} 🔥</span>
      ),
    },
    {
      key: 'badges',
      label: 'Badges',
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">
          {Array.isArray(value) ? value.length : 0}
        </span>
      ),
    },
    {
      key: 'institutionId',
      label: 'Institution',
      render: (value) => (
        <span className="text-sm text-gray-600">{value || 'Individual'}</span>
      ),
    },
  ];

  const handleEdit = (row: StudentDocument) => {
    setEditingStudent(row);
    setIsModalOpen(true);
  };

  const handleDelete = async (row: StudentDocument) => {
    if (!confirm(`Are you sure you want to delete ${row.displayName}?`)) return;

    try {
      await deleteDocument(row.id);

      // Also delete from Firebase Auth
      await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteAuth',
          data: { userId: row.id },
        }),
      });

      logger.log('Student deleted:', row.id);
    } catch (err) {
      logger.error('Error deleting student:', err);
      alert('Failed to delete student');
    }
  };

  const handleSubmit = async (data: UserFormData) => {
    try {
      if (editingStudent) {
        const updateData: any = {
          displayName: data.displayName,
        };

        // Only include institutionId if it has a value
        if (data.institutionId) {
          updateData.institutionId = data.institutionId;
        }

        await updateDocument(editingStudent.id, updateData);
      } else {
        // Create new student via API
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            data: { ...data, role: 'student' },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create student');
        }

        await refresh();
      }
    } catch (err) {
      logger.error('Error saving student:', err);
      throw err;
    }
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'XP', 'Level', 'Streak', 'Badges', 'Institution', 'Created'],
      ...students.map((s) => [
        s.displayName,
        s.email,
        s.xp || 0,
        s.level || 1,
        s.streak || 0,
        s.badges?.length || 0,
        s.institutionId || '',
        s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString() : '',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg p-6">
          <div className="flex items-center gap-3">
            <GraduationCap size={32} />
            <div>
              <h1 className="text-2xl font-bold">Student Management</h1>
              <p className="text-blue-100">Manage students, XP, and progress</p>
            </div>
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
        {[
          { label: 'Total Students', value: students.length },
          { label: 'Avg XP', value: Math.round(students.reduce((sum, s) => sum + (s.xp || 0), 0) / students.length || 0) },
          { label: 'Active Streaks', value: students.filter((s) => (s.streak || 0) > 0).length },
          { label: 'Total Badges', value: students.reduce((sum, s) => sum + (s.badges?.length || 0), 0) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
          >
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <TableManager
          title="Students"
          data={students}
          columns={columns}
          loading={loading}
          error={error}
          searchPlaceholder="Search students..."
          onAdd={() => {
            setEditingStudent(null);
            setIsModalOpen(true);
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBulkDelete={bulkDelete}
          onExport={handleExport}
          onRefresh={refresh}
          onSearch={(term) => search(term, ['displayName', 'email'])}
          onRowClick={handleEdit}
          hasMore={hasMore}
          onLoadMore={loadMore}
          enableImport={false}
        />
      </motion.div>

      {/* Form Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingStudent ? { ...editingStudent, role: 'student' } : { role: 'student' }}
        mode={editingStudent ? 'edit' : 'add'}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
      />
    </div>
  );
}
