apps/dashboard/
├── src/
│   ├── pages/
│   │   ├── Overview.tsx            # Visão geral de todos os módulos
│   │   ├── Goals.tsx               # Gerenciamento de metas
│   │   └── Settings.tsx            # Configurações gerais
│   │
│   ├── widgets/                    # Widgets para cada módulo
│   │   ├── InvestWidget.tsx        # Widget do InvestTracker
│   │   ├── KnowledgeWidget.tsx     # Widget de conhecimento
│   │   ├── HealthWidget.tsx        # Widget de saúde
│   │   └── GoalsWidget.tsx         # Widget de metas
│   │
│   ├── routes/                     # Configuração de rotas
│   │   └── AppRoutes.tsx           # Rotas da aplicação
│   │
│   └── App.tsx                     # Componente principal
│
├── tsconfig.json
└── package.json