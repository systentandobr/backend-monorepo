import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  CurrentPosition, 
  LoanData, 
  ScenarioData,
  DEFAULT_ANALYSIS_MONTHS 
} from '@/components/simulator/types/investment-types';
import { ScenarioAnalysis } from '@/components/simulator/types/monthly-projection-types';
import { calculateScenarioResults } from '@/components/simulator/utils/investment-calculations';
import { 
  calculateScenarioAnalysis,
  calculateMonthlyProjections 
} from '@/components/simulator/utils/monthly-projection-calculations';

// Interface da store
interface EnhancedSimulationState {
  // Dados da posição atual
  currentPosition: CurrentPosition;
  updateCurrentPosition: (key: keyof CurrentPosition, value: any) => void;
  
  // Dados do empréstimo
  loanData: LoanData;
  updateLoanData: (key: keyof LoanData, value: any) => void;
  
  // Cenários de investimento
  scenarios: ScenarioData[];
  setScenarios: (scenarios: ScenarioData[]) => void;
  activeScenarioIndex: number;
  setActiveScenarioIndex: (index: number) => void;
  updateScenario: (index: number, key: keyof ScenarioData, value: any) => void;
  addScenario: () => void;
  
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
  
  // Análise de cenários
  scenarioAnalysis: ScenarioAnalysis;
  
  // Projeções mensais
  monthlyProjections: Record<number, any[]>; // targetPrice -> monthlyData
  
  // Ações
  calculateAllScenarios: () => void;
  calculateScenarioAnalysis: () => void;
  calculateMonthlyProjections: () => void;
  resetSimulation: () => void;
}

// Valores iniciais
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

const defaultScenarioAnalysis: ScenarioAnalysis = {
  calculatedMonthlyPayment: 0,
  totalInterest: 0,
  breakEvenTime: 0,
  optimalSellingPrice: 0,
  timeToTarget: {},
  maxWaitTime: 0
};

