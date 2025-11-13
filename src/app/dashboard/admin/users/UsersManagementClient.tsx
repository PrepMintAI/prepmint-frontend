// src/app/dashboard/admin/users/UsersManagementClient.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, Eye, Edit, Trash2, AlertCircle } from 'lucide-react';
import TableManager, { ColumnDef } from '@/components/admin/TableManager';
import UserFormModal, { UserFormData } from '@/components/admin/UserFormModal';
import UserActionsModal from '@/components/admin/UserActionsModal';
import ImportModal from '@/components/admin/ImportModal';
import { useSupabaseCRUD, SupabaseDocument } from '@/hooks/useSupabaseCRUD';
import Button from '@/components/common/Button';
import { logger } from '@/lib/logger';
import { useAuth } from '@/context/AuthContext';

interface UserDocument extends SupabaseDocument {
  email: string;
  display_name: string;
  role: 'student' | 'teacher' | 'admin' | 'institution';
  xp?: number;
  level?: number;
  institution_id?: string;
  account_type?: 'individual' | 'institution';
  created_at: string;
  updated_at?: string;
  last_active?: string;
  status?: 'active' | 'suspended' | 'pending';
}

export default function UsersManagementClient() {
  const { user, loading: authLoading } = useAuth();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDocument | null>(null);
  const [actionType, setActionType] = useState<'view' | 'edit' | 'delete' | 'reset-password'>('view');
  const [editingUser, setEditingUser] = useState<UserDocument | null>(null);

  const {
    documents: users,
    loading,
    error,
    hasMore,
    addDocument,
    updateDocument,
    deleteDocument,
    bulkDelete,
    loadMore,
    refresh,
    search,
  } = useSupabaseCRUD<UserDocument>({
    tableName: 'users',
    pageSize: 20,
    orderByField: 'created_at',
    orderDirection: 'desc',
    realtime: true,
  });

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
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

  const columns: ColumnDef<UserDocument>[] = [
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
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value) => {
        const colors = {
          student: 'bg-blue-100 text-blue-700',
          teacher: 'bg-green-100 text-green-700',
          admin: 'bg-purple-100 text-purple-700',
          institution: 'bg-orange-100 text-orange-700',
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {value}
          </span>
        );
      },
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
      key: 'account_type',
      label: 'Account Type',
      render: (value) => (
        <span className="text-sm text-gray-600 capitalize">{value || 'individual'}</span>
      ),
    },
    {
      key: 'xp',
      label: 'XP',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">{value || 0}</span>
      ),
    },
    {
      key: 'level',
      label: 'Level',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">{value || 1}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
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
    setEditingUser(null);
    setIsFormModalOpen(true);
  };

  const handleView = (row: UserDocument) => {
    setSelectedUser(row);
    setActionType('view');
    setIsActionModalOpen(true);
  };

  const handleEdit = (row: UserDocument) => {
    setSelectedUser(row);
    setActionType('edit');
    setIsActionModalOpen(true);
  };

  const handleDelete = (row: UserDocument) => {
    setSelectedUser(row);
    setActionType('delete');
    setIsActionModalOpen(true);
  };

  const handleResetPassword = (row: UserDocument) => {
    setSelectedUser(row);
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
      logger.error(`Error ${action}ing user:`, err);
      throw err;
    }
  };

  const handleSubmit = async (data: UserFormData) => {
    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = {
          display_name: data.displayName,
          role: data.role,
          account_type: data.accountType,
        };

        // Only include institution_id if it has a value
        if (data.institutionId) {
          updateData.institution_id = data.institutionId;
        }

        await updateDocument(editingUser.id, updateData);
      } else {
        // Create new user via API
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            data,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create user');
        }

        await refresh();
      }
    } catch (err) {
      logger.error('Error saving user:', err);
      throw err;
    }
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Account Type', 'XP', 'Level', 'Status', 'Institution ID', 'Created'],
      ...users.map((user) => [
        user.display_name,
        user.email,
        user.role,
        user.account_type || 'individual',
        user.xp || 0,
        user.level || 1,
        user.status || 'active',
        user.institution_id || '',
        user.created_at
          ? new Date(user.created_at).toLocaleDateString()
          : '',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (data: any[]) => {
    try {
      const usersData = data.map((row) => ({
        displayName: row['Display Name'] || row['Name'],
        email: row['Email'],
        role: (row['Role']?.toLowerCase() as UserFormData['role']) || 'student',
        password: row['Password'] || undefined,
        accountType: row['Account Type']?.toLowerCase() || 'individual',
        institutionId: row['Institution ID'] || undefined,
      }));

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulkCreate',
          data: { users: usersData },
        }),
      });

      const result = await response.json();

      if (result.success) {
        const successCount = result.results.filter((r: any) => r.success).length;
        logger.log(`Successfully imported ${successCount} users`);
        await refresh();
      }
    } catch (err) {
      logger.error('Error importing users:', err);
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
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Shield size={32} />
            <div>
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-purple-100">
                Manage all users, roles, and permissions
              </p>
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
          { label: 'Total Users', value: users.length, color: 'blue' },
          {
            label: 'Students',
            value: users.filter((u) => u.role === 'student').length,
            color: 'green',
          },
          {
            label: 'Teachers',
            value: users.filter((u) => u.role === 'teacher').length,
            color: 'purple',
          },
          {
            label: 'Admins',
            value: users.filter((u) => u.role === 'admin').length,
            color: 'orange',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
          >
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className={`text-3xl font-bold text-${stat.color}-600 mt-1`}>
              {stat.value}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Table with custom action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <TableManager
          title="Users"
          data={users}
          columns={columns}
          loading={loading}
          error={error}
          searchPlaceholder="Search users..."
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

        {/* Custom Action Buttons Row */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900 mb-3 font-medium">
            Quick Actions: Click on any user row to view details, or use the action buttons in the table:
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Eye size={16} />}
              onClick={() => users[0] && handleView(users[0])}
              disabled={users.length === 0}
            >
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit size={16} />}
              onClick={() => users[0] && handleEdit(users[0])}
              disabled={users.length === 0}
            >
              Edit User
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Key size={16} />}
              onClick={() => users[0] && handleResetPassword(users[0])}
              disabled={users.length === 0}
            >
              Reset Password
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 size={16} />}
              onClick={() => users[0] && handleDelete(users[0])}
              disabled={users.length === 0}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Delete User
            </Button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Note: These demo buttons act on the first user. In production, select a user from the table.
          </p>
        </div>
      </motion.div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingUser || undefined}
        mode={editingUser ? 'edit' : 'add'}
      />

      {/* User Actions Modal */}
      <UserActionsModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        user={selectedUser}
        action={actionType}
        onConfirm={handleActionConfirm}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        templateHeaders={['Display Name', 'Email', 'Role', 'Password', 'Account Type', 'Institution ID']}
        templateExample={[
          ['John Doe', 'john@example.com', 'student', 'password123', 'individual', ''],
          ['Jane Smith', 'jane@example.com', 'teacher', 'password456', 'individual', 'inst_001'],
          ['Admin User', 'admin@example.com', 'admin', 'adminpass', 'individual', ''],
        ]}
        entityName="Users"
      />
    </div>
  );
}
