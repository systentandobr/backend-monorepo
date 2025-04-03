'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

// Utilitários
import { formatCurrency } from '@/components/simulator/utils/monthly-projection-calculations';
import MonthlyDetailPanel from './MonthlyDetailPanel';

interface MonthlyProjectionRowProps {
  month: number;
  targetPrices: number[];
  monthlyProjections: Record<number, any[]>;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelection: () => void;
}

const MonthlyProjectionRow: React.FC<MonthlyProjectionRowProps> = ({
  month,
  targetPrices,
  monthlyProjections,
  isSelected,
  isExpanded,
  onToggleSelection
}) => {
  // Obter o resultado para um preço-alvo e mês específicos
  const getMonthResult = (targetPrice: number, month: number) => {
    if (!monthlyProjections[targetPrice] || !monthlyProjections[targetPrice][month - 1]) {
      return null;
    }
    
    return monthlyProjections[targetPrice][month - 1];
  };
  
  return (
    <>
      <tr 
        className={cn(
          "border-b border-dark-border cursor-pointer hover:bg-dark-card/20 transition-colors",
          isSelected ? "bg-dark-card/30" : ""
        )}
        onClick={onToggleSelection}
      >
        <td className="py-2 px-4 font-medium text-white">
          <div className="flex items-center">
            {!isExpanded && (
              <ChevronDown 
                className={cn(
                  "mr-2 h-4 w-4 transition-transform",
                  isSelected ? "transform rotate-180" : ""
                )} 
              />
            )}
            Mês {month}
          </div>
        </td>
        
        {targetPrices.map(price => {
          const result = getMonthResult(price, month);
          if (!result) return <td key={price} className="py-2 px-4 text-right text-gray-400">-</td>;
          
          const { netProfit } = result;
          const isPositive = netProfit > 0;
          
          return (
            <td 
              key={price} 
              className={cn(
                "py-2 px-4 text-right font-medium",
                isPositive ? "text-green-500" : "text-red-500"
              )}
            >
              {formatCurrency(netProfit)}
            </td>
          );
        })}
      </tr>
      
      {/* Painel de detalhes expandido */}
      {isSelected && !isExpanded && (
        <tr className="bg-dark-card/10">
          <td colSpan={targetPrices.length + 1} className="py-4 px-6">
            <MonthlyDetailPanel 
              month={month}
              targetPrices={targetPrices}
              monthlyProjections={monthlyProjections}
            />
          </td>
        </tr>
      )}
    </>
  );
};

export default MonthlyProjectionRow;
