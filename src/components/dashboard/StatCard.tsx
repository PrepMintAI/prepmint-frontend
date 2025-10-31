// src/components/dashboard/StatCard.tsx
import React, { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  variant?: 'default' | 'gradient';
}

function StatCard({ label, value, icon, trend, className = '', variant = 'default' }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-50 rounded-lg text-blue-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders when parent re-renders
const MemoizedStatCard = React.memo(StatCard);

export default MemoizedStatCard;

// Also export as named export for compatibility
export { MemoizedStatCard as StatCard };
