'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  MinusCircle
} from 'lucide-react';
import { cn } from '@/utils/cn';

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

interface ScenarioSelectorProps {
  scenariosData: Record<ScenarioType, ScenarioData>;
  activeScenario: ScenarioType;
  setActiveScenario: (type: ScenarioType) => void;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenariosData,
  activeScenario,
  setActiveScenario
}) => {
  // Obter cor baseada no tipo de cenário
  const getScenarioColor = (type: ScenarioType) => {
    switch (type) {
      case 'optimistic': return 'text-green-500';
      case 'realistic': return 'text-blue-500';
      case 'pessimistic': return 'text-amber-500';
      default: return 'text-white';
    }
  };
  
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {Object.values(scenariosData).map((scenario) => (
        <Card
          key={scenario.type}
          className={cn(
            "cursor-pointer p-4 transition-all",
            activeScenario === scenario.type
              ? 'bg-dark-background border-2 border-primary'
              : 'bg-dark-background border-dark-border hover:border-gray-600'
          )}
          onClick={() => setActiveScenario(scenario.type)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-dark-card mr-3">
                {getScenarioIcon(scenario.type)}
              </div>
              <h4 className="font-medium text-white">{scenario.name}</h4>
            </div>
            <div className={getScenarioColor(scenario.type)}>
              {scenario.annualReturn}%
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Volatilidade:</span>
            <span className="text-white">{scenario.volatility}%</span>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ScenarioSelector;
