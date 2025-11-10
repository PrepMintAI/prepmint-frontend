// src/app/dashboard/analytics/AnalyticsClient.tsx
'use client';

import { useState, useEffect } from 'react';
import Spinner from '@/components/common/Spinner';
import StudentAnalytics from '@/components/dashboard/StudentAnalytics';
import TeacherAnalytics from '@/app/dashboard/teacher/analytics/TeacherAnalytics';
import { InstitutionAnalyticsView } from '@/app/dashboard/institution/analytics/AnalyticsClient';
import AdminAnalytics from './AdminAnalytics';

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
    return <StudentAnalytics userId={userId} userName={userName} />;
  }

  if (role === 'teacher') {
    return <TeacherAnalytics userId={userId} userName={userName} />;
  }

  if (role === 'institution') {
    if (!institutionId) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">Institution ID not found.</p>
        </div>
      );
    }
    return <InstitutionAnalyticsView institutionId={institutionId} />;
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
