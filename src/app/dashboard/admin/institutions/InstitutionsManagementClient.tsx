// src/app/dashboard/admin/institutions/InstitutionsManagementClient.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, AlertCircle, Eye, Edit, Trash2 } from 'lucide-react';
import TableManager, { ColumnDef } from '@/components/admin/TableManager';
import ImportModal from '@/components/admin/ImportModal';
import { useSupabaseCRUD, SupabaseDocument } from '@/hooks/useSupabaseCRUD';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/common/Button';
import { logger } from '@/lib/logger';
import { useAuth } from '@/context/AuthContext';

interface InstitutionDocument extends SupabaseDocument {
  name: string;
  type: 'school' | 'university' | 'training_center' | 'other';
  location?: string;
  address?: string;
  phone?: string;
  email?: string;
  student_count?: number;
  teacher_count?: number;
  status: 'active' | 'inactive' | 'suspended';
  subscription_plan?: 'free' | 'basic' | 'premium' | 'enterprise';
  created_at: string;
  updated_at?: string;
}

export default function InstitutionsManagementClient() {
  const { user, loading: authLoading } = useAuth();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const {
    documents: institutions,
    loading,
    error,
    hasMore,
    updateDocument,
    deleteDocument,
    bulkDelete,
    loadMore,
    refresh,
    search,
  } = useSupabaseCRUD<InstitutionDocument>({
    tableName: 'institutions',
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
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

  const columns: ColumnDef<InstitutionDocument>[] = [
    {
      key: 'name',
      label: 'Institution Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value || '-'}</div>
          <div className="text-xs text-gray-500">{row.type || 'N/A'}</div>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (value) => (
        <span className="text-sm text-gray-600">{value || 'N/A'}</span>
      ),
    },
    {
      key: 'student_count',
      label: 'Students',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-medium text-blue-600">{value || 0}</span>
      ),
    },
    {
      key: 'teacher_count',
      label: 'Teachers',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-medium text-green-600">{value || 0}</span>
      ),
    },
    {
      key: 'subscription_plan',
      label: 'Plan',
      render: (value) => {
        const colors = {
          free: 'bg-gray-100 text-gray-700',
          basic: 'bg-blue-100 text-blue-700',
          premium: 'bg-purple-100 text-purple-700',
          enterprise: 'bg-orange-100 text-orange-700',
        };
        const plan = value || 'free';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[plan as keyof typeof colors]}`}>
            {plan}
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
          inactive: 'bg-gray-100 text-gray-700',
          suspended: 'bg-red-100 text-red-700',
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

  const handleView = (row: InstitutionDocument) => {
    // For now, just log - can be expanded with a detailed view modal
    logger.log('View institution:', row);
    alert(`Institution: ${row.name}\nType: ${row.type}\nLocation: ${row.location || 'N/A'}\nStudents: ${row.student_count || 0}\nTeachers: ${row.teacher_count || 0}`);
  };

  const handleEdit = (row: InstitutionDocument) => {
    // For now, just log - can be expanded with edit modal
    logger.log('Edit institution:', row);
    alert('Edit functionality coming soon! This would open an edit modal.');
  };

  const handleDelete = async (row: InstitutionDocument) => {
    if (!confirm(`Are you sure you want to delete ${row.name}? This will affect all associated users.`)) return;

    try {
      await deleteDocument(row.id);
      logger.log('Institution deleted:', row.id);
    } catch (err) {
      logger.error('Error deleting institution:', err);
      alert('Failed to delete institution');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Type', 'Location', 'Email', 'Phone', 'Students', 'Teachers', 'Plan', 'Status', 'Created'],
      ...institutions.map((inst) => [
        inst.name,
        inst.type || '',
        inst.location || '',
        inst.email || '',
        inst.phone || '',
        inst.student_count || 0,
        inst.teacher_count || 0,
        inst.subscription_plan || 'free',
        inst.status || 'active',
        inst.created_at ? new Date(inst.created_at).toLocaleDateString() : '',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `institutions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (data: any[]) => {
    try {
      const institutionsData = data.map((row) => ({
        name: row['Name'],
        type: row['Type']?.toLowerCase() || 'other',
        location: row['Location'] || undefined,
        email: row['Email'] || undefined,
        phone: row['Phone'] || undefined,
        status: row['Status']?.toLowerCase() || 'active',
        subscription_plan: row['Plan']?.toLowerCase() || 'free',
      }));

      // Insert institutions via Supabase
      const { data: insertedData, error } = await (supabase
        .from('institutions') as any)
        .insert(institutionsData)
        .select();

      if (error) {
        throw error;
      }

      logger.log(`Successfully imported ${insertedData?.length || 0} institutions`);
      await refresh();
    } catch (err) {
      logger.error('Error importing institutions:', err);
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
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg p-6">
          <div className="flex items-center gap-3">
            <Building size={32} />
            <div>
              <h1 className="text-2xl font-bold">Institution Management</h1>
              <p className="text-orange-100">Manage institutions and their subscriptions</p>
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
          { label: 'Total Institutions', value: institutions.length },
          { label: 'Total Students', value: institutions.reduce((sum, i) => sum + (i.student_count || 0), 0) },
          { label: 'Total Teachers', value: institutions.reduce((sum, i) => sum + (i.teacher_count || 0), 0) },
          { label: 'Active', value: institutions.filter((i) => i.status === 'active').length },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
          >
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-3xl font-bold text-orange-600 mt-1">{stat.value}</p>
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
          title="Institutions"
          data={institutions}
          columns={columns}
          loading={loading}
          error={error}
          searchPlaceholder="Search institutions..."
          onAdd={() => alert('Add functionality coming soon! This would open a form modal.')}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBulkDelete={bulkDelete}
          onExport={handleExport}
          onImport={handleOpenImport}
          onRefresh={refresh}
          onSearch={(term) => search(term, ['name', 'location', 'email'])}
          onRowClick={handleView}
          hasMore={hasMore}
          onLoadMore={loadMore}
          enableEdit={false}
          enableDelete={false}
        />

        {/* Quick Actions Info */}
        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-900 mb-3 font-medium">
            Quick Actions: Click on any institution row to view details
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Eye size={16} />}
              onClick={() => institutions[0] && handleView(institutions[0])}
              disabled={institutions.length === 0}
            >
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit size={16} />}
              onClick={() => institutions[0] && handleEdit(institutions[0])}
              disabled={institutions.length === 0}
            >
              Edit Institution
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 size={16} />}
              onClick={() => institutions[0] && handleDelete(institutions[0])}
              disabled={institutions.length === 0}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Delete Institution
            </Button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Note: Full edit and detail modals will be added in future updates
          </p>
        </div>
      </motion.div>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        templateHeaders={['Name', 'Type', 'Location', 'Email', 'Phone', 'Plan', 'Status']}
        templateExample={[
          ['Springfield High School', 'school', 'Springfield, IL', 'admin@springfield.edu', '555-0100', 'premium', 'active'],
          ['Tech University', 'university', 'Boston, MA', 'contact@techuni.edu', '555-0200', 'enterprise', 'active'],
          ['Coding Bootcamp', 'training_center', 'San Francisco, CA', 'info@codingboot.com', '555-0300', 'basic', 'active'],
        ]}
        entityName="Institutions"
      />
    </div>
  );
}
