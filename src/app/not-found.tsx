import React from 'react';
import Link from 'next/link';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { AlertCircle, ArrowRight, Home } from 'lucide-react';

export const metadata = {
  title: '404 - Page Not Found | PrepMint',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card variant="elevated" padding="lg" className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle size={32} className="text-yellow-600" />
            </div>
          </div>

          {/* 404 Code */}
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-8">
            Sorry, the page you&apos;re looking for doesn&apos;t exist. It may have been moved or deleted.
          </p>

          {/* Suggestions */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <p className="text-sm font-medium text-gray-900 mb-3">Here are some helpful links:</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Home size={16} className="text-blue-600 flex-shrink-0" />
                <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Go to Home
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight size={16} className="text-blue-600 flex-shrink-0" />
                <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Go to Dashboard
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <ArrowRight size={16} className="text-blue-600 flex-shrink-0" />
                <Link href="/login" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Return to Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Primary Action */}
          <Link href="/" className="block">
            <Button
              variant="primary"
              size="md"
              fullWidth
              leftIcon={<Home size={18} />}
            >
              Go Home
            </Button>
          </Link>

          {/* Secondary Action */}
          <Link href="/dashboard" className="block mt-3">
            <Button
              variant="outline"
              size="md"
              fullWidth
            >
              Dashboard
            </Button>
          </Link>

          {/* Support Info */}
          <p className="text-xs text-gray-500 mt-6">
            Lost? Contact{' '}
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
      </div>
    </div>
  );
}
