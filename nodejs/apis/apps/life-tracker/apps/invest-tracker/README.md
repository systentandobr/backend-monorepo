apps/invest-tracker/
├── src/
│   ├── pages/                      # Páginas do InvestTracker
│   │   ├── Dashboard.tsx           # Dashboard principal
│   │   ├── Opportunities.tsx       # Página de oportunidades
│   │   ├── Favorites.tsx           # Ativos favoritos
│   │   ├── Simulator.tsx           # Simulador de investimentos
│   │   └── Crypto.tsx              # Página de criptomoedas
│   │
│   ├── components/                 # Componentes específicos do módulo
│   │   ├── AssetList.tsx           # Lista de ativos
│   │   ├── PriceChart.tsx          # Gráfico de preços
│   │   └── OpportunityCard.tsx     # Card de oportunidade
│   │
│   ├── hooks/                      # Hooks específicos do módulo
│   │   ├── useAssets.ts            # Hook para gerenciar ativos
│   │   ├── useOpportunities.ts     # Hook para oportunidades
│   │   └── usePortfolio.ts         # Hook para portfólio
│   │
│   └── index.tsx                   # Ponto de entrada
│
├── tsconfig.json                   # Configuração TypeScript
└── package.json                    # Dependências específicas