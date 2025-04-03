'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ScenarioData } from '../types/investment-types';
import { formatCurrency } from '../utils/investment-calculations';
import { cn } from '@/utils/cn';
import { DollarSign, BarChart2 } from 'lucide-react';

interface ScenarioSelectorProps {
  scenarios: ScenarioData[];
  activeScenarioIndex: number;
  setActiveScenarioIndex: (index: number) => void;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarios,
  activeScenarioIndex,
  setActiveScenarioIndex
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {scenarios.map((scenario, index) => (
        <Card
          key={scenario.id}
          className={cn(
            "cursor-pointer p-4 transition-all",
            activeScenarioIndex === index
              ? 'bg-primary/20 border-primary'
              : 'bg-dark-background border-dark-border hover:border-gray-600'
          )}
          onClick={() => setActiveScenarioIndex(index)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-dark-card mr-3">
                {scenario.investmentStrategy === 'single' ? (
                  <DollarSign className="text-blue-500" />
                ) : (
                  <BarChart2 className="text-green-500" />
                )}
              </div>
              <h4 className="font-medium text-white">{scenario.name}</h4>
            </div>
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Estratégia:</span>
              <span className="text-white">
                {scenario.investmentStrategy === 'single' ? 'Único' : 'Escalonado'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Investimento:</span>
              <span className="text-white">{formatCurrency(scenario.investmentAmount)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Preço Médio:</span>
              <span className="text-white">{formatCurrency(scenario.results.averagePrice)}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ScenarioSelector;
