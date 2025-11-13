// src/components/admin/TableManager.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Edit,
  MoreVertical,
  Check,
  X,
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import { SupabaseDocument } from '@/hooks/useSupabaseCRUD';

export interface ColumnDef<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface TableManagerProps<T extends SupabaseDocument> {
  title: string;
  data: T[];
  columns: ColumnDef<T>[];
  loading: boolean;
  error: string | null;
  searchPlaceholder?: string;
  // Callbacks
  onAdd?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onBulkDelete?: (selectedIds: string[]) => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
  onRefresh?: () => void;
  onSearch?: (term: string) => void;
  onRowClick?: (row: T) => void;
  // Pagination
  hasMore?: boolean;
  onLoadMore?: () => void;
  // Features
  enableSearch?: boolean;
  enableAdd?: boolean;
  enableEdit?: boolean;
  enableDelete?: boolean;
  enableBulkDelete?: boolean;
  enableExport?: boolean;
  enableImport?: boolean;
  enableRefresh?: boolean;
}

export default function TableManager<T extends SupabaseDocument>({
  title,
  data,
  columns,
  loading,
  error,
  searchPlaceholder = 'Search...',
  onAdd,
  onEdit,
  onDelete,
  onBulkDelete,
  onExport,
  onImport,
  onRefresh,
  onSearch,
  onRowClick,
  hasMore,
  onLoadMore,
  enableSearch = true,
  enableAdd = true,
  enableEdit = true,
  enableDelete = true,
  enableBulkDelete = true,
  enableExport = true,
  enableImport = true,
  enableRefresh = true,
}: TableManagerProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((row) => row.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedRows.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedRows.size} items?`)) {
      onBulkDelete?.(Array.from(selectedRows));
      setSelectedRows(new Set());
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport?.(file);
    }
  };

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn as keyof T];
    const bValue = b[sortColumn as keyof T];

    if (aValue === bValue) return 0;

    const comparison = aValue < bValue ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>

        <div className="flex items-center gap-2 flex-wrap">
          {enableRefresh && onRefresh && (
            <Button
              variant="ghost"
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
          )}

          {enableExport && onExport && (
            <Button
              variant="outline"
              onClick={onExport}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </Button>
          )}

          {enableImport && onImport && (
            <label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button variant="outline" className="flex items-center gap-2 cursor-pointer">
                <Upload size={16} />
                Import
              </Button>
            </label>
          )}

          {enableAdd && onAdd && (
            <Button variant="primary" onClick={onAdd} className="flex items-center gap-2">
              <Plus size={16} />
              Add New
            </Button>
          )}
        </div>
      </div>

      {/* Search and Bulk Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {enableSearch && (
          <div className="flex-1 max-w-md relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {enableBulkDelete && selectedRows.size > 0 && (
          <Button
            variant="outline"
            onClick={handleBulkDelete}
            className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
          >
            <Trash2 size={16} />
            Delete Selected ({selectedRows.size})
          </Button>
        )}
      </div>

      {/* Table */}
      <Card variant="elevated" padding="none">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-red-700">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {enableBulkDelete && (
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === data.length && data.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    } ${column.width || ''}`}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortColumn === column.key && (
                        <span className="text-blue-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {(enableEdit || enableDelete) && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider w-24">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading && data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="px-4 py-12 text-center">
                    <Spinner />
                    <p className="text-gray-600 mt-4">Loading...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="px-4 py-12 text-center text-gray-500">
                    No data found
                  </td>
                </tr>
              ) : (
                sortedData.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={(e) => {
                      // Don't trigger row click if clicking on checkbox or action buttons
                      const target = e.target as HTMLElement;
                      if (
                        target.tagName === 'INPUT' ||
                        target.tagName === 'BUTTON' ||
                        target.closest('button')
                      ) {
                        return;
                      }
                      onRowClick?.(row);
                    }}
                  >
                    {enableBulkDelete && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRows.has(row.id)}
                          onChange={() => handleSelectRow(row.id)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={String(column.key)} className="px-4 py-3 text-sm text-gray-900">
                        {column.render
                          ? column.render(row[column.key as keyof T], row)
                          : String(row[column.key as keyof T] || '-')}
                      </td>
                    ))}
                    {(enableEdit || enableDelete) && (
                      <td className="px-4 py-3 text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          {enableEdit && onEdit && (
                            <button
                              onClick={() => onEdit(row)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          {enableDelete && onDelete && (
                            <button
                              onClick={() => onDelete(row)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Load More */}
        {hasMore && onLoadMore && (
          <div className="p-4 border-t border-gray-200 text-center">
            <Button variant="ghost" onClick={onLoadMore} disabled={loading}>
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
