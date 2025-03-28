// Tipos para projeções mensais detalhadas

// Interface para projeção mensal detalhada
export interface MonthlyProjection {
  month: number;
  
  // Dados do empréstimo
  payment: number;
  interestPayment: number;
  principalPayment: number;
  remainingBalance: number;
  accumulatedInterest: number;
  accumulatedPayments: number;
  
  // Dados do investimento (para preço-alvo específico)
  assetValue?: number;
  grossProfit?: number;
  netProfit?: number;
  roi?: number;
  annualizedRoi?: number;
}

// Interface para análise de cenário com projeções mensais
export interface ScenarioAnalysis {
  calculatedMonthlyPayment: number;
  totalInterest: number;
  breakEvenTime: number;
  optimalSellingPrice: number;
  timeToTarget: Record<number, number>; // targetPrice -> meses
  maxWaitTime: number;
  
  // Projeções mensais detalhadas
  monthlyProjections?: Record<number, Record<number, MonthlyProjection>>; // targetPrice -> month -> projection
  bestCaseMonth?: number;
  bestCasePrice?: number;
  worstCaseMonth?: number;
  worstCasePrice?: number;
  breakEvenMonths?: Record<number, number>; // targetPrice -> month
}

// Resumo mensal para um cenário e preço-alvo específicos
export interface MonthlySummary {
  month: number;
  targetPrice: number;
  grossValue: number;    // Valor bruto da posição
  loanPayment: number;   // Pagamento acumulado do empréstimo
  netValue: number;      // Valor líquido (bruto - empréstimo)
  netProfit: number;     // Lucro líquido (considerando investimento inicial)
  profitPercentage: number; // Percentual de lucro
}

// Estatísticas importantes de um cenário
export interface ScenarioMetrics {
  breakEvenMonth: number;          // Mês em que o investimento atinge o break-even
  optimalSellingMonth: number;     // Mês ideal para venda
  optimalSellingPrice: number;     // Preço ideal para venda
  expectedAnnualReturn: number;    // Retorno anual esperado
  riskLevel: 'low' | 'medium' | 'high'; // Nível de risco
}
