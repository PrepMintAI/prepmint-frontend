'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    // Send error to Sentry for monitoring
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: error.stack,
        },
      },
      tags: {
        errorBoundary: 'true',
        digest: error.digest || 'unknown',
      },
    });

    // Log error for local debugging
    logger.error('[Error Boundary]', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card variant="elevated" padding="lg" className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle size={32} className="text-red-600" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            We&apos;re sorry for the inconvenience. An unexpected error occurred while processing your request.
          </p>

          {/* Error Message (Dev Only) */}
          {isDevelopment && error.message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left"
            >
              <p className="text-sm font-mono text-red-700 break-words">
                <span className="font-bold">Error:</span> {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 mt-2 break-words">
                  <span className="font-bold">Digest:</span> {error.digest}
                </p>
              )}
            </motion.div>
          )}

          {/* Stack Trace (Dev Only) */}
          {isDevelopment && error.stack && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-gray-800 border border-gray-600 rounded-lg text-left max-h-32 overflow-y-auto"
            >
              <p className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-words">
                {error.stack}
              </p>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={reset}
              leftIcon={<RefreshCw size={18} />}
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => router.push('/')}
              leftIcon={<Home size={18} />}
            >
              Go Home
            </Button>
          </div>

          {/* Support Link */}
          <p className="text-xs text-gray-500 mt-6">
            If the problem persists, please contact{' '}
            <a
              href="mailto:support@prepmint.in"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              support@prepmint.in
            </a>
          </p>
        </Card>

        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, #1f2937 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
