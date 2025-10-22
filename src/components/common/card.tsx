// src/components/common/Card.tsx
import React, { HTMLAttributes } from 'react';

type CardVariant = 'default' | 'bordered' | 'elevated' | 'glass' | 'gradient';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-white border border-gray-200',
  bordered: 'bg-white border-2 border-gray-300',
  elevated: 'bg-white shadow-lg border border-gray-100',
  glass: 'bg-white/80 backdrop-blur-sm border border-gray-200/50',
  gradient: 'bg-gradient-to-br from-blue-50 to-white border border-blue-200',
};

const paddingClasses = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export default function Card({
  variant = 'default',
  padding = 'md',
  hover = false,
  clickable = false,
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-lg transition-all duration-200
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${hover ? 'hover:shadow-lg hover:-translate-y-1' : ''}
        ${clickable ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// Card Header Component
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, icon, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  );
}

// Card Body Component
interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={`text-gray-700 ${className}`}>{children}</div>;
}

// Card Footer Component
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}

export function CardFooter({ children, className = '', divider = true }: CardFooterProps) {
  return (
    <div className={`${divider ? 'mt-4 pt-4 border-t border-gray-200' : 'mt-4'} ${className}`}>
      {children}
    </div>
  );
}

// Stat Card (for metrics/numbers)
interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  variant?: CardVariant;
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  variant = 'default',
  trend = 'neutral',
  onClick,
}: StatCardProps) {
  const trendColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  return (
    <Card
      variant={variant}
      hover={!!onClick}
      clickable={!!onClick}
      onClick={onClick}
      className="relative overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${trendColors[trend]}`}>
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {change > 0 ? '+' : ''}{change}%
              </span>
              {changeLabel && <span className="text-xs text-gray-500">{changeLabel}</span>}
            </div>
          )}
        </div>
        
        {icon && (
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// Progress Card (for XP, streaks, etc.)
interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple';
  suffix?: string;
}

export function ProgressCard({
  title,
  current,
  total,
  icon,
  color = 'blue',
  suffix = '',
}: ProgressCardProps) {
  const percentage = Math.min((current / total) * 100, 100);
  
  const colorClasses = {
    blue: { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-500', light: 'bg-green-100', text: 'text-green-600' },
    orange: { bg: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-600' },
    purple: { bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-600' },
  };

  return (
    <Card variant="elevated">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && <div className={`${colorClasses[color].text}`}>{icon}</div>}
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
        <span className="text-sm font-bold text-gray-900">
          {current}/{total}{suffix}
        </span>
      </div>
      
      <div className={`w-full ${colorClasses[color].light} rounded-full h-3`}>
        <div
          className={`${colorClasses[color].bg} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <p className="text-xs text-gray-500 mt-2">{percentage.toFixed(0)}% Complete</p>
    </Card>
  );
}

// Badge Card (for achievements)
interface BadgeCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  earned?: boolean;
  earnedDate?: string;
  onClick?: () => void;
}

export function BadgeCard({
  name,
  description,
  icon,
  earned = false,
  earnedDate,
  onClick,
}: BadgeCardProps) {
  return (
    <Card
      variant={earned ? 'gradient' : 'default'}
      hover
      clickable={!!onClick}
      onClick={onClick}
      className={`text-center ${!earned ? 'opacity-50 grayscale' : ''}`}
    >
      <div className="flex flex-col items-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
            earned ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : 'bg-gray-200 text-gray-400'
          }`}
        >
          {icon}
        </div>
        <h4 className="font-semibold text-gray-900 mb-1">{name}</h4>
        <p className="text-xs text-gray-600 mb-2">{description}</p>
        {earned && earnedDate && (
          <p className="text-xs text-blue-600">Earned {earnedDate}</p>
        )}
        {!earned && <p className="text-xs text-gray-500">Not earned yet</p>}
      </div>
    </Card>
  );
}
