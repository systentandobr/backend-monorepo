packages/goals/
├── src/
│   ├── components/
│   │   ├── GoalTracker.tsx         # Rastreador de meta
│   │   ├── GoalForm.tsx            # Formulário de meta
│   │   └── GoalsList.tsx           # Lista de metas
│   │
│   ├── hooks/
│   │   ├── useGoals.ts             # Hook principal de metas
│   │   ├── useGoalProgress.ts      # Progresso de metas
│   │   └── useRelatedGoals.ts      # Metas relacionadas
│   │
│   ├── types/
│   │   └── Goal.ts                 # Tipos para metas
│   │
│   └── services/
│       ├── goalService.ts          # Serviço de metas
│       └── goalAnalytics.ts        # Análise de metas
│
├── tsconfig.json
└── package.json