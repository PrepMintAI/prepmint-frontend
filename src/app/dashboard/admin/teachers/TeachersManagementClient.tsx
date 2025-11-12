// src/app/dashboard/admin/teachers/TeachersManagementClient.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, AlertCircle } from 'lucide-react';
import { where } from 'firebase/firestore';
import TableManager, { ColumnDef } from '@/components/admin/TableManager';
import UserFormModal, { UserFormData } from '@/components/admin/UserFormModal';
import { useFirestoreCRUD, FirestoreDocument } from '@/hooks/useFirestoreCRUD';
import { logger } from '@/lib/logger';
import { useAuth } from '@/context/AuthContext';

interface TeacherDocument extends FirestoreDocument {
  email: string;
  displayName: string;
  role: 'teacher';
  institutionId?: string;
  subjects?: string[];
  yearsOfExperience?: number;
  classes?: string[];
  createdAt: any;
}

export default function TeachersManagementClient() {
  const { user, loading: authLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherDocument | null>(null);

  const {
    documents: teachers,
    loading,
    error,
    hasMore,
    updateDocument,
    deleteDocument,
    bulkDelete,
    loadMore,
    refresh,
    search,
  } = useFirestoreCRUD<TeacherDocument>({
    collectionName: 'users',
    pageSize: 20,
    orderByField: 'createdAt',
    orderDirection: 'desc',
    realtime: true,
    filters: [where('role', '==', 'teacher')],
  });

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
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

  const columns: ColumnDef<TeacherDocument>[] = [
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
      key: 'subjects',
      label: 'Subjects',
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(value) && value.length > 0 ? (
            value.slice(0, 3).map((subject, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
              >
                {subject}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400">No subjects</span>
          )}
          {Array.isArray(value) && value.length > 3 && (
            <span className="text-xs text-gray-500">+{value.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: 'classes',
      label: 'Classes',
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(value) && value.length > 0 ? (
            value.slice(0, 2).map((cls, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs"
              >
                {cls}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400">No classes</span>
          )}
          {Array.isArray(value) && value.length > 2 && (
            <span className="text-xs text-gray-500">+{value.length - 2}</span>
          )}
        </div>
      ),
    },
    {
      key: 'yearsOfExperience',
      label: 'Experience',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">
          {value ? `${value} years` : 'Not set'}
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

  const handleEdit = (row: TeacherDocument) => {
    setEditingTeacher(row);
    setIsModalOpen(true);
  };

  const handleDelete = async (row: TeacherDocument) => {
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

      logger.log('Teacher deleted:', row.id);
    } catch (err) {
      logger.error('Error deleting teacher:', err);
      alert('Failed to delete teacher');
    }
  };

  const handleSubmit = async (data: UserFormData) => {
    try {
      if (editingTeacher) {
        const updateData: any = {
          displayName: data.displayName,
        };

        // Only include institutionId if it has a value
        if (data.institutionId) {
          updateData.institutionId = data.institutionId;
        }

        await updateDocument(editingTeacher.id, updateData);
      } else {
        // Create new teacher via API
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            data: { ...data, role: 'teacher' },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create teacher');
        }

        await refresh();
      }
    } catch (err) {
      logger.error('Error saving teacher:', err);
      throw err;
    }
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Subjects', 'Classes', 'Experience', 'Institution', 'Created'],
      ...teachers.map((t) => [
        t.displayName,
        t.email,
        Array.isArray(t.subjects) ? t.subjects.join('; ') : '',
        Array.isArray(t.classes) ? t.classes.join('; ') : '',
        t.yearsOfExperience || '',
        t.institutionId || '',
        t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString() : '',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teachers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-6">
          <div className="flex items-center gap-3">
            <BookOpen size={32} />
            <div>
              <h1 className="text-2xl font-bold">Teacher Management</h1>
              <p className="text-purple-100">Manage teachers, subjects, and classes</p>
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
          { label: 'Total Teachers', value: teachers.length },
          {
            label: 'Avg Experience',
            value: teachers.filter(t => t.yearsOfExperience).length > 0
              ? `${Math.round(teachers.reduce((sum, t) => sum + (t.yearsOfExperience || 0), 0) / teachers.filter(t => t.yearsOfExperience).length)} yrs`
              : 'N/A'
          },
          {
            label: 'Total Subjects',
            value: new Set(teachers.flatMap(t => t.subjects || [])).size
          },
          {
            label: 'Total Classes',
            value: new Set(teachers.flatMap(t => t.classes || [])).size
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
          >
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">{stat.value}</p>
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
          title="Teachers"
          data={teachers}
          columns={columns}
          loading={loading}
          error={error}
          searchPlaceholder="Search teachers..."
          onAdd={() => {
            setEditingTeacher(null);
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
        initialData={editingTeacher ? { ...editingTeacher, role: 'teacher' } : { role: 'teacher' }}
        mode={editingTeacher ? 'edit' : 'add'}
        title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
      />
    </div>
  );
}
