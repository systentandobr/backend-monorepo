packages/analytics/
├── src/
│   ├── components/
│   │   ├── CorrelationChart.tsx    # Gráfico de correlação
│   │   ├── MetricCompare.tsx       # Comparação de métricas
│   │   └── InsightCard.tsx         # Card de insight
│   │
│   ├── hooks/
│   │   ├── useMetrics.ts           # Hook para métricas
│   │   ├── useCorrelation.ts       # Análise de correlação
│   │   └── useInsights.ts          # Geração de insights
│   │
│   └── services/
│       ├── metricService.ts        # Serviço de métricas
│       ├── correlationService.ts   # Serviço de correlação
│       └── insightEngine.ts        # Motor de insights
│
├── tsconfig.json
└── package.json