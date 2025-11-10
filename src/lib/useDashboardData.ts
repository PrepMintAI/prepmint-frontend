import { useEffect, useState } from 'react';
import { logger } from './logger';

interface DashboardData {
  xp: number;
  streak: number;
  level: number;
  xpToNextLevel: number;
  activity: { date: string; xp: number }[];
  subjectProgress: { subject: string; percent: number; color: string }[];
  upcomingTests: { title: string; date: string; subject: string; xp: number }[];
}

// ✅ Fallback mock data (used until API is connected)
const fallbackData: DashboardData = {
  xp: 2450,
  streak: 7,
  level: 5,
  xpToNextLevel: 550,
  activity: Array.from({ length: 90 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      date: date.toISOString().split('T')[0],
      xp: Math.floor(Math.random() * 50),
    };
  }).reverse(),
  subjectProgress: [
    { subject: 'Mathematics', percent: 85, color: '#3AB5E5' },
    { subject: 'Science', percent: 72, color: '#41D786' },
    { subject: 'History', percent: 60, color: '#FF6B6B' },
    { subject: 'Literature', percent: 90, color: '#FFD93D' },
    { subject: 'Languages', percent: 45, color: '#6C5CE7' },
  ],
  upcomingTests: [
    { title: 'Algebra Final', date: '2023-08-15', subject: 'Mathematics', xp: 150 },
    { title: 'Chemistry Quiz', date: '2023-08-18', subject: 'Science', xp: 100 },
    { title: 'World War II Test', date: '2023-08-22', subject: 'History', xp: 120 },
  ],
};

export const useDashboardData = (range: 'week' | 'month' | 'year' = 'week'): DashboardData => {
  const [data, setData] = useState<DashboardData>(fallbackData);

  useEffect(() => {
    /**
     * TODO: Replace with actual API call
     * Example endpoint: `/api/dashboard?range=${range}`
     * 
     * fetch(`/api/dashboard?range=${range}`)
     *   .then(res => res.json())
     *   .then((json: DashboardData) => setData(json))
     *   .catch(err => {
     *     logger.error("Failed to fetch dashboard data:", err);
     *     setData(fallbackData); // fallback on error
     *   });
     */

    // For now, just simulate delay for async feel
    const timeout = setTimeout(() => {
      setData(fallbackData);
    }, 200);

    return () => clearTimeout(timeout);
  }, [range]);

  return data;
};



/*
For /api/dashboard?range=week, your backend can return:

{
  "xp": 2450,
  "streak": 7,
  "level": 5,
  "xpToNextLevel": 550,
  "activity": [
    { "date": "2023-07-01", "xp": 30 },
    ...
  ],
  "subjectProgress": [
    { "subject": "Mathematics", "percent": 85, "color": "#3AB5E5" },
    ...
  ],
  "upcomingTests": [
    { "title": "Algebra Final", "date": "2023-08-15", "subject": "Mathematics", "xp": 150 },
    ...
  ]
}
*/