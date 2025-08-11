# Prompt 
Gere o código da fase 1 

🎯 Objetivos
Construir um monorepo escalável e modular usando Turborepo.
Desenvolver módulos independentes e integrados para diversas áreas da vida do usuário.
Utilizar React, TypeScript, HeroUI e Tailwind CSS para o frontend.
Implementar um backend híbrido com Golang, Python e NestJS.
Garantir a qualidade do código com testes, linting e formatação.
Adotar princípios de clean architecture e SOLID.
🛠️ Tecnologias
Frontend: React, TypeScript, Vite, HeroUI, Tailwind CSS
Arquitetura: Monorepo (Turborepo)
Estado: Zustand, React Context API
Visualização: Recharts, D3.js
Persistência: LocalStorage, Supabase/MongoDB (planejado)
Backend:
Golang (Núcleo da aplicação)
Python (ML)
NestJS (API)

# Backend arquitetura híbrida
Golang: Núcleo da aplicação (coleta de dados, análise de mercado, sistema de negociação).
Python: Camada de ML (treinamento e execução de modelos, análise de dados).
NestJS: Camada de API e interface (comunicação com o frontend, gerenciamento de requisições).


## Arquitetura Completa do Life Tracker
O Life Tracker será estruturado como um monorepo usando Turborepo, com uma arquitetura modular que permitirá o desenvolvimento incremental dos diferentes módulos de vida. Aqui está como a estrutura completa do projeto ficará, incluindo o InvestTracker refatorado e os novos módulos.
Estrutura do Monorepo
Copylife-tracker/
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

Copylife-tracker/
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

Integração com o Dashboard Central
O dashboard central será responsável por unificar todos os módulos:
Copyapps/dashboard/
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
Módulo Knowledge Tracker (Exemplo de novo módulo)
Copyapps/knowledge-tracker/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx           # Dashboard de conhecimento
│   │   ├── Resources.tsx           # Recursos de aprendizado
│   │   ├── Sessions.tsx            # Sessões de estudo
│   │   └── Progress.tsx            # Progresso em cursos/livros
│   │
│   ├── components/
│   │   ├── ResourceCard.tsx        # Card de recurso
│   │   ├── StudyTimer.tsx          # Temporizador de estudo
│   │   └── LearningPathChart.tsx   # Gráfico de caminho de aprendizado
│   │
│   ├── hooks/
│   │   ├── useResources.ts         # Gerenciamento de recursos
│   │   ├── useSessions.ts          # Sessões de estudo
│   │   └── useProgress.ts          # Progresso
│   │
│   └── index.tsx
│
├── tsconfig.json
└── package.json
Sistema de Metas Compartilhado
O sistema de metas será o principal ponto de integração entre os módulos:
Copypackages/goals/
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
Sistema de Analytics/Insights
O sistema de analytics será responsável por correlacionar dados entre módulos:
Copypackages/analytics/
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

> Utilize Briefing abaixo para entender as dependências que podemos usar no projeto, que consiste em um plano sustentável de desenvolvimento.

> Criar uma camada backend da aplicação usando GoLang para construção de APIS próprias que irão consumir os dados armazenados para mostrar no frontend, com os dados coletados de APIs e fontes externas que irá funcionar como um batch ou um watcher que irá alimentar a base de dados local Supabase e/ou MongoDB, 

> Fragmentados por módulos os apps expõe cada domain tem a sua responsabilidade única preservada

## Módulo Invest-tracker tem objetivo:
### Monitorar os preços de ações na bolsa brasileira API da B3 e criptomoedas usando Binance API,  

### Criar carteiras de investimentos baseados em ativos favoritos de forma inteligente de acordo com o estudo aplicado

### devo estar monitorando frequentemente e armazenando um histórico mensal, semanal e diário para tomada de decisão de compra/venda.

### Com base em informações do mercado para saber a relevância de cada fundo imobiliário ou ações. Objetivo para serem monitoração por um tempo e fazer estratégias de compra e venda

### Criar no dashboard uma lista de oportunidades custo/beneficio de oportunidade

### Criar notificações aos usuários mostrarão oportunidades com melhor momento para entrada nas operações compra e venda.

