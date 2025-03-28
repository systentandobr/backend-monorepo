'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

// Utilitários
import { formatCurrency, formatPercentage } from '@/components/simulator/utils/monthly-projection-calculations';

interface MonthlyDetailPanelProps {
  month: number;
  targetPrices: number[];
  monthlyProjections: Record<number, any[]>;
}

const MonthlyDetailPanel: React.FC<MonthlyDetailPanelProps> = ({
  month,
  targetPrices,
  monthlyProjections
}) => {
  // Obter o resultado para um preço-alvo e mês específicos
  const getMonthResult = (targetPrice: number, month: number) => {
    if (!monthlyProjections[targetPrice] || !monthlyProjections[targetPrice][month - 1]) {
      return null;
    }
    
    return monthlyProjections[targetPrice][month - 1];
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {targetPrices.map(price => {
        const result = getMonthResult(price, month);
        if (!result) return null;
        
        const { 
          grossValue, 
          loanPayment,
          netValue,
          netProfit,
          profitPercentage
        } = result;
        
        return (
          <Card key={price} className="bg-dark-card border-dark-border p-3">
            <div className="text-sm text-gray-400 mb-2">
              Preço-alvo: {formatCurrency(price)}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Valor Bruto:</span>
                <span className="text-white">
                  {formatCurrency(grossValue)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Parcelas Acumuladas:</span>
                <span className="text-amber-500">
                  {formatCurrency(loanPayment)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Valor Líquido:</span>
                <span className="text-white">
                  {formatCurrency(netValue)}
                </span>
              </div>
              
              <div className="flex justify-between pt-2 border-t border-dark-border">
                <span className="text-white font-medium">Lucro Líquido:</span>
                <span className={netProfit >= 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                  {formatCurrency(netProfit)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Retorno:</span>
                <span className={profitPercentage >= 0 ? "text-green-500" : "text-red-500"}>
                  {formatPercentage(profitPercentage)}
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default MonthlyDetailPanel;
