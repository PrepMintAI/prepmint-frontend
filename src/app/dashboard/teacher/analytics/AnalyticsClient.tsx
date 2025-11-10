// src/app/dashboard/teacher/analytics/AnalyticsClient.tsx
'use client';

import TeacherAnalytics from './TeacherAnalytics';
import InstitutionAnalytics from '@/components/dashboard/InstitutionAnalytics';
import Card from '@/components/common/Card';

interface AnalyticsClientProps {
  userId: string;
  userRole: string;
  institutionId?: string;
  studentId?: string;
  testId?: string;
}

export function AnalyticsClient({
  userId,
  userRole,
  institutionId,
  studentId,
  testId,
}: AnalyticsClientProps) {
  // Institution Analytics
  if (userRole === 'institution' && institutionId) {
    return (
      <div className="space-y-6">
        <InstitutionAnalytics institutionId={institutionId} userId={userId} />
      </div>
    );
  }

  // Teacher Analytics
  if (userRole === 'teacher') {
    return <TeacherAnalytics userId={userId} userName="Teacher" />;
  }

  return (
    <div className="space-y-6">
      <Card variant="elevated" padding="lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Analytics
        </h2>
        <p className="text-gray-600 text-sm">
          Analytics dashboard for role: {userRole}
        </p>
      </Card>
    </div>
  );
}
