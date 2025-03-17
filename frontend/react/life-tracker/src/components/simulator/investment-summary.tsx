// src/components/simulator/investment-summary.tsx
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { ProgressBar } from '@/components/ui/progress-bar';

interface InvestmentSummaryProps {
  compact?: boolean;
}

// Mock data
const portfolioData = {
  totalValue: 85650.75,
  monthlyReturn: 3.2,
  allocation: [
    { name: 'Renda Fixa', percentage: 40, value: 34260.30, growth: 1.8 },
    { name: 'Ações', percentage: 30, value: 25695.23, growth: 5.2 },
    { name: 'FIIs', percentage: 20, value: 17130.15, growth: 2.7 },
    { name: 'Criptomoedas', percentage: 10, value: 8565.07, growth: 8.6 }
  ],
  monthGoal: 75,
  yearGoal: 42
};

export const InvestmentSummary: React.FC<InvestmentSummaryProps> = ({
  compact = false
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-medium">Patrimônio Total</h3>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(portfolioData.totalValue)}
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm flex items-center
          ${portfolioData.monthlyReturn >= 0 ? 'bg-green-500 bg-opacity-20 text-green-500' : 'bg-red-500 bg-opacity-20 text-red-500'}`}
        >
          {portfolioData.monthlyReturn >= 0 
            ? <TrendingUp size={16} className="mr-1" /> 
            : <TrendingDown size={16} className="mr-1" />
          }
          {portfolioData.monthlyReturn}%
        </div>
      </div>

      {/* Allocation Chart */}
      {!compact && (
        <div className="bg-dark-background p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">Alocação</h4>
            <PieChart size={16} className="text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {portfolioData.allocation.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-sm text-white">{item.name}</div>
                  <div className="text-sm text-gray-400">{item.percentage}%</div>
                </div>
                <div className="flex items-center">
                  <ProgressBar 
                    value={item.percentage} 
                    className="flex-1 mr-3"
                    size="small"
                    color={
                      item.name === 'Renda Fixa' ? 'primary' :
                      item.name === 'Ações' ? 'success' :
                      item.name === 'FIIs' ? 'warning' : 'error'
                    }
                  />
                  <div className="text-xs text-gray-400">
                    {formatCurrency(item.value)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goals Progress */}
      <div className="bg-dark-background p-4 rounded-lg">
        <h4 className="text-white font-medium mb-3">Metas de Investimento</h4>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm text-white">Meta Mensal</div>
              <div className="text-sm text-gray-400">{portfolioData.monthGoal}%</div>
            </div>
            <ProgressBar value={portfolioData.monthGoal} color="primary" size="small" />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm text-white">Meta Anual</div>
              <div className="text-sm text-gray-400">{portfolioData.yearGoal}%</div>
            </div>
            <ProgressBar value={portfolioData.yearGoal} color="primary" size="small" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {!compact && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-dark-background p-3 rounded-lg flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-2">
              <DollarSign size={16} className="text-primary" />
            </div>
            <div className="text-sm text-white">Novo Aporte</div>
          </div>
          
          <div className="bg-dark-background p-3 rounded-lg flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-2">
              <TrendingUp size={16} className="text-primary" />
            </div>
            <div className="text-sm text-white">Rebalancear</div>
          </div>
        </div>
      )}
    </div>
  );
};
