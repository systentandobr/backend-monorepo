'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Download,
  BarChart2,
  Calendar 
} from 'lucide-react';
import { ScenarioData, TargetPriceResult, DEFAULT_ANALYSIS_MONTHS } from '../types/investment-types';
import { formatCurrency, formatPercent } from '../utils/investment-calculations';
import { cn } from '@/utils/cn';

interface ScenarioResultsProps {
  scenario: ScenarioData;
}

const ScenarioResults: React.FC<ScenarioResultsProps> = ({
  scenario
}) => {
  const [selectedTargetIndex, setSelectedTargetIndex] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(12); // Padrão: 12 meses
  
  // Obter o resultado para o preço-alvo selecionado
  const selectedTargetResult = scenario.results.resultsByTargetPrice[selectedTargetIndex];
  
  if (!selectedTargetResult) {
    return (
      <div className="bg-dark-card border-dark-border rounded-lg p-6">
        <div className="text-center py-8">
          <AlertCircle size={40} className="mx-auto text-gray-500 mb-3" />
          <h4 className="text-xl font-medium text-white mb-2">Não foi possível calcular resultados</h4>
          <p className="text-gray-400">Verifique os parâmetros do cenário e tente novamente.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-dark-card border-dark-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Resultados da Simulação</h3>
        <Button variant="outline" size="sm">
          <Download size={16} className="mr-2" />
          <span>Exportar</span>
        </Button>
      </div>
      
      {/* Resumo do cenário */}
      <Card className="bg-dark-background border-dark-border p-4 mb-6">
        <h4 className="font-medium text-white mb-3">Resumo do Cenário</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Estratégia:</span>
              <span className="text-white">
                {scenario.investmentStrategy === 'single' ? 'Investimento Único' : 'Investimento Escalonado'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Valor Investido:</span>
              <span className="text-white">{formatCurrency(scenario.results.totalInvestment)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Quantidade Total:</span>
              <span className="text-white">{scenario.results.totalUnits.toFixed(8)} {scenario.name.split(' ')[0]}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Preço Médio:</span>
              <span className="text-white">{formatCurrency(scenario.results.averagePrice)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Preço-Alvo Selecionado:</span>
              <span className="text-white">{formatCurrency(selectedTargetResult.targetPrice)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Tempo para Breakeven:</span>
              <span className="text-white">
                {selectedTargetResult.timeToBreakeven > 0 
                  ? `${selectedTargetResult.timeToBreakeven} meses` 
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Seletor de preço-alvo */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Selecione o Preço-Alvo</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {scenario.results.resultsByTargetPrice.map((result, index) => (
            <Card 
              key={index}
              className={cn(
                "cursor-pointer p-2 transition-all text-center",
                selectedTargetIndex === index
                  ? 'bg-primary/20 border-primary'
                  : 'bg-dark-background border-dark-border hover:border-gray-600'
              )}
              onClick={() => setSelectedTargetIndex(index)}
            >
              <div className="text-sm font-medium text-white mb-1">
                {formatCurrency(result.targetPrice)}
              </div>
              <div className="text-xs text-gray-400">
                {formatPercent((result.targetPrice / scenario.results.averagePrice - 1) * 100)}
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Seletor de período de análise */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Selecione o Período de Análise</label>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_ANALYSIS_MONTHS.map((month) => (
            <Button 
              key={month}
              variant={selectedMonth === month ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMonth(month)}
            >
              {month} {month === 1 ? 'mês' : 'meses'}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Resultados para o preço e período selecionados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-dark-background border-dark-border p-4">
          <div className="text-sm text-gray-400 mb-1">Lucro em {selectedMonth} meses</div>
          <div className={cn(
            "text-xl font-bold mb-2",
            selectedTargetResult.profitAfterMonths[selectedMonth] > 0 ? 'text-green-500' : 'text-red-500'
          )}>
            {formatCurrency(selectedTargetResult.profitAfterMonths[selectedMonth])}
          </div>
          <div className="flex items-center">
            {selectedTargetResult.profitAfterMonths[selectedMonth] > 0 ? (
              <TrendingUp size={16} className="text-green-500 mr-2" />
            ) : (
              <TrendingDown size={16} className="text-red-500 mr-2" />
            )}
            <span className="text-xs text-gray-400">
              {formatPercent(selectedTargetResult.profitPercentageAfterMonths[selectedMonth])} de retorno
            </span>
          </div>
        </Card>
        
        <Card className="bg-dark-background border-dark-border p-4">
          <div className="text-sm text-gray-400 mb-1">Tempo Máximo de Espera</div>
          <div className="text-xl font-bold text-white mb-2">
            {selectedTargetResult.maxWaitTime} meses
          </div>
          <div className="flex items-center">
            <Calendar size={16} className="text-blue-500 mr-2" />
            <span className="text-xs text-gray-400">
              Antes que os juros superem o lucro
            </span>
          </div>
        </Card>
        
        <Card className="bg-dark-background border-dark-border p-4">
          <div className="text-sm text-gray-400 mb-1">Preço para Breakeven em {selectedMonth} meses</div>
          <div className="text-xl font-bold text-white mb-2">
            {formatCurrency(
              (scenario.results.totalInvestment + 
               selectedTargetResult.profitAfterMonths[selectedMonth]) / 
              scenario.results.totalUnits
            )}
          </div>
          <div className="flex items-center">
            <BarChart2 size={16} className="text-amber-500 mr-2" />
            <span className="text-xs text-gray-400">
              Considerando juros acumulados
            </span>
          </div>
        </Card>
      </div>
      
      {/* Tabela de resultados */}
      <div className="mb-6">
        <h4 className="font-medium text-white mb-3">Projeção de Resultados</h4>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="pb-2 text-left text-gray-400 font-medium">Período</th>
                {scenario.results.resultsByTargetPrice.map((result, index) => (
                  <th key={index} className="pb-2 text-right text-gray-400 font-medium">
                    {formatCurrency(result.targetPrice)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEFAULT_ANALYSIS_MONTHS.map(month => (
                <tr key={month} className="border-b border-dark-border/30 hover:bg-dark-background/30">
                  <td className="py-3 text-white">
                    {month} {month === 1 ? 'mês' : 'meses'}
                  </td>
                  
                  {scenario.results.resultsByTargetPrice.map((result, index) => (
                    <td 
                      key={index} 
                      className={cn(
                        "py-3 text-right font-medium",
                        result.profitAfterMonths[month] > 0 ? 'text-green-500' : 'text-red-500'
                      )}
                    >
                      {formatCurrency(result.profitAfterMonths[month])}
                      <br />
                      <span className="text-xs">
                        ({formatPercent(result.profitPercentageAfterMonths[month])})
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Recomendações */}
      <Card className="bg-dark-background border-dark-border p-4">
        <div className="flex items-start">
          <AlertCircle size={20} className="text-primary mr-3 mt-1" />
          <div>
            <h4 className="font-medium text-white mb-1">Interpretação dos Resultados</h4>
            <p className="text-sm text-gray-400">
              {selectedTargetResult.profitAfterMonths[selectedMonth] > 0 ? (
                <>
                  Este cenário apresenta um potencial de lucro de {formatCurrency(selectedTargetResult.profitAfterMonths[selectedMonth])} ({formatPercent(selectedTargetResult.profitPercentageAfterMonths[selectedMonth])}) em {selectedMonth} meses com o preço-alvo de {formatCurrency(selectedTargetResult.targetPrice)}. 
                  O tempo máximo de espera antes que os juros superem o potencial de lucro é de {selectedTargetResult.maxWaitTime} meses.
                </>
              ) : (
                <>
                  Este cenário apresenta um prejuízo estimado de {formatCurrency(Math.abs(selectedTargetResult.profitAfterMonths[selectedMonth]))} em {selectedMonth} meses com o preço-alvo de {formatCurrency(selectedTargetResult.targetPrice)}. 
                  Considere ajustar o preço-alvo ou o horizonte de tempo para buscar um resultado positivo.
                </>
              )}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ScenarioResults;
