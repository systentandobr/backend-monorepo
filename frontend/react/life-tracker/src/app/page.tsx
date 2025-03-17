'use client';

import React, { useState } from 'react';
import { Calendar, Activity, DollarSign, TrendingUp, Briefcase, BookOpen, Coffee, Plus, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

// Componentes UI
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProgressBar } from '@/components/ui/progress-bar';

// Componentes de módulos
import { HabitList } from '@/components/habit/habit-list';
import { InvestmentSummary } from '@/components/simulator/investment-summary';
import { OpportunityPreview } from '@/components/business/opportunity-preview';
import { CrossModuleProgress } from '@/components/integration/cross-module-progress';
import { GoalCard } from '@/components/habit/goal-card';

// Componente para o calendário de dias da semana
const WeekCalendar = () => {
  const days = [
    { abbr: 'DOM', num: 9, active: false },
    { abbr: 'SEG', num: 10, active: false },
    { abbr: 'TER', num: 11, active: false },
    { abbr: 'QUA', num: 12, active: true },
    { abbr: 'QUI', num: 13, active: false },
    { abbr: 'SEX', num: 14, active: false },
    { abbr: 'SAB', num: 15, active: false },
  ];

  return (
    <div className="grid grid-cols-7 gap-2 mb-6">
      {days.map((day) => (
        <div key={day.abbr} className="flex flex-col items-center">
          <div className="text-xs text-gray-400 mb-1">{day.abbr}</div>
          <div 
            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm
              ${day.active 
                ? 'bg-primary text-white' 
                : 'bg-dark-card text-gray-400'}`
            }
          >
            {day.num}
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente para os filtros de período do dia
const DayPeriodFilter = () => {
  const periods = [
    { name: 'Manhã', active: false },
    { name: 'Todos', active: true },
    { name: 'Tarde', active: false },
    { name: 'Noite', active: false },
  ];

  return (
    <div className="flex justify-center space-x-4 mb-8">
      {periods.map((period) => (
        <div 
          key={period.name}
          className={`px-4 py-2 text-sm relative
            ${period.active 
              ? 'text-white' 
              : 'text-gray-400'}`
          }
        >
          {period.name}
          {period.active && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
          )}
        </div>
      ))}
    </div>
  );
};

// Componente de hábito individual
const HabitItem = ({ 
  icon, 
  title, 
  streak, 
  completed 
}: { 
  icon: React.ReactNode; 
  title: string; 
  streak: string; 
  completed: boolean;
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-dark-card rounded-lg mb-3">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-opacity-20 flex items-center justify-center mr-3"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-white font-medium">{title}</h3>
          <p className="text-xs text-gray-400">{streak}</p>
        </div>
      </div>
      <div 
        className={`w-6 h-6 rounded-full flex items-center justify-center
          ${completed 
            ? 'bg-green-500 text-white' 
            : 'border border-gray-600'}`
        }
      >
        {completed && "✓"}
      </div>
    </div>
  );
};

// Componente de navegação inferior (mobile)
const BottomNavigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border py-3 px-4">
      <div className="flex justify-around">
        <button className="flex flex-col items-center text-primary">
          <Calendar size={20} />
          <span className="text-xs mt-1">Hoje</span>
        </button>
        
        <button className="flex flex-col items-center text-gray-400">
          <Activity size={20} />
          <span className="text-xs mt-1">Desafios</span>
        </button>
        
        <div className="relative">
          <button className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
            <Plus size={24} />
          </button>
        </div>
        
        <button className="flex flex-col items-center text-gray-400">
          <TrendingUp size={20} />
          <span className="text-xs mt-1">Estat.</span>
        </button>
        
        <button className="flex flex-col items-center text-gray-400">
          <Settings size={20} />
          <span className="text-xs mt-1">Explore</span>
        </button>
      </div>
    </nav>
  );
};

// Componente de seção de IntegratedDashboard
const IntegratedSection = () => {
  return (
    <Card className="bg-dark-card mb-6">
      <div className="p-4 border-b border-dark-border">
        <h2 className="font-bold text-white">Visão Holística</h2>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-dark-background p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <Activity className="text-green-500 mr-2" size={16} />
              <span className="text-sm text-white">Hábitos</span>
            </div>
            <div className="text-xl font-bold text-white">78%</div>
            <ProgressBar value={78} max={100} color="primary" size="small" />
          </div>
          
          <div className="bg-dark-background p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <DollarSign className="text-primary mr-2" size={16} />
              <span className="text-sm text-white">Finanças</span>
            </div>
            <div className="text-xl font-bold text-white">65%</div>
            <ProgressBar value={65} max={100} color="primary" size="small" />
          </div>
          
          <div className="bg-dark-background p-3 rounded-lg">
            <div className="flex items-center mb-2">
              <Briefcase className="text-accent-main mr-2" size={16} />
              <span className="text-sm text-white">Negócios</span>
            </div>
            <div className="text-xl font-bold text-white">42%</div>
            <ProgressBar value={42} max={100} color="primary" size="small" />
          </div>
        </div>
        
        <CrossModuleProgress showIntegrationMetrics={true} />
        
        <Button variant="ghost" className="w-full mt-4">
          Ver análise completa
        </Button>
      </div>
    </Card>
  );
};

// Componente principal
export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('hoje');

  return (
    <div className="min-h-screen bg-dark-background text-white pb-20">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">Hoje</h1>
        <button className="w-10 h-10 rounded-full bg-dark-card flex items-center justify-center">
          <Settings size={20} />
        </button>
      </div>

      {/* Conteúdo principal */}
      <div className="px-4">
        <Tabs defaultValue="hoje" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-6 bg-dark-card">
            <TabsTrigger value="hoje" className="flex-1">Hoje</TabsTrigger>
            <TabsTrigger value="objetivos" className="flex-1">Objetivos</TabsTrigger>
            <TabsTrigger value="investimentos" className="flex-1">Investimentos</TabsTrigger>
            <TabsTrigger value="negocios" className="flex-1">Negócios</TabsTrigger>
          </TabsList>

          <TabsContent value="hoje">
            <WeekCalendar />
            <DayPeriodFilter />
            
            <IntegratedSection />
            
            <div className="space-y-3">
              <HabitItem 
                icon={<Coffee className="text-purple-500" size={20} />} 
                title="Limitar cafeína" 
                streak="Faça um chá de ervas" 
                completed={false} 
              />
              
              <HabitItem 
                icon={<DollarSign className="text-green-500" size={20} />} 
                title="Revisar carteira" 
                streak="Série de 5 dias" 
                completed={true} 
              />
              
              <HabitItem 
                icon={<BookOpen className="text-blue-500" size={20} />} 
                title="Ler" 
                streak="Série de 2 dias" 
                completed={true} 
              />

              <HabitItem 
                icon={<Briefcase className="text-yellow-500" size={20} />} 
                title="Analisar oportunidade" 
                streak="Franquia de tecnologia" 
                completed={false} 
              />
            </div>
          </TabsContent>

          <TabsContent value="objetivos">
            <Card className="bg-dark-card mb-6">
              <div className="p-4 border-b border-dark-border">
                <h2 className="font-bold text-white">Metas Integradas</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <GoalCard 
                    title="Investir em renda fixa"
                    description="Meta de aportes mensais para reserva de emergência"
                    progress={65}
                    icon={<DollarSign size={20} />}
                    linkedModules={['finance']}
                  />
                  
                  <GoalCard 
                    title="Estudo diário"
                    description="Conhecimento técnico para franquia de tecnologia"
                    progress={40}
                    icon={<BookOpen size={20} />}
                    linkedModules={['habits', 'business']}
                  />
                  
                  <GoalCard 
                    title="Rede de contatos"
                    description="Construir relacionamentos para novo negócio"
                    progress={25}
                    icon={<Briefcase size={20} />}
                    linkedModules={['business', 'habits']}
                  />
                </div>
                
                <Button className="w-full mt-4">
                  Nova Meta Integrada
                </Button>
              </div>
            </Card>
            
            <HabitList />
          </TabsContent>

          <TabsContent value="investimentos">
            <Card className="bg-dark-card mb-6">
              <div className="p-4 border-b border-dark-border">
                <h2 className="font-bold text-white">Resumo da Carteira</h2>
              </div>
              <div className="p-4">
                <InvestmentSummary />
                
                <Button variant="outline" className="w-full mt-4">
                  Ver detalhes da carteira
                </Button>
              </div>
            </Card>
            
            <Card className="bg-dark-card mb-6">
              <div className="p-4 border-b border-dark-border">
                <h2 className="font-bold text-white">Simulador de Investimentos</h2>
              </div>
              <div className="p-4">
                <div className="bg-dark-background p-4 rounded-lg mb-4">
                  <h3 className="text-white font-medium mb-2">Aportes mensais</h3>
                  <p className="text-sm text-gray-400 mb-2">
                    Simule o resultado de seus investimentos com aportes mensais regulares
                  </p>
                  <Button size="sm">Iniciar simulação</Button>
                </div>
                
                <div className="bg-dark-background p-4 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Reserva de emergência</h3>
                  <p className="text-sm text-gray-400 mb-2">
                    Calcule quanto você precisa para sua reserva de emergência
                  </p>
                  <Button size="sm" variant="outline">Calcular</Button>
                </div>
              </div>
            </Card>
            
            <Card className="bg-dark-card">
              <div className="p-4 border-b border-dark-border">
                <h2 className="font-bold text-white">Hábitos Relacionados</h2>
              </div>
              <div className="p-4">
                <HabitItem 
                  icon={<DollarSign className="text-green-500" size={20} />} 
                  title="Revisar carteira" 
                  streak="Série de 5 dias" 
                  completed={true} 
                />
                
                <HabitItem 
                  icon={<DollarSign className="text-green-500" size={20} />} 
                  title="Aporte mensal" 
                  streak="Dia 15 de cada mês" 
                  completed={false} 
                />
                
                <Button variant="ghost" className="w-full mt-4">
                  Criar novo hábito financeiro
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="negocios">
            <Card className="bg-dark-card mb-6">
              <div className="p-4 border-b border-dark-border">
                <h2 className="font-bold text-white">Oportunidades em Análise</h2>
              </div>
              <div className="p-4">
                <OpportunityPreview />
                
                <Button className="w-full mt-4">
                  Buscar novas oportunidades
                </Button>
              </div>
            </Card>
            
            <Card className="bg-dark-card mb-6">
              <div className="p-4 border-b border-dark-border">
                <h2 className="font-bold text-white">Plano de Preparação</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div className="bg-dark-background p-4 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Preparo Financeiro</h3>
                    <ProgressBar value={35} max={100} color="primary" size="medium" />
                    <p className="text-sm text-gray-400 mt-2">
                      Capital inicial: R$ 35.000 / R$ 100.000
                    </p>
                  </div>
                  
                  <div className="bg-dark-background p-4 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Conhecimento Técnico</h3>
                    <ProgressBar value={60} max={100} color="primary" size="medium" />
                    <p className="text-sm text-gray-400 mt-2">
                      6 de 10 cursos concluídos
                    </p>
                  </div>
                  
                  <div className="bg-dark-background p-4 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Rede de Contatos</h3>
                    <ProgressBar value={25} max={100} color="primary" size="medium" />
                    <p className="text-sm text-gray-400 mt-2">
                      5 de 20 conexões estratégicas
                    </p>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-dark-card">
              <div className="p-4 border-b border-dark-border">
                <h2 className="font-bold text-white">Hábitos Recomendados</h2>
              </div>
              <div className="p-4">
                <HabitItem 
                  icon={<BookOpen className="text-blue-500" size={20} />} 
                  title="Curso de gestão" 
                  streak="3x por semana" 
                  completed={false} 
                />
                
                <HabitItem 
                  icon={<Briefcase className="text-yellow-500" size={20} />} 
                  title="Networking" 
                  streak="1 novo contato por semana" 
                  completed={false} 
                />
                
                <Button variant="ghost" className="w-full mt-4">
                  Adicionar à rotina
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Navegação inferior */}
      <BottomNavigation />
    </div>
  );
}