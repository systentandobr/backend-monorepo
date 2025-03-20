import React from 'react';
import { motion } from 'framer-motion';
import { Option } from '@/config/onboarding';
import { animations } from '@/utils/animations';

interface QuestionCardProps {
  icon: React.ReactNode;
  question: string;
  options: Option[];
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  icon,
  question,
  options,
  selectedOptionId,
  onSelect
}) => {
  return (
    <motion.div 
      className="bg-dark-card p-6 rounded-xl shadow-lg max-w-md w-full"
      variants={animations.containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex items-center mb-6"
        variants={animations.itemVariants}
      >
        <div className="w-10 h-10 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4">
          {icon}
        </div>
        <h2 className="text-xl font-semibold">{question}</h2>
      </motion.div>
      
      <div className="space-y-4">
        {options.map((option) => (
          <motion.div
            key={option.id}
            className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 ${
              selectedOptionId === option.id 
                ? 'border-primary bg-primary bg-opacity-10' 
                : 'border-gray-700 hover:border-gray-500'
            }`}
            onClick={() => onSelect(option.id)}
            variants={animations.itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{option.text}</h3>
                {option.description && (
                  <p className="text-sm text-gray-400 mt-1">{option.description}</p>
                )}
              </div>
              
              {option.visualIndicator === 'triangle' && (
                <div className="w-0 h-0 border-left-8 border-right-8 border-bottom-16 border-transparent border-b-primary ml-2" />
              )}
              
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                selectedOptionId === option.id 
                  ? 'bg-primary' 
                  : 'bg-gray-700'
              }`}>
                {selectedOptionId === option.id && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default QuestionCard;