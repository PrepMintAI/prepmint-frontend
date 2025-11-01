'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import {
  Download, ArrowLeft, FileText, BarChart3, Users, GraduationCap,
  Calendar, TrendingUp, FileSpreadsheet, Filter, CheckCircle
} from 'lucide-react';
import {
  getStudentsByInstitution,
  getTeachersByInstitution,
  getTestsByInstitution,
} from '@/lib/comprehensiveMockData';

type ReportType = 'student' | 'teacher' | 'academic' | 'attendance' | 'performance';

interface ReportCard {
  id: ReportType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  format: string[];
}

export function ReportsClient({ institutionId }: { institutionId: string }) {
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  // Fetch data
  const students = useMemo(() => getStudentsByInstitution(institutionId), [institutionId]);
  const teachers = useMemo(() => getTeachersByInstitution(institutionId), [institutionId]);
  const tests = useMemo(() => getTestsByInstitution(institutionId), [institutionId]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const avgPerformance = Math.round(
      students.reduce((acc, s) => acc + s.performance.overallPercentage, 0) /
      Math.max(1, students.length)
    );

    const avgAttendance = Math.round(
      students.reduce((acc, s) => acc + s.performance.attendance, 0) /
      Math.max(1, students.length)
    );

    const completedTests = tests.filter(t => t.status === 'completed').length;

    return {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      avgPerformance,
      avgAttendance,
      completedTests,
      totalTests: tests.length,
    };
  }, [students, teachers, tests]);

  const reportCards: ReportCard[] = [
    {
      id: 'student',
      title: 'Student Report',
      description: 'Comprehensive student data including performance, attendance, and demographics',
      icon: <Users size={24} />,
      color: 'from-blue-500 to-cyan-600',
      format: ['PDF', 'Excel', 'CSV'],
    },
    {
      id: 'teacher',
      title: 'Teacher Report',
      description: 'Teacher profiles, assigned classes, subjects, and performance metrics',
      icon: <GraduationCap size={24} />,
      color: 'from-purple-500 to-pink-600',
      format: ['PDF', 'Excel'],
    },
    {
      id: 'academic',
      title: 'Academic Performance',
      description: 'Subject-wise performance analysis, test scores, and grade distribution',
      icon: <BarChart3 size={24} />,
      color: 'from-green-500 to-emerald-600',
      format: ['PDF', 'Excel'],
    },
    {
      id: 'attendance',
      title: 'Attendance Report',
      description: 'Class-wise and student-wise attendance tracking and analysis',
      icon: <Calendar size={24} />,
      color: 'from-orange-500 to-red-600',
      format: ['PDF', 'Excel', 'CSV'],
    },
    {
      id: 'performance',
      title: 'Performance Trends',
      description: 'Historical performance data, trends, and comparative analysis',
      icon: <TrendingUp size={24} />,
      color: 'from-indigo-500 to-purple-600',
      format: ['PDF', 'Excel'],
    },
  ];

  const handleDownloadReport = (reportType: ReportType, format: string) => {
    // TODO: In production, call API to generate and download report
    alert(`Downloading ${reportType} report in ${format} format...`);
  };

  const handleGenerateCustomReport = () => {
    alert('Custom report builder coming soon!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          leftIcon={<ArrowLeft size={20} />}
          onClick={() => router.push('/dashboard/institution')}
        >
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText size={28} />
            Reports & Analytics
          </h1>
          <p className="text-gray-600">Generate and download comprehensive institutional reports</p>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Total Teachers</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalTeachers}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Avg Performance</p>
          <p className="text-2xl font-bold text-green-600">{stats.avgPerformance}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Avg Attendance</p>
          <p className="text-2xl font-bold text-blue-600">{stats.avgAttendance}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Tests Completed</p>
          <p className="text-2xl font-bold text-gray-900">{stats.completedTests}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Total Tests</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalTests}</p>
        </Card>
      </div>

      {/* Date Range Filter */}
      <Card className="p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              From Date
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              To Date
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          <Button variant="outline" leftIcon={<Filter size={20} />}>
            Apply Filter
          </Button>
        </div>
      </Card>

      {/* Available Reports */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Reports</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportCards.map((report) => (
            <Card
              key={report.id}
              variant="elevated"
              padding="lg"
              hover
              className="cursor-pointer transition-all"
              onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center text-white`}>
                  {report.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{report.title}</h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
              </div>

              {selectedReport === report.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Download Format:</p>
                  <div className="flex flex-wrap gap-2">
                    {report.format.map((format) => (
                      <Button
                        key={format}
                        size="sm"
                        variant="outline"
                        leftIcon={
                          format === 'PDF' ? <FileText size={16} /> :
                          format === 'Excel' ? <FileSpreadsheet size={16} /> :
                          <Download size={16} />
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadReport(report.id, format);
                        }}
                      >
                        {format}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Report Builder */}
      <Card variant="elevated" className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white">
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Custom Report Builder</h3>
              <p className="text-sm text-gray-600">
                Create custom reports with specific metrics, filters, and data points
              </p>
            </div>
          </div>
          <Button
            leftIcon={<CheckCircle size={20} />}
            onClick={handleGenerateCustomReport}
          >
            Build Custom Report
          </Button>
        </div>
      </Card>

      {/* Scheduled Reports */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Scheduled Reports</h2>
        <p className="text-gray-600 mb-4">
          Set up automated report generation and email delivery on a recurring schedule
        </p>
        <Button variant="outline" leftIcon={<Calendar size={20} />}>
          Configure Scheduled Reports
        </Button>
      </Card>
    </div>
  );
}
