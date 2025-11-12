// src/hooks/useSupabaseCRUD.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface SupabaseDocument {
  id: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface SupabaseFilter {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is';
  value: any;
}

export interface UseSupabaseCRUDOptions {
  tableName: string;
  pageSize?: number;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  realtime?: boolean;
  filters?: SupabaseFilter[];
  select?: string; // Custom select query (default: '*')
}

export interface UseSupabaseCRUDReturn<T extends SupabaseDocument> {
  documents: T[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  // CRUD operations
  addDocument: (data: Omit<T, 'id' | 'created_at' | 'updated_at'>) => Promise<string>;
  updateDocument: (id: string, data: Partial<Omit<T, 'id' | 'created_at'>>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  // Pagination
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  // Search
  search: (searchTerm: string, searchFields: string[]) => void;
}

export function useSupabaseCRUD<T extends SupabaseDocument>(
  options: UseSupabaseCRUDOptions
): UseSupabaseCRUDReturn<T> {
  const {
    tableName,
    pageSize = 20,
    orderByField = 'created_at',
    orderDirection = 'desc',
    realtime = true,
    filters = [],
    select = '*',
  } = options;

  const [documents, setDocuments] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFields, setSearchFields] = useState<string[]>([]);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);

  // Fetch documents
  const fetchDocuments = useCallback(
    async (isLoadMore = false) => {
      try {
        setLoading(true);
        setError(null);

        const page = isLoadMore ? currentPage + 1 : 0;
        const from = page * pageSize;
        const to = from + pageSize - 1;

        // Build query
        let query = supabase
          .from(tableName)
          .select(select, { count: 'exact' })
          .order(orderByField, { ascending: orderDirection === 'asc' })
          .range(from, to);

        // Apply filters
        filters.forEach((filter) => {
          if (filter.operator === 'in') {
            query = query.in(filter.column, filter.value as any[]);
          } else if (filter.operator === 'is') {
            query = query.is(filter.column, filter.value);
          } else {
            query = query[filter.operator](filter.column, filter.value);
          }
        });

        const { data, error: fetchError, count } = await query;

        if (fetchError) throw fetchError;

        const docs = (data || []) as T[];

        if (isLoadMore) {
          setDocuments((prev) => [...prev, ...docs]);
          setCurrentPage(page);
        } else {
          setDocuments(docs);
          setCurrentPage(0);
        }

        setTotal(count || 0);
        setHasMore(docs.length === pageSize);
        setLoading(false);
      } catch (err) {
        logger.error(`Error fetching ${tableName}:`, err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setLoading(false);
      }
    },
    [tableName, filters, orderByField, orderDirection, pageSize, currentPage, select]
  );

  // Set up real-time subscription
  useEffect(() => {
    if (!realtime) {
      fetchDocuments();
      return;
    }

    // Initial fetch
    fetchDocuments();

    // Set up realtime subscription
    const channel = supabase
      .channel(`${tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        (payload) => {
          logger.log(`Realtime event on ${tableName}:`, payload.eventType);

          if (payload.eventType === 'INSERT') {
            setDocuments((prev) => {
              // Check if document already exists
              if (prev.some((doc) => doc.id === (payload.new as T).id)) {
                return prev;
              }
              // Insert at beginning or end based on order direction
              return orderDirection === 'desc'
                ? [payload.new as T, ...prev]
                : [...prev, payload.new as T];
            });
          } else if (payload.eventType === 'UPDATE') {
            setDocuments((prev) =>
              prev.map((doc) =>
                doc.id === (payload.new as T).id ? (payload.new as T) : doc
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setDocuments((prev) =>
              prev.filter((doc) => doc.id !== (payload.old as T).id)
            );
          }
        }
      )
      .subscribe();

    setRealtimeChannel(channel);

    return () => {
      if (realtimeChannel) {
        logger.log(`Unsubscribing from ${tableName} realtime`);
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [tableName, filters, orderByField, orderDirection, pageSize, realtime, select, fetchDocuments]);

  // Add document
  const addDocument = async (data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
    try {
      const { data: insertedData, error: insertError } = await supabase
        .from(tableName)
        .insert([data])
        .select('id')
        .single();

      if (insertError) throw insertError;

      logger.log(`Document added to ${tableName}:`, insertedData.id);

      // Only refresh if realtime is disabled
      if (!realtime) {
        await refresh();
      }

      return insertedData.id;
    } catch (err) {
      logger.error(`Error adding document to ${tableName}:`, err);
      throw err;
    }
  };

  // Update document
  const updateDocument = async (id: string, data: Partial<Omit<T, 'id' | 'created_at'>>): Promise<void> => {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      logger.log(`Document updated in ${tableName}:`, id);

      // Only refresh if realtime is disabled
      if (!realtime) {
        await refresh();
      }
    } catch (err) {
      logger.error(`Error updating document in ${tableName}:`, err);
      throw err;
    }
  };

  // Delete document
  const deleteDocument = async (id: string): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      logger.log(`Document deleted from ${tableName}:`, id);

      // Only refresh if realtime is disabled
      if (!realtime) {
        await refresh();
      }
    } catch (err) {
      logger.error(`Error deleting document from ${tableName}:`, err);
      throw err;
    }
  };

  // Bulk delete
  const bulkDelete = async (ids: string[]): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .in('id', ids);

      if (deleteError) throw deleteError;

      logger.log(`Bulk deleted ${ids.length} documents from ${tableName}`);

      // Always refresh for bulk operations
      await refresh();
    } catch (err) {
      logger.error(`Error bulk deleting from ${tableName}:`, err);
      throw err;
    }
  };

  // Load more
  const loadMore = async () => {
    if (!hasMore || loading) return;
    await fetchDocuments(true);
  };

  // Refresh
  const refresh = async () => {
    setCurrentPage(0);
    await fetchDocuments(false);
  };

  // Search (client-side filtering)
  const search = (term: string, fields: string[]) => {
    setSearchTerm(term);
    setSearchFields(fields);
  };

  // Filter documents by search term
  const filteredDocuments = searchTerm
    ? documents.filter((doc) =>
        searchFields.some((field) => {
          const value = doc[field as keyof T];
          return (
            value &&
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      )
    : documents;

  return {
    documents: filteredDocuments,
    loading,
    error,
    total,
    hasMore,
    addDocument,
    updateDocument,
    deleteDocument,
    bulkDelete,
    loadMore,
    refresh,
    search,
  };
}
