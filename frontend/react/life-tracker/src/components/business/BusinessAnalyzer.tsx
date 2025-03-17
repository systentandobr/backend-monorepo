'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart2, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock,
  Download,
  ChevronDown,
  PieChart,
  FileText,
  ArrowRight,
  PlusSquare,
  MinusSquare,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface BusinessAnalyzerProps {
  className?: string;
  opportunityId?: string;
}

// Dados de análise
interface AnalysisData {
  financialAnalysis: {
    initialInvestment: number;
    monthlyRevenue: number;
    monthlyCosts: number;
    monthlyProfit: number;
    projectedROI: number;
    breakevenPoint: number;
    breakevenMonths: number;
    profitMargin: number;
  };
  marketAnalysis: {
    marketSize: number;
    marketGrowth: number;
    competitionLevel: 'low' | 'medium' | 'high';
    entryBarriers: 'low' | 'medium' | 'high';
    targetAudience: string;
    customerAcquisitionCost: number;
    marketSaturation: number;
  };
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  riskAnalysis: {
    overallRisk: 'low' | 'medium' | 'high';
    financialRisk: 'low' | 'medium' | 'high';
    marketRisk: 'low' | 'medium' | 'high';
    operationalRisk: 'low' | 'medium' | 'high';
    regulatoryRisk: 'low' | 'medium' | 'high';
  };
  viabilityScore: number;
  recommendations: string[];
}

