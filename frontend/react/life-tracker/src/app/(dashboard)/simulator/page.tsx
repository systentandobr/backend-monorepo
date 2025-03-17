'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator,
  PieChart,
  BarChart2,
  TrendingUp,
  RefreshCcw,
  DollarSign,
  Briefcase,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import InvestmentCalculator from '@/components/simulator/InvestmentCalculator';
import ScenarioAnalyzer from '@/components/simulator/ScenarioAnalyzer';
import AssetComparison from '@/components/simulator/AssetComparison';

// Tipos de simuladores disponíveis
type SimulatorType = 'compound-interest' | 'stock-comparison' | 'retirement' | 'asset-allocation';

export default function SimulatorPage() {
  const [activeSimulator, setActiveSimulator] = useState<SimulatorType>('compound-interest');
  const [showInfo, setShowInfo] = useState(true);
  
  // Definições dos simuladores disponíveis
  const simulators = [
    {
      id: 'compound-interest',
      name: 'Juros Compostos',
      description: 'Calcule o crescimento do seu investimento ao longo do tempo com aportes mensais',
      icon: <Calculator size={20} />
    },
    {
      id: 'stock-comparison',
      name: 'Comparação de Ativos',
      description: 'Compare o desempenho histórico e projetado de diferentes ativos',
      icon: <BarChart2 size={20} />
    },
    {
      id: 'retirement',
      name: 'Planejamento para Aposentadoria',
      description: 'Calcule quanto você precisa investir para atingir sua meta de aposentadoria',
      icon: <Briefcase size={20} />
    },
    {
      id: 'asset-allocation',
      name: 'Alocação de Ativos',
      description: 'Simule diferentes modelos de alocação de ativos e seus resultados esperados',
      icon: <PieChart size={20} />
    }
  ];
  
  // Animações para elementos
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };
  
  return (
    <main className="min-h-screen bg-dark-background text-white pb-20">
      {/* Header */}
      <div className="bg-dark-card border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Simulador de Investimentos</h1>
              <p className="text-gray-400 mt-1">
                Projete cenários financeiros e tome decisões baseadas em dados
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Button variant="outline" size="sm" className="flex items-center">
                <RefreshCcw size={16} className="mr-2" />
                <span>Redefinir Simulação</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tip Card */}
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6"
          >
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <HelpCircle size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white mb-1">Dica de Simulação</h3>
                <p className="text-gray-300 text-sm">
                  Teste diferentes cenários alterando os parâmetros do simulador. 
                  O poder dos juros compostos é mais visível em períodos longos. 
                  Compare taxas de retorno realistas para diferentes classes de ativos.
                </p>
              </div>
              <button 
                onClick={() => setShowInfo(false)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      
        {/* Simulator Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {simulators.map((simulator) => (
            <Card
              key={simulator.id}
              className={`cursor-pointer p-4 transition-all ${
                activeSimulator === simulator.id 
                  ? 'bg-primary/20 border-primary' 
                  : 'bg-dark-card border-dark-border hover:bg-gray-800'
              }`}
              onClick={() => setActiveSimulator(simulator.id as SimulatorType)}
            >
              <div className="flex items-center mb-2">
                <div 
                  className={`p-2 rounded-full mr-3 ${
                    activeSimulator === simulator.id 
                      ? 'bg-primary/30' 
                      : 'bg-dark-background'
                  }`}
                >
                  {simulator.icon}
                </div>
                <h3 className="font-medium text-white">{simulator.name}</h3>
              </div>
              <p className="text-sm text-gray-400">{simulator.description}</p>
            </Card>
          ))}
        </div>
        
        {/* Active Simulator */}
        <motion.div
          key={activeSimulator}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {activeSimulator === 'compound-interest' && (
            <motion.div variants={itemVariants}>
              <InvestmentCalculator />
            </motion.div>
          )}
          
          {activeSimulator === 'stock-comparison' && (
            <motion.div variants={itemVariants}>
              <AssetComparison />
            </motion.div>
          )}
          
          {activeSimulator === 'retirement' && (
            <motion.div variants={itemVariants}>
              <ScenarioAnalyzer />
            </motion.div>
          )}
          
          {activeSimulator === 'asset-allocation' && (
            <motion.div variants={itemVariants} className="bg-dark-card p-6 rounded-lg border border-dark-border">
              <div className="text-center py-12">
                <PieChart size={48} className="mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Alocação de Ativos</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Este simulador estará disponível em breve. Você poderá simular diferentes 
                  modelos de alocação de ativos e seus resultados esperados.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* Related Articles */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <div className="border-t border-dark-border pt-8">
          <h2 className="text-xl font-bold mb-4">Artigos Relacionados</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-dark-card border-dark-border hover:border-gray-600 p-4 transition-all cursor-pointer">
              <h3 className="font-bold text-white mb-2">O Poder dos Juros Compostos</h3>
              <p className="text-sm text-gray-400 mb-3">
                Entenda como pequenas diferenças na taxa de juros podem resultar em grandes 
                diferenças no resultado final do seu investimento.
              </p>
              <div className="text-primary text-sm font-medium">Ler artigo →</div>
            </Card>
            
            <Card className="bg-dark-card border-dark-border hover:border-gray-600 p-4 transition-all cursor-pointer">
              <h3 className="font-bold text-white mb-2">Inflação e Seus Impactos</h3>
              <p className="text-sm text-gray-400 mb-3">
                Descubra como a inflação pode corroer seu poder de compra e como proteger 
                seus investimentos desse efeito.
              </p>
              <div className="text-primary text-sm font-medium">Ler artigo →</div>
            </Card>
            
            <Card className="bg-dark-card border-dark-border hover:border-gray-600 p-4 transition-all cursor-pointer">
              <h3 className="font-bold text-white mb-2">Estratégias de Alocação</h3>
              <p className="text-sm text-gray-400 mb-3">
                Conheça diferentes estratégias de alocação de ativos e como elas podem 
                ajudar a otimizar sua carteira de investimentos.
              </p>
              <div className="text-primary text-sm font-medium">Ler artigo →</div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
