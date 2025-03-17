'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  MinusCircle,
  AlertCircle,
  Download,
  BarChart2
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ScenarioAnalyzerProps {
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

export const ScenarioAnalyzer: React.FC<ScenarioAnalyzerProps> = ({
  className
}) => {
  // Estado para o cenário ativo
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('realistic');
  
  // Dados de exemplo para os cenários
  const scenarios: Record<ScenarioType, ScenarioData> = {
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
  };

  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Obter cor baseada no tipo de cenário
  const getScenarioColor = (type: ScenarioType) => {
    switch (type) {
      case 'optimistic': return 'text-green-500';
      case 'realistic': return 'text-blue-500';
      case 'pessimistic': return 'text-amber-500';
      default: return 'text-white';
    }
  };
  
  // Obter ícone baseado no tipo de cenário
  const getScenarioIcon = (type: ScenarioType) => {
    switch (type) {
      case 'optimistic': return <TrendingUp className="text-green-500" />;
      case 'realistic': return <MinusCircle className="text-blue-500" />;
      case 'pessimistic': return <TrendingDown className="text-amber-500" />;
      default: return null;
    }
  };
  
  // Obter dados do cenário ativo
  const activeScenarioData = scenarios[activeScenario];
  
  return (
    <div className={cn("space-y-6", className)}>
      <div className="bg-dark-card border-dark-border rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-white">Análise de Cenários</h3>
        <p className="text-gray-400 mb-6">
          Compare diferentes cenários de mercado e suas projeções para tomar decisões mais informadas.
          Os cenários são baseados em dados históricos e projeções estatísticas.
        </p>
        
        {/* Selector para os cenários */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.values(scenarios).map((scenario) => (
            <Card
              key={scenario.type}
              className={cn(
                "cursor-pointer p-4 transition-all",
                activeScenario === scenario.type
                  ? 'bg-dark-background border-2 border-primary'
                  : 'bg-dark-background border-dark-border hover:border-gray-600'
              )}
              onClick={() => setActiveScenario(scenario.type)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-dark-card mr-3">
                    {getScenarioIcon(scenario.type)}
                  </div>
                  <h4 className="font-medium text-white">{scenario.name}</h4>
                </div>
                <div className={getScenarioColor(scenario.type)}>
                  {scenario.annualReturn}%
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Volatilidade:</span>
                <span className="text-white">{scenario.volatility}%</span>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Detalhes do cenário selecionado */}
        <div className="bg-dark-background border border-dark-border rounded-lg p-4 mb-6">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-dark-card mr-3">
              {getScenarioIcon(activeScenarioData.type)}
            </div>
            <h4 className="font-medium text-white">Cenário {activeScenarioData.name}</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Parâmetros do Cenário</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Retorno anual médio:</span>
                  <span className="text-white">{activeScenarioData.annualReturn}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Volatilidade:</span>
                  <span className="text-white">{activeScenarioData.volatility}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Horizonte de tempo:</span>
                  <span className="text-white">{activeScenarioData.timeHorizon} anos</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400 mb-1">Dados de Investimento</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Investimento inicial:</span>
                  <span className="text-white">{formatCurrency(activeScenarioData.initialInvestment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Aporte mensal:</span>
                  <span className="text-white">{formatCurrency(activeScenarioData.monthlyContribution)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Probabilidade de sucesso:</span>
                  <span className="text-white">{activeScenarioData.probabilityOfSuccess}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-card rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle size={20} className="text-primary mr-3 mt-1" />
              <div>
                <div className="text-sm font-medium text-white mb-1">Interpretação do Cenário</div>
                <p className="text-xs text-gray-400">
                  {activeScenario === 'optimistic' && 
                    'Este cenário representa condições de mercado favoráveis com crescimento econômico robusto, inflação controlada e políticas monetárias acomodatícias. É menos provável, mas possível em períodos de forte recuperação econômica.'}
                  {activeScenario === 'realistic' && 
                    'Este cenário representa as condições de mercado mais prováveis com base em médias históricas de longo prazo. Incorpora ciclos econômicos normais e é considerado uma projeção equilibrada.'}
                  {activeScenario === 'pessimistic' && 
                    'Este cenário contempla condições de mercado desafiadoras, como recessão econômica, alta inflação ou instabilidade política. É mais conservador e útil para planejar contra riscos de queda.'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Resultados da projeção */}
        <div className="mb-6">
          <h4 className="font-medium text-white mb-3">Projeção de Resultados</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-dark-background border-dark-border p-4">
              <div className="text-sm text-gray-400 mb-1">Resultado Provável</div>
              <div className="text-xl font-bold text-white mb-2">
                {formatCurrency(activeScenarioData.projectedFinalAmount)}
              </div>
              <div className="flex items-center">
                <MinusCircle size={16} className="text-blue-500 mr-2" />
                <span className="text-xs text-gray-400">Valor médio projetado</span>
              </div>
            </Card>
            
            <Card className="bg-dark-background border-dark-border p-4">
              <div className="text-sm text-gray-400 mb-1">Pior Cenário</div>
              <div className="text-xl font-bold text-white mb-2">
                {formatCurrency(activeScenarioData.worstCaseAmount)}
              </div>
              <div className="flex items-center">
                <TrendingDown size={16} className="text-amber-500 mr-2" />
                <span className="text-xs text-gray-400">5% de probabilidade</span>
              </div>
            </Card>
            
            <Card className="bg-dark-background border-dark-border p-4">
              <div className="text-sm text-gray-400 mb-1">Melhor Cenário</div>
              <div className="text-xl font-bold text-white mb-2">
                {formatCurrency(activeScenarioData.bestCaseAmount)}
              </div>
              <div className="flex items-center">
                <TrendingUp size={16} className="text-green-500 mr-2" />
                <span className="text-xs text-gray-400">5% de probabilidade</span>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Gráfico de projeção */}
        <div className="bg-dark-background border border-dark-border rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-white">Projeção Comparativa</h4>
            <Button variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              <span>Exportar Dados</span>
            </Button>
          </div>
          
          <div className="h-64 bg-dark-card rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <BarChart2 size={32} className="text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Gráfico de projeção comparativa entre cenários</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-400">Otimista</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-400">Realista</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-400">Pessimista</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="default" className="flex-1">
            Salvar Cenário
          </Button>
          <Button variant="outline" className="flex-1">
            Comparar Mais Cenários
          </Button>
        </div>
      </div>
      
      {/* Recomendações baseadas no cenário */}
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
                    'Em um cenário otimista, considere aumentar a exposição a ativos de maior risco como ações growth e small caps. Reduza posições em renda fixa de longo prazo.'}
                  {activeScenario === 'realistic' && 
                    'Em um cenário realista, uma alocação equilibrada entre renda variável e fixa é recomendada. Mantenha diversificação entre diferentes classes de ativos.'}
                  {activeScenario === 'pessimistic' && 
                    'Em um cenário pessimista, aumente a exposição a ativos defensivos como renda fixa, preferindo prazos mais curtos. Mantenha uma reserva de liquidez maior.'}
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
                  Baseado no cenário {activeScenarioData.name.toLowerCase()}, considere os seguintes ajustes:
                </p>
                <ul className="text-sm text-gray-400 space-y-2 pl-4">
                  {activeScenario === 'optimistic' && (
                    <>
                      <li>Aumente gradualmente seus aportes mensais para maximizar ganhos</li>
                      <li>Considere investimentos mais agressivos em setores de alto crescimento</li>
                      <li>Revise a estratégia a cada 3 meses para capturar oportunidades</li>
                    </>
                  )}
                  {activeScenario === 'realistic' && (
                    <>
                      <li>Mantenha sua estratégia de aportes regulares</li>
                      <li>Diversifique entre diferentes classes de ativos</li>
                      <li>Revise anualmente sua alocação para manter o balanço adequado</li>
                    </>
                  )}
                  {activeScenario === 'pessimistic' && (
                    <>
                      <li>Considere aumentar sua reserva de emergência</li>
                      <li>Priorize redução de dívidas de alto custo</li>
                      <li>Busque oportunidades em ativos descontados com bons fundamentos</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScenarioAnalyzer;
