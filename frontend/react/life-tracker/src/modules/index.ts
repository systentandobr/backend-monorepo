/**
 * Definição dos módulos do sistema Life Tracker
 * Esta estrutura permite a organização modular e expansível da aplicação
 */

// Interface base para módulos
export interface AppModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  routes: string[];
  isEnabled: boolean;
  order: number;
}

// Definições dos módulos da aplicação
export const APP_MODULES: Record<string, AppModule> = {
  FINANCIAL_MONITORING: {
    id: 'financial-monitoring',
    name: 'Monitoramento Financeiro',
    description: 'Acompanhamento de ativos financeiros e mercados',
    icon: 'line-chart',
    routes: ['/portfolio', '/market', '/opportunities'],
    isEnabled: true,
    order: 1
  },
  
  INVESTMENT_SIMULATION: {
    id: 'investment-simulation',
    name: 'Simulações de Investimento',
    description: 'Simulações e projeções para otimizar decisões financeiras',
    icon: 'calculator',
    routes: ['/simulator'],
    isEnabled: true,
    order: 2
  },
  
  PERSONAL_PLANNING: {
    id: 'personal-planning',
    name: 'Planejamento Pessoal e Metas',
    description: 'Organização de rotinas e metas pessoais',
    icon: 'target',
    routes: ['/habits', '/goals'],
    isEnabled: true,
    order: 3
  },
  
  AUTOMATION_AI: {
    id: 'automation-ai',
    name: 'Automação e IA',
    description: 'Mecanismos autônomos para facilitar decisões',
    icon: 'cpu',
    routes: ['/insights', '/automation'],
    isEnabled: true,
    order: 4
  },
  
  WELLBEING: {
    id: 'wellbeing',
    name: 'Bem-Estar e Produtividade',
    description: 'Monitoramento de hábitos e qualidade de vida',
    icon: 'heart',
    routes: ['/wellbeing'],
    isEnabled: true,
    order: 5
  },
  
  BUSINESS_OPPORTUNITIES: {
    id: 'business-opportunities',
    name: 'Oportunidades de Negócio',
    description: 'Criação e validação de ideias de negócios',
    icon: 'briefcase',
    routes: ['/business'],
    isEnabled: true,
    order: 6
  },
};

// Tipos derivados dos módulos
export type ModuleId = keyof typeof APP_MODULES;

// Funções auxiliares para trabalhar com módulos
export const getEnabledModules = (): AppModule[] => {
  return Object.values(APP_MODULES)
    .filter(module => module.isEnabled)
    .sort((a, b) => a.order - b.order);
};

export const getModuleByRoute = (route: string): AppModule | undefined => {
  return Object.values(APP_MODULES).find(module => 
    module.routes.some(r => r === route || route.startsWith(r))
  );
};

// Definições dos módulos de marketplace
export interface MarketplaceModule extends AppModule {
  price?: number;
  currency?: string;
  isInstalled: boolean;
  avgRating: number;
  numReviews: number;
  lastUpdated: string;
}

// Módulos do marketplace (extensões disponíveis)
export const MARKETPLACE_MODULES: Record<string, MarketplaceModule> = {
  CRYPTO_TRACKING: {
    id: 'crypto-tracking',
    name: 'Rastreamento de Criptomoedas',
    description: 'Acompanhamento avançado de criptomoedas e blockchain',
    icon: 'bitcoin',
    routes: ['/crypto'],
    isEnabled: false,
    order: 10,
    price: 0,
    currency: 'BRL',
    isInstalled: false,
    avgRating: 4.7,
    numReviews: 320,
    lastUpdated: '2023-11-15'
  },
  
  REAL_ESTATE: {
    id: 'real-estate',
    name: 'Investimentos Imobiliários',
    description: 'Análise de FIIs e oportunidades no mercado imobiliário',
    icon: 'home',
    routes: ['/real-estate'],
    isEnabled: false,
    order: 11,
    price: 19.90,
    currency: 'BRL',
    isInstalled: false,
    avgRating: 4.5,
    numReviews: 187,
    lastUpdated: '2023-12-02'
  },
  
  AI_ADVISOR: {
    id: 'ai-advisor',
    name: 'Consultor IA',
    description: 'Recomendações personalizadas baseadas em IA avançada',
    icon: 'cpu',
    routes: ['/ai-advisor'],
    isEnabled: false,
    order: 12,
    price: 29.90,
    currency: 'BRL',
    isInstalled: false,
    avgRating: 4.9,
    numReviews: 452,
    lastUpdated: '2024-01-10'
  },
};

// Função para obter módulos do marketplace
export const getMarketplaceModules = (): MarketplaceModule[] => {
  return Object.values(MARKETPLACE_MODULES)
    .sort((a, b) => b.avgRating - a.avgRating);
};