export const BusinessAnalyzer: React.FC<BusinessAnalyzerProps> = ({
  className,
  opportunityId
}) => {
  // Estados para controle da interface
  const [activeTab, setActiveTab] = useState<'financial' | 'market' | 'swot' | 'risk' | 'summary'>('financial');
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  
  // Exemplo de dados de análise
  const analysisData: AnalysisData = {
    financialAnalysis: {
      initialInvestment: 120000,
      monthlyRevenue: 28000,
      monthlyCosts: 19000,
      monthlyProfit: 9000,
      projectedROI: 22,
      breakevenPoint: 95000,
      breakevenMonths: 14,
      profitMargin: 32.1
    },
    marketAnalysis: {
      marketSize: 1800000000,
      marketGrowth: 12.5,
      competitionLevel: 'medium',
      entryBarriers: 'medium',
      targetAudience: 'Profissionais urbanos de 25 a 45 anos, conscientes sobre saúde e com poder aquisitivo médio a alto',
      customerAcquisitionCost: 120,
      marketSaturation: 65
    },
    swotAnalysis: {
      strengths: [
        'Modelo de negócio já validado com casos de sucesso',
        'Baixa necessidade de estoque e gerenciamento de produtos',
        'Franqueador fornece treinamento e suporte operacional',
        'Marca estabelecida com reconhecimento de mercado'
      ],
      weaknesses: [
        'Taxas contínuas de royalties e marketing',
        'Menos flexibilidade para adaptações locais',
        'Dependência da gestão central do franqueador',
        'Investimento inicial relativamente alto'
      ],
      opportunities: [
        'Crescente demanda por alimentação saudável',
        'Possibilidade de expansão para múltiplas unidades',
        'Potencial para delivery e vendas online',
        'Tendência de valorização de marcas com propósito sustentável'
      ],
      threats: [
        'Aumento da concorrência no segmento de alimentação saudável',
        'Possível saturação de mercado em regiões específicas',
        'Instabilidade econômica e inflação de alimentos',
        'Mudanças regulatórias em franquias ou setor alimentício'
      ]
    },
    riskAnalysis: {
      overallRisk: 'medium',
      financialRisk: 'medium',
      marketRisk: 'low',
      operationalRisk: 'low',
      regulatoryRisk: 'medium'
    },
    viabilityScore: 78,
    recommendations: [
      'Realizar pesquisa local para validar demanda específica na região pretendida',
      'Solicitar dados detalhados de desempenho das unidades existentes da franquia',
      'Considerar iniciar com uma única unidade antes de planejar expansão',
      'Desenvolver estratégia de marketing local complementar à do franqueador',
      'Estabelecer reserva financeira adicional para os primeiros 6 meses de operação',
      'Analisar detalhadamente o contrato de franquia, especialmente cláusulas de território e exclusividade',
      'Visitar pelo menos 3 unidades existentes e conversar com os franqueados',
      'Identificar potenciais fornecedores alternativos para casos de emergência'
    ]
  };

  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Formatar valores percentuais
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Obter cor baseada no nível (baixo/médio/alto)
  const getLevelColor = (level: 'low' | 'medium' | 'high', isRisk: boolean = true) => {
    if (isRisk) {
      switch (level) {
        case 'low': return 'text-green-500';
        case 'medium': return 'text-amber-500';
        case 'high': return 'text-red-500';
        default: return 'text-gray-400';
      }
    } else {
      switch (level) {
        case 'low': return 'text-amber-500';
        case 'medium': return 'text-blue-500';
        case 'high': return 'text-green-500';
        default: return 'text-gray-400';
      }
    }
  };

  // Obter cor baseada na pontuação de viabilidade
  const getViabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  // Renderizar análise financeira
  const renderFinancialAnalysis = () => {
    const data = analysisData.financialAnalysis;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-dark-background border-dark-border p-4">
            <h4 className="font-medium text-white mb-4">Investimento e Lucro</h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-400">Investimento Inicial</div>
                  <div className="text-xl font-bold text-white">{formatCurrency(data.initialInvestment)}</div>
                </div>
                <DollarSign size={20} className="text-primary" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Receita Mensal</div>
                  <div className="text-lg font-medium text-white">{formatCurrency(data.monthlyRevenue)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Custos Mensais</div>
                  <div className="text-lg font-medium text-white">{formatCurrency(data.monthlyCosts)}</div>
                </div>
              </div>
              
              <div className="pt-2 border-t border-dark-border">
                <div className="text-sm text-gray-400">Lucro Mensal Estimado</div>
                <div className="text-xl font-bold text-white">{formatCurrency(data.monthlyProfit)}</div>
              </div>
              
              <div className="pt-2 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Margem de Lucro</div>
                  <div className="text-lg font-medium text-white">{formatPercent(data.profitMargin)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">ROI Projetado</div>
                  <div className="text-lg font-medium text-white">{formatPercent(data.projectedROI)}/ano</div>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-dark-background border-dark-border p-4">
            <h4 className="font-medium text-white mb-4">Ponto de Equilíbrio</h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-400">Ponto de Equilíbrio Financeiro</div>
                  <div className="text-xl font-bold text-white">{formatCurrency(data.breakevenPoint)}</div>
                </div>
                <BarChart2 size={20} className="text-primary" />
              </div>
              
              <div className="flex items-center gap-3 bg-primary/10 rounded-lg p-3">
                <Clock size={20} className="text-primary" />
                <div>
                  <div className="text-white font-medium">Retorno do Investimento em</div>
                  <div className="text-gray-400 text-sm">
                    Aproximadamente {data.breakevenMonths} meses
                  </div>
                </div>
              </div>
              
              <div className="h-32 bg-dark-card rounded-lg border border-dark-border flex items-center justify-center">
                <p className="text-gray-400 text-sm">Gráfico de projeção de breakeven</p>
              </div>
              
              <div className="text-sm text-gray-400">
                O ponto de equilíbrio representa o momento em que o faturamento acumulado
                se iguala ao investimento inicial, marcando o início do retorno real do investimento.
              </div>
            </div>
          </Card>
        </div>
        
        <Card className="bg-dark-background border-dark-border p-4">
          <h4 className="font-medium text-white mb-4">Projeção Financeira (5 anos)</h4>
          
          <div className="h-60 bg-dark-card rounded-lg border border-dark-border flex items-center justify-center mb-4">
            <p className="text-gray-400 text-sm">Gráfico de projeção financeira</p>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" size="sm">
              <PieChart size={16} className="mr-2" />
              <span>Comparar Cenários</span>
            </Button>
            <Button variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              <span>Exportar Análise</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  // Renderizar análise de mercado
  const renderMarketAnalysis = () => {
    const data = analysisData.marketAnalysis;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-dark-background border-dark-border p-4">
            <h4 className="font-medium text-white mb-4">Tamanho e Crescimento do Mercado</h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-400">Tamanho do Mercado</div>
                  <div className="text-xl font-bold text-white">{formatCurrency(data.marketSize)}</div>
                </div>
                <div className="flex items-center">
                  <TrendingUp size={16} className="text-green-500 mr-1" />
                  <span className="text-green-500">{formatPercent(data.marketGrowth)}</span>
                </div>
              </div>
              
              <div className="h-32 bg-dark-card rounded-lg border border-dark-border flex items-center justify-center">
                <p className="text-gray-400 text-sm">Gráfico de crescimento do mercado</p>
              </div>
              
              <div className="pt-2 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Barreira de Entrada</div>
                  <div className={`text-lg font-medium ${getLevelColor(data.entryBarriers, true)}`}>
                    {data.entryBarriers === 'low' && 'Baixa'}
                    {data.entryBarriers === 'medium' && 'Média'}
                    {data.entryBarriers === 'high' && 'Alta'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Concorrência</div>
                  <div className={`text-lg font-medium ${getLevelColor(data.competitionLevel, true)}`}>
                    {data.competitionLevel === 'low' && 'Baixa'}
                    {data.competitionLevel === 'medium' && 'Média'}
                    {data.competitionLevel === 'high' && 'Alta'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-dark-background border-dark-border p-4">
            <h4 className="font-medium text-white mb-4">Perfil do Cliente</h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-400">Público-Alvo</div>
                  <div className="text-white">{data.targetAudience}</div>
                </div>
                <Users size={20} className="text-primary" />
              </div>
              
              <div className="pt-3 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Custo de Aquisição</div>
                  <div className="text-lg font-medium text-white">{formatCurrency(data.customerAcquisitionCost)}</div>
                  <div className="text-xs text-gray-400">por cliente</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Saturação do Mercado</div>
                  <div className="text-lg font-medium text-white">{formatPercent(data.marketSaturation)}</div>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="h-24 bg-dark-card rounded-lg border border-dark-border flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Gráfico de segmentação de clientes</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <Card className="bg-dark-background border-dark-border p-4">
          <h4 className="font-medium text-white mb-4">Análise Competitiva</h4>
          
          <div className="h-60 bg-dark-card rounded-lg border border-dark-border flex items-center justify-center mb-4">
            <p className="text-gray-400 text-sm">Mapa de posicionamento competitivo</p>
          </div>
          
          <div className="text-sm text-gray-400">
            A análise competitiva mostra o posicionamento de mercado em relação aos concorrentes diretos,
            considerando variáveis como preço, qualidade, variedade e experiência do cliente.
          </div>
        </Card>
      </div>
    );
  };

  // Renderizar análise SWOT
  const renderSwotAnalysis = () => {
    const data = analysisData.swotAnalysis;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-dark-background border-dark-border p-4">
            <h4 className="font-medium text-white mb-4 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Forças (Strengths)
            </h4>
            
            <ul className="space-y-2">
              {data.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <Check size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-300">{strength}</span>
                </li>
              ))}
            </ul>
          </Card>
          
          <Card className="bg-dark-background border-dark-border p-4">
            <h4 className="font-medium text-white mb-4 flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              Fraquezas (Weaknesses)
            </h4>
            
            <ul className="space-y-2">
              {data.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start">
                  <X size={16} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-300">{weakness}</span>
                </li>
              ))}
            </ul>
          </Card>
          
          <Card className="bg-dark-background border-dark-border p-4">
            <h4 className="font-medium text-white mb-4 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Oportunidades (Opportunities)
            </h4>
            
            <ul className="space-y-2">
              {data.opportunities.map((opportunity, index) => (
                <li key={index} className="flex items-start">
                  <TrendingUp size={16} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-300">{opportunity}</span>
                </li>
              ))}
            </ul>
          </Card>
          
          <Card className="bg-dark-background border-dark-border p-4">
            <h4 className="font-medium text-white mb-4 flex items-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
              Ameaças (Threats)
            </h4>
            
            <ul className="space-y-2">
              {data.threats.map((threat, index) => (
                <li key={index} className="flex items-start">
                  <AlertCircle size={16} className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-300">{threat}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        
        <Card className="bg-dark-background border-dark-border p-4">
          <h4 className="font-medium text-white mb-4">Matriz SWOT</h4>
          
          <div className="h-60 bg-dark-card rounded-lg border border-dark-border flex items-center justify-center mb-4">
            <p className="text-gray-400 text-sm">Visualização da matriz SWOT</p>
          </div>
          
          <div className="text-sm text-gray-400">
            A análise SWOT é uma ferramenta estratégica para identificar os fatores internos
            (forças e fraquezas) e externos (oportunidades e ameaças) que impactam o negócio.
            Use-a para maximizar pontos fortes e oportunidades enquanto minimiza fraquezas e ameaças.
          </div>
        </Card>
      </div>
    );
  };

  // Renderizar análise de risco
  const renderRiskAnalysis = () => {
    const data = analysisData.riskAnalysis;
    
    return (
      <div className="space-y-6">
        <Card className="bg-dark-background border-dark-border p-4">
          <h4 className="font-medium text-white mb-4">Avaliação de Riscos</h4>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm text-gray-400">Nível de Risco Geral</div>
              <div className={`text-2xl font-bold ${getLevelColor(data.overallRisk)}`}>
                {data.overallRisk === 'low' && 'Baixo'}
                {data.overallRisk === 'medium' && 'Médio'}
                {data.overallRisk === 'high' && 'Alto'}
              </div>
            </div>
            <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center"
              style={{ 
                borderColor: data.overallRisk === 'low' ? '#10b981' : 
                             data.overallRisk === 'medium' ? '#f59e0b' : '#ef4444'
              }}
            >
              <div className="text-lg font-bold text-white">
                {data.overallRisk === 'low' && 'B'}
                {data.overallRisk === 'medium' && 'M'}
                {data.overallRisk === 'high' && 'A'}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-400">Risco Financeiro</span>
                <span className={getLevelColor(data.financialRisk)}>
                  {data.financialRisk === 'low' && 'Baixo'}
                  {data.financialRisk === 'medium' && 'Médio'}
                  {data.financialRisk === 'high' && 'Alto'}
                </span>
              </div>
              <div className="w-full bg-dark-card rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    data.financialRisk === 'low' ? 'bg-green-500' : 
                    data.financialRisk === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    width: data.financialRisk === 'low' ? '33%' : 
                           data.financialRisk === 'medium' ? '66%' : '100%' 
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-400">Risco de Mercado</span>
                <span className={getLevelColor(data.marketRisk)}>
                  {data.marketRisk === 'low' && 'Baixo'}
                  {data.marketRisk === 'medium' && 'Médio'}
                  {data.marketRisk === 'high' && 'Alto'}
                </span>
              </div>
              <div className="w-full bg-dark-card rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    data.marketRisk === 'low' ? 'bg-green-500' : 
                    data.marketRisk === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    width: data.marketRisk === 'low' ? '33%' : 
                           data.marketRisk === 'medium' ? '66%' : '100%' 
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-400">Risco Operacional</span>
                <span className={getLevelColor(data.operationalRisk)}>
                  {data.operationalRisk === 'low' && 'Baixo'}
                  {data.operationalRisk === 'medium' && 'Médio'}
                  {data.operationalRisk === 'high' && 'Alto'}
                </span>
              </div>
              <div className="w-full bg-dark-card rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    data.operationalRisk === 'low' ? 'bg-green-500' : 
                    data.operationalRisk === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    width: data.operationalRisk === 'low' ? '33%' : 
                           data.operationalRisk === 'medium' ? '66%' : '100%' 
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-400">Risco Regulatório</span>
                <span className={getLevelColor(data.regulatoryRisk)}>
                  {data.regulatoryRisk === 'low' && 'Baixo'}
                  {data.regulatoryRisk === 'medium' && 'Médio'}
                  {data.regulatoryRisk === 'high' && 'Alto'}
                </span>
              </div>
              <div className="w-full bg-dark-card rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    data.regulatoryRisk === 'low' ? 'bg-green-500' : 
                    data.regulatoryRisk === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ 
                    width: data.regulatoryRisk === 'low' ? '33%' : 
                           data.regulatoryRisk === 'medium' ? '66%' : '100%' 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-dark-background border-dark-border p-4">
            <h4 className="font-medium text-white mb-4">Matriz de Risco</h4>
            
            <div className="h-60 bg-dark-card rounded-lg border border-dark-border flex items-center justify-center">
              <p className="text-gray-400 text-sm">Visualização da matriz de risco</p>
            </div>
          </Card>
          
          <Card className="bg-dark-background border-dark-border p-4">
            <h4 className="font-medium text-white mb-4">Plano de Contingência</h4>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="p-1 rounded-full bg-dark-card mr-2 mt-0.5">
                  <AlertCircle size={14} className="text-amber-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Volatilidade Financeira</div>
                  <p className="text-xs text-gray-400">Manter reserva emergencial para cobrir pelo menos 6 meses de operação</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-1 rounded-full bg-dark-card mr-2 mt-0.5">
                  <AlertCircle size={14} className="text-amber-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Aumento da Concorrência</div>
                  <p className="text-xs text-gray-400">Desenvolver estratégias de fidelização e diferenciação de produto</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-1 rounded-full bg-dark-card mr-2 mt-0.5">
                  <AlertCircle size={14} className="text-amber-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Problemas com Fornecedores</div>
                  <p className="text-xs text-gray-400">Identificar e qualificar fornecedores alternativos para emergências</p>
                </div>
              </div>
              
              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  <FileText size={16} className="mr-2" />
                  <span>Ver Plano Completo</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // Renderizar resumo da análise
  const renderSummary = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-dark-background border-dark-border p-4 md:col-span-2">
            <h4 className="font-medium text-white mb-4">Pontuação de Viabilidade</h4>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">Viabilidade Geral do Negócio</div>
                <div className={`text-3xl font-bold ${getViabilityColor(analysisData.viabilityScore)}`}>
                  {analysisData.viabilityScore}/100
                </div>
              </div>
              
              <div className="mt-4 md:mt-0">
                <div className="w-24 h-24 mx-auto md:mx-0 relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="transparent"
                      stroke="#333"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="transparent"
                      stroke={
                        analysisData.viabilityScore >= 80 ? '#10b981' : 
                        analysisData.viabilityScore >= 60 ? '#f59e0b' : 
                        analysisData.viabilityScore >= 40 ? '#f97316' : '#ef4444'
                      }
                      strokeWidth="8"
                      strokeDasharray={`${analysisData.viabilityScore * 2.83} 283`}
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-lg font-bold text-white">{analysisData.viabilityScore}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Viabilidade Financeira</div>
                <div className="flex items-center">
                  <div className="w-full bg-dark-card rounded-full h-2 mr-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: '80%' }}
                    ></div>
                  </div>
                  <span className="text-white">80%</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Viabilidade de Mercado</div>
                <div className="flex items-center">
                  <div className="w-full bg-dark-card rounded-full h-2 mr-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                  <span className="text-white">85%</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Viabilidade Operacional</div>
                <div className="flex items-center">
                  <div className="w-full bg-dark-card rounded-full h-2 mr-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                  <span className="text-white">75%</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Sustentabilidade</div>
                <div className="flex items-center">
                  <div className="w-full bg-dark-card rounded-full h-2 mr-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: '70%' }}
                    ></div>
                  </div>
                  <span className="text-white">70%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/10 rounded-lg p-3">
              <div className="flex items-start">
                <div className="p-1 rounded-full bg-dark-card mr-2 mt-0.5">
                  <AlertCircle size={14} className="text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Interpretação da Pontuação</div>
                  <p className="text-xs text-gray-200">
                    Uma pontuação de viabilidade de 78/100 indica um bom potencial para sucesso, 
                    com fortes indicadores financeiros e de mercado. Os riscos são administráveis 
                    com planejamento adequado e implementação de estratégias de mitigação recomendadas.
                  </p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-dark-background border-dark-border p-4">
            <h4 className="font-medium text-white mb-4">Principais Indicadores</h4>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">ROI Projetado</div>
                <div className="text-xl font-bold text-white">
                  {formatPercent(analysisData.financialAnalysis.projectedROI)}/ano
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Ponto de Equilíbrio</div>
                <div className="text-lg text-white">
                  {analysisData.financialAnalysis.breakevenMonths} meses
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Crescimento de Mercado</div>
                <div className="text-lg text-white">
                  {formatPercent(analysisData.marketAnalysis.marketGrowth)}/ano
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Nível de Risco</div>
                <div className={`text-lg ${getLevelColor(analysisData.riskAnalysis.overallRisk)}`}>
                  {analysisData.riskAnalysis.overallRisk === 'low' && 'Baixo'}
                  {analysisData.riskAnalysis.overallRisk === 'medium' && 'Médio'}
                  {analysisData.riskAnalysis.overallRisk === 'high' && 'Alto'}
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <Card className="bg-dark-background border-dark-border p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-white">Recomendações</h4>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowAllRecommendations(!showAllRecommendations)}
            >
              {showAllRecommendations ? (
                <MinusSquare size={16} className="mr-2" />
              ) : (
                <PlusSquare size={16} className="mr-2" />
              )}
              <span>{showAllRecommendations ? 'Mostrar Menos' : 'Mostrar Todas'}</span>
            </Button>
          </div>
          
          <div className="space-y-3">
            {analysisData.recommendations
              .slice(0, showAllRecommendations ? undefined : 4)
              .map((recommendation, index) => (
                <div key={index} className="flex items-start">
                  <ArrowRight size={16} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-300">{recommendation}</span>
                </div>
              ))}
          </div>
          
          {!showAllRecommendations && analysisData.recommendations.length > 4 && (
            <div className="mt-3 text-center">
              <Button 
                variant="ghost" 
                onClick={() => setShowAllRecommendations(true)}
              >
                Ver mais {analysisData.recommendations.length - 4} recomendações
              </Button>
            </div>
          )}
        </Card>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="default" className="flex-1">
            <Download size={16} className="mr-2" />
            <span>Baixar Relatório Completo</span>
          </Button>
          <Button variant="outline" className="flex-1">
            <PieChart size={16} className="mr-2" />
            <span>Comparar com Outras Oportunidades</span>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="bg-dark-card border-dark-border rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Análise de Viabilidade de Negócio</h3>
            <p className="text-gray-400 text-sm">
              Franquia de Alimentação Saudável - Análise Detalhada
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getViabilityColor(analysisData.viabilityScore)}`}>
              Pontuação: {analysisData.viabilityScore}/100
            </div>
            <Button variant="outline" size="sm">
              <FileText size={16} className="mr-2" />
              <span>Ver PDF</span>
            </Button>
          </div>
        </div>
        
        {/* Navegação em abas */}
        <div className="border-b border-dark-border mb-6">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'financial'
                  ? 'border-primary text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('financial')}
            >
              Financeira
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'market'
                  ? 'border-primary text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('market')}
            >
              Mercado
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'swot'
                  ? 'border-primary text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('swot')}
            >
              SWOT
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'risk'
                  ? 'border-primary text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('risk')}
            >
              Riscos
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'summary'
                  ? 'border-primary text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('summary')}
            >
              Resumo
            </button>
          </nav>
        </div>
        
        {/* Conteúdo da aba atual */}
        {activeTab === 'financial' && renderFinancialAnalysis()}
        {activeTab === 'market' && renderMarketAnalysis()}
        {activeTab === 'swot' && renderSwotAnalysis()}
        {activeTab === 'risk' && renderRiskAnalysis()}
        {activeTab === 'summary' && renderSummary()}
      </div>
    </div>
  );
};

export default BusinessAnalyzer;
