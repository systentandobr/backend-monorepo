import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { animations } from '@/utils/animations';

type CommitmentConfig = {
  title: string;
  description: string;
  actionKey: string;
  defaultAction: string;
  timeframeKey: string;
  defaultTimeframe: string;
};

interface ActionCommitmentCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  commitmentConfig: CommitmentConfig;
  values: {
    action: string;
    timeframe: string;
  };
  onChange: (field: 'action' | 'timeframe', value: string) => void;
  onComplete: () => void;
}

const ActionCommitmentCard: React.FC<ActionCommitmentCardProps> = ({
  icon,
  title,
  description,
  commitmentConfig,
  values,
  onChange,
  onComplete
}) => {
  const [isActionFocused, setIsActionFocused] = useState(false);
  
  // Opções padrão para períodos de tempo
  const timeframeOptions = [
    '7 dias',
    '14 dias',
    '30 dias',
    '60 dias',
    '90 dias',
    '6 meses',
    '12 meses'
  ];
  
  // Função para sugerir ações se o usuário não tiver digitado nada ainda
  const suggestAction = (suggestion: string) => {
    onChange('action', suggestion);
  };
  
  // Exemplos de sugestões baseadas no título
  const getSuggestions = () => {
    if (title.toLowerCase().includes('consistência')) {
      return [
        'Meditar por 10 minutos todas as manhãs',
        'Ler 10 páginas de um livro antes de dormir',
        'Escrever 3 coisas pelas quais sou grato diariamente'
      ];
    } else if (title.toLowerCase().includes('financeiro')) {
      return [
        'Revisar meus gastos semanalmente',
        'Separar 15% da minha renda para investimentos',
        'Estudar 30 minutos por semana sobre investimentos'
      ];
    } else if (title.toLowerCase().includes('aprendizado')) {
      return [
        'Dedicar 30 minutos diários para aprender uma nova habilidade',
        'Completar um curso online em 60 dias',
        'Praticar um idioma por 15 minutos diários'
      ];
    } else if (title.toLowerCase().includes('negócio') || title.toLowerCase().includes('empreendedor')) {
      return [
        'Validar uma ideia de negócio com 5 clientes potenciais por semana',
        'Desenvolver um MVP em 30 dias',
        'Dedicar 5 horas semanais para pesquisa e planejamento'
      ];
    } else {
      return [
        'Dedicar tempo diariamente para este hábito',
        'Estabelecer uma rotina semanal para esta prática',
        'Começar com pequenos passos consistentes'
      ];
    }
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
        <h2 className="text-xl font-semibold">{title}</h2>
      </motion.div>
      
      {description && (
        <motion.p 
          className="text-gray-400 mb-6"
          variants={animations.itemVariants}
        >
          {description}
        </motion.p>
      )}
      
      <motion.div 
        className="mb-6"
        variants={animations.itemVariants}
        custom={1}
      >
        <label className="block text-white mb-2 font-medium">{commitmentConfig.title}</label>
        <p className="text-gray-400 text-sm mb-3">{commitmentConfig.description}</p>
        <Textarea
          value={values.action}
          onChange={(e) => onChange('action', e.target.value)}
          placeholder="Escreva seu compromisso específico aqui..."
          className="w-full p-3 bg-dark-background border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={3}
          onFocus={() => setIsActionFocused(true)}
          onBlur={() => setIsActionFocused(false)}
        />
      </motion.div>
      
      {/* Sugestões caso o usuário não tenha digitado (e não esteja focado no campo) */}
      {!values.action && !isActionFocused && (
        <motion.div 
          className="mb-6"
          variants={animations.itemVariants}
          custom={2}
        >
          <p className="text-gray-300 text-sm mb-3">Sugestões para inspirar você:</p>
          <div className="space-y-2">
            {getSuggestions().map((suggestion, index) => (
              <div 
                key={index}
                className="text-sm p-3 bg-dark-background border border-gray-700 rounded-lg text-gray-300 hover:border-primary hover:text-primary cursor-pointer transition-colors"
                onClick={() => suggestAction(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        </motion.div>
      )}
      
      <motion.div 
        className="mb-6"
        variants={animations.itemVariants}
        custom={3}
      >
        <label className="block text-white mb-2 font-medium">Por quanto tempo você se compromete?</label>
        <Select
          value={values.timeframe}
          onValueChange={(value) => onChange('timeframe', value)}
        >
          <SelectTrigger className="w-full bg-dark-background border-gray-700 text-white">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent className="bg-dark-background border-gray-700 text-white">
            {timeframeOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>
      
      <motion.div 
        className="mt-8"
        variants={animations.itemVariants}
        custom={4}
      >
        <Button 
          onClick={onComplete}
          disabled={!values.action.trim() || !values.timeframe}
          className="w-full bg-primary hover:bg-primary-dark transition-colors"
        >
          Confirmar Compromisso
        </Button>
        
        {(!values.action.trim() || !values.timeframe) && (
          <p className="text-gray-400 text-xs text-center mt-2">
            {!values.action.trim() ? 'Defina seu compromisso para continuar' : 'Selecione o período para continuar'}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ActionCommitmentCard;