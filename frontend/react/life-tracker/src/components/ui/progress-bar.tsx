
// src/components/ui/progress-bar.tsx
import React from 'react';
import { cn } from '@/utils/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = 'primary',
  size = 'medium',
  showLabel = false,
  className,
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
  
  const colorStyles = {
    primary: 'bg-primary',
    success: 'bg-feedback-success',
    warning: 'bg-feedback-warning',
    error: 'bg-feedback-error',
  };
  
  const sizeStyles = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3',
  };

  return (
    <div className="w-full">
      <div className={cn('w-full bg-dark-border rounded-full overflow-hidden', sizeStyles[size], className)}>
        <div
          className={cn('transition-all duration-300 ease-in-out', colorStyles[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-xs text-gray-400 mt-1 text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

