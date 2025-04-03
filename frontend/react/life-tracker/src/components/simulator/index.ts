// Componentes principais
export { default as ScenarioAnalyzer } from './ScenarioAnalyzer';
export { default as EnhancedScenarioAnalyzer } from './EnhancedScenarioAnalyzer';
export { default as CryptoInvestmentScenarios } from './CryptoInvestmentScenarios';
export { default as MonthlyProjectionTable } from './MonthlyProjectionTable';

// Componentes de visualização
export { default as MonthlyProjectionRow } from './MonthlyProjectionRow';
export { default as MonthlyDetailPanel } from './MonthlyDetailPanel';
export { default as MonthlyProjectionMilestones } from './MonthlyProjectionMilestones';

// Componentes do cenário melhorado
export { default as ScenarioSelector } from './enhanced/ScenarioSelector';
export { default as ScenarioDetails } from './enhanced/ScenarioDetails';
export { default as ScenarioProjections } from './enhanced/ScenarioProjections';
export { default as ScenarioRecommendations } from './enhanced/ScenarioRecommendations';

// Re-exportar tipos
export * from './types/investment-types';
export * from './types/monthly-projection-types';

// Re-exportar utilitários
export * from './utils/investment-calculations';
export * from './utils/monthly-projection-calculations';
