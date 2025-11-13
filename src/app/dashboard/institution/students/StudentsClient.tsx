// src/app/dashboard/institution/students/StudentsClient.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, AlertCircle, Eye, Edit, Key, Trash2 } from 'lucide-react';
import TableManager, { ColumnDef } from '@/components/admin/TableManager';
import UserFormModal, { UserFormData } from '@/components/admin/UserFormModal';
import UserActionsModal from '@/components/admin/UserActionsModal';
import ImportModal from '@/components/admin/ImportModal';
import { useSupabaseCRUD, SupabaseDocument } from '@/hooks/useSupabaseCRUD';
import Button from '@/components/common/Button';
import { logger } from '@/lib/logger';

interface StudentDocument extends SupabaseDocument {
  email: string;
  display_name: string;
  role: 'student';
  xp?: number;
  level?: number;
  institution_id?: string;
  account_type?: 'individual' | 'institution';
  streak?: number;
  badges?: string[];
  created_at: string;
  last_active?: string;
  status?: 'active' | 'suspended' | 'pending';
}

export function StudentsClient({ institutionId }: { institutionId?: string }) {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDocument | null>(null);
  const [actionType, setActionType] = useState<'view' | 'edit' | 'delete' | 'reset-password'>('view');
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
  } = useSupabaseCRUD<StudentDocument>({
    tableName: 'users',
    pageSize: 20,
    orderByField: 'xp',
    orderDirection: 'desc',
    realtime: true,
    filters: [
      { column: 'role', operator: 'eq' as const, value: 'student' },
      ...(institutionId ? [{ column: 'institution_id', operator: 'eq' as const, value: institutionId }] : []),
    ],
  });

  if (!institutionId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-yellow-900">No Institution Found</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Please contact support to link your account to an institution.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const columns: ColumnDef<StudentDocument>[] = [
    {
      key: 'display_name',
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
      key: 'status',
      label: 'Status',
      render: (value) => {
        const colors = {
          active: 'bg-green-100 text-green-700',
          suspended: 'bg-red-100 text-red-700',
          pending: 'bg-yellow-100 text-yellow-700',
        };
        const status = value || 'active';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
            {status}
          </span>
        );
      },
    },
  ];

  const handleAdd = () => {
    setEditingStudent(null);
    setIsFormModalOpen(true);
  };

  const handleView = (row: StudentDocument) => {
    setSelectedStudent(row);
    setActionType('view');
    setIsActionModalOpen(true);
  };

  const handleEdit = (row: StudentDocument) => {
    setSelectedStudent(row);
    setActionType('edit');
    setIsActionModalOpen(true);
  };

  const handleDelete = (row: StudentDocument) => {
    setSelectedStudent(row);
    setActionType('delete');
    setIsActionModalOpen(true);
  };

  const handleResetPassword = (row: StudentDocument) => {
    setSelectedStudent(row);
    setActionType('reset-password');
    setIsActionModalOpen(true);
  };

  const handleActionConfirm = async (action: 'view' | 'edit' | 'delete' | 'reset-password', data?: any) => {
    try {
      switch (action) {
        case 'edit':
          if (data?.userId) {
            const { userId, ...updateData } = data;
            await updateDocument(userId, updateData);
          }
          break;

        case 'delete':
          if (data?.userId) {
            await deleteDocument(data.userId);

            // Delete from Supabase Auth via API
            await fetch('/api/admin/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'deleteAuth',
                data: { userId: data.userId },
              }),
            });
          }
          break;

        case 'reset-password':
          if (data?.userId && data?.newPassword) {
            const response = await fetch('/api/admin/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'resetPassword',
                data: { userId: data.userId, newPassword: data.newPassword },
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to reset password');
            }
          }
          break;
      }

      await refresh();
    } catch (err) {
      logger.error(`Error ${action}ing student:`, err);
      throw err;
    }
  };

  const handleSubmit = async (data: UserFormData) => {
    try {
      if (editingStudent) {
        const updateData: any = {
          display_name: data.displayName,
        };

        await updateDocument(editingStudent.id, updateData);
      } else {
        // Create new student via API
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            data: { ...data, role: 'student', institutionId },
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
      ['Name', 'Email', 'XP', 'Level', 'Streak', 'Status', 'Created'],
      ...students.map((s) => [
        s.display_name,
        s.email,
        s.xp || 0,
        s.level || 1,
        s.streak || 0,
        s.status || 'active',
        s.created_at ? new Date(s.created_at).toLocaleDateString() : '',
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

  const handleImport = async (data: any[]) => {
    try {
      const studentsData = data.map((row) => ({
        displayName: row['Display Name'] || row['Name'],
        email: row['Email'],
        role: 'student' as const,
        password: row['Password'] || undefined,
        accountType: 'institution',
        institutionId: institutionId,
      }));

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulkCreate',
          data: { users: studentsData },
        }),
      });

      const result = await response.json();

      if (result.success) {
        const successCount = result.results.filter((r: any) => r.success).length;
        logger.log(`Successfully imported ${successCount} students`);
        await refresh();
      }
    } catch (err) {
      logger.error('Error importing students:', err);
      throw err;
    }
  };

  const handleOpenImport = () => {
    setIsImportModalOpen(true);
  };

  return (
    <div className="space-y-6">
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
          { label: 'Active Students', value: students.filter((s) => s.status === 'active' || !s.status).length },
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
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBulkDelete={bulkDelete}
          onExport={handleExport}
          onImport={handleOpenImport}
          onRefresh={refresh}
          onSearch={(term) => search(term, ['display_name', 'email'])}
          onRowClick={handleView}
          hasMore={hasMore}
          onLoadMore={loadMore}
          enableEdit={false}
          enableDelete={false}
        />

        {/* Quick Actions Info */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 mb-3 font-medium">
            Quick Actions: Click on any student row to view details
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Eye size={16} />}
              onClick={() => students[0] && handleView(students[0])}
              disabled={students.length === 0}
            >
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit size={16} />}
              onClick={() => students[0] && handleEdit(students[0])}
              disabled={students.length === 0}
            >
              Edit Student
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Key size={16} />}
              onClick={() => students[0] && handleResetPassword(students[0])}
              disabled={students.length === 0}
            >
              Reset Password
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 size={16} />}
              onClick={() => students[0] && handleDelete(students[0])}
              disabled={students.length === 0}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Delete Student
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Form Modal */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingStudent ? { ...editingStudent, role: 'student' } : { role: 'student' }}
        mode={editingStudent ? 'edit' : 'add'}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
      />

      {/* User Actions Modal */}
      <UserActionsModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        user={selectedStudent}
        action={actionType}
        onConfirm={handleActionConfirm}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        templateHeaders={['Display Name', 'Email', 'Password']}
        templateExample={[
          ['John Doe', 'john@example.com', 'password123'],
          ['Jane Smith', 'jane@example.com', 'password456'],
          ['Bob Wilson', 'bob@example.com', 'password789'],
        ]}
        entityName="Students"
      />
    </div>
  );
}
