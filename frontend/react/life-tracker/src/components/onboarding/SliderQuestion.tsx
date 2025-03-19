// src/components/onboarding/SliderQuestion.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SliderQuestionProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  formatLabel?: (value: number) => string;
}

const SliderQuestion: React.FC<SliderQuestionProps> = ({
  min,
  max,
  step,
  value,
  onChange,
  formatLabel = (value) => value.toString()
}) => {
  // Estado local para atualização visual imediata
  const [localValue, setLocalValue] = useState(value);
  
  // Calcula a porcentagem para posicionar o handle e o gradiente
  const percentage = ((localValue - min) / (max - min)) * 100;
  
  // Função para mudar o valor local e chamar o callback
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };
  
  // Variantes para animação
  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="w-full"
      initial="initial"
      animate="animate"
      variants={variants}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">{formatLabel(min)}</span>
        <div className="bg-primary bg-opacity-20 px-3 py-1 rounded-full text-primary font-medium text-sm">
          {formatLabel(localValue)}
        </div>
        <span className="text-sm text-gray-400">{formatLabel(max)}</span>
      </div>
      
      <div className="relative">
        {/* Trilha do slider */}
        <div className="w-full h-2 bg-gray-700 rounded-full"></div>
        
        {/* Progresso preenchido */}
        <div 
          className="absolute top-0 left-0 h-2 bg-primary rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
        
        {/* Marcas de passos (opcional) */}
        {step !== 1 && max - min <= 10 * step && (
          <div className="absolute top-0 w-full flex justify-between">
            {Array.from({ length: Math.floor((max - min) / step) + 1 }).map((_, index) => (
              <div 
                key={index}
                className="w-1 h-1 bg-gray-500 rounded-full mt-[2px]"
              ></div>
            ))}
          </div>
        )}
        
        {/* Input range oculto para funcionalidade */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          className="absolute top-0 w-full h-2 appearance-none bg-transparent cursor-pointer z-10"
          style={{
            // Personalizações do thumb
            WebkitAppearance: 'none',
            // Remover pontilhado de foco no Firefox
            outline: 'none'
          }}
        />
        
        {/* Círculo visual para o handle */}
        <div 
          className="absolute top-0 w-5 h-5 bg-primary rounded-full -mt-1.5 pointer-events-none shadow-lg transform -translate-x-1/2"
          style={{ left: `${percentage}%` }}
        ></div>
      </div>
    </motion.div>
  );
};

export default SliderQuestion;
