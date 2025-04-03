'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { LoanData } from '../types/investment-types';
import { 
  formatCurrency, 
  calculateLoanInstallment, 
  calculateTotalInterest 
} from '../utils/investment-calculations';

interface LoanDataFormProps {
  loanData: LoanData;
  updateLoanData: (key: keyof LoanData, value: any) => void;
}

const LoanDataForm: React.FC<LoanDataFormProps> = ({
  loanData,
  updateLoanData
}) => {
  // Handler para mudanças nos inputs numéricos
  const handleNumberInput = (key: keyof LoanData, value: string, decimals: number = 2) => {
    if (value === '' || isNaN(Number(value))) return;
    
    let numValue = parseFloat(value);
    
    // Para o prazo, arredondamos para um número inteiro
    if (key === 'term') {
      numValue = Math.round(numValue);
    } else if (decimals > 0) {
      // Para outros valores, limitamos as casas decimais
      const factor = Math.pow(10, decimals);
      numValue = Math.round(numValue * factor) / factor;
    }
    
    updateLoanData(key, numValue);
  };

  return (
    <Card className="bg-dark-background border-dark-border p-4">
      <h4 className="font-medium text-white mb-3">Dados do Empréstimo</h4>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Valor do Empréstimo (R$)</label>
          <input
            type="number"
            value={loanData.amount}
            onChange={(e) => handleNumberInput('amount', e.target.value, 0)}
            className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Taxa de Juros Mensal (%)</label>
          <input
            type="number"
            value={loanData.interestRate}
            onChange={(e) => handleNumberInput('interestRate', e.target.value, 2)}
            className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-white"
            step="0.01"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Prazo (meses)</label>
          <input
            type="number"
            value={loanData.term}
            onChange={(e) => handleNumberInput('term', e.target.value, 0)}
            className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-white"
          />
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-dark-card rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="text-gray-400">Valor da Parcela:</span>
          <span className="text-white">
            {formatCurrency(calculateLoanInstallment(loanData.amount, loanData.interestRate, loanData.term))}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Total de Juros:</span>
          <span className="text-amber-500">
            {formatCurrency(calculateTotalInterest(loanData))}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default LoanDataForm;
