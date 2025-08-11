life-tracker/
├── apps/                           # Aplicações/módulos
│   ├── dashboard/                  # Dashboard unificado 
│   ├── invest-tracker/             # InvestTracker refatorado
│   ├── knowledge-tracker/          # Módulo de estudos e conhecimento
│   ├── health-tracker/             # Módulo de saúde
│   ├── fitness-tracker/            # Módulo de exercícios físicos
│   ├── nutrition-tracker/          # Módulo de alimentação
│   └── mobile/                     # Versão móvel (opcional)
│
├── packages/                       # Pacotes compartilhados
│   ├── ui/                         # Biblioteca de componentes
│   │   ├── components/
│   │   │   ├── buttons/            # Botões reutilizáveis
│   │   │   ├── cards/              # Cards para diferentes visualizações
│   │   │   ├── charts/             # Componentes de visualização de dados
│   │   │   ├── forms/              # Componentes de formulário
│   │   │   ├── layout/             # Componentes de layout
│   │   │   └── feedback/           # Notificações, alertas, etc.
│   │   └── styles/                 # Estilos compartilhados
│   │
│   ├── core/                       # Lógica de negócios compartilhada
│   │   ├── entities/               # Modelos de dados
│   │   ├── repositories/           # Interfaces para acesso a dados
│   │   ├── services/               # Serviços compartilhados
│   │   └── utils/                  # Utilitários compartilhados
│   │
│   ├── state/                      # Gerenciamento de estado
│   │   ├── contexts/               # Contextos React
│   │   ├── stores/                 # Stores Zustand
│   │   └── queries/                # React Query hooks
│   │
│   ├── api/                        # Clientes de API
│   │   ├── b3/                     # API da B3
│   │   ├── binance/                # API da Binance
│   │   ├── health/                 # APIs de saúde
│   │   └── common/                 # Utilitários para API
│   │
│   ├── goals/                      # Sistema de metas compartilhado
│   │   ├── components/             # Componentes de UI para metas
│   │   ├── hooks/                  # Hooks para integrações
│   │   └── services/               # Serviços para gerenciamento
│   │
│   ├── analytics/                  # Sistema de análise
│   │   ├── trackers/               # Rastreamento de métricas
│   │   ├── charts/                 # Visualizações de dados
│   │   └── insights/               # Geração de insights
│   │
│   └── auth/                       # Autenticação compartilhada
│       ├── components/             # Componentes de autenticação
│       ├── hooks/                  # Hooks de autenticação
│       └── services/               # Serviços de autenticação
│
├── config/                         # Configurações compartilhadas
│   ├── eslint/                     # Regras de ESLint
│   ├── jest/                       # Configuração de testes
│   └── typescript/                 # Configurações TypeScript
│
└── scripts/                        # Scripts utilitários
    ├── build.js                    # Scripts de build
    ├── generate.js                 # Generators de código
    └── deploy.js                   # Scripts de deploy

    