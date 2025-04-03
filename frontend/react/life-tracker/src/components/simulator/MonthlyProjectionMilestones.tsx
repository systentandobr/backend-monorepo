'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign 
} from 'lucide-react';

// Tipos
import { LoanData } from '@/components/simulator/types/investment-types';
import { ScenarioAnalysis } from '@/components/simulator/types/monthly-projection-types';

// Utilitários
import { formatCurrency } from '@/components/simulator/utils/monthly-projection-calculations';

interface MonthlyProjectionMilestonesProps {
  loanData: LoanData;
  scenarioAnalysis: ScenarioAnalysis;
}

const MonthlyProjectionMilestones: React.FC<MonthlyProjectionMilestonesProps> = ({
  loanData,
  scenarioAnalysis
}) => {
  return (
    <div className="bg-dark-background border border-dark-border rounded-lg p-4">
      <h4 className="font-medium text-white mb-3">Marcos Importantes</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-dark-card border-dark-border p-3">
          <div className="flex items-start">
            <Calendar className="text-blue-500 h-5 w-5 mr-2 mt-1" />
            <div>
              <div className="text-sm text-gray-400">Quitação do Empréstimo</div>
              <div className="text-lg font-medium text-white">Mês {loanData.term}</div>
              <div className="text-xs text-gray-400">
                Total pago: {formatCurrency(scenarioAnalysis.calculatedMonthlyPayment * loanData.term)}
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-dark-card border-dark-border p-3">
          <div className="flex items-start">
            <TrendingUp className="text-green-500 h-5 w-5 mr-2 mt-1" />
            <div>
              <div className="text-sm text-gray-400">Breakeven</div>
              <div className="text-lg font-medium text-white">
                {scenarioAnalysis.breakEvenTime > 0 
                  ? `Mês ${scenarioAnalysis.breakEvenTime}` 
                  : 'Não atingido'}
              </div>
              <div className="text-xs text-gray-400">
                Ponto em que o lucro cobre o investimento + juros
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-dark-card border-dark-border p-3">
          <div className="flex items-start">
            <TrendingDown className="text-amber-500 h-5 w-5 mr-2 mt-1" />
            <div>
              <div className="text-sm text-gray-400">Tempo Limite</div>
              <div className="text-lg font-medium text-white">
                {scenarioAnalysis.maxWaitTime > 0 
                  ? `Mês ${scenarioAnalysis.maxWaitTime}` 
                  : 'Indefinido'}
              </div>
              <div className="text-xs text-gray-400">
                Tempo máximo antes que os juros superem o potencial de lucro
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-dark-card border-dark-border p-3">
          <div className="flex items-start">
            <DollarSign className="text-primary h-5 w-5 mr-2 mt-1" />
            <div>
              <div className="text-sm text-gray-400">Venda Ótima</div>
              <div className="text-lg font-medium text-white">
                {formatCurrency(scenarioAnalysis.optimalSellingPrice)}
              </div>
              <div className="text-xs text-gray-400">
                Melhor preço-alvo para resultado positivo
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MonthlyProjectionMilestones;
