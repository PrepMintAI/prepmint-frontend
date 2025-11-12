// src/components/admin/FirebaseAdminCheck.tsx
import { AlertCircle, Settings } from 'lucide-react';
import Card from '@/components/common/Card';

/**
 * Component to display when Firebase Admin SDK is not properly configured
 * Shows helpful error message with configuration instructions
 */
export default function FirebaseAdminNotConfigured() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card variant="elevated" padding="lg" className="max-w-2xl">
        <div className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle size={32} className="text-orange-600" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Firebase Admin SDK Not Configured
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            The Firebase Admin SDK credentials are not properly configured on the server.
            Admin features require Firebase Admin credentials to verify user sessions.
          </p>

          {/* Configuration Steps */}
          <div className="bg-gray-50 rounded-lg p-6 text-left mb-6">
            <div className="flex items-start gap-3 mb-4">
              <Settings size={20} className="text-gray-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Configuration Required</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Please configure the following environment variables on your server:
                </p>
              </div>
            </div>

            <div className="bg-gray-800 rounded p-4 overflow-x-auto">
              <code className="text-xs text-green-400 whitespace-pre font-mono">
{`# Firebase Admin SDK (server-side only)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"`}
              </code>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p className="mb-2">
                <strong>For Vercel:</strong> Add these in{' '}
                <span className="font-mono bg-gray-200 px-1 rounded">Settings → Environment Variables</span>
              </p>
              <p className="mb-2">
                <strong>For local development:</strong> Add to{' '}
                <span className="font-mono bg-gray-200 px-1 rounded">.env.local</span> file
              </p>
              <p className="text-xs text-gray-500 mt-3">
                Get credentials from Firebase Console → Project Settings → Service Accounts → Generate New Private Key
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <a
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Open Firebase Console
            </a>
            <a
              href="/"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Go to Home
            </a>
          </div>

          {/* Support */}
          <p className="text-xs text-gray-500 mt-6">
            If you&apos;ve already configured these variables, try restarting your server.
          </p>
        </div>
      </Card>
    </div>
  );
}
