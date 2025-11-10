'use client';

import React, { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for critical failures
 * Must include <html> and <body> tags (Next.js requirement)
 * Minimal dependencies - may run when other code fails
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Send critical error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: error.stack,
        },
      },
      tags: {
        errorBoundary: 'global',
        digest: error.digest || 'unknown',
      },
      level: 'fatal',
    });

    // Log critical error for monitoring
    logger.error('[Global Error Boundary]', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f3f4f6',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
          }}
        >
          <div style={{ maxWidth: '448px', width: '100%', padding: '16px' }}>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                padding: '24px',
                textAlign: 'center',
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#fee2e2',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>

              {/* Heading */}
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '8px',
                  marginTop: 0,
                }}
              >
                Critical Error
              </h1>

              {/* Description */}
              <p
                style={{
                  color: '#4b5563',
                  marginBottom: '24px',
                  marginTop: 0,
                  lineHeight: 1.5,
                }}
              >
                A critical system error occurred. We&apos;re working to fix this issue. Please try again.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && error.message && (
                <div
                  style={{
                    marginBottom: '20px',
                    padding: '12px',
                    backgroundColor: '#fef2f2',
                    borderRadius: '6px',
                    textAlign: 'left',
                    border: '1px solid #fecaca',
                  }}
                >
                  <p
                    style={{
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      color: '#991b1b',
                      margin: 0,
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    <strong>Error:</strong> {error.message}
                  </p>
                </div>
              )}

              {/* Reset Button */}
              <button
                onClick={reset}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                }}
              >
                Try Again
              </button>

              {/* Home Link */}
              <a
                href="/"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 16px',
                  backgroundColor: 'transparent',
                  color: '#2563eb',
                  border: '2px solid #2563eb',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLAnchorElement).style.backgroundColor = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLAnchorElement).style.backgroundColor = 'transparent';
                }}
              >
                Go Home
              </a>

              {/* Support Info */}
              <p
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginTop: '20px',
                  marginBottom: 0,
                }}
              >
                Contact{' '}
                <a
                  href="mailto:support@prepmint.in"
                  style={{
                    color: '#2563eb',
                    textDecoration: 'none',
                  }}
                >
                  support@prepmint.in
                </a>{' '}
                for help
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
