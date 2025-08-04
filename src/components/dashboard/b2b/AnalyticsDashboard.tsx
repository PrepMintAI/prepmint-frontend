'use client';

import { Bar, BarChart as RechartsBarChart, CartesianGrid, Cell, Legend, Line, LineChart as RechartsLineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState, useEffect } from 'react';

// Define interfaces for backend data structure
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

interface SubjectDistribution {
  name: string;
  value: number;
  studentCount: number;
}

interface InstitutionAnalytics {
  activeStudents: number;
  avgPerformance: number;
  activeClasses: number;
  teachers: number;
  subjectPerformance: SubjectPerformance[];
  performanceTrend: PerformanceTrend[];
  subjectDistribution: SubjectDistribution[];
}

// Custom Tooltip Component for Pie Chart
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 min-w-48">
        <p className="font-semibold text-gray-800 mb-1">{data.name}</p>
        <p className="text-sm text-gray-600">Share: <span className="font-medium">{data.value}%</span></p>
        <p className="text-sm text-gray-600">Students: <span className="font-medium">{data.studentCount}</span></p>
      </div>
    );
  }
  return null;
};

// Skeleton Loading Component
const SkeletonChart = () => (
  <div className="animate-pulse">
    <div className="h-80 bg-gray-100 rounded-lg"></div>
  </div>
);

export default function AnalyticsDashboard() {
  // State for analytics data and loading
  const [analyticsData, setAnalyticsData] = useState<InstitutionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Colors for consistent chart styling
  const COLORS = ["#41D786", "#3ac574", "#33b362", "#2ca150", "#258f3e", "#1e7d2c"];

  useEffect(() => {
    // TODO: Replace with actual API call
    // Simulate API fetch with setTimeout
    const fetchAnalyticsData = async () => {
      // TODO: Fetch data from backend API
      // const response = await fetch('/api/institution/analytics');
      // const data = await response.json();
      
      // Mock data - replace with API response
      const mockData: InstitutionAnalytics = {
        activeStudents: 1248,
        avgPerformance: 86,
        activeClasses: 24,
        teachers: 12,
        subjectPerformance: [
          { subject: "Math", avgScore: 85, topPerformerScore: 98 },
          { subject: "Science", avgScore: 78, topPerformerScore: 95 },
          { subject: "English", avgScore: 92, topPerformerScore: 99 },
          { subject: "History", avgScore: 70, topPerformerScore: 88 },
          { subject: "Geography", avgScore: 88, topPerformerScore: 96 },
        ],
        performanceTrend: [
          { month: "Jan", avg: 75, target: 78 },
          { month: "Feb", avg: 78, target: 80 },
          { month: "Mar", avg: 82, target: 82 },
          { month: "Apr", avg: 85, target: 84 },
          { month: "May", avg: 88, target: 86 },
          { month: "Jun", avg: 90, target: 88 },
        ],
        subjectDistribution: [
          { name: "Math", value: 25, studentCount: 312 },
          { name: "Science", value: 20, studentCount: 250 },
          { name: "English", value: 15, studentCount: 187 },
          { name: "History", value: 10, studentCount: 125 },
          { name: "Geography", value: 10, studentCount: 125 },
          { name: "Others", value: 20, studentCount: 250 },
        ],
      };

      // Simulate network delay
      setTimeout(() => {
        setAnalyticsData(mockData);
        setLoading(false);
      }, 800);
    };

    fetchAnalyticsData();
  }, []);

  // Custom Tooltip for Line Chart
  const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
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

  // Early return for loading state
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="rounded-xl bg-white p-6 shadow-md">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/4"></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 rounded-xl bg-gray-100">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-xl bg-white p-6 shadow-md">
                <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
                <SkeletonChart />
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <SkeletonChart />
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6 p-6">
      {/* Metrics Cards */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">Institution Analytics</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active Students", value: analyticsData.activeStudents.toLocaleString(), icon: "👥" },
            { label: "Avg. Performance", value: `${analyticsData.avgPerformance}%`, icon: "📈" },
            { label: "Active Classes", value: analyticsData.activeClasses.toString(), icon: "📚" },
            { label: "Teachers", value: analyticsData.teachers.toString(), icon: "👨‍🏫" },
          ].map((metric, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div className="text-3xl mb-1">{metric.icon}</div>
              <p className="text-2xl font-bold text-emerald-600">{metric.value}</p>
              <p className="text-gray-600 text-sm mt-1">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Subject Performance Bar Chart */}
        <div className="rounded-xl bg-white p-6 shadow-md">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Subject Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart 
                data={analyticsData.subjectPerformance} 
                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              >
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
                  label={{ 
                    value: 'Score (%)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { textAnchor: 'middle', fill: '#4b5563', fontSize: 12 } 
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number, name: string) => [`${value}`, name]}
                  labelStyle={{ color: '#1f2937', fontWeight: '600' }}
                />
                <Legend
                  formatter={() => <span className="text-gray-700 font-medium">Average Score</span>}
                  verticalAlign="top"
                  height={40}
                />
                <Bar 
                  dataKey="avgScore" 
                  name="Average Score"
                  radius={[4, 4, 0, 0]}
                >
                  {analyticsData.subjectPerformance.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="transition-all duration-200 hover:opacity-80"
                    />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Trend Line Chart */}
        <div className="rounded-xl bg-white p-6 shadow-md">
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
                  label={{ 
                    value: 'Score (%)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { textAnchor: 'middle', fill: '#4b5563', fontSize: 12 } 
                  }}
                />
                <Tooltip content={<CustomLineTooltip />} />
                <Legend
                  formatter={() => <span className="text-gray-700 font-medium">Performance</span>}
                  verticalAlign="top"
                  height={40}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  name="Average Score"
                  stroke="#41D786"
                  strokeWidth={3}
                  dot={{ fill: '#41D786', r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  className="transition-all duration-200"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Target"
                  stroke="#6b7280"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  className="transition-all duration-200"
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="rounded-xl bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-bold text-gray-800">Subject Distribution</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={analyticsData.subjectDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent?.toFixed(0))}%`}
              >
                {analyticsData.subjectDistribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    className="transition-all duration-200 hover:opacity-80 outline-none focus:outline-none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend
                payload={analyticsData.subjectDistribution.map((entry, i) => ({
                  id: entry.name,
                  value: entry.name,
                  type: 'circle',
                  color: COLORS[i % COLORS.length],
                }))}
                wrapperStyle={{ paddingTop: 16 }}
                formatter={(value) => <span className="text-gray-700 text-sm font-medium">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}