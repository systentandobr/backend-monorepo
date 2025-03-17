// src/components/integration/cross-module-progress.tsx
import React from 'react';
import { Activity, DollarSign, Briefcase, TrendingUp, ArrowRight } from 'lucide-react';

interface CrossModuleProgressProps {
  habitId?: number;
  investmentId?: number;
  businessId?: number;
  showIntegrationMetrics?: boolean;
}

// Mock data for integration metrics
const integrationData = {
  financialHabits: {
    total: 5,
    completed: 3,
    impact: 'medium'
  },
  businessPreparation: {
    skills: {
      total: 8,
      acquired: 5
    },
    capital: {
      current: 35000,
      required: 100000
    },
    impact: 'high'
  },
  investmentHabits: {
    total: 3,
    consistent: 2,
    impact: 'high'
  },
  habitFinancialImpact: {
    monthly: 850,
    yearly: 10200,
    impact: 'medium'
  }
};

export const CrossModuleProgress: React.FC<CrossModuleProgressProps> = ({
  habitId,
  investmentId,
  businessId,
  showIntegrationMetrics = false
}) => {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Get impact class (color)
  const getImpactClass = (impact: string) => {
    switch (impact) {
      case 'low':
        return 'text-gray-400';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  // Render integration metrics based on showIntegrationMetrics prop
  if (showIntegrationMetrics) {
    return (
      <div className="space-y-4">
        {/* Financial Habits Integration */}
        <div className="bg-dark-background rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Activity size={16} className="text-green-500 mr-1" />
              <ArrowRight size={12} className="mx-1" />
              <DollarSign size={16} className="text-primary mr-1" />
            </div>
            <div className={`text-xs ${getImpactClass(integrationData.financialHabits.impact)}`}>
              Impacto {integrationData.financialHabits.impact === 'low' ? 'Baixo' : 
                       integrationData.financialHabits.impact === 'medium' ? 'Médio' : 'Alto'}
            </div>
          </div>
          
          <h3 className="text-sm text-white font-medium mb-1">Hábitos Financeiros</h3>
          <p className="text-xs text-gray-400 mb-2">
            {integrationData.financialHabits.completed} de {integrationData.financialHabits.total} hábitos financeiros
          </p>
          
          <div className="text-xs text-gray-400">
            Impacto mensal estimado: {formatCurrency(integrationData.habitFinancialImpact.monthly)}
          </div>
        </div>
        
        {/* Business Preparation Integration */}
        <div className="bg-dark-background rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <DollarSign size={16} className="text-primary mr-1" />
              <ArrowRight size={12} className="mx-1" />
              <Briefcase size={16} className="text-accent-main mr-1" />
            </div>
            <div className={`text-xs ${getImpactClass(integrationData.businessPreparation.impact)}`}>
              Impacto {integrationData.businessPreparation.impact === 'low' ? 'Baixo' : 
                      integrationData.businessPreparation.impact === 'medium' ? 'Médio' : 'Alto'}
            </div>
          </div>
          
          <h3 className="text-sm text-white font-medium mb-1">Preparação para Negócios</h3>
          <p className="text-xs text-gray-400 mb-2">
            Capital: {formatCurrency(integrationData.businessPreparation.capital.current)} / 
            {formatCurrency(integrationData.businessPreparation.capital.required)}
          </p>
          
          <div className="text-xs text-gray-400">
            Habilidades: {integrationData.businessPreparation.skills.acquired} de {integrationData.businessPreparation.skills.total} adquiridas
          </div>
        </div>
        
        {/* Investment Habits Integration */}
        <div className="bg-dark-background rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Activity size={16} className="text-green-500 mr-1" />
              <ArrowRight size={12} className="mx-1" />
              <Briefcase size={16} className="text-accent-main mr-1" />
            </div>
            <div className={`text-xs ${getImpactClass(integrationData.investmentHabits.impact)}`}>
              Impacto {integrationData.investmentHabits.impact === 'low' ? 'Baixo' : 
                      integrationData.investmentHabits.impact === 'medium' ? 'Médio' : 'Alto'}
            </div>
          </div>
          
          <h3 className="text-sm text-white font-medium mb-1">Hábitos e Negócios</h3>
          <p className="text-xs text-gray-400 mb-2">
            {integrationData.investmentHabits.consistent} de {integrationData.investmentHabits.total} hábitos consistentes
          </p>
          
          <div className="text-xs text-gray-400">
            Impacto em preparação para negócios: 35%
          </div>
        </div>
      </div>
    );
  }

  // Render specific integration based on provided IDs
  return (
    <div className="bg-dark-background rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-medium">Integrações</h3>
        <TrendingUp size={16} className="text-gray-400" />
      </div>
      
      <div className="text-sm text-gray-400 mb-3">
        Visualize como seus objetivos, finanças e oportunidades de negócio estão interconectados.
      </div>
      
      <div className="flex items-center justify-around text-xs text-gray-400">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-dark-card flex items-center justify-center mb-1">
            <Activity size={20} className="text-green-500" />
          </div>
          <span>Hábitos</span>
        </div>
        
        <ArrowRight size={16} />
        
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-dark-card flex items-center justify-center mb-1">
            <DollarSign size={20} className="text-primary" />
          </div>
          <span>Finanças</span>
        </div>
        
        <ArrowRight size={16} />
        
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-dark-card flex items-center justify-center mb-1">
            <Briefcase size={20} className="text-accent-main" />
          </div>
          <span>Negócios</span>
        </div>
      </div>
    </div>
  );
};
