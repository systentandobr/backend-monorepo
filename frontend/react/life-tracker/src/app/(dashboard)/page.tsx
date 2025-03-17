"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Settings, 
  TrendingUp, 
  Wallet, 
  LineChart, 
  BarChart3,
  ChevronDown,
  Plus,
  Home,
  Search,
  PieChart 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Dados mock para oportunidades
const mockOpportunities = [
  {
    id: 1,
    name: 'Tesouro Direto Selic 2029',
    category: 'Renda Fixa',
    trend: 'up',
    change: '+2.3%',
    price: 'R$ 13.240',
    score: 92
  },
  {
    id: 2,
    name: 'PETR4',
    category: 'Ações',
    trend: 'down',
    change: '-1.5%',
    price: 'R$ 36,25',
    score: 75
  },
  {
    id: 3,
    name: 'ETF IVVB11',
    category: 'Internacional',
    trend: 'up',
    change: '+0.8%',
    price: 'R$ 195,40',
    score: 88
  },
  {
    id: 4,
    name: 'FII HGLG11',
    category: 'Fundos Imobiliários',
    trend: 'neutral',
    change: '0.0%',
    price: 'R$ 107,50',
    score: 82
  },
  {
    id: 5,
    name: 'CDB Banco ABC 2026',
    category: 'Renda Fixa',
    trend: 'up',
    change: '+0.2%',
    price: 'CDI + 2%',
    score: 79
  },
  {
    id: 6,
    name: 'VALE3',
    category: 'Ações',
    trend: 'up',
    change: '+3.1%',
    price: 'R$ 72,80',
    score: 81
  }
];

// Dados mock para hábitos
const mockHabits = [
  {
    id: 1,
    name: 'Poupar 20% da renda',
    icon: '💰',
    color: '#4CAF50',
    streak: 14,
    completedToday: true
  },
  {
    id: 2,
    name: 'Acompanhar carteira',
    icon: '📊',
    color: '#2196F3',
    streak: 21,
    completedToday: true
  },
  {
    id: 3,
    name: 'Pesquisar investimentos',
    icon: '🔍',
    color: '#9C27B0',
    streak: 5,
    completedToday: false
  },
  {
    id: 4,
    name: 'Controlar gastos',
    icon: '📝',
    color: '#FF9800',
    streak: 10,
    completedToday: false
  }
];