### Criar uma divisão para filtar na tela com opções: Oportunidades, Favoritos, Criptomoeadas, Ações e Fundos imobiliários,

### Simulações de estratégias que eu posso aplicar para fazer com que tenha boa performance nas operações gerando oportunidades,dentro de uma área de simulações segura onde eu posso escolher o ativo, verificar o momento ideal, fazer previsões ou estudos de possíveis cenários, fazendo algoritmos capazes de calcular possíveis variações de mercado e que tipo de estratégia mais adequado. 

### Monitoramento e aprendizado de máquina para investir automaticamente analisando o mercado e prevendo simulaçoes, dimensionando os alvos de saída da operação, para calcular os possíveis lucros das operações, antes de serem efetuados.

### Posteriormente poderá ser sincronizada com um Supabase, para fins de performance os dados serão provisionados em etapas para uma base de consulta em MongoDB localmente e depois sincronizados para Cloud provendo dados para aplicações mobile. (a principio tudo será local enquanto ambiente desenvolvimento) 


## Organize numa arquitetura limpa, organize o código com hooks, ui, view, models, components, separando cada estrutura com sua devida responsabilidade, afim de deixar o código bem simples e agradável de leitura, implementar usando SOLID design, e princípios do clean architecture.

### Escreva testes para os componentes e a lógica crítica estar sempre validada, utilize mocks ou stubs para facilitar a cobertura


# Plano de Desenvolvimento Equilibrado - Life Tracker
Aqui está um plano detalhado para desenvolver o sistema Life Tracker de forma equilibrada e metódica, organizando as entregas em fases incrementais.

Fase 1: Fundação (Dia 1)
Dias 1-2: Estrutura do Monorepo

Configurar Turborepo
Definir estrutura de pastas e convenções
Configurar CI/CD básico (GitHub Actions ou similar)
Implementar linting e formatação compartilhados

Dias 3-4: Migração do InvestTracker

Mover código do InvestTracker para a estrutura de monorepo
Adaptar arquivos de configuração (package.json, tsconfig.json)
Garantir que a aplicação funcione na nova estrutura
Criar primeiros pacotes compartilhados (UI e utils)

Entregável: InvestTracker funcional na estrutura de monorepo
Fase 2: Componentização (Dia 2)
Dias 5-6: Design System

Criar biblioteca de componentes de UI compartilhados
Implementar tokens de design (cores, tipografia, espaçamento)
Documentar componentes usando Storybook
Extrair componentes comuns do InvestTracker

Dias 7-8: Core Services

Desenvolver pacote de gerenciamento de estado (state)
Implementar serviços de autenticação básicos
Criar pacote de utilitários para data/tempo
Desenvolver serviço de persistência de dados

Entregável: Biblioteca de componentes e serviços compartilhados
Fase 3: Dashboard & Metas (Dia 3)
Dias 9-10: Dashboard Unificado

Criar aplicação dashboard básica
Implementar widgets para InvestTracker
Desenvolver layout da navegação principal
Preparar placeholders para módulos futuros

Dias 11-12: Sistema de Metas

Desenvolver entidades e repositórios para metas
Implementar componentes de visualização de metas
Criar hooks para gerenciamento de metas
Integrar metas com InvestTracker

Entregável: Dashboard funcional com sistema de metas integrado
Fase 4: Knowledge Tracker (Dia 4)
Dias 13-14: Estrutura Básica

Implementar entidades e modelos para recursos de aprendizado
Criar UI para cadastro e visualização de materiais de estudo
Desenvolver sistema de acompanhamento de progresso
Integrar com metas estabelecidas

Dias 15-16: Recursos Avançados

Implementar sistema de sessões de estudo com timer
Desenvolver histórico e estatísticas de aprendizado
Criar relatórios de progresso
Integrar com InvestTracker para orçamento educacional

Entregável: Módulo Knowledge Tracker funcional com integração financeira
Fase 5: Sistema de Analytics (Dia 5)
Dias 17-18: Framework de Análise

Desenvolver infraestrutura para coleta de dados
Implementar armazenamento de métricas
Criar componentes de visualização de dados
Desenvolver algoritmos de correlação simples

Dias 19-20: Insights Cross-Module

