import { 
  LoanData, 
  ScenarioData, 
  CurrentPosition,
  TargetPriceResult,
  DEFAULT_ANALYSIS_MONTHS
} from '../types/investment-types';

// Calcular parcela de empréstimo (Sistema Price)
export const calculateLoanInstallment = (
  amount: number, 
  interestRate: number, 
  term: number
): number => {
  const monthlyRate = interestRate / 100;
  return amount * ((Math.pow(1 + monthlyRate, term) * monthlyRate) / 
                   (Math.pow(1 + monthlyRate, term) - 1));
};

// Calcular juros acumulados até um determinado mês
export const calculateAccumulatedInterest = (
  loanData: LoanData,
  month: number
): number => {
  let accumulatedInterest = 0;
  
  if (month <= loanData.term) {
    // Durante o período do empréstimo
    for (let i = 1; i <= month; i++) {
      const remainingPrincipal = loanData.amount * (1 - (i - 1) / loanData.term);
      const interestForMonth = remainingPrincipal * (loanData.interestRate / 100);
      accumulatedInterest += interestForMonth;
    }
  } else {
    // Após o período do empréstimo (juros já foram todos pagos)
    accumulatedInterest = loanData.amount * Math.pow(1 + loanData.interestRate / 100, loanData.term) - loanData.amount;
  }
  
  return accumulatedInterest;
};

// Calcular total de juros ao longo do empréstimo
export const calculateTotalInterest = (loanData: LoanData): number => {
  const monthlyInstallment = calculateLoanInstallment(
    loanData.amount, 
    loanData.interestRate, 
    loanData.term
  );
  
  return monthlyInstallment * loanData.term - loanData.amount;
};

// Calcular resultados para um preço-alvo específico
export const calculateTargetPriceResult = (
  targetPrice: number,
  totalUnits: number,
  totalInvestment: number,
  loanData: LoanData
): TargetPriceResult => {
  // Calcular resultados para cada mês de análise
  const profitAfterMonths: Record<number, number> = {};
  const profitPercentageAfterMonths: Record<number, number> = {};
  
  DEFAULT_ANALYSIS_MONTHS.forEach(month => {
    // Calcular juros acumulados para o mês
    const accumulatedInterest = calculateAccumulatedInterest(loanData, month);
    
    // Cálculo do lucro após os juros
    const grossProfit = totalUnits * targetPrice - totalInvestment;
    const netProfit = grossProfit - accumulatedInterest;
    
    profitAfterMonths[month] = netProfit;
    profitPercentageAfterMonths[month] = (netProfit / totalInvestment) * 100;
  });
  
  // Calcular o tempo máximo de espera antes que os juros ultrapassem o lucro potencial
  let maxWaitTime = 0;
  const potentialProfit = totalUnits * targetPrice - totalInvestment;
  
  for (let month = 1; month <= 60; month++) {
    const accumulatedInterest = calculateAccumulatedInterest(loanData, month);
    
    if (accumulatedInterest < potentialProfit) {
      maxWaitTime = month;
    } else {
      break;
    }
  }
  
  // Calcular o mês em que o preço de breakeven é atingido
  let timeToBreakeven = 0;
  let breakevenFound = false;
  
  for (let month = 1; month <= 60; month++) {
    const accumulatedInterest = calculateAccumulatedInterest(loanData, month);
    const netProfit = totalUnits * targetPrice - totalInvestment - accumulatedInterest;
    
    if (!breakevenFound && netProfit >= 0) {
      timeToBreakeven = month;
      breakevenFound = true;
      break;
    }
  }
  
  return {
    targetPrice,
    timeToBreakeven,
    profitAfterMonths,
    profitPercentageAfterMonths,
    maxWaitTime
  };
};

// Calcular resultados para um cenário
export const calculateScenarioResults = (
  scenario: ScenarioData,
  currentPosition: CurrentPosition,
  loanData: LoanData
): ScenarioData => {
  let totalUnits = currentPosition.quantity;
  let totalInvestment = currentPosition.quantity * currentPosition.averagePrice;
  
  // Calcular total de unidades e preço médio baseado na estratégia de investimento
  if (scenario.investmentStrategy === 'single') {
    // Investimento único na cotação atual
    const newUnits = scenario.investmentAmount / currentPosition.currentPrice;
    totalUnits += newUnits;
    totalInvestment += scenario.investmentAmount;
  } else if (scenario.investmentStrategy === 'staged') {
    // Investimento escalonado em diferentes porcentagens de queda
    for (let i = 0; i < scenario.stagePercentages.length; i++) {
      const dropPercentage = scenario.stagePercentages[i];
      const allocationPercentage = scenario.stageAllocations[i];
      const allocationAmount = (scenario.investmentAmount * allocationPercentage) / 100;
      
      // Preço após queda
      const priceAtStage = currentPosition.currentPrice * (1 - dropPercentage / 100);
      
      // Unidades compradas neste estágio
      const unitsAtStage = allocationAmount / priceAtStage;
      
      totalUnits += unitsAtStage;
      totalInvestment += allocationAmount;
    }
  }
  
  // Cálculo do preço médio
  const averagePrice = totalInvestment / totalUnits;
  
  // Calcular resultados para cada preço-alvo
  const resultsByTargetPrice = scenario.targetPrices.map(targetPrice => 
    calculateTargetPriceResult(targetPrice, totalUnits, totalInvestment, loanData)
  );
  
  return {
    ...scenario,
    results: {
      totalUnits,
      averagePrice,
      totalInvestment,
      resultsByTargetPrice
    }
  };
};

// Formatar valores monetários
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(value);
};

// Formatar percentagens
export const formatPercent = (value: number) => {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
};
