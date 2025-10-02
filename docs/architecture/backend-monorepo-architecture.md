# Arquitetura do Backend Monorepo - Systentando

## Visão Geral

O backend do Systentando é implementado como um monorepo multi-linguagem que combina as melhores tecnologias para cada domínio específico, criando um ecossistema robusto e escalável.

## Princípios Arquiteturais

1. **Multi-Linguagem**: Cada linguagem otimizada para seu domínio específico
2. **Clean Architecture**: Separação clara de responsabilidades
3. **SOLID Principles**: Código maintível e extensível
4. **Microserviços**: Serviços independentes mas integrados
5. **API-First**: Design orientado a APIs RESTful
6. **Segurança Centralizada**: Autenticação e autorização unificadas

## Stack Tecnológico

### Node.js (NestJS + MongoDB)
- **Framework**: NestJS 10 + TypeScript 5
- **Banco de Dados**: MongoDB com Mongoose
- **Autenticação**: JWT + Passport
- **Documentação**: Swagger/OpenAPI
- **Validação**: class-validator + class-transformer
- **Testes**: Jest + Supertest

### Python (FastAPI + PostgreSQL)
- **Framework**: FastAPI + Pydantic
- **Banco de Dados**: PostgreSQL com SQLAlchemy
- **IA**: Agno Framework + OpenAI + Tavily
- **Validação**: Pydantic schemas
- **Testes**: pytest + pytest-asyncio

### Golang (Gin + MongoDB)
- **Framework**: Gin + Clean Architecture
- **Banco de Dados**: MongoDB com mongo-driver
- **Arquitetura**: SOLID + Domain-Driven Design
- **Testes**: go test + testify

## Estrutura do Monorepo

```
backend-monorepo/
├── nodejs/apis/                    # Node.js APIs (NestJS + MongoDB)
│   ├── apps/
│   │   ├── apis-monorepo/          # API Gateway principal
│   │   ├── life-tracker/           # Life Tracker API
│   │   │   ├── src/modules/        # Módulos implementados
│   │   │   │   ├── analytics/      # Analytics e métricas
│   │   │   │   ├── business/       # Oportunidades de negócio
│   │   │   │   ├── financial/      # Dados financeiros
│   │   │   │   ├── gamification/  # Sistema de gamificação
│   │   │   │   ├── habits/        # Gerenciamento de hábitos
│   │   │   │   ├── health/        # Dados de saúde
│   │   │   │   ├── productivity/  # Metas de produtividade
│   │   │   │   └── routines/      # Rotinas integradas
│   │   │   ├── schemas/            # Schemas MongoDB
│   │   │   └── tests/              # Testes de contrato
│   │   ├── sys-assistente-estudos/ # Assistente de estudos
│   │   ├── sys-pagamentos/         # Sistema de pagamentos
│   │   └── sys-produtos/           # Catálogo de produtos
│   └── libs/                       # Bibliotecas compartilhadas
├── python/                         # Python Services (FastAPI + PostgreSQL)
│   ├── life-tracker/agent-onboarding/ # Agente IA com Agno
│   │   ├── core/                   # Core do agente
│   │   ├── tools/                  # Ferramentas especializadas
│   │   ├── memory/                 # Memória PostgreSQL
│   │   └── api/                    # Endpoints FastAPI
│   └── meu-nutri/                  # Sistema de nutrição
├── golang/                         # Golang Services (Gin + MongoDB)
│   ├── invest-tracker/             # Rastreador de investimentos
│   │   ├── internal/               # Clean Architecture
│   │   ├── pkg/                    # Pacotes compartilhados
│   │   └── cmd/                    # Aplicações
│   └── zen-launcher/               # Launcher de bem-estar
└── docs/                           # Documentação do ecossistema
```

## Módulos Implementados

### Life Tracker API (Node.js)
- **Analytics**: Métricas e análises de dados
- **Business**: Oportunidades e projetos de negócio
- **Financial**: Dados financeiros e portfólio
- **Gamification**: Sistema de pontos, conquistas e progresso
- **Habits**: Gerenciamento de hábitos e rotinas
- **Health**: Dados de saúde e exames
- **Productivity**: Metas e objetivos de produtividade
- **Routines**: Rotinas integradas e personalizadas

### Agente de Onboarding (Python)
- **Agno Framework**: IA personalizada com memória persistente
- **Ferramentas Especializadas**: 7 ferramentas para onboarding
- **Memória PostgreSQL**: Histórico completo de interações
- **Integração OpenAI**: Processamento de linguagem natural
- **Tavily Integration**: Pesquisa web inteligente

### Invest Tracker (Golang)
- **Clean Architecture**: Separação de responsabilidades
- **Coleta de Dados**: APIs financeiras em tempo real
- **Análise Fundamental**: Avaliação de ativos
- **Simulação de Portfólio**: Cenários de investimento
- **Notificações**: Alertas personalizados

## Sistema de Gamificação

### Elementos Implementados
- **Pontos de Contribuição (CP)**: Recompensas por atividades
- **Pontos de Experiência (XP)**: Progressão de nível
- **Tokens de Equity (ET)**: Participação no sucesso
- **Conquistas**: Distintivos por habilidades
- **Desafios**: Missões com objetivos específicos
- **Quadros de Líderes**: Classificações motivacionais

