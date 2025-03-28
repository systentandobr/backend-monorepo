'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { CurrentPosition } from '../types/investment-types';
import { formatCurrency, formatPercent } from '../utils/investment-calculations';
import { cn } from '@/utils/cn';

interface CurrentPositionFormProps {
  currentPosition: CurrentPosition;
  updateCurrentPosition: (key: keyof CurrentPosition, value: any) => void;
}

const CurrentPositionForm: React.FC<CurrentPositionFormProps> = ({
  currentPosition,
  updateCurrentPosition
}) => {
  // Função para limitar números a uma certa quantidade de casas decimais
  const limitDecimals = (value: number, decimals: number): number => {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  };

  // Handler para mudanças nos inputs numéricos
  const handleNumberInput = (key: keyof CurrentPosition, value: string, decimals: number = 2) => {
    if (value === '' || isNaN(Number(value))) return;
    const numValue = parseFloat(value);
    updateCurrentPosition(key, limitDecimals(numValue, decimals));
  };

  return (
    <Card className="bg-dark-background border-dark-border p-4">
      <h4 className="font-medium text-white mb-3">Posição Atual</h4>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Token</label>
          <input
            type="text"
            value={currentPosition.token}
            onChange={(e) => updateCurrentPosition('token', e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Quantidade</label>
          <input
            type="number"
            value={currentPosition.quantity}
            onChange={(e) => handleNumberInput('quantity', e.target.value, 8)}
            className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-white"
            step="0.0001"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Preço Atual (R$)</label>
          <input
            type="number"
            value={currentPosition.currentPrice}
            onChange={(e) => handleNumberInput('currentPrice', e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Preço Médio de Compra (R$)</label>
          <input
            type="number"
            value={currentPosition.averagePrice}
            onChange={(e) => handleNumberInput('averagePrice', e.target.value)}
            className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-white"
          />
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-dark-card rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="text-gray-400">Valor Atual:</span>
          <span className="text-white">{formatCurrency(currentPosition.quantity * currentPosition.currentPrice)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Lucro/Prejuízo:</span>
          <span className={cn(
            currentPosition.currentPrice >= currentPosition.averagePrice ? 'text-green-500' : 'text-red-500'
          )}>
            {formatCurrency(currentPosition.quantity * (currentPosition.currentPrice - currentPosition.averagePrice))}
            {' '}
            ({formatPercent((currentPosition.currentPrice / currentPosition.averagePrice - 1) * 100)})
          </span>
        </div>
      </div>
    </Card>
  );
};

export default CurrentPositionForm;
