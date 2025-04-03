import { 
  LoanData, 
  ScenarioData, 
  CurrentPosition
} from '../types/investment-types';
import { 
  MonthlyProjection,
  ScenarioAnalysis,
  MonthlySummary
} from '../types/monthly-projection-types';
import { calculateLoanInstallment } from './investment-calculations';

// Calcular a parcela mensal do empréstimo (Sistema Price)
export const calculateMonthlyPayment = (loanData: LoanData): number => {
  const { amount, interestRate, term } = loanData;
  const monthlyRate = interestRate / 100;
  
  if (monthlyRate === 0 || term === 0) {
    return amount / term; // Sem juros, parcela simples
  }
  
  return amount * ((Math.pow(1 + monthlyRate, term) * monthlyRate) / 
                  (Math.pow(1 + monthlyRate, term) - 1));
};

// Calcular o cronograma de amortização do empréstimo
export const calculateAmortizationSchedule = (loanData: LoanData): MonthlyProjection[] => {
  const monthlyRate = loanData.interestRate / 100;
  const monthlyPayment = calculateMonthlyPayment(loanData);
  
  let remainingBalance = loanData.amount;
  const schedule: MonthlyProjection[] = [];
  
  for (let month = 1; month <= loanData.term; month++) {
    // Calcular juros para este mês
    const interestPayment = remainingBalance * monthlyRate;
    
    // Calcular pagamento de principal
    const principalPayment = monthlyPayment - interestPayment;
    
    // Atualizar saldo remanescente
    remainingBalance -= principalPayment;
    
    // Adicionar ao cronograma
    schedule.push({
      month,
      payment: monthlyPayment,
      interestPayment,
      principalPayment,
      remainingBalance: Math.max(0, remainingBalance),
      accumulatedInterest: schedule.length > 0 
        ? schedule[schedule.length - 1].accumulatedInterest + interestPayment
        : interestPayment,
      accumulatedPayments: schedule.length > 0
        ? schedule[schedule.length - 1].accumulatedPayments + monthlyPayment
        : monthlyPayment
    });
  }
  
  // Adicionar meses após o término do empréstimo (até 60 meses total)
  const lastMonth = schedule[schedule.length - 1];
  
  for (let month = loanData.term + 1; month <= 60; month++) {
    schedule.push({
      month,
      payment: 0,
      interestPayment: 0,
      principalPayment: 0,
      remainingBalance: 0,
      accumulatedInterest: lastMonth.accumulatedInterest,
      accumulatedPayments: lastMonth.accumulatedPayments
    });
  }
  
  return schedule;
};

// Calcular projeções mensais para um cenário
export const calculateMonthlyProjections = (
  scenario: ScenarioData,
  currentPosition: CurrentPosition,
  loanData: LoanData
): Record<number, MonthlySummary[]> => {
  // Obter cronograma de amortização
  const schedule = calculateAmortizationSchedule(loanData);
  
  // Valor inicial do investimento (baseado na posição atual)
  const initialInvestment = currentPosition.quantity * currentPosition.averagePrice;
  
  // Obter dados totais do cenário
  const { totalUnits, totalInvestment } = scenario.results;
  
  // Resultados por preço-alvo
  const results: Record<number, MonthlySummary[]> = {};
  
  // Para cada preço-alvo
  scenario.targetPrices.forEach(targetPrice => {
    results[targetPrice] = [];
    
    // Para cada mês (até 60)
    for (let month = 1; month <= 60; month++) {
      const loanInfo = schedule[month - 1];
      
      // Valor bruto da posição neste preço
      const grossValue = totalUnits * targetPrice;
      
      // Pagamento acumulado do empréstimo
      const loanPayment = loanInfo.accumulatedPayments;
      
      // Valor líquido (bruto - empréstimo)
      const netValue = grossValue - loanInfo.remainingBalance;
      
      // Lucro líquido (considerando investimento inicial)
      const netProfit = netValue - totalInvestment;
      
      // Percentual de lucro
      const profitPercentage = (netProfit / totalInvestment) * 100;
      
      // Adicionar ao resultado
      results[targetPrice].push({
        month,
        targetPrice,
        grossValue,
        loanPayment,
        netValue,
        netProfit,
        profitPercentage
      });
    }
  });
  
  return results;
};

// Calcular a análise de cenário completa
export const calculateScenarioAnalysis = (
  scenario: ScenarioData,
  currentPosition: CurrentPosition,
  loanData: LoanData
): ScenarioAnalysis => {
  // Calcular mensalidade do empréstimo
  const monthlyPayment = calculateMonthlyPayment(loanData);
  
  // Calcular juros totais
  const totalInterest = monthlyPayment * loanData.term - loanData.amount;
  
  // Obter projeções mensais
  const monthlyData = calculateMonthlyProjections(
    scenario, 
    currentPosition, 
    loanData
  );
  
  // Tempo até atingir o breakeven para cada preço-alvo
  const timeToTarget: Record<number, number> = {};
  const breakEvenMonths: Record<number, number> = {};
  
  // Encontrar o melhor e o pior caso
  let bestCaseMonth = 0;
  let bestCasePrice = 0;
  let bestNetProfit = -Infinity;
  
  let worstCaseMonth = 0;
  let worstCasePrice = 0;
  let worstNetProfit = Infinity;
  
  // Analisar dados mensais
  Object.entries(monthlyData).forEach(([priceStr, projections]) => {
    const price = parseFloat(priceStr);
    
    // Encontrar o primeiro mês de breakeven
    for (const projection of projections) {
      if (projection.netProfit >= 0 && !breakEvenMonths[price]) {
        breakEvenMonths[price] = projection.month;
        timeToTarget[price] = projection.month;
      }
      
      // Verificar melhor caso após 12 meses
      if (projection.month === 12 && projection.netProfit > bestNetProfit) {
        bestNetProfit = projection.netProfit;
        bestCasePrice = price;
        bestCaseMonth = 12;
      }
      
      // Verificar pior caso após 12 meses
      if (projection.month === 12 && projection.netProfit < worstNetProfit) {
        worstNetProfit = projection.netProfit;
        worstCasePrice = price;
        worstCaseMonth = 12;
      }
    }
  });
  
  // Determinar o preço de venda ótimo
  const optimalSellingPrice = bestCasePrice;
  
  // Determinar o tempo máximo de espera (até que o dinheiro emprestado exceda o valor)
  let maxWaitTime = 60; // Default: 5 anos
  
  for (let month = 60; month >= 1; month--) {
    // Verificar se há pelo menos um preço-alvo com resultado positivo neste mês
    const anyPositive = Object.values(monthlyData).some(projections => {
      const projection = projections[month - 1];
      return projection && projection.netProfit > 0;
    });
    
    if (anyPositive) {
      maxWaitTime = month;
      break;
    }
  }
  
  // Determinar o tempo até o breakeven (média entre os preços-alvo)
  const breakEvenTimes = Object.values(breakEvenMonths);
  const breakEvenTime = breakEvenTimes.length > 0
    ? Math.round(breakEvenTimes.reduce((sum, time) => sum + time, 0) / breakEvenTimes.length)
    : 0;
  
  return {
    calculatedMonthlyPayment: monthlyPayment,
    totalInterest,
    breakEvenTime,
    optimalSellingPrice,
    timeToTarget,
    maxWaitTime,
    monthlyProjections: {} as any, // Conversão de tipo
    bestCaseMonth,
    bestCasePrice,
    worstCaseMonth,
    worstCasePrice,
    breakEvenMonths
  };
};

// Formatar valores monetários
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(value);
};

// Formatar percentuais
export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};
