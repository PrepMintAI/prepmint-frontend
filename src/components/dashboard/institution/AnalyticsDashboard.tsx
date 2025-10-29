//src/components/dashboard/institution/AnalyticsDashboard.tsx

'use client';

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

// —————————————————————————————————————————————————————————————
// Types
// —————————————————————————————————————————————————————————————

interface SubjectPerformance {
  subject: string;
  avgScore: number;
  topPerformerScore: number;
}

interface PerformanceTrend {
  month: string;
  avg: number;
  target: number;
}

interface InstitutionAnalytics {
  activeStudents: number;
  avgPerformance: number;
  activeClasses: number;
  teachers: number;
  subjectPerformance: SubjectPerformance[];
  performanceTrend: PerformanceTrend[];
}

// —————————————————————————————————————————————————————————————
// Components
// —————————————————————————————————————————————————————————————

// Stat Card Component
const StatCard = ({
  label,
  value,
  icon,
  bgColor = 'bg-white',
  textColor = 'text-emerald-600',
}: {
  label: string;
  value: string;
  icon: string;
  bgColor?: string;
  textColor?: string;
}) => (
  <motion.div
    className={`rounded-2xl p-6 shadow-sm border border-gray-100 ${bgColor} hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
        <p className="text-gray-600 text-sm mt-1">{label}</p>
      </div>
      <div className="text-4xl opacity-70">{icon}</div>
    </div>
  </motion.div>
);

// Animated Progress Bar — ✅ SSR-Safe
const ProgressBar = ({ percentage }: { percentage: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true, // Only trigger once
    margin: '0px 0px -50px 0px', // Trigger when 50px from bottom of viewport
  });

  return (
    <div className="w-full bg-gray-200 rounded-full h-3.5 mt-4 relative">
      <motion.div
        ref={ref}
        initial={{ width: 0 }}
        animate={inView ? { width: `${percentage}%` } : { width: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="h-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
      />
      <p className="text-right text-sm font-medium text-gray-700 mt-2">
        {percentage}% Overall Progress
      </p>
    </div>
  );
};

// Header Section
const HeaderSection = () => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900">Brightwood Academy</h1>
      <p className="text-gray-600 mt-1">Academic Performance Dashboard</p>
    </div>
    <div className="mt-4 sm:mt-0">
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 animate-pulse">
        ● Live
      </span>
    </div>
  </div>
);

// Footer Section
const FooterSection = () => {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setLastUpdated(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-200">
      <p className="text-sm text-gray-500">
        Last updated {formatDistanceToNow(lastUpdated)} ago
      </p>
      <a
        href="#"
        className="text-emerald-600 font-medium hover:underline mt-2 sm:mt-0"
      >
        View full report →
      </a>
    </div>
  );
};

// Custom Tooltip for Line Chart
const CustomLineTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number;
    dataKey: string;
    payload: Record<string, unknown>;
  }>;
  label?: string;
}) => {
  if (active && payload && payload.length && label) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 drop-shadow-md">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-gray-600">{entry.name}: </span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Skeleton Loading
const SkeletonChart = () => (
  <div className="animate-pulse">
    <div className="h-80 bg-gray-100 rounded-xl"></div>
  </div>
);

// —————————————————————————————————————————————————————————————
// Main Dashboard Component
// —————————————————————————————————————————————————————————————

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<InstitutionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Gradient Colors for Bar Chart
  const BAR_GRADIENTS = [
    'url(#grad1)',
    'url(#grad2)',
    'url(#grad3)',
    'url(#grad4)',
    'url(#grad5)',
  ];

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      const mockData: InstitutionAnalytics = {
        activeStudents: 1248,
        avgPerformance: 86,
        activeClasses: 24,
        teachers: 12,
        subjectPerformance: [
          { subject: 'Math', avgScore: 85, topPerformerScore: 98 },
          { subject: 'Science', avgScore: 78, topPerformerScore: 95 },
          { subject: 'English', avgScore: 92, topPerformerScore: 99 },
          { subject: 'History', avgScore: 70, topPerformerScore: 88 },
          { subject: 'Geography', avgScore: 88, topPerformerScore: 96 },
        ],
        performanceTrend: [
          { month: 'Jan', avg: 75, target: 78 },
          { month: 'Feb', avg: 78, target: 80 },
          { month: 'Mar', avg: 82, target: 82 },
          { month: 'Apr', avg: 85, target: 84 },
          { month: 'May', avg: 88, target: 86 },
          { month: 'Jun', avg: 90, target: 88 },
        ],
      };

      setTimeout(() => {
        setAnalyticsData(mockData);
        setLoading(false);
      }, 800);
    };

    fetchAnalyticsData();
  }, []);

  // Animation Variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="rounded-2xl bg-white p-8 shadow-md">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/4"></div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="p-6 rounded-xl bg-gray-50">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 mt-8 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="rounded-xl bg-white p-6 shadow-md">
                <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
                <SkeletonChart />
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md mt-8">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <SkeletonChart />
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header */}
        <HeaderSection />

        {/* Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Active Students"
            value={analyticsData.activeStudents.toLocaleString()}
            icon="👥"
            bgColor="bg-gradient-to-br from-blue-50 to-indigo-50"
            textColor="text-blue-600"
          />
          <StatCard
            label="Avg. Score"
            value={`${analyticsData.avgPerformance}%`}
            icon="📊"
            bgColor="bg-gradient-to-br from-emerald-50 to-teal-50"
            textColor="text-emerald-600"
          />
          <StatCard
            label="Active Classes"
            value={analyticsData.activeClasses.toString()}
            icon="📚"
            bgColor="bg-gradient-to-br from-purple-50 to-pink-50"
            textColor="text-purple-600"
          />
          <StatCard
            label="Teachers"
            value={analyticsData.teachers.toString()}
            icon="👩‍🏫"
            bgColor="bg-gradient-to-br from-amber-50 to-orange-50"
            textColor="text-amber-600"
          />
        </motion.div>

        {/* Progress Bar */}
        <motion.div variants={item} className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800">Overall Progress</h3>
          <ProgressBar percentage={analyticsData.avgPerformance} />
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Subject Performance Bar Chart */}
          <motion.div variants={item} className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-800">Class Performance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={analyticsData.subjectPerformance}
                  margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34D399" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="grad3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F87171" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="grad4" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#D97706" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="grad5" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="subject"
                    tick={{ fill: '#4b5563', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#4b5563', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                    domain={[0, 100]}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: number) => [value, 'Score']}
                    labelStyle={{ color: '#1f2937', fontWeight: '600' }}
                  />
                  <Bar dataKey="avgScore" radius={[6, 6, 0, 0]}>
                    {analyticsData.subjectPerformance.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_GRADIENTS[index % BAR_GRADIENTS.length]} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Performance Trend Line Chart */}
          <motion.div variants={item} className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-800">Performance Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={analyticsData.performanceTrend}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#4b5563', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#4b5563', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                    domain={[70, 100]}
                    width={30}
                  />
                  <Tooltip content={<CustomLineTooltip />} />
                  <div style={{ paddingTop: '10px' }}>
                    <Legend
                      verticalAlign="top"
                      height={40}
                    />
                  </div>
                  <Line
                    type="monotone"
                    dataKey="avg"
                    name="Average Score"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10B981', strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Target"
                    stroke="#9CA3AF"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <FooterSection />
      </motion.div>
    </div>
  );
}