// Dados mock para insights
const mockInsights = [
  {
    id: 1,
    title: 'Oportunidade de rebalanceamento',
    category: 'Carteira',
    description: 'Sua alocação em renda variável está 5% abaixo do ideal para seu perfil de risco.',
    priority: 'medium'
  },
  {
    id: 2,
    title: 'Alta de juros EUA',
    category: 'Notícia',
    description: 'FED aumentou taxa de juros em 0.25%. Considere revisar investimentos internacionais.',
    priority: 'high'
  },
  {
    id: 3,
    title: 'Dividendos a receber',
    category: 'Lembrete',
    description: 'Você receberá dividendos de 3 ativos nos próximos 7 dias, totalizando R$ 156,40.',
    priority: 'low'
  }
];

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('opportunities');

  // Função para formatar o valor de pontuação em um número 
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <main className="min-h-screen bg-dark-background text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-dark-background border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Life Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-dark-card">
                <Bell size={20} />
              </button>
              <button className="p-2 rounded-full hover:bg-dark-card">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-dark-card border-dark-border p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-500/10 mr-3">
                <TrendingUp className="text-blue-500" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Rentabilidade (Mês)</p>
                <h3 className="text-xl font-bold text-white">+ 3,5%</h3>
              </div>
            </div>
          </Card>
          
          <Card className="bg-dark-card border-dark-border p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-500/10 mr-3">
                <Wallet className="text-green-500" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Oportunidades</p>
                <h3 className="text-xl font-bold text-white">12 novas</h3>
              </div>
            </div>
          </Card>
          
          <Card className="bg-dark-card border-dark-border p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-500/10 mr-3">
                <LineChart className="text-purple-500" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Insights</p>
                <h3 className="text-xl font-bold text-white">7 novos</h3>
              </div>
            </div>
          </Card>
          
          <Card className="bg-dark-card border-dark-border p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-500/10 mr-3">
                <BarChart3 className="text-yellow-500" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Streak</p>
                <h3 className="text-xl font-bold text-white">14 dias</h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-dark-border mb-6">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'opportunities'
                  ? 'border-primary text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('opportunities')}
            >
              Oportunidades
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'habits'
                  ? 'border-primary text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('habits')}
            >
              Hábitos Financeiros
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'insights'
                  ? 'border-primary text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('insights')}
            >
              Insights
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'opportunities' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Melhores Oportunidades</h2>
              <div className="flex items-center">
                <Button variant="outline" size="sm" className="flex items-center">
                  <span>Filtrar</span>
                  <ChevronDown className="ml-2" size={16} />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockOpportunities.map((opportunity) => (
                <Card 
                  key={opportunity.id}
                  className="bg-dark-card border-dark-border hover:border-gray-600 p-4 rounded-lg transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-white">{opportunity.name}</h3>
                      <p className="text-xs text-gray-400">{opportunity.category}</p>
                    </div>
                    <div className={`text-sm font-medium ${
                      opportunity.trend === 'up' ? 'text-green-500' : 
                      opportunity.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                    }`}>
                      {opportunity.change}
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-lg font-semibold">{opportunity.price}</div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">Score</p>
                      <p className={`text-lg font-bold ${getScoreColor(opportunity.score)}`}>
                        {opportunity.score}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Button variant="ghost" className="text-primary">
                Ver todas as oportunidades
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'habits' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Hábitos Financeiros</h2>
              <Button variant="outline" size="sm">
                <Plus className="mr-2" size={16} />
                <span>Adicionar Hábito</span>
              </Button>
            </div>
            
            <div className="space-y-4">
              {mockHabits.map((habit) => (
                <Card 
                  key={habit.id}
                  className="bg-dark-card border-dark-border p-4 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                        style={{ backgroundColor: habit.color }}
                      >
                        <span className="text-lg">{habit.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{habit.name}</h3>
                        <p className="text-xs text-gray-400">Série de {habit.streak} dias</p>
                      </div>
                    </div>
                    <div>
                      <div 
                        className={`w-6 h-6 rounded-full ${
                          habit.completedToday 
                            ? 'bg-green-500 flex items-center justify-center' 
                            : 'border-2 border-gray-600'
                        }`}
                      >
                        {habit.completedToday && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Insights e Tendências</h2>
              <div className="flex items-center">
                <Button variant="outline" size="sm" className="flex items-center">
                  <span>Filtrar</span>
                  <ChevronDown className="ml-2" size={16} />
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {mockInsights.map((insight) => (
                <Card 
                  key={insight.id}
                  className="bg-dark-card border-dark-border p-4 rounded-lg"
                >
                  <div className="flex items-start">
                    <div 
                      className={`w-3 h-3 rounded-full mt-1.5 mr-3 ${
                        insight.priority === 'high' ? 'bg-red-500' :
                        insight.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                    />
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium text-white">{insight.title}</h3>
                        <span className="ml-2 px-2 py-0.5 text-xs bg-dark-border rounded-full text-gray-300">
                          {insight.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{insight.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border py-3 px-4">
        <div className="flex justify-around">
          <button className="flex flex-col items-center text-primary">
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </button>
          
          <button className="flex flex-col items-center text-gray-400">
            <Search size={20} />
            <span className="text-xs mt-1">Explorar</span>
          </button>
          
          <div className="relative">
            <button className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
              <Plus size={24} />
            </button>
          </div>
          
          <button className="flex flex-col items-center text-gray-400">
            <PieChart size={20} />
            <span className="text-xs mt-1">Carteira</span>
          </button>
          
          <button className="flex flex-col items-center text-gray-400">
            <Settings size={20} />
            <span className="text-xs mt-1">Perfil</span>
          </button>
        </div>
      </nav>
    </main>
  );
}