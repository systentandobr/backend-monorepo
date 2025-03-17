'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export interface OptionProps {
  id: string;
  text: string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
  isSelected?: boolean;
  visualIndicator?: 'triangle' | 'circle' | 'none';
}

interface QuestionCardProps {
  question: string;
  description?: string;
  options: OptionProps[];
  onSelect: (optionId: string) => void;
  selectedOptionId?: string;
  className?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  description,
  options,
  onSelect,
  selectedOptionId,
  className,
}) => {
  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <h2 className="text-2xl font-bold text-white text-center mb-2">{question}</h2>
      {description && (
        <p className="text-gray-400 text-center mb-8">{description}</p>
      )}
      
      <div className="space-y-3">
        {options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            isSelected={option.id === selectedOptionId}
            onClick={() => onSelect(option.id)}
          />
        ))}
      </div>
    </div>
  );
};

interface OptionCardProps {
  option: OptionProps;
  isSelected?: boolean;
  onClick: () => void;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  option,
  isSelected = false,
  onClick,
}) => {
  const {
    text,
    description,
    icon,
    visualIndicator = 'triangle'
  } = option;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-lg transition-colors relative overflow-hidden",
        "bg-dark-card hover:bg-gray-800",
        isSelected && "ring-1 ring-primary"
      )}
    >
      <div className="relative z-10 flex justify-between items-center">
        <div>
          <p className="text-white font-medium">{text}</p>
          {description && (
            <p className="text-gray-400 text-sm mt-1">{description}</p>
          )}
        </div>
        
        {isSelected && visualIndicator === 'triangle' && (
          <div className="text-red-500 mr-2">◀</div>
        )}
        
        {isSelected && visualIndicator === 'circle' && (
          <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center">
            <span className="text-xs text-black">✓</span>
          </div>
        )}
      </div>
      
      {/* Decorative elements */}
      <div className="absolute right-0 bottom-0">
        {isSelected ? (
          <div className="right-0 bottom-0 w-24 h-24">
            <div className="absolute right-0 bottom-0 w-12 h-12 bg-teal-600 rounded-full opacity-20 transform translate-x-6 translate-y-6" />
            <div className="absolute right-4 bottom-8 w-6 h-6 bg-teal-500 rounded-full opacity-30" />
            <div className="absolute right-10 bottom-2 w-8 h-8 bg-teal-700 rounded-full opacity-20" />
          </div>
        ) : (
          <div className="h-12 w-12 rounded-full bg-gray-700 opacity-10" />
        )}
      </div>
    </motion.button>
  );
};

export default QuestionCard;
