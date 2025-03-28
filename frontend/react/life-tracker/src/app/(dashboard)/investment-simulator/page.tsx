'use client';

import React from 'react';
import { 
  CryptoInvestmentScenarios, 
  EnhancedScenarioAnalyzer 
} from '@/components/simulator';

export default function InvestmentSimulatorPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-white">Simulador de Investimentos</h1>
      
      {/* Formulário de simulação de investimentos */}
      <div className="mb-12">
        <CryptoInvestmentScenarios />
      </div>
      
      {/* Análise de cenários aprimorada com projeção mensal */}
      <div>
        <EnhancedScenarioAnalyzer />
      </div>
    </div>
  );
}
