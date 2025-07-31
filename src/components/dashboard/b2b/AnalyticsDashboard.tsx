// src/components/dashboard/b2b/AnalyticsDashboard.tsx

'use client';

import { BarChart, LineChart, PieChart } from "recharts";
import { Bar, BarChart as RechartsBarChart, CartesianGrid, Cell, Legend, Line, LineChart as RechartsLineChart, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const performanceData = [
  { subject: "Math", score: 85 },
  { subject: "Science", score: 78 },
  { subject: "English", score: 92 },
  { subject: "History", score: 70 },
  { subject: "Geography", score: 88 },
];

const progressData = [
  { month: "Jan", avg: 75 },
  { month: "Feb", avg: 78 },
  { month: "Mar", avg: 82 },
  { month: "Apr", avg: 85 },
  { month: "May", avg: 88 },
  { month: "Jun", avg: 90 },
];

const subjectDistribution = [
  { name: "Math", value: 25 },
  { name: "Science", value: 20 },
  { name: "English", value: 15 },
  { name: "History", value: 10 },
  { name: "Geography", value: 10 },
  { name: "Others", value: 20 },
];

const COLORS = ["#41D786", "#3ac574", "#33b362", "#2ca150", "#258f3e", "#1e7d2c"];

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">Institution Analytics</h2>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-4 text-center">
            <p className="text-3xl font-bold text-[#41D786]">1,248</p>
            <p className="text-gray-600">Active Students</p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-3xl font-bold text-[#41D786]">86%</p>
            <p className="text-gray-600">Avg. Performance</p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-3xl font-bold text-[#41D786]">24</p>
            <p className="text-gray-600">Active Classes</p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-3xl font-bold text-[#41D786]">12</p>
            <p className="text-gray-600">Teachers</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Subject Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" name="Average Score">
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">Performance Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avg" 
                  name="Average Score" 
                  stroke="#41D786" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }} 
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold">Subject Distribution</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={subjectDistribution}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {subjectDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}