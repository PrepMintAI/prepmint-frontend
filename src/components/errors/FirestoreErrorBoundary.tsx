// src/components/errors/FirestoreErrorBoundary.tsx
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isFirestoreError: boolean;
}

/**
 * Error Boundary specifically designed to catch Firestore-related errors
 *
 * Features:
 * - Detects Firestore assertion failures
 * - Provides recovery options
 * - Shows user-friendly error messages
 * - Offers to clear cache and reload
 */
export class FirestoreErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isFirestoreError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if this is a Firestore-related error
    const errorMessage = error.message || error.toString();
    const isFirestoreError =
      errorMessage.includes('Firestore') ||
      errorMessage.includes('firebase') ||
      errorMessage.includes('Unexpected state') ||
      errorMessage.includes('IndexedDB') ||
      errorMessage.includes('INTERNAL ASSERTION');

    return {
      hasError: true,
      error,
      isFirestoreError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('[FirestoreErrorBoundary] Caught error:', {
      error: error.toString(),
      errorInfo: errorInfo.componentStack,
    });

    this.setState({
      errorInfo,
    });

    // If it's a Firestore error, attempt recovery
    if (this.state.isFirestoreError) {
      logger.error('[FirestoreErrorBoundary] Firestore error detected, recovery may be needed');
    }
  }

  handleClearCache = async () => {
    try {
      logger.log('[FirestoreErrorBoundary] Clearing Firestore cache...');

      // Clear IndexedDB
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const databases = await window.indexedDB.databases();

        for (const dbInfo of databases) {
          if (dbInfo.name?.includes('firestore')) {
            await new Promise<void>((resolve, reject) => {
              const request = window.indexedDB.deleteDatabase(dbInfo.name!);
              request.onsuccess = () => resolve();
              request.onerror = () => reject(request.error);
            });
            logger.log('[FirestoreErrorBoundary] Cleared:', dbInfo.name);
          }
        }
      }

      // Clear localStorage
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('firebase') || key.includes('firestore'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        logger.log('[FirestoreErrorBoundary] Cleared localStorage');
      }

      // Reload the page
      window.location.reload();
    } catch (err) {
      logger.error('[FirestoreErrorBoundary] Failed to clear cache:', err);
      // Force reload anyway
      window.location.reload();
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isFirestoreError: false,
    });
  };

  render() {
    if (this.state.hasError) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, isFirestoreError } = this.state;

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <Card variant="elevated" padding="lg" className="max-w-2xl">
            <div className="text-center">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle size={32} className="text-red-600" />
                </div>
              </div>

              {/* Heading */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isFirestoreError ? 'Database Error' : 'Something Went Wrong'}
              </h1>

              {/* Description */}
              <p className="text-gray-600 mb-6">
                {isFirestoreError
                  ? 'There was an issue with the local database. This can usually be fixed by clearing the cache.'
                  : 'An unexpected error occurred. You can try again or refresh the page.'}
              </p>

              {/* Error details (development only) */}
              {process.env.NODE_ENV === 'development' && error && (
                <div className="bg-gray-50 rounded-lg p-4 text-left mb-6 max-h-48 overflow-auto">
                  <p className="text-xs font-mono text-gray-700 break-all">
                    {error.toString()}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="primary"
                  onClick={this.handleRetry}
                  leftIcon={<RefreshCw size={18} />}
                >
                  Try Again
                </Button>

                {isFirestoreError && (
                  <Button
                    variant="outline"
                    onClick={this.handleClearCache}
                  >
                    Clear Cache & Reload
                  </Button>
                )}

                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/'}
                >
                  Go Home
                </Button>
              </div>

              {/* Help text */}
              <p className="text-xs text-gray-500 mt-6">
                If the problem persists, try signing out and signing back in,
                or contact support.
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default FirestoreErrorBoundary;