### Níveis de Progressão
```
Nível 1: Iniciante (0-100 XP)
Nível 2: Aprendiz (101-300 XP)
Nível 3: Praticante (301-600 XP)
Nível 4: Especialista (601-1000 XP)
Nível 5: Mestre (1001-1500 XP)
Nível 6: Visionário (1501-2100 XP)
Nível 7: Pioneiro (2101-2800 XP)
Nível 8: Inovador (2801-3600 XP)
Nível 9: Virtuoso (3601-4500 XP)
Nível 10: Lenda (4501+ XP)
```

## Autenticação e Segurança

### SYS-SEGURANÇA API
- **URL**: https://auth.systentando.com
- **JWT Tokens**: Access (15min) + Refresh (7 dias)
- **RBAC**: Role-Based Access Control
- **API Keys**: Autenticação para serviços
- **2FA**: Autenticação de dois fatores
- **Client Libraries**: Python, Node.js, Golang

### Implementação de Segurança
- **Criptografia**: bcrypt para senhas
- **Rate Limiting**: Proteção contra abusos
- **Auditoria**: Logs de todas as operações
- **Compliance**: LGPD e GDPR
- **Blacklist**: Tokens revogados

## APIs e Integrações

### Life Tracker API
```
GET    /api/analytics/metrics
GET    /api/business/opportunities
POST   /api/financial/portfolio
GET    /api/gamification/points
POST   /api/habits
GET    /api/health/progress
POST   /api/productivity/goals
GET    /api/routines/integrated
```

### Agente de Onboarding
```
POST   /onboarding/complete
POST   /onboarding/analyze-profile
POST   /onboarding/generate-plan
GET    /onboarding/user/{id}/memory
GET    /onboarding/user/{id}/recommendations
```

### Invest Tracker
```
GET    /api/assets
POST   /api/portfolio/simulate
GET    /api/opportunities
POST   /api/alerts
```

## Bancos de Dados

### MongoDB (Node.js + Golang)
- **Dados Não-Relacionais**: Métricas, logs, cache
- **Schemas Flexíveis**: Estruturas adaptáveis
- **Performance**: Consultas otimizadas
- **Escalabilidade**: Sharding automático

### PostgreSQL (Python)
- **Dados Relacionais**: Usuários, sessões, memória
- **ACID**: Transações consistentes
- **Índices**: Performance otimizada
- **Backup**: Replicação automática

## Monitoramento e Observabilidade

### Métricas Implementadas
- **Performance**: Tempo de resposta, throughput
- **Erros**: Taxa de erro, logs estruturados
- **Uso**: Métricas de usuário e funcionalidades
- **Negócio**: KPIs específicos do domínio

### Ferramentas
- **Logs**: Estruturados em JSON
- **Métricas**: Prometheus + Grafana
- **Tracing**: Distributed tracing
- **Alertas**: Notificações automáticas

## Testes e Qualidade

### Estratégia de Testes
- **Unit Tests**: Cobertura mínima 80%
- **Integration Tests**: APIs e bancos de dados
- **Contract Tests**: Validação de contratos
- **E2E Tests**: Fluxos completos

### Ferramentas por Linguagem
- **Node.js**: Jest + Supertest
- **Python**: pytest + pytest-asyncio
- **Golang**: go test + testify

## Deploy e DevOps

### Containerização
- **Docker**: Imagens otimizadas
- **Multi-stage**: Builds eficientes
- **Health Checks**: Verificação de saúde
- **Secrets**: Gerenciamento seguro

### Orquestração
- **Kubernetes**: Escalabilidade automática
- **Helm**: Gerenciamento de releases
- **Ingress**: Roteamento inteligente
- **Service Mesh**: Comunicação segura

## Próximos Passos

### Fase 1: Consolidação (Q2 2025)
- Integração completa com SYS-SEGURANÇA API
- Implementação de client libraries
- Testes automatizados completos
- Documentação de APIs

### Fase 2: Expansão (Q3 2025)
- Sistema de notificações
- Analytics avançados
- Integrações externas
- Performance otimizada

### Fase 3: Escala (Q4 2025)
- Microserviços independentes
- Cache distribuído
- Load balancing
- Monitoramento avançado

## Conclusão

O backend monorepo do Systentando representa uma arquitetura moderna e robusta que combina as melhores práticas de desenvolvimento com tecnologias de ponta. A implementação multi-linguagem permite otimizar cada domínio específico enquanto mantém a integração e consistência do ecossistema como um todo.

A arquitetura atual suporta:
- ✅ **Escalabilidade**: Suporte a milhares de usuários simultâneos
- ✅ **Manutenibilidade**: Código limpo e bem estruturado
- ✅ **Extensibilidade**: Fácil adição de novos módulos
- ✅ **Segurança**: Autenticação e autorização robustas
- ✅ **Performance**: Resposta rápida e eficiente
- ✅ **Observabilidade**: Monitoramento completo do sistema