Implementar métricas cruzadas entre módulos
Criar dashboards de correlação
Desenvolver sistema de notificações baseadas em insights
Implementar recomendações iniciais

Entregável: Sistema de análise cruzada entre investimentos e conhecimento
Fase 6: Health Tracker (Dia 6)
Dias 21-22: Métricas de Saúde

Desenvolver entidades para dados de saúde
Criar UI para registro manual de métricas
Implementar gráficos de tendências
Integrar com sistema de metas

Dias 23-24: Integração e Expansão

Implementar conectores para serviços de saúde (APIs)
Desenvolver correlações com outros módulos
Criar sistema de lembretes de saúde
Integrar com aspectos financeiros (gastos com saúde)

Entregável: Módulo Health Tracker com visualização de tendências e correlações
Fase 7: Fitness Tracker (Dia 7)
Dias 25-26: Atividades e Treinos

Desenvolver modelos para exercícios e treinos
Criar UI para planejamento e registro de atividades
Implementar acompanhamento de progressão
Integrar com sistema de metas

Dias 27-28: Planos e Análises

Desenvolver sistema de planos de treino
Criar análises de desempenho
Implementar visualizações de progresso
Integrar com Health Tracker e outros módulos

Entregável: Módulo Fitness Tracker funcional com análises integradas
Fase 8: Nutrition Tracker (Dia 8)
Dias 29-30: Registro Alimentar

Implementar modelos para alimentos e refeições
Criar UI para registro de alimentação
Desenvolver cálculo de macronutrientes
Integrar com metas nutricionais

Dias 31-32: Planejamento e Análise

Desenvolver sistema de planejamento de refeições
Criar orçamento para alimentação (integração financeira)
Implementar análises nutricionais
Conectar com Health e Fitness Tracker

Entregável: Módulo Nutrition Tracker funcional com planejamento e análises
Fase 9: Gamificação e Engajamento (Dia 9)
Dias 33-34: Sistema de Recompensas

Implementar framework de gamificação
Criar sistema de conquistas
Desenvolver badges e recompensas virtuais
Integrar elementos gamificados em todos os módulos

Dias 35-36: Desafios e Engajamento

Desenvolver sistema de desafios multi-área
Criar notificações inteligentes
Implementar lembretes contextuais
Desenvolver feedback personalizado de progresso

Entregável: Sistema de gamificação implementado em todos os módulos
Fase 10: Integração Mobile e Refinamento (Dia 10)
Dias 37-38: Versão Mobile

Desenvolver layout responsivo ou app React Native
Criar versões mobile dos principais componentes
Implementar sincronização offline
Otimizar performance para dispositivos móveis

Dias 39-40: Refinamento e Polimento

Conduzir testes de usabilidade
Refinar fluxos de usuário
Otimizar performance geral
Melhorar integrações entre módulos

Entregável: Versão mobile funcional e sistema totalmente integrado
Princípios de Desenvolvimento
Durante todo o processo, adote estes princípios para garantir qualidade e consistência:

Desenvolvimento Incremental: Cada fase constrói sobre a anterior
Testabilidade: Escreva testes para componentes e lógica crítica
Documentação Contínua: Documente interfaces e decisões de design
Priorização de Valor: Foque nas funcionalidades que trazem maior impacto
Feedback Constante: Use o sistema enquanto o desenvolve
Refatoração Regular: Refine o código regularmente para evitar débito técnico
Design Consistente: Mantenha a experiência do usuário coesa entre módulos

Este plano permite que você construa gradualmente um sistema integrado enquanto obtém valor desde as primeiras fases, garantindo que eu possa começar a usar e se beneficiar do sistema mesmo durante seu desenvolvimento.

🌟 Visão Geral
Life Tracker é uma plataforma monorepo que unifica dados e métricas pessoais para oferecer uma visão holística do seu progresso. Ao invés de usar aplicativos isolados para cada aspecto da vida, o Life Tracker integra tudo em um único ecossistema, permitindo:

Visualização unificada do seu progresso em múltiplas áreas
Correlações e insights que mostram como cada aspecto afeta os outros
Planejamento integrado para metas financeiras, de saúde e conhecimento
Decisões equilibradas baseadas em dados completos, não isolados
Eficiência e foco graças à centralização de todas as informações

