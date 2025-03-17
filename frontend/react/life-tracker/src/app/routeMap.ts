/**
 * Mapa de rotas do Life Tracker
 * Centraliza as definições de todas as rotas disponíveis na aplicação
 */

// Tipos para as rotas
export interface RouteDefinition {
  path: string;
  title: string;
  description?: string;
  requiresAuth?: boolean;
  icon?: string;
  category?: 'main' | 'dashboard' | 'finances' | 'settings' | 'insights';
}

// Definição das rotas da aplicação
export const ROUTES = {
  // Autenticação e onboarding
  LANDING: { path: '/', title: 'Início', requiresAuth: false },
  LOGIN: { path: '/login', title: 'Login', requiresAuth: false },
  REGISTER: { path: '/register', title: 'Cadastro', requiresAuth: false },
  ONBOARDING: { path: '/onboarding', title: 'Primeiros Passos', requiresAuth: true },
  
  // Dashboard principal
  DASHBOARD: { 
    path: '/dashboard', 
    title: 'Dashboard', 
    description: 'Visão geral e principais insights',
    requiresAuth: true,
    icon: 'home',
    category: 'main',
  },
  
  // Módulo de Monitoramento Financeiro
  PORTFOLIO: { 
    path: '/portfolio', 
    title: 'Carteira', 
    description: 'Acompanhamento da sua carteira de investimentos',
    requiresAuth: true,
    icon: 'pieChart',
    category: 'finances',
  },
  MARKET: { 
    path: '/market', 
    title: 'Mercado', 
    description: 'Monitoramento de ativos e mercados',
    requiresAuth: true,
    icon: 'trendingUp',
    category: 'finances',
  },
  OPPORTUNITIES: { 
    path: '/opportunities', 
    title: 'Oportunidades', 
    description: 'Análise de oportunidades de investimento',
    requiresAuth: true,
    icon: 'target',
    category: 'finances',
  },
  
  // Módulo de Simulações de Investimento
  SIMULATOR: { 
    path: '/simulator', 
    title: 'Simulador', 
    description: 'Faça simulações de investimentos e estratégias',
    requiresAuth: true,
    icon: 'calculator',
    category: 'finances',
  },
  
  // Módulo de Planejamento Pessoal e Metas
  HABITS: { 
    path: '/habits', 
    title: 'Hábitos', 
    description: 'Acompanhe e desenvolva seus hábitos financeiros',
    requiresAuth: true,
    icon: 'checkSquare',
    category: 'dashboard',
  },
  GOALS: { 
    path: '/goals', 
    title: 'Metas', 
    description: 'Defina e acompanhe suas metas financeiras',
    requiresAuth: true,
    icon: 'target',
    category: 'dashboard',
  },
  
  // Módulo de Insights e Análises
  INSIGHTS: { 
    path: '/insights', 
    title: 'Insights', 
    description: 'Análises e recomendações personalizadas',
    requiresAuth: true,
    icon: 'lightbulb',
    category: 'insights',
  },
  REPORTS: { 
    path: '/reports', 
    title: 'Relatórios', 
    description: 'Relatórios detalhados e análises históricas',
    requiresAuth: true,
    icon: 'fileText',
    category: 'insights',
  },
  
  // Módulo de Bem-Estar e Produtividade
  WELLBEING: { 
    path: '/wellbeing', 
    title: 'Bem-Estar', 
    description: 'Acompanhe seu equilíbrio entre produtividade e bem-estar',
    requiresAuth: true,
    icon: 'activity',
    category: 'dashboard',
  },
  
  // Módulo de Oportunidades de Negócio
  BUSINESS: { 
    path: '/business', 
    title: 'Negócios', 
    description: 'Explore e avalie oportunidades de negócios',
    requiresAuth: true,
    icon: 'briefcase',
    category: 'insights',
  },
  
  // Configurações
  SETTINGS: { 
    path: '/settings', 
    title: 'Configurações', 
    description: 'Ajuste as configurações da sua conta',
    requiresAuth: true,
    icon: 'settings',
    category: 'settings',
  },
  PROFILE: { 
    path: '/profile', 
    title: 'Perfil', 
    description: 'Gerencie seu perfil e preferências',
    requiresAuth: true,
    icon: 'user',
    category: 'settings',
  },
  NOTIFICATIONS: { 
    path: '/notifications', 
    title: 'Notificações', 
    description: 'Configure suas notificações e alertas',
    requiresAuth: true,
    icon: 'bell',
    category: 'settings',
  },
} as const;

// Função para agrupar rotas por categoria
export const getRoutesByCategory = (category: string): RouteDefinition[] => {
  return Object.values(ROUTES).filter(route => route.category === category);
};

// Função para verificar se uma rota requer autenticação
export const routeRequiresAuth = (path: string): boolean => {
  const route = Object.values(ROUTES).find(r => r.path === path);
  return route?.requiresAuth || false;
};

// Tipo para as rotas
export type Routes = typeof ROUTES;
export type RoutePaths = keyof Routes;
