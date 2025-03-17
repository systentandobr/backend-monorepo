// src/components/ui/card.tsx
import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  className,
}) => {
  const baseStyles = 'rounded-lg overflow-hidden';
  const variantStyles = {
    default: 'bg-dark-card',
    elevated: 'bg-dark-card shadow-lg',
    outlined: 'bg-transparent border border-dark-border',
  };
  const paddingStyles = {
    small: 'p-2',
    medium: 'p-4',
    large: 'p-6',
  };

  return (
    <div className={cn(baseStyles, variantStyles[variant], className)}>
      {children}
    </div>
  );
};
