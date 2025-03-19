// src/components/onboarding/MultiSelectCard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface Option {
  id: string;
  text: string;
  description?: string;
}

interface MultiSelectCardProps {
  icon: React.ReactNode;
  question: string;
  options: Option[];
  selectedOptions: string[];
  minSelections: number;
  onComplete: (selected: string[]) => void;
}

const MultiSelectCard: React.FC<MultiSelectCardProps> = ({
  icon,
  question,
  options,
  selectedOptions,
  minSelections,
  onComplete
}) => {
  // Estado local para os itens selecionados
  const [selected, setSelected] = useState<string[]>(selectedOptions || []);
  // Estado para rastrear se a quantidade mínima já foi selecionada
  const [isValid, setIsValid] = useState(selectedOptions?.length >= minSelections);
  
  // Atualiza a validação quando as seleções mudam
  useEffect(() => {
    setIsValid(selected.length >= minSelections);
  }, [selected, minSelections]);
  
  // Alterna a seleção de uma opção
  const toggleOption = (optionId: string) => {
    setSelected(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };
  
  // Animações
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="bg-dark-card p-6 rounded-xl max-w-md w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4">
          {icon}
        </div>
        <h2 className="text-xl font-semibold">{question}</h2>
      </div>
      
      {minSelections > 0 && (
        <p className="text-sm text-gray-400 mb-4">
          Selecione pelo menos {minSelections} {minSelections === 1 ? 'opção' : 'opções'}
        </p>
      )}
      
      <motion.div className="space-y-3 mb-6">
        {options.map((option) => (
          <motion.div
            key={option.id}
            variants={itemVariants}
            onClick={() => toggleOption(option.id)}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              selected.includes(option.id)
                ? 'bg-primary bg-opacity-20 border border-primary'
                : 'bg-dark-background hover:bg-gray-800'
            }`}
          >
            <div className="flex items-center">
              <div
                className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                  selected.includes(option.id)
                    ? 'bg-primary'
                    : 'border border-gray-600'
                }`}
              >
                {selected.includes(option.id) && <Check size={12} className="text-white" />}
              </div>
              <div className="flex-grow">
                <h3 className="font-medium text-white">{option.text}</h3>
                {option.description && (
                  <p className="text-sm text-gray-400 mt-1">{option.description}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <Button
        onClick={() => onComplete(selected)}
        disabled={!isValid}
        className={`w-full ${
          isValid
            ? 'bg-primary hover:bg-primary-dark'
            : 'bg-gray-700 cursor-not-allowed'
        }`}
      >
        Continuar
      </Button>
      
      {!isValid && (
        <p className="text-sm text-yellow-500 mt-2 text-center">
          Por favor, selecione pelo menos {minSelections} {minSelections === 1 ? 'opção' : 'opções'}
        </p>
      )}
    </motion.div>
  );
};

export default MultiSelectCard;