// Criar a store zustand
const useEnhancedSimulationStore = create<EnhancedSimulationState>((set, get) => ({
  // Estado inicial
  currentPosition: defaultCurrentPosition,
  loanData: defaultLoanData,
  scenarios: defaultScenarios,
  activeScenarioIndex: 0,
  portfolioData: defaultPortfolioData,
  scenarioAnalysis: defaultScenarioAnalysis,
  monthlyProjections: {},
  
  // Atualizar posição atual
  updateCurrentPosition: (key, value) => {
    set((state) => {
      const newPosition = { 
        ...state.currentPosition, 
        [key]: value 
      };
      
      // Recalcular porcentagens do portfólio
      const cryptoValue = newPosition.quantity * newPosition.currentPrice;
      const newAllocation = [...state.portfolioData.allocation];
      const cryptoIndex = newAllocation.findIndex(item => item.name === 'Criptomoedas');
      
      if (cryptoIndex >= 0) {
        newAllocation[cryptoIndex].value = cryptoValue;
        
        // Recalcular o valor total
        const newTotal = newAllocation.reduce((sum, item) => sum + item.value, 0);
        
        // Atualizar porcentagens
        newAllocation.forEach(item => {
          item.percentage = Math.round((item.value / newTotal) * 100);
        });
        
        // Recalcular todos os cenários e análises
        setTimeout(() => {
          get().calculateAllScenarios();
          get().calculateScenarioAnalysis();
          get().calculateMonthlyProjections();
        }, 0);
        
        return {
          currentPosition: newPosition,
          portfolioData: {
            ...state.portfolioData,
            totalValue: newTotal,
            allocation: newAllocation
          }
        };
      }
      
      // Recalcular todos os cenários e análises
      setTimeout(() => {
        get().calculateAllScenarios();
        get().calculateScenarioAnalysis();
        get().calculateMonthlyProjections();
      }, 0);
      
      return { currentPosition: newPosition };
    });
  },
  
  // Atualizar dados do empréstimo
  updateLoanData: (key, value) => {
    set((state) => {
      const newLoanData = { ...state.loanData, [key]: value };
      
      // Recalcular todos os cenários e análises
      setTimeout(() => {
        get().calculateAllScenarios();
        get().calculateScenarioAnalysis();
        get().calculateMonthlyProjections();
      }, 0);
      
      return { loanData: newLoanData };
    });
  },
  
  // Definir cenários
  setScenarios: (scenarios) => {
    set({ scenarios });
    
    // Recalcular análises
    setTimeout(() => {
      get().calculateAllScenarios();
      get().calculateScenarioAnalysis();
      get().calculateMonthlyProjections();
    }, 0);
  },
  
  // Definir cenário ativo
  setActiveScenarioIndex: (index) => {
    set({ activeScenarioIndex: index });
    
    // Recalcular análises
    setTimeout(() => {
      get().calculateScenarioAnalysis();
      get().calculateMonthlyProjections();
    }, 0);
  },
  
  // Atualizar um cenário específico
  updateScenario: (index, key, value) => {
    set((state) => {
      const updatedScenarios = [...state.scenarios];
      updatedScenarios[index] = {
        ...updatedScenarios[index],
        [key]: value
      };
      
      // Recalcular todos os cenários e análises
      setTimeout(() => {
        get().calculateAllScenarios();
        get().calculateScenarioAnalysis();
        get().calculateMonthlyProjections();
      }, 0);
      
      return { scenarios: updatedScenarios };
    });
  },
  
  // Adicionar um novo cenário
  addScenario: () => {
    set((state) => {
      const newScenario: ScenarioData = {
        id: uuidv4(),
        name: `Cenário ${state.scenarios.length + 1}`,
        investmentAmount: 10000,
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
      };
      
      const newScenarios = [...state.scenarios, newScenario];
      
      // Recalcular
      setTimeout(() => {
        get().calculateAllScenarios();
        get().calculateScenarioAnalysis();
        get().calculateMonthlyProjections();
      }, 0);
      
      return { 
        scenarios: newScenarios,
        activeScenarioIndex: newScenarios.length - 1
      };
    });
  },
  
  // Calcular resultados para todos os cenários
  calculateAllScenarios: () => {
    set((state) => {
      const { currentPosition, loanData, scenarios } = state;
      
      const updatedScenarios = scenarios.map(scenario => 
        calculateScenarioResults(scenario, currentPosition, loanData)
      );
      
      return { scenarios: updatedScenarios };
    });
  },
  
  // Calcular análise de cenário
  calculateScenarioAnalysis: () => {
    set((state) => {
      const { currentPosition, loanData, scenarios, activeScenarioIndex } = state;
      
      if (scenarios.length === 0 || !scenarios[activeScenarioIndex]) {
        return { scenarioAnalysis: defaultScenarioAnalysis };
      }
      
      const activeScenario = scenarios[activeScenarioIndex];
      const analysis = calculateScenarioAnalysis(
        activeScenario,
        currentPosition,
        loanData
      );
      
      return { scenarioAnalysis: analysis };
    });
  },
  
  // Calcular projeções mensais
  calculateMonthlyProjections: () => {
    set((state) => {
      const { currentPosition, loanData, scenarios, activeScenarioIndex } = state;
      
      if (scenarios.length === 0 || !scenarios[activeScenarioIndex]) {
        return { monthlyProjections: {} };
      }
      
      const activeScenario = scenarios[activeScenarioIndex];
      const projections = calculateMonthlyProjections(
        activeScenario,
        currentPosition,
        loanData
      );
      
      return { monthlyProjections: projections };
    });
  },
  
  // Resetar a simulação para os valores padrão
  resetSimulation: () => {
    set({
      currentPosition: defaultCurrentPosition,
      loanData: defaultLoanData,
      scenarios: defaultScenarios,
      activeScenarioIndex: 0,
      portfolioData: defaultPortfolioData,
      scenarioAnalysis: defaultScenarioAnalysis,
      monthlyProjections: {}
    });
    
    // Recalcular
    setTimeout(() => {
      get().calculateAllScenarios();
      get().calculateScenarioAnalysis();
      get().calculateMonthlyProjections();
    }, 0);
  }
}));

export default useEnhancedSimulationStore;
