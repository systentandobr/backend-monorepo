'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';

// Store
import useEnhancedSimulationStore from '@/store/enhancedSimulationStore';

// Componentes
import ScenarioSelector from './enhanced/ScenarioSelector';
import ScenarioDetails from './enhanced/ScenarioDetails';
import ScenarioProjections from './enhanced/ScenarioProjections';
import ScenarioRecommendations from './enhanced/ScenarioRecommendations';
import MonthlyProjectionTable from './MonthlyProjectionTable';

interface EnhancedScenarioAnalyzerProps {
  className?: string;
}

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

const EnhancedScenarioAnalyzer: React.FC<EnhancedScenarioAnalyzerProps> = ({
  className
}) => {
  // Estado para o cenário ativo
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('realistic');
  
  // Obter dados do store
  const { 
    currentPosition, 
    loanData, 
    scenarios, 
    activeScenarioIndex,
    scenarioAnalysis,
    calculateScenarioAnalysis,
    calculateMonthlyProjections
  } = useEnhancedSimulationStore();
  
  // Realizar cálculos quando o componente for montado
  useEffect(() => {
    calculateScenarioAnalysis();
    calculateMonthlyProjections();
  }, [calculateScenarioAnalysis, calculateMonthlyProjections]);
  
  // Dados de exemplo para os cenários
  const [scenariosData, setScenariosData] = useState<Record<ScenarioType, ScenarioData>>({
    optimistic: {
      name: 'Otimista',
      type: 'optimistic',
      annualReturn: 15,
      volatility: 22,
      initialInvestment: 10000,
      timeHorizon: 10,
      monthlyContribution: 1000,
      probabilityOfSuccess: 65,
      projectedFinalAmount: 350000,
      worstCaseAmount: 180000,
      bestCaseAmount: 520000
    },
    realistic: {
      name: 'Realista',
      type: 'realistic',
      annualReturn: 10,
      volatility: 15,
      initialInvestment: 10000,
      timeHorizon: 10,
      monthlyContribution: 1000,
      probabilityOfSuccess: 80,
      projectedFinalAmount: 230000,
      worstCaseAmount: 150000,
      bestCaseAmount: 310000
    },
    pessimistic: {
      name: 'Pessimista',
      type: 'pessimistic',
      annualReturn: 6,
      volatility: 10,
      initialInvestment: 10000,
      timeHorizon: 10,
      monthlyContribution: 1000,
      probabilityOfSuccess: 90,
      projectedFinalAmount: 170000,
      worstCaseAmount: 130000,
      bestCaseAmount: 210000
    }
  });
  
  // Atualizar cenários com dados da simulação
  useEffect(() => {
    if (scenarios && scenarios.length > 0) {
      const activeSimScenario = scenarios[activeScenarioIndex];
      
      // Verificar se temos resultados calculados
      if (!activeSimScenario.results || 
          !activeSimScenario.results.resultsByTargetPrice || 
          activeSimScenario.results.resultsByTargetPrice.length === 0) {
        return;
      }
      
      // Obter preços-alvo ordenados
      const targetPrices = [...activeSimScenario.targetPrices].sort((a, b) => a - b);
      const lowestPrice = targetPrices[0];
      const midPrice = targetPrices[Math.floor(targetPrices.length / 2)];
      const highestPrice = targetPrices[targetPrices.length - 1];
      
      // Obter resultados para cada preço-alvo
      const lowestResult = activeSimScenario.results.resultsByTargetPrice.find(r => r.targetPrice === lowestPrice);
      const midResult = activeSimScenario.results.resultsByTargetPrice.find(r => r.targetPrice === midPrice);
      const highestResult = activeSimScenario.results.resultsByTargetPrice.find(r => r.targetPrice === highestPrice);
      
      // Atualizar os valores dos cenários com base nos dados da simulação
      const updatedScenarios = { ...scenariosData };
      
      // Calcular valores atualizados para cada cenário
      
      // Cenário otimista: baseado no preço-alvo mais alto
      if (highestResult) {
        const profit12Months = highestResult.profitAfterMonths[12] || 0;
        const returnPercent = highestResult.profitPercentageAfterMonths[12] || 0;
        
        updatedScenarios.optimistic = {
          ...updatedScenarios.optimistic,
          initialInvestment: activeSimScenario.results.totalInvestment,
          projectedFinalAmount: activeSimScenario.results.totalUnits * highestPrice,
          worstCaseAmount: Math.max(activeSimScenario.results.totalInvestment * 0.9, 
                               activeSimScenario.results.totalUnits * highestPrice * 0.85),
          bestCaseAmount: activeSimScenario.results.totalUnits * highestPrice * 1.15,
          annualReturn: Math.max(12, returnPercent),
          timeHorizon: highestResult.timeToBreakeven > 0 ? Math.ceil(highestResult.timeToBreakeven / 12) : 2,
          probabilityOfSuccess: 70 // Valor estimado
        };
      }
      
      // Cenário realista: baseado no preço-alvo médio
      if (midResult) {
        const profit12Months = midResult.profitAfterMonths[12] || 0;
        const returnPercent = midResult.profitPercentageAfterMonths[12] || 0;
        
        updatedScenarios.realistic = {
          ...updatedScenarios.realistic,
          initialInvestment: activeSimScenario.results.totalInvestment,
          projectedFinalAmount: activeSimScenario.results.totalUnits * midPrice,
          worstCaseAmount: Math.max(activeSimScenario.results.totalInvestment * 0.95, 
                               activeSimScenario.results.totalUnits * midPrice * 0.9),
          bestCaseAmount: activeSimScenario.results.totalUnits * midPrice * 1.1,
          annualReturn: Math.max(8, returnPercent),
          timeHorizon: midResult.timeToBreakeven > 0 ? Math.ceil(midResult.timeToBreakeven / 12) : 3,
          probabilityOfSuccess: 80 // Valor estimado
        };
      }
      
      // Cenário pessimista: baseado no preço-alvo mais baixo
      if (lowestResult) {
        const profit12Months = lowestResult.profitAfterMonths[12] || 0;
        const returnPercent = lowestResult.profitPercentageAfterMonths[12] || 0;
        
        updatedScenarios.pessimistic = {
          ...updatedScenarios.pessimistic,
          initialInvestment: activeSimScenario.results.totalInvestment,
          projectedFinalAmount: activeSimScenario.results.totalUnits * lowestPrice,
          worstCaseAmount: Math.max(activeSimScenario.results.totalInvestment * 0.8, 
                               activeSimScenario.results.totalUnits * lowestPrice * 0.9),
          bestCaseAmount: activeSimScenario.results.totalUnits * lowestPrice * 1.05,
          annualReturn: Math.max(5, returnPercent),
          timeHorizon: lowestResult.timeToBreakeven > 0 ? Math.ceil(lowestResult.timeToBreakeven / 12) : 4,
          probabilityOfSuccess: 90 // Valor estimado
        };
      }
      
      setScenariosData(updatedScenarios);
    }
  }, [scenarios, activeScenarioIndex, scenarioAnalysis]);
  
  // Obter dados do cenário ativo
  const activeScenarioData = scenariosData[activeScenario];
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Seletor e detalhes do cenário */}
      <div className="bg-dark-card border-dark-border rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-white">Análise de Cenários</h3>
        <p className="text-gray-400 mb-6">
          Compare diferentes cenários de mercado e suas projeções para tomar decisões mais informadas.
          Os cenários são baseados nos dados da sua simulação de investimento em criptomoedas.
        </p>
        
        {/* Seletor de cenários */}
        <ScenarioSelector 
          scenariosData={scenariosData}
          activeScenario={activeScenario}
          setActiveScenario={setActiveScenario}
        />
        
        {/* Detalhes do cenário selecionado */}
        <ScenarioDetails 
          activeScenarioData={activeScenarioData}
          activeScenario={activeScenario}
        />
        
        {/* Projeções de resultados */}
        <ScenarioProjections 
          activeScenarioData={activeScenarioData}
        />
      </div>
      
      {/* Projeção mensal de resultados */}
      <MonthlyProjectionTable />
      
      {/* Recomendações baseadas no cenário */}
      <ScenarioRecommendations 
        activeScenario={activeScenario}
        activeScenarioData={activeScenarioData}
        scenarios={scenarios}
        activeScenarioIndex={activeScenarioIndex}
        scenarioAnalysis={scenarioAnalysis}
      />
    </div>
  );
};

export default EnhancedScenarioAnalyzer;
