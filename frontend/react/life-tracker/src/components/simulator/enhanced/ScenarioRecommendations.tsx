'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  MinusCircle,
  AlertCircle
} from 'lucide-react';

// Utilitários
import { formatCurrency } from '@/components/simulator/utils/monthly-projection-calculations';

// Tipos
import { ScenarioData as SimScenarioData } from '@/components/simulator/types/investment-types';
import { ScenarioAnalysis } from '@/components/simulator/types/monthly-projection-types';

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

interface ScenarioRecommendationsProps {
  activeScenario: ScenarioType;
  activeScenarioData: ScenarioData;
  scenarios: SimScenarioData[];
  activeScenarioIndex: number;
  scenarioAnalysis: ScenarioAnalysis;
}

const ScenarioRecommendations: React.FC<ScenarioRecommendationsProps> = ({
  activeScenario,
  activeScenarioData,
  scenarios,
  activeScenarioIndex,
  scenarioAnalysis
}) => {
  // Obter o cenário ativo da simulação
  const activeSimScenario = scenarios[activeScenarioIndex];
  
  // Verificar se temos dados de preços-alvo
  const hasTargetPrices = activeSimScenario?.targetPrices && activeSimScenario.targetPrices.length > 0;
  
  // Obter preços-alvo mínimo e máximo (se disponíveis)
  const minTargetPrice = hasTargetPrices 
    ? Math.min(...activeSimScenario.targetPrices) 
    : 0;
    
  const maxTargetPrice = hasTargetPrices 
    ? Math.max(...activeSimScenario.targetPrices) 
    : 0;
  
  return (
    <div className="bg-dark-card border-dark-border rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-white">Recomendações para o Cenário</h3>
      
      <div className="space-y-4">
        <Card className="bg-dark-background border-dark-border p-4">
          <div className="flex items-start">
            <div className="p-2 rounded-full bg-dark-card mr-3">
              {activeScenario === 'optimistic' && <TrendingUp className="text-green-500" />}
              {activeScenario === 'realistic' && <MinusCircle className="text-blue-500" />}
              {activeScenario === 'pessimistic' && <TrendingDown className="text-amber-500" />}
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Estratégia de Alocação</h4>
              <p className="text-sm text-gray-400">
                {activeScenario === 'optimistic' && 
                  'Em um cenário otimista, considere aumentar a exposição a criptomoedas de maior capitalização. Se confirmar a tendência de alta, você pode gradualmente adicionar posições em projetos menores com alto potencial de crescimento.'}
                {activeScenario === 'realistic' && 
                  'Em um cenário realista, mantenha uma alocação equilibrada entre criptomoedas estabelecidas e algumas de médio risco. Utilize estratégias de investimento escalonado para aproveitar a volatilidade do mercado.'}
                {activeScenario === 'pessimistic' && 
                  'Em um cenário pessimista, priorize manter uma reserva significativa em stablecoins e tokens de maior liquidez. Evite projetos de maior risco e considere técnicas de hedge para proteger seu capital.'}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-dark-background border-dark-border p-4">
          <div className="flex items-start">
            <div className="p-2 rounded-full bg-dark-card mr-3">
              <AlertCircle className="text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Ajustes Sugeridos</h4>
              <p className="text-sm text-gray-400 mb-3">
                Baseado no cenário {activeScenarioData.name.toLowerCase()} e nos dados da sua simulação, considere os seguintes ajustes:
              </p>
              <ul className="text-sm text-gray-400 space-y-2 pl-4">
                {activeScenario === 'optimistic' && (
                  <>
                    <li>Defina alertas de preço para {formatCurrency(maxTargetPrice)} com plano de venda parcial</li>
                    <li>Considere aumentar sua exposição utilizando {formatCurrency(activeSimScenario?.investmentAmount || 0)} em investimento escalonado</li>
                    {scenarioAnalysis.timeToTarget[maxTargetPrice] && (
                      <li>Tempo estimado para atingir o alvo: {scenarioAnalysis.timeToTarget[maxTargetPrice]} meses</li>
                    )}
                    <li>Reavalie sua posição a cada 3 meses para ajustar a estratégia</li>
                  </>
                )}
                {activeScenario === 'realistic' && (
                  <>
                    <li>Divida seu investimento de {formatCurrency(activeSimScenario?.investmentAmount || 0)} em 4 partes iguais</li>
                    <li>Utilize quedas de 10% a 30% para acumular posições</li>
                    <li>Tempo máximo de espera recomendado: {scenarioAnalysis.maxWaitTime} meses</li>
                    <li>Mantenha uma reserva de 15% para oportunidades excepcionais</li>
                  </>
                )}
                {activeScenario === 'pessimistic' && (
                  <>
                    <li>Defina um stop loss em {formatCurrency(minTargetPrice * 0.7)} (30% abaixo do preço-alvo mínimo)</li>
                    <li>Considere reduzir o prazo do empréstimo ou valor da exposição</li>
                    <li>O breakeven está estimado em {scenarioAnalysis.breakEvenTime || '?'} meses - avalie se isso é sustentável</li>
                    <li>Reavalie o investimento caso não alcance {formatCurrency(minTargetPrice)} em 6 meses</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </Card>
        
        <Card className="bg-dark-background border-dark-border p-4">
          <div className="flex items-start">
            <div className="p-2 rounded-full bg-dark-card mr-3">
              <MinusCircle className="text-blue-500" />
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Resumo do Fluxo Financeiro</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Investimento Total:</span>
                  <span className="text-white">{formatCurrency(activeScenarioData.initialInvestment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Parcela Mensal do Empréstimo:</span>
                  <span className="text-white">{formatCurrency(scenarioAnalysis.calculatedMonthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total de Juros (empréstimo completo):</span>
                  <span className="text-white">{formatCurrency(scenarioAnalysis.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Projeção de Retorno Anual:</span>
                  <span className="text-green-500">{activeScenarioData.annualReturn}%</span>
                </div>
                <div className="flex justify-between font-medium mt-2">
                  <span>Ponto de Equilíbrio:</span>
                  <span className="text-blue-500">Mês {scenarioAnalysis.breakEvenTime}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ScenarioRecommendations;
