// src/hooks/useFirestoreCRUD.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  where,
  QueryConstraint,
  DocumentData,
  onSnapshot,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase.client';
import { logger } from '@/lib/logger';

export interface FirestoreDocument extends DocumentData {
  id: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface UseFirestoreCRUDOptions {
  collectionName: string;
  pageSize?: number;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  realtime?: boolean;
  filters?: QueryConstraint[];
}

export interface UseFirestoreCRUDReturn<T extends FirestoreDocument> {
  documents: T[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  // CRUD operations
  addDocument: (data: Omit<T, 'id'>) => Promise<string>;
  updateDocument: (id: string, data: Partial<T>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  // Pagination
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  // Search
  search: (searchTerm: string, searchFields: string[]) => void;
}

export function useFirestoreCRUD<T extends FirestoreDocument>(
  options: UseFirestoreCRUDOptions
): UseFirestoreCRUDReturn<T> {
  const {
    collectionName,
    pageSize = 20,
    orderByField = 'createdAt',
    orderDirection = 'desc',
    realtime = true,
    filters = [],
  } = options;

  const [documents, setDocuments] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFields, setSearchFields] = useState<string[]>([]);

  // Fetch documents
  const fetchDocuments = useCallback(
    async (isLoadMore = false) => {
      try {
        setLoading(true);
        setError(null);

        const collectionRef = collection(db, collectionName);
        const constraints: QueryConstraint[] = [...filters];

        // Add ordering
        constraints.push(orderBy(orderByField, orderDirection));

        // Add pagination
        if (isLoadMore && lastVisible) {
          constraints.push(startAfter(lastVisible));
        }
        constraints.push(limit(pageSize));

        const q = query(collectionRef, ...constraints);
        const snapshot = await getDocs(q);

        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        if (isLoadMore) {
          setDocuments((prev) => [...prev, ...docs]);
        } else {
          setDocuments(docs);
        }

        setTotal(snapshot.size);
        setHasMore(snapshot.docs.length === pageSize);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setLoading(false);
      } catch (err) {
        logger.error(`Error fetching ${collectionName}:`, err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setLoading(false);
      }
    },
    [collectionName, filters, orderByField, orderDirection, pageSize, lastVisible]
  );

  // Real-time listener
  useEffect(() => {
    if (!realtime) {
      fetchDocuments();
      return;
    }

    const collectionRef = collection(db, collectionName);
    const constraints: QueryConstraint[] = [...filters];
    constraints.push(orderBy(orderByField, orderDirection));
    constraints.push(limit(pageSize));

    const q = query(collectionRef, ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        setDocuments(docs);
        setTotal(snapshot.size);
        setHasMore(snapshot.docs.length === pageSize);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setLoading(false);
      },
      (err) => {
        logger.error(`Error in ${collectionName} listener:`, err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, filters, orderByField, orderDirection, pageSize, realtime]);

  // Add document
  const addDocument = async (data: Omit<T, 'id'>): Promise<string> => {
    try {
      const docData = {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, collectionName), docData);
      logger.log(`Document added to ${collectionName}:`, docRef.id);
      await refresh();
      return docRef.id;
    } catch (err) {
      logger.error(`Error adding document to ${collectionName}:`, err);
      throw err;
    }
  };

  // Update document
  const updateDocument = async (id: string, data: Partial<T>): Promise<void> => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      logger.log(`Document updated in ${collectionName}:`, id);
      await refresh();
    } catch (err) {
      logger.error(`Error updating document in ${collectionName}:`, err);
      throw err;
    }
  };

  // Delete document
  const deleteDocument = async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      logger.log(`Document deleted from ${collectionName}:`, id);
      await refresh();
    } catch (err) {
      logger.error(`Error deleting document from ${collectionName}:`, err);
      throw err;
    }
  };

  // Bulk delete
  const bulkDelete = async (ids: string[]): Promise<void> => {
    try {
      const batch = writeBatch(db);

      ids.forEach((id) => {
        const docRef = doc(db, collectionName, id);
        batch.delete(docRef);
      });

      await batch.commit();
      logger.log(`Bulk deleted ${ids.length} documents from ${collectionName}`);
      await refresh();
    } catch (err) {
      logger.error(`Error bulk deleting from ${collectionName}:`, err);
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
    setLastVisible(null);
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
