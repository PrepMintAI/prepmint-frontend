// src/app/dashboard/admin/teachers/TeachersManagementClient.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, AlertCircle, Eye, Edit, Key, Trash2 } from 'lucide-react';
import TableManager, { ColumnDef } from '@/components/admin/TableManager';
import UserFormModal, { UserFormData } from '@/components/admin/UserFormModal';
import UserActionsModal from '@/components/admin/UserActionsModal';
import ImportModal from '@/components/admin/ImportModal';
import { useSupabaseCRUD, SupabaseDocument } from '@/hooks/useSupabaseCRUD';
import Button from '@/components/common/Button';
import { logger } from '@/lib/logger';
import { useAuth } from '@/context/AuthContext';

interface TeacherDocument extends SupabaseDocument {
  email: string;
  display_name: string;
  role: 'teacher';
  institution_id?: string;
  account_type?: 'individual' | 'institution';
  subjects?: string[];
  years_of_experience?: number;
  classes?: string[];
  created_at: string;
  last_active?: string;
  status?: 'active' | 'suspended' | 'pending';
}

export default function TeachersManagementClient() {
  const { user, loading: authLoading } = useAuth();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherDocument | null>(null);
  const [actionType, setActionType] = useState<'view' | 'edit' | 'delete' | 'reset-password'>('view');
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
  } = useSupabaseCRUD<TeacherDocument>({
    tableName: 'users',
    pageSize: 20,
    orderByField: 'created_at',
    orderDirection: 'desc',
    realtime: true,
    filters: [{ column: 'role', operator: 'eq', value: 'teacher' }],
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
            <span className="text-sm text-gray-500">No subjects</span>
          )}
          {Array.isArray(value) && value.length > 3 && (
            <span className="text-xs text-gray-500">+{value.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: 'years_of_experience',
      label: 'Experience',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-900">{value ? `${value} years` : 'N/A'}</span>
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
    {
      key: 'institution_id',
      label: 'Institution',
      render: (value) => (
        <span className="text-sm text-gray-600">{value || 'Individual'}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Joined',
      sortable: true,
      render: (value) => {
        if (!value) return '-';
        const date = new Date(value);
        return (
          <span className="text-sm text-gray-600">
            {date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        );
      },
    },
  ];

  const handleAdd = () => {
    setEditingTeacher(null);
    setIsFormModalOpen(true);
  };

  const handleView = (row: TeacherDocument) => {
    setSelectedTeacher(row);
    setActionType('view');
    setIsActionModalOpen(true);
  };

  const handleEdit = (row: TeacherDocument) => {
    setSelectedTeacher(row);
    setActionType('edit');
    setIsActionModalOpen(true);
  };

  const handleDelete = (row: TeacherDocument) => {
    setSelectedTeacher(row);
    setActionType('delete');
    setIsActionModalOpen(true);
  };

  const handleResetPassword = (row: TeacherDocument) => {
    setSelectedTeacher(row);
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
      logger.error(`Error ${action}ing teacher:`, err);
      throw err;
    }
  };

  const handleSubmit = async (data: UserFormData) => {
    try {
      if (editingTeacher) {
        const updateData: any = {
          display_name: data.displayName,
        };

        // Only include institution_id if it has a value
        if (data.institutionId) {
          updateData.institution_id = data.institutionId;
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
      ['Name', 'Email', 'Experience', 'Status', 'Institution', 'Joined'],
      ...teachers.map((t) => [
        t.display_name,
        t.email,
        t.years_of_experience || 0,
        t.status || 'active',
        t.institution_id || '',
        t.created_at ? new Date(t.created_at).toLocaleDateString() : '',
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

  const handleImport = async (data: any[]) => {
    try {
      const teachersData = data.map((row) => ({
        displayName: row['Display Name'] || row['Name'],
        email: row['Email'],
        role: 'teacher' as const,
        password: row['Password'] || undefined,
        accountType: row['Account Type']?.toLowerCase() || 'individual',
        institutionId: row['Institution ID'] || undefined,
      }));

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulkCreate',
          data: { users: teachersData },
        }),
      });

      const result = await response.json();

      if (result.success) {
        const successCount = result.results.filter((r: any) => r.success).length;
        logger.log(`Successfully imported ${successCount} teachers`);
        await refresh();
      }
    } catch (err) {
      logger.error('Error importing teachers:', err);
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
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg p-6">
          <div className="flex items-center gap-3">
            <BookOpen size={32} />
            <div>
              <h1 className="text-2xl font-bold">Teacher Management</h1>
              <p className="text-green-100">Manage teachers and their assignments</p>
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
          { label: 'With Institution', value: teachers.filter((t) => t.institution_id).length },
          { label: 'Active Teachers', value: teachers.filter((t) => t.status === 'active' || !t.status).length },
          { label: 'Avg Experience', value: `${Math.round(teachers.reduce((sum, t) => sum + (t.years_of_experience || 0), 0) / teachers.length || 0)} yrs` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
          >
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stat.value}</p>
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
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-900 mb-3 font-medium">
            Quick Actions: Click on any teacher row to view details
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Eye size={16} />}
              onClick={() => teachers[0] && handleView(teachers[0])}
              disabled={teachers.length === 0}
            >
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit size={16} />}
              onClick={() => teachers[0] && handleEdit(teachers[0])}
              disabled={teachers.length === 0}
            >
              Edit Teacher
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Key size={16} />}
              onClick={() => teachers[0] && handleResetPassword(teachers[0])}
              disabled={teachers.length === 0}
            >
              Reset Password
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 size={16} />}
              onClick={() => teachers[0] && handleDelete(teachers[0])}
              disabled={teachers.length === 0}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Delete Teacher
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Form Modal */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingTeacher ? { ...editingTeacher, role: 'teacher' } : { role: 'teacher' }}
        mode={editingTeacher ? 'edit' : 'add'}
        title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
      />

      {/* User Actions Modal */}
      <UserActionsModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        user={selectedTeacher}
        action={actionType}
        onConfirm={handleActionConfirm}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        templateHeaders={['Display Name', 'Email', 'Password', 'Account Type', 'Institution ID']}
        templateExample={[
          ['Alice Johnson', 'alice@example.com', 'password123', 'individual', ''],
          ['Bob Smith', 'bob@example.com', 'password456', 'individual', 'inst_001'],
          ['Carol White', 'carol@example.com', 'password789', 'institution', 'inst_001'],
        ]}
        entityName="Teachers"
      />
    </div>
  );
}
