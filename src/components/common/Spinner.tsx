// src/components/common/Spinner.tsx
import React from 'react';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'primary' | 'secondary' | 'white' | 'success' | 'danger';

interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
  label?: string;
  fullScreen?: boolean;
}

const sizeClasses: Record<SpinnerSize, string> = {
  xs: 'h-4 w-4 border-2',
  sm: 'h-6 w-6 border-2',
  md: 'h-10 w-10 border-3',
  lg: 'h-16 w-16 border-4',
  xl: 'h-24 w-24 border-4',
};

const variantClasses: Record<SpinnerVariant, string> = {
  primary: 'border-blue-600 border-t-transparent',
  secondary: 'border-gray-600 border-t-transparent',
  white: 'border-white border-t-transparent',
  success: 'border-green-600 border-t-transparent',
  danger: 'border-red-600 border-t-transparent',
};

export default function Spinner({
  size = 'md',
  variant = 'primary',
  className = '',
  label,
  fullScreen = false,
}: SpinnerProps) {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && (
        <p className="text-sm text-gray-600 font-medium animate-pulse">
          {label}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Alternative inline spinner for tight spaces
export function InlineSpinner({ 
  size = 'sm', 
  variant = 'primary',
  className = '' 
}: Pick<SpinnerProps, 'size' | 'variant' | 'className'>) {
  return (
    <div
      className={`inline-block animate-spin rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

// Spinner with overlay for button states
export function ButtonSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
      <InlineSpinner size="sm" variant="white" />
    </div>
  );
}
