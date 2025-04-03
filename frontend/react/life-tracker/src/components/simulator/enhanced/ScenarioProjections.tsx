'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  MinusCircle,
  Download,
  BarChart2
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

interface ScenarioProjectionsProps {
  activeScenarioData: ScenarioData;
}

const ScenarioProjections: React.FC<ScenarioProjectionsProps> = ({
  activeScenarioData
}) => {
  return (
    <>
      {/* Resultados da projeção */}
      <div className="mb-6">
        <h4 className="font-medium text-white mb-3">Projeção de Resultados</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-dark-background border-dark-border p-4">
            <div className="text-sm text-gray-400 mb-1">Resultado Provável</div>
            <div className="text-xl font-bold text-white mb-2">
              {formatCurrency(activeScenarioData.projectedFinalAmount)}
            </div>
            <div className="flex items-center">
              <MinusCircle size={16} className="text-blue-500 mr-2" />
              <span className="text-xs text-gray-400">Valor médio projetado</span>
            </div>
          </Card>
          
          <Card className="bg-dark-background border-dark-border p-4">
            <div className="text-sm text-gray-400 mb-1">Pior Cenário</div>
            <div className="text-xl font-bold text-white mb-2">
              {formatCurrency(activeScenarioData.worstCaseAmount)}
            </div>
            <div className="flex items-center">
              <TrendingDown size={16} className="text-amber-500 mr-2" />
              <span className="text-xs text-gray-400">5% de probabilidade</span>
            </div>
          </Card>
          
          <Card className="bg-dark-background border-dark-border p-4">
            <div className="text-sm text-gray-400 mb-1">Melhor Cenário</div>
            <div className="text-xl font-bold text-white mb-2">
              {formatCurrency(activeScenarioData.bestCaseAmount)}
            </div>
            <div className="flex items-center">
              <TrendingUp size={16} className="text-green-500 mr-2" />
              <span className="text-xs text-gray-400">5% de probabilidade</span>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Gráfico de projeção */}
      <div className="bg-dark-background border border-dark-border rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium text-white">Projeção Comparativa</h4>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            <span>Exportar Dados</span>
          </Button>
        </div>
        
        <div className="h-64 bg-dark-card rounded-lg flex items-center justify-center mb-4">
          <div className="text-center">
            <BarChart2 size={32} className="text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Gráfico de projeção comparativa entre cenários</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-400">Otimista</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-400">Realista</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-400">Pessimista</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="default" className="flex-1">
          Salvar Cenário
        </Button>
        <Button variant="outline" className="flex-1">
          Comparar Mais Cenários
        </Button>
      </div>
    </>
  );
};

export default ScenarioProjections;
