
// src/components/ui/button.tsx
import React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  className,
}) => {
  const baseStyles = 'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50';
  
  const variantStyles = {
    default: 'bg-primary hover:bg-primary-light text-white',
    accent: 'bg-accent-main hover:bg-accent-light text-white',
    outline: 'bg-transparent border border-primary text-primary hover:bg-primary hover:bg-opacity-10',
    ghost: 'bg-transparent hover:bg-white hover:bg-opacity-5 text-white',
  };
  
  const sizeStyles = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };
  
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        disabledStyles,
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

