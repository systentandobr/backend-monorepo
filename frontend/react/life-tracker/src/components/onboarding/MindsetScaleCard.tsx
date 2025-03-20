import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { animations } from '@/utils/animations';

type MindsetScale = {
  statement: string;
  key: string;
  leftLabel: string;
  rightLabel: string;
};

interface MindsetScaleCardProps {
  icon: React.ReactNode;
  question: string;
  description: string;
  scales: MindsetScale[];
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
  onComplete: () => void;
}

const MindsetScaleCard: React.FC<MindsetScaleCardProps> = ({    
  icon,
  question,
  description,
  scales,
  values,
  onChange,
  onComplete
}) => {
  // Função para verificar se todos os campos foram preenchidos
  const isComplete = () => {
    return scales.every(scale => values[scale.key] !== undefined);
  };

  return (
    <motion.div
      className="bg-dark-card p-6 rounded-xl max-w-md w-full shadow-lg"
      variants={animations.containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex items-center mb-4"
        variants={animations.itemVariants}
      >
        <div className="w-10 h-10 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mr-4">
          {icon}
        </div>
        <h2 className="text-xl font-semibold">{question}</h2>
      </motion.div>
      
      {description && (
        <motion.p 
          className="text-gray-400 mb-6"
          variants={animations.itemVariants}
        >
          {description}
        </motion.p>
      )}
      
      {scales.map((scale, index) => (
        <motion.div 
          key={scale.key} 
          className="mb-8"
          variants={animations.itemVariants}
          custom={index + 1}
        >
          <p className="text-white mb-3 font-medium">{scale.statement}</p>
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span className="max-w-[45%]">{scale.leftLabel}</span>
              <span className="max-w-[45%] text-right">{scale.rightLabel}</span>
            </div>
            <div className="py-4">
              <Slider
                min={1}
                max={10}
                step={1}
                value={[values[scale.key] || 5]}
                onValueChange={(value: any) => onChange(scale.key, value[0])}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-gray-500 px-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <span key={num} className={values[scale.key] === num ? 'text-primary font-bold' : ''}>
                    {num}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-center text-sm text-primary font-medium mt-2">
              {values[scale.key] 
                ? `Sua resposta: ${values[scale.key]} / 10` 
                : 'Deslize para selecionar seu nível'}
            </div>
          </div>
        </motion.div>
      ))}
      
      <motion.div variants={animations.itemVariants} custom={scales.length + 1}>
        <Button 
          onClick={onComplete}
          className="w-full bg-primary hover:bg-primary-dark transition-colors mt-4"
          disabled={!isComplete()}
        >
          Continuar
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default MindsetScaleCard;