📊 Módulos Principais
InvestTracker
Monitore investimentos na B3 e criptomoedas, analise oportunidades, simule cenários e acompanhe o desempenho da sua carteira de forma inteligente.
Knowledge Tracker (Em desenvolvimento)
Acompanhe seu progresso em estudos, gerencie materiais de aprendizado, registre sessões de estudo produtivas e visualize seu crescimento intelectual.
Health Tracker (Planejado)
Monitore indicadores de saúde, acompanhe seu sono, níveis de energia e bem-estar geral, enquanto visualiza como sua saúde impacta outras áreas.
Fitness Tracker (Planejado)
Gerencie treinos, acompanhe progressão de exercícios, visualize métricas corporais e planeje seu desenvolvimento físico.
Nutrition Tracker (Planejado)
Acompanhe alimentação, planeje refeições equilibradas, monitore a ingestão de nutrientes e gerencie o orçamento alimentar.
🔄 Integrações Inteligentes
O que torna o Life Tracker único são as poderosas integrações entre módulos:

Finanças + Conhecimento: Avalie o ROI real de seus investimentos em educação
Saúde + Produtividade: Visualize como qualidade do sono afeta seu desempenho
Exercícios + Finanças: Entenda como investimentos em saúde geram economia a longo prazo
Nutrição + Energia: Correlacione alimentação com níveis de energia e produtividade
Metas Interconectadas: Crie objetivos que incorporam múltiplas dimensões da vida

🛠️ Tecnologias

Frontend: React, TypeScript, Tailwind CSS
Arquitetura: Monorepo com Turborepo
Estado: Zustand, React Context API
Visualização: Recharts, D3.js
Persistência: LocalStorage, Firebase/Supabase (planejado)

🚀 Roadmap
O Life Tracker está sendo desenvolvido em fases incrementais, cada uma adicionando funcionalidades valiosas ao ecossistema:

Fundação: InvestTracker como módulo inicial
Expansão: Dashboard unificado e sistema de metas
Conhecimento: Módulo de acompanhamento de estudos
Análise: Sistema de insights cruzados entre módulos
Saúde: Monitoramento de métricas de saúde e bem-estar
Fitness: Acompanhamento de atividades físicas
Nutrição: Planejamento e registro alimentar
Engajamento: Gamificação e sistema de recompensas
Mobilidade: Acesso via dispositivos móveis

💡 Filosofia
O Life Tracker é construído sobre a filosofia de que o desenvolvimento pessoal é um sistema integrado — progressos em uma área afetam positivamente as outras, criando um ciclo virtuoso de crescimento. Em vez de otimizar cada aspecto isoladamente, a plataforma incentiva uma visão holística e equilibrada.

"O todo é maior que a soma das partes." — Aristóteles
O Life Tracker transforma essa sabedoria em uma ferramenta prática para elevar cada dimensão da sua vida através de dados integrados, insights acionáveis e uma visão unificada do seu progresso pessoal.


Fluxo de Dados

Coleta de Dados: Cada módulo coleta dados específicos de seu domínio
Armazenamento Local: Dados são armazenados localmente e sincronizados quando necessário
Métricas Compartilhadas: Métricas relevantes são enviadas ao sistema de analytics
Correlações: O sistema de analytics identifica correlações entre métricas de diferentes módulos
Insights: Insights são gerados com base nas correlações
Notificações: Insights relevantes são enviados ao usuário como notificações
Metas: O sistema de metas é atualizado com base no progresso e insights

Principais Integrações
InvestTracker → Knowledge: Orçamento para educação, ROI de investimentos em conhecimento
Knowledge → Health: Tempo de estudo vs. métricas de saúde
Health → Fitness: Saúde geral vs. desempenho em exercícios
Fitness → Nutrition: Necessidades calóricas baseadas em atividade física
Nutrition → Health: Impacto da alimentação em métricas de saúde
Todos → Goals: Todos os módulos contribuem para o progresso em metas

Este design modular permite que você comece com o InvestTracker e adicione gradualmente novos módulos, enquanto mantém uma base sólida para integração entre eles. A arquitetura de pacotes compartilhados facilita a reutilização de código e a consistência entre os módulos.