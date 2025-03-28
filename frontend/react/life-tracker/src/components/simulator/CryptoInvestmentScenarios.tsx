'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

// Importar store
import useSimulationStore from '@/store/simulationStore';

// Tipos
import { ScenarioData } from './types/investment-types';

// Componentes
import CurrentPositionForm from './crypto/CurrentPositionForm';
import LoanDataForm from './crypto/LoanDataForm';
import ScenarioSelector from './crypto/ScenarioSelector';
import ScenarioConfig from './crypto/ScenarioConfig';
import ScenarioResults from './crypto/ScenarioResults';

interface CryptoInvestmentScenariosProps {
  className?: string;
}

const CryptoInvestmentScenarios: React.FC<CryptoInvestmentScenariosProps> = ({
  className
}) => {
  // Estado local
  const [showAdvancedConfig, setShowAdvancedConfig] = useState<boolean>(false);
  
  // Obter estado e ações da store Zustand
  const { 
    currentPosition, 
    updateCurrentPosition,
    loanData,
    updateLoanData,
    scenarios,
    activeScenarioIndex,
    setActiveScenarioIndex,
    addScenario,
    updateScenario,
    calculateAllScenarios
  } = useSimulationStore();
  
  // Calcular cenários inicialmente
  useEffect(() => {
    calculateAllScenarios();
  }, []);
  
  // Obter o cenário ativo
  const activeScenario = scenarios[activeScenarioIndex];
  
  return (
    <div className={className}>
      {/* Posição Atual e Configurações */}
      <div className="bg-dark-card border-dark-border rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4 text-white">Simulação de Investimento em Criptomoedas</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Posição Atual */}
          <CurrentPositionForm 
            currentPosition={currentPosition}
            updateCurrentPosition={updateCurrentPosition}
          />
          
          {/* Dados do Empréstimo */}
          <LoanDataForm 
            loanData={loanData}
            updateLoanData={updateLoanData}
          />
        </div>
      </div>
      
      {/* Cenários */}
      <div className="bg-dark-card border-dark-border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Cenários de Investimento</h3>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
            >
              {showAdvancedConfig ? 'Ocultar Configuração' : 'Configuração Avançada'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={addScenario}
            >
              <PlusCircle size={16} className="mr-2" />
              <span>Novo Cenário</span>
            </Button>
          </div>
        </div>
        
        {/* Seletor de Cenários */}
        <ScenarioSelector 
          scenarios={scenarios}
          activeScenarioIndex={activeScenarioIndex}
          setActiveScenarioIndex={setActiveScenarioIndex}
        />
        
        {/* Configuração de Cenário */}
        {showAdvancedConfig && activeScenario && (
          <ScenarioConfig 
            scenario={activeScenario}
            updateScenario={(key, value) => updateScenario(activeScenarioIndex, key, value)}
          />
        )}
      </div>
      
      {/* Resultados */}
      {activeScenario && <ScenarioResults scenario={activeScenario} />}
    </div>
  );
};

export default CryptoInvestmentScenarios;
