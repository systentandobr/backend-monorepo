// Tipos de assets
export type AssetType = 'stock' | 'reit' | 'etf' | 'crypto' | 'fixed-income';

// Interface para posição atual
export interface CurrentPosition {
  token: string;
  quantity: number;
  currentPrice: number;
  averagePrice: number;
}

// Interface para dados de empréstimo
export interface LoanData {
  amount: number;
  interestRate: number; // Taxa mensal em porcentagem
  term: number; // Número de meses
}

// Interface para dados de cenário
export interface ScenarioData {
  id: string;
  name: string;
  investmentAmount: number;
  investmentStrategy: 'single' | 'staged';
  stagePercentages: number[]; // Porcentagens de queda para cada estágio
  stageAllocations: number[];  // Percentual de alocação para cada estágio
  targetPrices: number[];  // Preços-alvo para venda
  results: ScenarioResults;
}

// Interface para resultados de cenário
export interface ScenarioResults {
  totalUnits: number;
  averagePrice: number;
  totalInvestment: number;
  resultsByTargetPrice: TargetPriceResult[];
}

export interface TargetPriceResult {
  targetPrice: number;
  timeToBreakeven: number;
  profitAfterMonths: Record<number, number>; // Mês -> Lucro
  profitPercentageAfterMonths: Record<number, number>; // Mês -> Porcentagem de lucro
  maxWaitTime: number; // Tempo máximo de espera em meses
}

// Meses padrão para análise
export const DEFAULT_ANALYSIS_MONTHS = [1, 3, 6, 12, 24, 36];
