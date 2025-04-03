'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  CurrentPosition, 
  LoanData, 
  ScenarioData
} from '../types/investment-types';

// Definir a interface do contexto
interface SimulationContextType {
  // Dados da posição atual
  currentPosition: CurrentPosition;
  updateCurrentPosition: (key: keyof CurrentPosition, value: any) => void;
  
  // Dados do empréstimo
  loanData: LoanData;
  updateLoanData: (key: keyof LoanData, value: any) => void;
  
  // Cenários de investimento
  scenarios: ScenarioData[];
  setScenarios: React.Dispatch<React.SetStateAction<ScenarioData[]>>;
  activeScenarioIndex: number;
  setActiveScenarioIndex: React.Dispatch<React.SetStateAction<number>>;
  
  // Dados calculados da carteira
  portfolioData: {
    totalValue: number;
    monthlyReturn: number;
    allocation: {
      name: string;
      percentage: number;
      value: number;
      growth: number;
    }[];
    monthGoal: number;
    yearGoal: number;
  };
  
  // Flags
  isDirty: boolean;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
}

// Valores padrão para o contexto
const defaultCurrentPosition: CurrentPosition = {
  token: 'BTC',
  quantity: 0.25,
  currentPrice: 180000,
  averagePrice: 190000,
};

const defaultLoanData: LoanData = {
  amount: 40000,
  interestRate: 2.95,
  term: 12,
};

const defaultScenarios: ScenarioData[] = [
  {
    id: '1',
    name: 'Investimento Único',
    investmentAmount: 10000,
    investmentStrategy: 'single',
    stagePercentages: [0],
    stageAllocations: [100],
    targetPrices: [190000, 210000, 250000],
    results: {
      totalUnits: 0,
      averagePrice: 0,
      totalInvestment: 0,
      resultsByTargetPrice: []
    }
  },
  {
    id: '2',
    name: 'Escalonado 25% a cada 10%',
    investmentAmount: 40000,
    investmentStrategy: 'staged',
    stagePercentages: [0, 10, 20, 30],
    stageAllocations: [25, 25, 25, 25],
    targetPrices: [190000, 210000, 250000],
    results: {
      totalUnits: 0,
      averagePrice: 0,
      totalInvestment: 0,
      resultsByTargetPrice: []
    }
  }
];

const defaultPortfolioData = {
  totalValue: 85650.75,
  monthlyReturn: 3.2,
  allocation: [
    { name: 'Renda Fixa', percentage: 40, value: 34260.30, growth: 1.8 },
    { name: 'Ações', percentage: 30, value: 25695.23, growth: 5.2 },
    { name: 'FIIs', percentage: 20, value: 17130.15, growth: 2.7 },
    { name: 'Criptomoedas', percentage: 10, value: 8565.07, growth: 8.6 }
  ],
  monthGoal: 75,
  yearGoal: 42
};

// Criar o contexto
export const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

// Provider do contexto
export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPosition, setCurrentPosition] = useState<CurrentPosition>(defaultCurrentPosition);
  const [loanData, setLoanData] = useState<LoanData>(defaultLoanData);
  const [scenarios, setScenarios] = useState<ScenarioData[]>(defaultScenarios);
  const [activeScenarioIndex, setActiveScenarioIndex] = useState<number>(0);
  const [portfolioData, setPortfolioData] = useState(defaultPortfolioData);
  const [isDirty, setIsDirty] = useState(false);

  // Funções para atualizar os valores
  const updateCurrentPosition = (key: keyof CurrentPosition, value: any) => {
    setCurrentPosition(prev => ({
      ...prev,
      [key]: value
    }));
    setIsDirty(true);
  };

  const updateLoanData = (key: keyof LoanData, value: any) => {
    setLoanData(prev => ({
      ...prev,
      [key]: value
    }));
    setIsDirty(true);
  };

  // Cálculo de dados do portfólio com base nos valores atuais
  useEffect(() => {
    if (isDirty) {
      // Calcular o valor total atual da posição cripto
      const cryptoValue = currentPosition.quantity * currentPosition.currentPrice;
      
      // Atualizar o valor da alocação de criptomoedas
      const newAllocation = [...defaultPortfolioData.allocation];
      const cryptoIndex = newAllocation.findIndex(item => item.name === 'Criptomoedas');
      
      if (cryptoIndex >= 0) {
        // Calcular novo valor e porcentagem para cripto
        newAllocation[cryptoIndex].value = cryptoValue;
        
        // Recalcular o valor total e as porcentagens
        const newTotal = newAllocation.reduce((sum, item) => sum + item.value, 0);
        
        // Atualizar porcentagens
        newAllocation.forEach(item => {
          item.percentage = Math.round((item.value / newTotal) * 100);
        });
        
        // Atualizar dados do portfólio
        setPortfolioData({
          ...defaultPortfolioData,
          totalValue: newTotal,
          allocation: newAllocation
        });
      }
      
      setIsDirty(false);
    }
  }, [isDirty, currentPosition]);

  const value = {
    currentPosition,
    updateCurrentPosition,
    loanData,
    updateLoanData,
    scenarios,
    setScenarios,
    activeScenarioIndex,
    setActiveScenarioIndex,
    portfolioData,
    isDirty,
    setIsDirty
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
