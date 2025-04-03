// src/components/ui/card.tsx
import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'small' | 'medium' | 'large';
  className?: string;
  // Adicionando propriedades de eventos comuns
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  onFocus?: React.FocusEventHandler<HTMLDivElement>;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  // Permite qualquer outra propriedade HTML nativa do div
  [key: string]: any;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...props // Captura propriedades adicionais
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

  // Adiciona a classe cursor-pointer se onClick existir
  const cursorStyles = onClick ? 'cursor-pointer' : '';

  return (
    <div 
      className={cn(baseStyles, variantStyles[variant], cursorStyles, className)}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      {...props}  // Passa qualquer propriedade adicional para o elemento div
    >
      {children}
    </div>
  );
};
