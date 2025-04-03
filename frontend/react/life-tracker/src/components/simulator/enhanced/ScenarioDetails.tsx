'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  MinusCircle,
  AlertCircle
} from 'lucide-react';

// Utilitários
import { formatCurrency } from '@/components/simulator/utils/monthly-projection-calculations';

// Definição dos tipos de cenários
type ScenarioType = 'optimistic' | 'realistic' | 'pessimistic';

// Interface para dados de simulação de cenário
interface ScenarioData {
  name: string;
  type: ScenarioType;
  annualReturn: number;
  volatility: number;
  initialInvestment: number;
  timeHorizon: number;
  monthlyContribution: number;
  probabilityOfSuccess: number;
  projectedFinalAmount: number;
  worstCaseAmount: number;
  bestCaseAmount: number;
}

interface ScenarioDetailsProps {
  activeScenarioData: ScenarioData;
  activeScenario: ScenarioType;
}

const ScenarioDetails: React.FC<ScenarioDetailsProps> = ({
  activeScenarioData,
  activeScenario
}) => {
  // Obter ícone baseado no tipo de cenário
  const getScenarioIcon = (type: ScenarioType) => {
    switch (type) {
      case 'optimistic': return <TrendingUp className="text-green-500" />;
      case 'realistic': return <MinusCircle className="text-blue-500" />;
      case 'pessimistic': return <TrendingDown className="text-amber-500" />;
      default: return null;
    }
  };
  
  return (
    <div className="bg-dark-background border border-dark-border rounded-lg p-4 mb-6">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-full bg-dark-card mr-3">
          {getScenarioIcon(activeScenarioData.type)}
        </div>
        <h4 className="font-medium text-white">Cenário {activeScenarioData.name}</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-400 mb-1">Parâmetros do Cenário</div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Retorno anual médio:</span>
              <span className="text-white">{activeScenarioData.annualReturn}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Volatilidade:</span>
              <span className="text-white">{activeScenarioData.volatility}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Horizonte de tempo:</span>
              <span className="text-white">{activeScenarioData.timeHorizon} anos</span>
            </div>
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-400 mb-1">Dados de Investimento</div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Investimento inicial:</span>
              <span className="text-white">{formatCurrency(activeScenarioData.initialInvestment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Aporte mensal:</span>
              <span className="text-white">{formatCurrency(activeScenarioData.monthlyContribution)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Probabilidade de sucesso:</span>
              <span className="text-white">{activeScenarioData.probabilityOfSuccess}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-dark-card rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle size={20} className="text-primary mr-3 mt-1" />
          <div>
            <div className="text-sm font-medium text-white mb-1">Interpretação do Cenário</div>
            <p className="text-xs text-gray-400">
              {activeScenario === 'optimistic' && 
                'Este cenário representa condições de mercado favoráveis com crescimento econômico robusto, inflação controlada e políticas monetárias acomodatícias. É menos provável, mas possível em períodos de forte recuperação econômica.'}
              {activeScenario === 'realistic' && 
                'Este cenário representa as condições de mercado mais prováveis com base em médias históricas de longo prazo. Incorpora ciclos econômicos normais e é considerado uma projeção equilibrada.'}
              {activeScenario === 'pessimistic' && 
                'Este cenário contempla condições de mercado desafiadoras, como recessão econômica, alta inflação ou instabilidade política. É mais conservador e útil para planejar contra riscos de queda.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioDetails;
