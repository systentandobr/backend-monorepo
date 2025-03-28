'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign
} from 'lucide-react';
import { cn } from '@/utils/cn';

// Store e utilitários
import useEnhancedSimulationStore from '@/store/enhancedSimulationStore';
import { formatCurrency, formatPercentage } from '@/components/simulator/utils/monthly-projection-calculations';
import MonthlyProjectionRow from './MonthlyProjectionRow';
import MonthlyProjectionMilestones from './MonthlyProjectionMilestones';

interface MonthlyProjectionTableProps {
  className?: string;
}

const MonthlyProjectionTable: React.FC<MonthlyProjectionTableProps> = ({ className }) => {
  // Estado local
  const [expanded, setExpanded] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([3, 6, 12]);
  
  // Obter dados do store
  const { 
    currentPosition,
    loanData,
    scenarios,
    activeScenarioIndex,
    scenarioAnalysis,
    monthlyProjections,
    calculateMonthlyProjections
  } = useEnhancedSimulationStore();
  
  // Calcular projeções quando o componente montar
  useEffect(() => {
    calculateMonthlyProjections();
  }, [calculateMonthlyProjections]);
  
  // Verificar se temos dados para exibir
  if (!scenarios.length || Object.keys(monthlyProjections).length === 0) {
    return (
      <Card className={cn("bg-dark-card border-dark-border p-6", className)}>
        <h3 className="text-xl font-bold mb-4 text-white">Projeção Mensal de Resultados</h3>
        <p className="text-gray-400">Configure um cenário de investimento para visualizar projeções mensais.</p>
      </Card>
    );
  }
  
  // Obter o cenário ativo
  const activeScenario = scenarios[activeScenarioIndex];
  
  // Obter dados de pagamento de empréstimo
  const monthlyPayment = scenarioAnalysis.calculatedMonthlyPayment;
  
  // Meses para exibição
  const displayMonths = expanded 
    ? Array.from({ length: 36 }, (_, i) => i + 1) // 1 a 36 meses
    : [1, 3, 6, 12, 24, 36]; // Meses chave
    
  // Preços-alvo ordenados
  const targetPrices = [...activeScenario.targetPrices].sort((a, b) => a - b);
  
  // Alternar a seleção de um mês
  const toggleMonthSelection = (month: number) => {
    if (selectedMonths.includes(month)) {
      setSelectedMonths(selectedMonths.filter(m => m !== month));
    } else {
      setSelectedMonths([...selectedMonths, month].sort((a, b) => a - b));
    }
  };
  
  return (
    <Card className={cn("bg-dark-card border-dark-border p-6", className)}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Projeção Mensal de Resultados</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Mostrar Menos' : 'Mostrar Todos os Meses'}
          {expanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
        </Button>
      </div>
      
      <p className="text-gray-400 mb-6">
        Acompanhe a evolução do seu investimento mês a mês, considerando o pagamento das parcelas do empréstimo.
        Os valores são calculados para cada preço-alvo configurado no cenário atual.
      </p>
      
      {/* Legenda explicativa */}
      <div className="bg-dark-background border border-dark-border rounded-lg p-4 mb-6">
        <h4 className="font-medium text-white mb-3">Sobre os Cálculos</h4>
        <ul className="text-sm text-gray-400 space-y-2">
          <li className="flex items-center">
            <DollarSign className="text-primary h-4 w-4 mr-2" />
            <span>Lucro Bruto: Valor total do investimento no preço-alvo, menos o investimento inicial</span>
          </li>
          <li className="flex items-center">
            <Calendar className="text-amber-500 h-4 w-4 mr-2" />
            <span>Parcelas do Empréstimo: Total acumulado de parcelas pagas até o mês ({formatCurrency(monthlyPayment)}/mês)</span>
          </li>
          <li className="flex items-center">
            <TrendingUp className="text-green-500 h-4 w-4 mr-2" />
            <span>Fluxo de Caixa Líquido: Resultado final após considerar o investimento inicial e parcelas</span>
          </li>
        </ul>
      </div>
      
      {/* Tabela de projeção mensal */}
      <div className="bg-dark-background border border-dark-border rounded-lg p-4 overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="text-left py-2 px-4 text-gray-400">Mês</th>
              {targetPrices.map(price => (
                <th key={price} className="text-right py-2 px-4 text-gray-400">
                  Preço: {formatCurrency(price)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayMonths.map(month => (
              <MonthlyProjectionRow
                key={month}
                month={month}
                targetPrices={targetPrices}
                monthlyProjections={monthlyProjections}
                isSelected={selectedMonths.includes(month) || expanded}
                isExpanded={expanded}
                onToggleSelection={() => !expanded && toggleMonthSelection(month)}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Marcos importantes */}
      <MonthlyProjectionMilestones 
        loanData={loanData}
        scenarioAnalysis={scenarioAnalysis}
      />
    </Card>
  );
};

export default MonthlyProjectionTable;
