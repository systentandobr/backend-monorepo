'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  TrendingUp, 
  ArrowUpDown, 
  Filter, 
  ChevronDown, 
  Star,
  StarOff,
  BarChart2,
  Users,
  DollarSign,
  Briefcase,
  Building,
  Clock,
  Zap
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface OpportunityScannerProps {
  className?: string;
}

// Tipos de oportunidades
type OpportunityType = 'startup' | 'franchise' | 'smallbusiness' | 'digital' | 'realestate' | 'stockmarket';

// Categorias de indústria
type IndustryCategory = 'tech' | 'food' | 'health' | 'retail' | 'finance' | 'education' | 'entertainment' | 'other';

// Nível de investimento
type InvestmentLevel = 'low' | 'medium' | 'high';

// Interface para os dados de oportunidade
interface OpportunityData {
  id: string;
  name: string;
  type: OpportunityType;
  industry: IndustryCategory;
  description: string;
  investmentMin: number;
  investmentMax: number;
  investmentLevel: InvestmentLevel;
  projectedROI: number;
  monthsToBreakeven: number;
  trendScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  growthPotential: 'low' | 'medium' | 'high';
  complexity: 'low' | 'medium' | 'high';
  tags: string[];
  isFavorite: boolean;
  location?: string;
}

export const OpportunityScanner: React.FC<OpportunityScannerProps> = ({
  className
}) => {
  // Estados para filtros e ordenação
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<OpportunityType[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<IndustryCategory[]>([]);
  const [investmentRange, setInvestmentRange] = useState<[number, number]>([0, 1000000]);
  const [sortBy, setSortBy] = useState<'trendScore' | 'projectedROI' | 'investmentMin' | 'monthsToBreakeven'>('trendScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Estado para oportunidades e oportunidades filtradas
  const [opportunities, setOpportunities] = useState<OpportunityData[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<OpportunityData[]>([]);

  // Exemplo de dados de oportunidades
  const mockOpportunities: OpportunityData[] = [
    {
      id: 'op1',
      name: 'Software as a Service (SaaS) para Gestão de Pequenos Negócios',
      type: 'startup',
      industry: 'tech',
      description: 'Plataforma de software para automatizar processos operacionais de pequenas empresas.',
      investmentMin: 150000,
      investmentMax: 500000,
      investmentLevel: 'medium',
      projectedROI: 28,
      monthsToBreakeven: 18,
      trendScore: 92,
      riskLevel: 'medium',
      growthPotential: 'high',
      complexity: 'medium',
      tags: ['SaaS', 'PME', 'Automação', 'Cloud'],
      isFavorite: false
    },
    {
      id: 'op2',
      name: 'Franquia de Alimentação Saudável',
      type: 'franchise',
      industry: 'food',
      description: 'Rede de restaurantes focados em alimentação saudável e sustentável com formato de quiosque.',
      investmentMin: 120000,
      investmentMax: 250000,
      investmentLevel: 'medium',
      projectedROI: 22,
      monthsToBreakeven: 14,
      trendScore: 88,
      riskLevel: 'medium',
      growthPotential: 'high',
      complexity: 'low',
      tags: ['Alimentação', 'Franquia', 'Saudável', 'Fast-food'],
      isFavorite: true,
      location: 'Principais centros urbanos'
    },
    {
      id: 'op3',
      name: 'Marketplace para Profissionais de Saúde',
      type: 'digital',
      industry: 'health',
      description: 'Plataforma que conecta pacientes a profissionais de saúde para consultas e atendimentos diversos.',
      investmentMin: 80000,
      investmentMax: 300000,
      investmentLevel: 'medium',
      projectedROI: 32,
      monthsToBreakeven: 15,
      trendScore: 94,
      riskLevel: 'medium',
      growthPotential: 'high',
      complexity: 'high',
      tags: ['Saúde', 'Marketplace', 'Telemedicina', 'Digital'],
      isFavorite: false
    },
    {
      id: 'op4',
      name: 'Dropshipping de Produtos Sustentáveis',
      type: 'digital',
      industry: 'retail',
      description: 'Loja online de produtos sustentáveis operando com modelo de dropshipping (sem estoque).',
      investmentMin: 5000,
      investmentMax: 20000,
      investmentLevel: 'low',
      projectedROI: 35,
      monthsToBreakeven: 6,
      trendScore: 82,
      riskLevel: 'low',
      growthPotential: 'medium',
      complexity: 'low',
      tags: ['E-commerce', 'Dropshipping', 'Sustentabilidade', 'Baixo Investimento'],
      isFavorite: false
    },
    {
      id: 'op5',
      name: 'Fintech de Crédito para Microempreendedores',
      type: 'startup',
      industry: 'finance',
      description: 'Plataforma digital para oferecer microcrédito a pequenos empreendedores com análise de risco inteligente.',
      investmentMin: 250000,
      investmentMax: 800000,
      investmentLevel: 'high',
      projectedROI: 40,
      monthsToBreakeven: 24,
      trendScore: 90,
      riskLevel: 'high',
      growthPotential: 'high',
      complexity: 'high',
      tags: ['Fintech', 'Crédito', 'Microempreendedores', 'Inclusão Financeira'],
      isFavorite: false
    },
    {
      id: 'op6',
      name: 'Escola de Programação e Robótica para Crianças',
      type: 'smallbusiness',
      industry: 'education',
      description: 'Escola que ensina programação, robótica e pensamento computacional para crianças e adolescentes.',
      investmentMin: 50000,
      investmentMax: 120000,
      investmentLevel: 'low',
      projectedROI: 25,
      monthsToBreakeven: 12,
      trendScore: 86,
      riskLevel: 'low',
      growthPotential: 'medium',
      complexity: 'medium',
      tags: ['Educação', 'Tecnologia', 'Crianças', 'STEM'],
      isFavorite: true
    },
    {
      id: 'op7',
      name: 'Aluguel de Imóveis para Airbnb em Regiões Turísticas',
      type: 'realestate',
      industry: 'other',
      description: 'Aquisição e gestão de imóveis em regiões turísticas para aluguel de curta temporada via plataformas como Airbnb.',
      investmentMin: 200000,
      investmentMax: 500000,
      investmentLevel: 'high',
      projectedROI: 18,
      monthsToBreakeven: 36,
      trendScore: 78,
      riskLevel: 'medium',
      growthPotential: 'medium',
      complexity: 'medium',
      tags: ['Imóveis', 'Turismo', 'Aluguel', 'Renda Passiva'],
      isFavorite: false,
      location: 'Destinos turísticos'
    },
    {
      id: 'op8',
      name: 'Plataforma de Streaming de Conteúdo Infantil',
      type: 'digital',
      industry: 'entertainment',
      description: 'Plataforma de streaming focada exclusivamente em conteúdo educativo e de entretenimento para crianças.',
      investmentMin: 180000,
      investmentMax: 600000,
      investmentLevel: 'high',
      projectedROI: 30,
      monthsToBreakeven: 22,
      trendScore: 84,
      riskLevel: 'high',
      growthPotential: 'high',
      complexity: 'high',
      tags: ['Streaming', 'Educação', 'Crianças', 'Conteúdo Digital'],
      isFavorite: false
    }
  ];

  // Carregar dados iniciais
  useEffect(() => {
    // Em uma implementação real, aqui faríamos uma chamada de API
    setOpportunities(mockOpportunities);
    setFilteredOpportunities(mockOpportunities);
  }, []);

  // Aplicar filtros e ordenação quando os parâmetros mudarem
  useEffect(() => {
    let result = [...opportunities];

    // Aplicar busca por termo
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        op => op.name.toLowerCase().includes(searchLower) || 
              op.description.toLowerCase().includes(searchLower) ||
              op.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filtrar por tipo de oportunidade
    if (selectedTypes.length > 0) {
      result = result.filter(op => selectedTypes.includes(op.type));
    }

    // Filtrar por indústria
    if (selectedIndustries.length > 0) {
      result = result.filter(op => selectedIndustries.includes(op.industry));
    }

    // Filtrar por faixa de investimento
    result = result.filter(
      op => op.investmentMin >= investmentRange[0] && op.investmentMin <= investmentRange[1]
    );

    // Aplicar ordenação
    result.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      
      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });

    setFilteredOpportunities(result);
  }, [
    opportunities, 
    searchTerm, 
    selectedTypes, 
    selectedIndustries, 
    investmentRange, 
    sortBy, 
    sortOrder
  ]);

  // Manipulador de favoritos
  const toggleFavorite = (id: string) => {
    setOpportunities(prevOpportunities => 
      prevOpportunities.map(op => 
        op.id === id ? { ...op, isFavorite: !op.isFavorite } : op
      )
    );
  };

  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Obter cor baseada no nível (baixo/médio/alto)
  const getLevelColor = (level: 'low' | 'medium' | 'high', type: 'risk' | 'potential' | 'complexity' | 'investment') => {
    if (type === 'risk' || type === 'complexity') {
      switch (level) {
        case 'low': return 'text-green-500';
        case 'medium': return 'text-amber-500';
        case 'high': return 'text-red-500';
        default: return 'text-gray-400';
      }
    } else { // potential or investment
      switch (level) {
        case 'low': return 'text-amber-500';
        case 'medium': return 'text-blue-500';
        case 'high': return 'text-green-500';
        default: return 'text-gray-400';
      }
    }
  };

  // Obter ícone baseado no tipo de oportunidade
  const getOpportunityIcon = (type: OpportunityType) => {
    switch (type) {
      case 'startup': return <Zap className="text-purple-500" />;
      case 'franchise': return <Building className="text-blue-500" />;
      case 'smallbusiness': return <Briefcase className="text-green-500" />;
      case 'digital': return <BarChart2 className="text-teal-500" />;
      case 'realestate': return <Building className="text-amber-500" />;
      case 'stockmarket': return <TrendingUp className="text-red-500" />;
      default: return <Briefcase className="text-gray-500" />;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="bg-dark-card border-dark-border rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Scanner de Oportunidades</h3>
            <p className="text-gray-400 text-sm">
              Descubra e analise novas oportunidades de negócio com base em tendências e métricas de mercado
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter size={16} className="mr-2" />
              <span>Filtros</span>
              <ChevronDown size={16} className="ml-2" />
            </Button>
            
            <div className="inline-flex rounded-md shadow-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="rounded-l-md rounded-r-none px-2"
              >
                <ArrowUpDown size={16} />
              </Button>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-dark-background border-y border-r border-dark-border rounded-r-md px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="trendScore">Tendência</option>
                <option value="projectedROI">ROI Projetado</option>
                <option value="investmentMin">Investimento</option>
                <option value="monthsToBreakeven">Tempo de Retorno</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Barra de busca */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Buscar oportunidades por palavra-chave, indústria ou tag..."
            className="w-full bg-dark-background border border-dark-border rounded-lg p-2 pl-9 text-white focus:border-primary focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Filtros avançados */}
        {showFilters && (
          <Card className="bg-dark-background border-dark-border p-4 mb-6">
            <h4 className="font-medium text-white mb-4">Filtros Avançados</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tipo de Oportunidade</label>
                <div className="space-y-2">
                  {[
                    { id: 'startup', label: 'Startup' },
                    { id: 'franchise', label: 'Franquia' },
                    { id: 'smallbusiness', label: 'Pequeno Negócio' },
                    { id: 'digital', label: 'Negócio Digital' },
                    { id: 'realestate', label: 'Imobiliário' },
                    { id: 'stockmarket', label: 'Mercado de Ações' }
                  ].map(type => (
                    <div key={type.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`type-${type.id}`}
                        className="mr-2 h-4 w-4 rounded border-gray-600 bg-dark-card text-primary focus:ring-primary focus:ring-offset-dark-background"
                        checked={selectedTypes.includes(type.id as OpportunityType)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTypes([...selectedTypes, type.id as OpportunityType]);
                          } else {
                            setSelectedTypes(selectedTypes.filter(t => t !== type.id));
                          }
                        }}
                      />
                      <label htmlFor={`type-${type.id}`} className="text-white text-sm">
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Indústria</label>
                <div className="space-y-2">
                  {[
                    { id: 'tech', label: 'Tecnologia' },
                    { id: 'food', label: 'Alimentação' },
                    { id: 'health', label: 'Saúde' },
                    { id: 'retail', label: 'Varejo' },
                    { id: 'finance', label: 'Finanças' },
                    { id: 'education', label: 'Educação' },
                    { id: 'entertainment', label: 'Entretenimento' },
                    { id: 'other', label: 'Outros' }
                  ].map(industry => (
                    <div key={industry.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`industry-${industry.id}`}
                        className="mr-2 h-4 w-4 rounded border-gray-600 bg-dark-card text-primary focus:ring-primary focus:ring-offset-dark-background"
                        checked={selectedIndustries.includes(industry.id as IndustryCategory)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIndustries([...selectedIndustries, industry.id as IndustryCategory]);
                          } else {
                            setSelectedIndustries(selectedIndustries.filter(i => i !== industry.id));
                          }
                        }}
                      />
                      <label htmlFor={`industry-${industry.id}`} className="text-white text-sm">
                        {industry.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Investimento Inicial (R$)</label>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Mínimo</label>
                      <select 
                        className="w-full bg-dark-background border border-dark-border rounded-md p-2 text-sm text-white"
                        value={investmentRange[0]}
                        onChange={(e) => setInvestmentRange([parseInt(e.target.value), investmentRange[1]])}
                      >
                        <option value="0">R$ 0</option>
                        <option value="5000">R$ 5.000</option>
                        <option value="25000">R$ 25.000</option>
                        <option value="50000">R$ 50.000</option>
                        <option value="100000">R$ 100.000</option>
                        <option value="250000">R$ 250.000</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Máximo</label>
                      <select 
                        className="w-full bg-dark-background border border-dark-border rounded-md p-2 text-sm text-white"
                        value={investmentRange[1]}
                        onChange={(e) => setInvestmentRange([investmentRange[0], parseInt(e.target.value)])}
                      >
                        <option value="50000">R$ 50.000</option>
                        <option value="100000">R$ 100.000</option>
                        <option value="250000">R$ 250.000</option>
                        <option value="500000">R$ 500.000</option>
                        <option value="1000000">R$ 1 milhão</option>
                        <option value="5000000">R$ 5 milhões</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nível de Risco</label>
                    <div className="flex gap-2">
                      <button 
                        className={`flex-1 py-1 px-2 text-xs rounded ${
                          selectedTypes.includes('low' as any) 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-dark-card text-gray-400'
                        }`}
                      >
                        Baixo
                      </button>
                      <button 
                        className={`flex-1 py-1 px-2 text-xs rounded ${
                          selectedTypes.includes('medium' as any) 
                            ? 'bg-amber-500/20 text-amber-400' 
                            : 'bg-dark-card text-gray-400'
                        }`}
                      >
                        Médio
                      </button>
                      <button 
                        className={`flex-1 py-1 px-2 text-xs rounded ${
                          selectedTypes.includes('high' as any) 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-dark-card text-gray-400'
                        }`}
                      >
                        Alto
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setSelectedTypes([]);
                  setSelectedIndustries([]);
                  setInvestmentRange([0, 1000000]);
                  setSearchTerm('');
                }}
              >
                Limpar Filtros
              </Button>
              <Button variant="default" size="sm">
                Aplicar Filtros
              </Button>
            </div>
          </Card>
        )}
        
        {/* Lista de oportunidades */}
        <div className="space-y-4">
          {filteredOpportunities.length > 0 ? (
            filteredOpportunities.map(opportunity => (
              <Card 
                key={opportunity.id}
                className="bg-dark-background border-dark-border hover:border-gray-600 transition-all p-0 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 md:divide-x md:divide-dark-border">
                  <div className="p-4 md:col-span-2">
                    <div className="flex items-start mb-2">
                      <div className="p-2 rounded-md bg-dark-card mr-3">
                        {getOpportunityIcon(opportunity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-white">{opportunity.name}</h4>
                          <button
                            onClick={() => toggleFavorite(opportunity.id)}
                            className="text-gray-400 hover:text-yellow-400 transition-colors"
                          >
                            {opportunity.isFavorite ? (
                              <Star size={16} className="fill-yellow-400 text-yellow-400" />
                            ) : (
                              <StarOff size={16} />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-dark-card text-gray-300">
                            {opportunity.type === 'startup' && 'Startup'}
                            {opportunity.type === 'franchise' && 'Franquia'}
                            {opportunity.type === 'smallbusiness' && 'Pequeno Negócio'}
                            {opportunity.type === 'digital' && 'Negócio Digital'}
                            {opportunity.type === 'realestate' && 'Imobiliário'}
                            {opportunity.type === 'stockmarket' && 'Mercado de Ações'}
                          </span>
                          <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-dark-card text-gray-300">
                            {opportunity.industry === 'tech' && 'Tecnologia'}
                            {opportunity.industry === 'food' && 'Alimentação'}
                            {opportunity.industry === 'health' && 'Saúde'}
                            {opportunity.industry === 'retail' && 'Varejo'}
                            {opportunity.industry === 'finance' && 'Finanças'}
                            {opportunity.industry === 'education' && 'Educação'}
                            {opportunity.industry === 'entertainment' && 'Entretenimento'}
                            {opportunity.industry === 'other' && 'Outros'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-3">
                      {opportunity.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {opportunity.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="inline-block px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-400">Investimento Inicial:</span>
                      </div>
                      <div className="text-lg font-bold text-white mb-1">
                        {formatCurrency(opportunity.investmentMin)}
                        {opportunity.investmentMax > opportunity.investmentMin && 
                          ` - ${formatCurrency(opportunity.investmentMax)}`
                        }
                      </div>
                      <div className={`text-sm font-medium ${getLevelColor(opportunity.investmentLevel, 'investment')}`}>
                        {opportunity.investmentLevel === 'low' && 'Baixo Investimento'}
                        {opportunity.investmentLevel === 'medium' && 'Investimento Médio'}
                        {opportunity.investmentLevel === 'high' && 'Alto Investimento'}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-sm text-gray-400 mb-1">Localização:</div>
                      <div className="text-white">
                        {opportunity.location || 'Flexível / Online'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <TrendingUp size={16} className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-400">Tendência:</span>
                        </div>
                        <div className="text-lg font-bold text-white">{opportunity.trendScore}</div>
                      </div>
                      <div className="w-full bg-dark-card rounded-full h-1.5">
                        <div 
                          className="bg-primary h-1.5 rounded-full" 
                          style={{ width: `${opportunity.trendScore}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">ROI Projetado:</div>
                        <div className="text-xl font-bold text-white">{opportunity.projectedROI}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Retorno em:</div>
                        <div className="flex items-center">
                          <Clock size={16} className="text-gray-400 mr-1" />
                          <span className="text-white">
                            {opportunity.monthsToBreakeven} {opportunity.monthsToBreakeven === 1 ? 'mês' : 'meses'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Risco:</div>
                        <div className={`text-sm font-medium ${getLevelColor(opportunity.riskLevel, 'risk')}`}>
                          {opportunity.riskLevel === 'low' && 'Baixo'}
                          {opportunity.riskLevel === 'medium' && 'Médio'}
                          {opportunity.riskLevel === 'high' && 'Alto'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Potencial:</div>
                        <div className={`text-sm font-medium ${getLevelColor(opportunity.growthPotential, 'potential')}`}>
                          {opportunity.growthPotential === 'low' && 'Baixo'}
                          {opportunity.growthPotential === 'medium' && 'Médio'}
                          {opportunity.growthPotential === 'high' && 'Alto'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Complexidade:</div>
                        <div className={`text-sm font-medium ${getLevelColor(opportunity.complexity, 'complexity')}`}>
                          {opportunity.complexity === 'low' && 'Baixa'}
                          {opportunity.complexity === 'medium' && 'Média'}
                          {opportunity.complexity === 'high' && 'Alta'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-3">
                      <Button variant="default" size="sm" className="w-full">
                        Analisar Oportunidade
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-dark-background rounded-lg border border-dark-border">
              <Briefcase size={40} className="mx-auto text-gray-500 mb-3" />
              <h4 className="text-white font-medium mb-2">Nenhuma oportunidade encontrada</h4>
              <p className="text-gray-400 text-sm mb-4">
                Tente ajustar seus filtros ou critérios de busca
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedTypes([]);
                  setSelectedIndustries([]);
                  setInvestmentRange([0, 1000000]);
                  setSearchTerm('');
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Tendências de mercado */}
      <div className="bg-dark-card border-dark-border rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Tendências de Mercado</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-dark-background border-dark-border p-4">
            <div className="flex items-center mb-3">
              <Zap size={20} className="text-purple-500 mr-2" />
              <h4 className="font-medium text-white">Startups em Ascensão</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">SaaS para PMEs</span>
                <span className="text-green-500">+15%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">FinTech</span>
                <span className="text-green-500">+12%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">HealthTech</span>
                <span className="text-green-500">+10%</span>
              </div>
            </div>
          </Card>
          
          <Card className="bg-dark-background border-dark-border p-4">
            <div className="flex items-center mb-3">
              <Building size={20} className="text-blue-500 mr-2" />
              <h4 className="font-medium text-white">Franquias em Alta</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Alimentação Saudável</span>
                <span className="text-green-500">+18%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Estética e Bem-estar</span>
                <span className="text-green-500">+14%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Educação</span>
                <span className="text-green-500">+9%</span>
              </div>
            </div>
          </Card>
          
          <Card className="bg-dark-background border-dark-border p-4">
            <div className="flex items-center mb-3">
              <Users size={20} className="text-green-500 mr-2" />
              <h4 className="font-medium text-white">Comportamento do Consumidor</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Sustentabilidade</span>
                <span className="text-green-500">+22%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Experiências Personalizadas</span>
                <span className="text-green-500">+16%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Comércio Local</span>
                <span className="text-green-500">+11%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OpportunityScanner;
