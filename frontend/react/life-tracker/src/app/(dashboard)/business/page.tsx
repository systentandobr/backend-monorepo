'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase,
  BarChart2,
  FileText,
  TrendingUp,
  AlertCircle,
  LightbulbIcon,
  ChevronDown,
  Search
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import OpportunityScanner from '@/components/business/OpportunityScanner';
import BusinessAnalyzer from '@/components/business/BusinessAnalyzer';

// Tipos de visualização
type ViewMode = 'scanner' | 'analyzer';

export default function BusinessPage() {
  const [activeView, setActiveView] = useState<ViewMode>('scanner');
  const [showTips, setShowTips] = useState(true);
  
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
              <h1 className="text-2xl font-bold">Oportunidades de Negócio</h1>
              <p className="text-gray-400 mt-1">
                Descubra, analise e avalie novas oportunidades de empreendimento
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <div className="relative hidden md:block w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar oportunidade..."
                  className="w-full bg-dark-background border border-dark-border rounded-lg p-2 pl-9 text-sm text-white"
                />
              </div>
              
              <Button variant="outline" size="sm" className="flex items-center">
                <FileText size={16} className="mr-2" />
                <span>Meus Projetos</span>
                <ChevronDown size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tip Card */}
        {showTips && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6"
          >
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <LightbulbIcon size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white mb-1">Dica para Analisar Oportunidades</h3>
                <p className="text-gray-300 text-sm">
                  Ao avaliar oportunidades de negócio, considere não apenas o potencial de lucro, 
                  mas também a adequação ao seu perfil, experiência e objetivos de longo prazo. 
                  Use o scanner para descobrir e o analisador para um estudo aprofundado.
                </p>
              </div>
              <button 
                onClick={() => setShowTips(false)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      
        {/* View Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card
            className={`cursor-pointer p-4 transition-all ${
              activeView === 'scanner' 
                ? 'bg-primary/20 border-primary' 
                : 'bg-dark-card border-dark-border hover:bg-gray-800'
            }`}
            onClick={() => setActiveView('scanner')}
          >
            <div className="flex items-center mb-2">
              <div 
                className={`p-2 rounded-full mr-3 ${
                  activeView === 'scanner' 
                    ? 'bg-primary/30' 
                    : 'bg-dark-background'
                }`}
              >
                <Search size={20} />
              </div>
              <h3 className="font-medium text-white">Scanner de Oportunidades</h3>
            </div>
            <p className="text-sm text-gray-400">
              Descubra e filtre oportunidades de negócio com base em suas preferências, 
              investimento disponível e potencial de retorno.
            </p>
          </Card>
          
          <Card
            className={`cursor-pointer p-4 transition-all ${
              activeView === 'analyzer' 
                ? 'bg-primary/20 border-primary' 
                : 'bg-dark-card border-dark-border hover:bg-gray-800'
            }`}
            onClick={() => setActiveView('analyzer')}
          >
            <div className="flex items-center mb-2">
              <div 
                className={`p-2 rounded-full mr-3 ${
                  activeView === 'analyzer' 
                    ? 'bg-primary/30' 
                    : 'bg-dark-background'
                }`}
              >
                <BarChart2 size={20} />
              </div>
              <h3 className="font-medium text-white">Analisador de Viabilidade</h3>
            </div>
            <p className="text-sm text-gray-400">
              Faça uma análise detalhada de viabilidade, incluindo projeções financeiras,
              análise de mercado, riscos e retorno sobre investimento.
            </p>
          </Card>
        </div>
        
        {/* Active View */}
        <motion.div
          key={activeView}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {activeView === 'scanner' && (
            <motion.div variants={itemVariants}>
              <OpportunityScanner />
            </motion.div>
          )}
          
          {activeView === 'analyzer' && (
            <motion.div variants={itemVariants}>
              <BusinessAnalyzer />
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* Related Resources */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <div className="border-t border-dark-border pt-8">
          <h2 className="text-xl font-bold mb-4">Recursos e Ferramentas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-dark-card border-dark-border hover:border-gray-600 p-4 transition-all cursor-pointer">
              <div className="flex items-center mb-3">
                <FileText size={20} className="text-primary mr-3" />
                <h3 className="font-bold text-white">Modelos de Plano de Negócios</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Templates prontos para diferentes tipos de negócios, com instruções
                detalhadas e exemplos para cada seção.
              </p>
              <div className="text-primary text-sm font-medium">Acessar modelos →</div>
            </Card>
            
            <Card className="bg-dark-card border-dark-border hover:border-gray-600 p-4 transition-all cursor-pointer">
              <div className="flex items-center mb-3">
                <TrendingUp size={20} className="text-primary mr-3" />
                <h3 className="font-bold text-white">Tendências de Mercado</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Relatórios e análises sobre tendências emergentes em diversos
                setores, com oportunidades e insights para empreendedores.
              </p>
              <div className="text-primary text-sm font-medium">Ver tendências →</div>
            </Card>
            
            <Card className="bg-dark-card border-dark-border hover:border-gray-600 p-4 transition-all cursor-pointer">
              <div className="flex items-center mb-3">
                <AlertCircle size={20} className="text-primary mr-3" />
                <h3 className="font-bold text-white">Guia de Due Diligence</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Checklist completo para realizar uma investigação detalhada
                antes de investir ou adquirir um negócio existente.
              </p>
              <div className="text-primary text-sm font-medium">Baixar guia →</div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
