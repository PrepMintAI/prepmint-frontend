// src/app/dashboard/admin/users/UsersManagementClient.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, Trash2, AlertCircle } from 'lucide-react';
import TableManager, { ColumnDef } from '@/components/admin/TableManager';
import UserFormModal, { UserFormData } from '@/components/admin/UserFormModal';
import { useFirestoreCRUD, FirestoreDocument } from '@/hooks/useFirestoreCRUD';
import Button from '@/components/common/Button';
import { logger } from '@/lib/logger';
import { useAuth } from '@/context/AuthContext';

interface UserDocument extends FirestoreDocument {
  email: string;
  displayName: string;
  role: 'student' | 'teacher' | 'admin' | 'institution';
  xp?: number;
  level?: number;
  institutionId?: string;
  accountType?: 'individual' | 'institution';
  createdAt: any;
  updatedAt?: any;
}

export default function UsersManagementClient() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDocument | null>(null);
  const [resettingPassword, setResettingPassword] = useState<string | null>(null);

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
  } = useFirestoreCRUD<UserDocument>({
    collectionName: 'users',
    pageSize: 20,
    orderByField: 'createdAt',
    orderDirection: 'desc',
    realtime: true,
  });

  // Check if current user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-red-900">Access Denied</h3>
            <p className="text-sm text-red-700 mt-1">
              You don&apos;t have permission to access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const columns: ColumnDef<UserDocument>[] = [
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
      key: 'accountType',
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
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) => {
        if (!value) return '-';
        const date = value.toDate ? value.toDate() : new Date(value);
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
    setIsModalOpen(true);
  };

  const handleEdit = (row: UserDocument) => {
    setEditingUser(row);
    setIsModalOpen(true);
  };

  const handleDelete = async (row: UserDocument) => {
    if (!confirm(`Are you sure you want to delete ${row.displayName}?`)) return;

    try {
      // Delete from Firestore
      await deleteDocument(row.id);

      // Delete from Firebase Auth
      await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteAuth',
          data: { userId: row.id },
        }),
      });

      logger.log('User deleted:', row.id);
    } catch (err) {
      logger.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const handleSubmit = async (data: UserFormData) => {
    try {
      if (editingUser) {
        // Update existing user
        await updateDocument(editingUser.id, {
          displayName: data.displayName,
          role: data.role,
          institutionId: data.institutionId || undefined,
          accountType: data.accountType,
        });
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

  const handleResetPassword = async (userId: string) => {
    const newPassword = prompt('Enter new password (min 6 characters):');
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      setResettingPassword(userId);

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resetPassword',
          data: { userId, newPassword },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      alert('Password reset successfully');
    } catch (err) {
      logger.error('Error resetting password:', err);
      alert('Failed to reset password');
    } finally {
      setResettingPassword(null);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Account Type', 'XP', 'Level', 'Institution ID', 'Created'],
      ...users.map((user) => [
        user.displayName,
        user.email,
        user.role,
        user.accountType || 'individual',
        user.xp || 0,
        user.level || 1,
        user.institutionId || '',
        user.createdAt?.toDate
          ? user.createdAt.toDate().toLocaleDateString()
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

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').slice(1); // Skip header
      const usersData = lines
        .filter((line) => line.trim())
        .map((line) => {
          const [displayName, email, role, password] = line.split(',');
          return {
            displayName: displayName.trim(),
            email: email.trim(),
            role: (role.trim() as UserFormData['role']) || 'student',
            password: password?.trim() || undefined,
          };
        });

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
        alert(`Successfully imported ${successCount} users`);
        await refresh();
      }
    } catch (err) {
      logger.error('Error importing users:', err);
      alert('Failed to import users');
    }
  };

  return (
    <div className="p-6 space-y-6">
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

      {/* Table */}
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
          onImport={handleImport}
          onRefresh={refresh}
          onSearch={(term) => search(term, ['displayName', 'email'])}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </motion.div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingUser || undefined}
        mode={editingUser ? 'edit' : 'add'}
      />
    </div>
  );
}
