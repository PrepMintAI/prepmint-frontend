// src/app/dashboard/analytics/AnalyticsClient.tsx
'use client';

import { useState, useEffect } from 'react';
import Spinner from '@/components/common/Spinner';
import StudentAnalytics from '@/components/dashboard/StudentAnalytics';

interface AnalyticsClientProps {
  userId: string;
  role: 'student' | 'teacher' | 'admin' | 'institution' | 'dev';
  institutionId?: string;
  userName: string;
}

export default function AnalyticsClient({
  userId,
  role,
  institutionId,
  userName,
}: AnalyticsClientProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [userId]);

  if (isLoading) {
    return <Spinner fullScreen label="Loading analytics..." />;
  }

  // Render based on user role
  if (role === 'student' || role === 'dev') {
    return <StudentAnalyticsWrapper userId={userId} userName={userName} />;
  }

  if (role === 'teacher') {
    return <TeacherAnalytics userId={userId} userName={userName} />;
  }

  if (role === 'institution') {
    return (
      <InstitutionAnalytics
        userId={userId}
        institutionId={institutionId}
        userName={userName}
      />
    );
  }

  if (role === 'admin') {
    return <AdminAnalytics userId={userId} userName={userName} />;
  }

  return (
    <div className="text-center py-12">
      <p className="text-gray-600">Analytics not available for your role.</p>
    </div>
  );
}

// ===== Simple Wrapper Component =====

function StudentAnalyticsWrapper({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  return <StudentAnalytics userId={userId} userName={userName} />;
}

// Teacher Analytics View
function TeacherAnalytics({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Teacher Analytics
        </h2>
        <div className="text-gray-600">
          <p className="mb-2">Welcome, {userName}!</p>
          <p className="text-sm">
            This section will display student performance metrics, evaluation
            statistics, class insights, and assessment analytics.
          </p>
        </div>
      </div>

      {/* Placeholder sections for Teacher Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Class Performance</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Student Progress</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">
            Assessment Insights
          </h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Evaluation Stats</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
      </div>
    </div>
  );
}

// Institution Analytics View
function InstitutionAnalytics({
  userId,
  institutionId,
  userName,
}: {
  userId: string;
  institutionId?: string;
  userName: string;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Institution Analytics
        </h2>
        <div className="text-gray-600">
          <p className="mb-2">Welcome, {userName}!</p>
          <p className="text-sm">
            This section will display institution-wide analytics, including
            student performance, teacher metrics, and institutional insights.
          </p>
          {institutionId && (
            <p className="text-sm text-gray-500 mt-2">
              Institution ID: {institutionId}
            </p>
          )}
        </div>
      </div>

      {/* Placeholder sections for Institution Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Student Overview</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Teacher Performance</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">
            Institutional Metrics
          </h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Assessment Data</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
      </div>
    </div>
  );
}

// Admin Analytics View
function AdminAnalytics({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Admin Analytics
        </h2>
        <div className="text-gray-600">
          <p className="mb-2">Welcome, {userName}!</p>
          <p className="text-sm">
            This section will display system-wide analytics, including platform
            usage, user statistics, and institutional data.
          </p>
        </div>
      </div>

      {/* Placeholder sections for Admin Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Platform Stats</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">User Analytics</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">
            Institution Overview
          </h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">System Health</h3>
          <p className="text-sm text-gray-600">Coming soon</p>
        </div>
      </div>
    </div>
  );
}
