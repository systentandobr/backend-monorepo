// src/components/business/opportunity-preview.tsx
import React from 'react';
import { TrendingUp, Clock, DollarSign, Tag, Shield, MapPin } from 'lucide-react';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';

interface BusinessOpportunity {
  id: number;
  name: string;
  type: 'startup' | 'franchise' | 'smallbusiness' | 'digital';
  industry: string;
  description: string;
  investmentMin: number;
  investmentMax: number;
  projectedROI: number;
  monthsToBreakeven: number;
  riskLevel: 'low' | 'medium' | 'high';
  tags: string[];
  location?: string;
  status: 'considering' | 'analyzing' | 'pursuing' | 'rejected';
  matchScore: number;
}

// Mock data
const opportunities: BusinessOpportunity[] = [
  {
    id: 1,
    name: 'Franquia de Tecnologia',
    type: 'franchise',
    industry: 'Tecnologia',
    description: 'Franquia de assistência e manutenção de equipamentos eletrônicos',
    investmentMin: 100000,
    investmentMax: 200000,
    projectedROI: 22,
    monthsToBreakeven: 16,
    riskLevel: 'medium',
    tags: ['franquia', 'tecnologia', 'serviços'],
    location: 'Diversas cidades',
    status: 'analyzing',
    matchScore: 85
  },
  {
    id: 2,
    name: 'E-commerce de Nicho',
    type: 'digital',
    industry: 'Varejo',
    description: 'Loja online especializada em produtos sustentáveis',
    investmentMin: 50000,
    investmentMax: 80000,
    projectedROI: 35,
    monthsToBreakeven: 12,
    riskLevel: 'medium',
    tags: ['e-commerce', 'digital', 'sustentabilidade'],
    status: 'considering',
    matchScore: 78
  },
  {
    id: 3,
    name: 'SaaS para Desenvolvedores',
    type: 'startup',
    industry: 'Software',
    description: 'Plataforma para gestão de projetos de desenvolvimento',
    investmentMin: 150000,
    investmentMax: 300000,
    projectedROI: 45,
    monthsToBreakeven: 24,
    riskLevel: 'high',
    tags: ['saas', 'tecnologia', 'startups'],
    status: 'considering',
    matchScore: 92
  }
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(value);
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'low':
      return 'text-green-500';
    case 'medium':
      return 'text-yellow-500';
    case 'high':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

interface OpportunityPreviewProps {
  limit?: number;
  filter?: string;
}

export const OpportunityPreview: React.FC<OpportunityPreviewProps> = ({
  limit = 2,
  filter
}) => {
  const filteredOpportunities = opportunities
    .filter(opp => !filter || opp.tags.includes(filter) || opp.industry === filter)
    .slice(0, limit);

  return (
    <div className="space-y-4">
      {filteredOpportunities.map((opportunity) => (
        <div key={opportunity.id} className="bg-dark-background rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-white font-medium">{opportunity.name}</h3>
            <div className="px-2 py-1 bg-primary bg-opacity-20 rounded-full text-xs text-primary">
              {opportunity.matchScore}% match
            </div>
          </div>
          
          <p className="text-sm text-gray-400 mb-3">
            {opportunity.description}
          </p>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex items-center text-xs text-gray-400">
              <DollarSign size={14} className="mr-1" />
              {formatCurrency(opportunity.investmentMin)} - {formatCurrency(opportunity.investmentMax)}
            </div>
            
            <div className="flex items-center text-xs text-gray-400">
              <TrendingUp size={14} className="mr-1" />
              ROI: {opportunity.projectedROI}%
            </div>
            
            <div className="flex items-center text-xs text-gray-400">
              <Clock size={14} className="mr-1" />
              {opportunity.monthsToBreakeven} meses
            </div>
            
            <div className="flex items-center text-xs">
              <Shield size={14} className={`mr-1 ${getRiskColor(opportunity.riskLevel)}`} />
              <span className={getRiskColor(opportunity.riskLevel)}>
                Risco {
                  opportunity.riskLevel === 'low' ? 'Baixo' :
                  opportunity.riskLevel === 'medium' ? 'Médio' : 'Alto'
                }
              </span>
            </div>
          </div>
          
          {opportunity.location && (
            <div className="flex items-center text-xs text-gray-400 mb-3">
              <MapPin size={14} className="mr-1" />
              {opportunity.location}
            </div>
          )}
          
          <div className="flex items-center mb-3">
            <Tag size={14} className="mr-1 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {opportunity.tags.map((tag) => (
                <span key={tag} className="text-xs bg-dark-card px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              Detalhes
            </Button>
            <Button size="sm" className="flex-1">
              Analisar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
