# Plano de Implementação: [FUNCIONALIDADE]

**Branch**: `[###-nome-da-funcionalidade]` | **Data**: [DATA] |
**Especificação**: [link] **Entrada**: Especificação de funcionalidade de
`/specs/[###-nome-da-funcionalidade]/spec.md`

## Fluxo de Execução (escopo do comando /plan)

```
1. Carregar especificação de funcionalidade do caminho de Entrada
   → Se não encontrado: ERRO "Nenhuma especificação de funcionalidade em {path}"
2. Preencher Contexto Técnico (procurar por PRECISA ESCLARECIMENTO)
   → Detectar Tipo de Projeto do contexto (web=frontend+backend, mobile=app+api, desktop=app+services)
   → Definir Decisão de Estrutura baseada no tipo de projeto
3. Avaliar seção Verificação Constitucional abaixo
   → Se violações existirem: Documentar em Rastreamento de Complexidade
   → Se nenhuma justificativa possível: ERRO "Simplifique abordagem primeiro"
   → Atualizar Rastreamento de Progresso: Verificação Constitucional Inicial
4. Executar Fase 0 → research.md
   → Se PRECISA ESCLARECIMENTO permanecer: ERRO "Resolva incógnitas"
5. Executar Fase 1 → contratos, data-model.md, quickstart.md, arquivo de template específico do agente (ex: `CLAUDE.md` para Claude Code, `.github/copilot-instructions.md` para GitHub Copilot, ou `GEMINI.md` para Gemini CLI).
6. Re-avaliar seção Verificação Constitucional
   → Se novas violações: Refatorar design, retornar à Fase 1
   → Atualizar Rastreamento de Progresso: Verificação Constitucional Pós-Design
7. Planejar Fase 2 → Descrever abordagem de geração de tarefas (NÃO criar tasks.md)
8. PARAR - Pronto para comando /tasks
```

**IMPORTANTE**: O comando /plan PARA no passo 7. Fases 2-4 são executadas por
outros comandos:

- Fase 2: comando /tasks cria tasks.md
- Fase 3-4: Execução de implementação (manual ou via ferramentas)

## Resumo

[Extrair da especificação de funcionalidade: requisito principal + abordagem
técnica da pesquisa]

## Contexto Técnico

**Backend Monorepo**: Microserviços multi-linguagem para ecossistema Systentando  
**Node.js Stack**: NestJS 10 + TypeScript 5 + MongoDB + JWT + Swagger  
**Python Stack**: FastAPI + PostgreSQL + Agno Framework + OpenAI  
**Golang Stack**: Gin + MongoDB + Clean Architecture + SOLID  
**Autenticação**: SYS-SEGURANÇA API integrada (JWT remoto + fallback local)  
**Testes**: Jest + pytest + go test + Supertest  
**Plataforma Alvo**: APIs RESTful para frontend e aplicações externas  
**Tipo de Projeto**: microserviços + monorepo backend  
**Metas de Performance**: <200ms resposta API, <100ms validação JWT, alta disponibilidade  
**Restrições**: Segurança robusta, escalabilidade horizontal, observabilidade completa  
**Escala/Escopo**: 10k+ usuários simultâneos, múltiplos domínios de vida, integração externa

**Planejamento** (`/plan`)

- Gerar plano de implementação considerando estado atual
- Definir arquitetura técnica
- Criar contratos de API
- Mapear integrações necessárias com SYS-SEGURANÇA API
- Considerar integração com backend NestJS + MongoDB
- Considerar integração com agente FastAPI + PostgreSQL

## Estado Atual do Sistema

### ✅ Backend Monorepo Implementado

**Node.js APIs (NestJS + MongoDB)**:
- ✅ Estrutura monorepo com múltiplas aplicações
- ✅ Life Tracker API com módulos: analytics, business, financial, gamification, habits, health, productivity, routines
- ✅ Schemas MongoDB implementados para todos os domínios
- ✅ Sistema de gamificação com pontos, conquistas e progresso
- ✅ APIs RESTful com Swagger/OpenAPI
- ✅ SYS-SEGURANÇA API integrada (JWT remoto + fallback local)
- ✅ JWTGuard com validação remota e local
- ✅ Middleware de segurança e rate limiting

**Python Services (FastAPI + PostgreSQL)**:
- ✅ Agente de Onboarding com Agno Framework
- ✅ Memória persistente PostgreSQL
- ✅ Ferramentas especializadas para onboarding
- ✅ Integração com OpenAI e Tavily
- ✅ Sistema de paths robusto

**Golang Services (Gin + MongoDB)**:
- ✅ Invest Tracker com Clean Architecture
- ✅ Coleta de dados financeiros
- ✅ Análise fundamental de ativos
- ✅ Simulação de portfólio

### ❌ Integrações Pendentes

**SYS-SEGURANÇA API**:
- ❌ Client libraries para Python e Golang
- ❌ API Keys para serviços externos
- ❌ Sistema RBAC completo (Role-Based Access Control)
- ❌ Integração com outros microserviços

**Outras Integrações**:
- ❌ Sistema de notificações
- ❌ Analytics e relatórios avançados
- ❌ Testes automatizados completos
- ❌ Documentação de APIs completa
- ❌ Monitoramento e observabilidade

### Análise de Recursos do Backend-Monorepo

_Para funcionalidades que requerem implementação de backend_

**Recursos Existentes a Analisar**:

- **APIs**: Endpoints já implementados que podem ser reutilizados
- **Módulos**: Estruturas de módulos existentes
- **Schemas**: Validações e modelos de dados existentes
- **Contratos**: Interfaces e contratos já definidos
- **Integrações**: Conexões com SYS-SEGURANÇA API existentes
- **Padrões**: Arquitetura e padrões de desenvolvimento utilizados

**Ponte de Integração**:

- Identificar recursos que podem ser reutilizados
- Mapear extensões necessárias para funcionalidades existentes
- Documentar adaptações necessárias
- Definir novos recursos que precisam ser criados

**Tipo de Implementação**: [NOVO_RECURSO | INTEGRACAO_BACKEND |
EXPANSAO_FUNCIONALIDADE | CORRECAO_BUG]

## Arquitetura de Segurança Centralizada

**SYS-SEGURANÇA API** (`https://auth.systentando.com`):

- **Autenticação JWT**: Access tokens (15min) + Refresh tokens (7 dias)
- **Sistema RBAC**: Role-Based Access Control com permissões granulares
- **API Keys**: Autenticação para serviços com controle de origem/IP
- **2FA**: Autenticação de dois fatores com TOTP
- **Dispositivos Confiáveis**: Gestão de dispositivos e sessões
- **Recuperação de Senha**: Sistema completo de recuperação
- **Client Libraries**: Python, Node.js, Golang para integração

**Integração com Life Tracker**:

- **Frontend**: Usar client library Node.js para autenticação
- **Backend NestJS**: Integrar com SYS-SEGURANÇA via client library
- **Agente Python**: Usar client library Python para autenticação
- **API Keys**: Configurar API Keys específicas para cada serviço

## Contexto Específico do Life Tracker

_Para funcionalidades relacionadas ao sistema de rastreamento de vida_

**Stack Frontend**:

- **Framework**: Next.js 15.2.2 com App Router
- **UI Library**: HeroUI (NextUI) + Radix UI
- **Estado**: Zustand + TanStack Query
- **Formulários**: React Hook Form + Zod
- **Estilização**: Tailwind CSS 4.0
- **Animações**: Framer Motion
- **Ícones**: Lucide React + Heroicons

**Integração Backend**:

- **API Principal**: NestJS + MongoDB (Node.js) - (dev) `http://localhost:9090`
  (prod) `https://api-prd.systentando.com`
- **Agente Onboarding**: FastAPI + PostgreSQL (Python) - (dev)
  `http://localhost:8000` (prod) `http://agents-ai.systentando.com`
- **Autenticação Centralizada**: SYS-SEGURANÇA API -
  `https://auth.systentando.com`
- **Client Libraries**: Python, Node.js, Golang para integração
- **Validação**: Zod schemas compartilhados

**Domínios de Vida**:

- **Healthness**: Saúde, exames, dieta, suplementação
- **Investiments**: Portfólio, simulação, análise de risco
- **Business**: Oportunidades, projetos, hábitos empresariais
- **Habits**: Sistema de hábitos e rotinas integradas

**Arquitetura de Módulos**:

- `src/app/` - App Router (rotas e layouts)
- `src/components/` - Componentes reutilizáveis
- `src/services/` - Camada de serviços e APIs
- `src/store/` - Stores Zustand para estado global
- `src/hooks/` - Custom hooks React
- `src/types/` - Definições TypeScript compartilhadas
- `src/utils/` - Utilitários e helpers

**Requisitos Específicos**:

- Sistema de gamificação com pontos e tabuleiro
- Integração com agente IA para onboarding personalizado
- Múltiplos domínios de vida com metas integradas
- Sistema de hábitos com streaks e categorias
- Simulador de investimentos com cenários
- Interface responsiva com tema dark/light
- PWA com funcionalidades offline

## Verificação Constitucional

_PORTA: Deve passar antes da pesquisa da Fase 0. Re-verificar após design da
Fase 1._

**Simplicidade**:

- Projetos: [#] (máx 3 - ex: api, cli, tests)
- Usando framework diretamente? (sem classes wrapper)
- Modelo de dados único? (sem DTOs a menos que serialização difira)
- Evitando padrões? (sem Repository/UoW sem necessidade comprovada)

**Arquitetura**:

- TODA funcionalidade como biblioteca? (sem código de app direto)
- Bibliotecas listadas: [nome + propósito para cada uma]
- CLI por biblioteca: [comandos com --help/--version/--format]
- Docs de biblioteca: formato llms.txt planejado?

**Testes (NÃO NEGOCIÁVEL)**:

- Ciclo RED-GREEN-Refactor aplicado? (teste DEVE falhar primeiro)
- Commits git mostram testes antes da implementação?
- Ordem: Contrato→Integração→E2E→Unit seguida estritamente?
- Dependências reais usadas? (DBs reais, não mocks)
- Testes de integração para: novas bibliotecas, mudanças de contrato, schemas
  compartilhados?
- PROIBIDO: Implementação antes do teste, pular fase RED

**Observabilidade**:

- Log estruturado incluído?
- Logs frontend → backend? (stream unificado)
- Contexto de erro suficiente?

**Versionamento**:

- Número de versão atribuído? (MAJOR.MINOR.BUILD)
- BUILD incrementa a cada mudança?
- Mudanças que quebram tratadas? (testes paralelos, plano de migração)

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```
specs/[###-funcionalidade]/
├── plan.md              # Este arquivo (saída do comando /plan)
├── research.md          # Saída da Fase 0 (comando /plan)
├── data-model.md        # Saída da Fase 1 (comando /plan)
├── quickstart.md        # Saída da Fase 1 (comando /plan)
├── contracts/           # Saída da Fase 1 (comando /plan)
└── tasks.md             # Saída da Fase 2 (comando /tasks - NÃO criado por /plan)
```

### Código Fonte (raiz do repositório)

```
# Backend Monorepo - Estrutura Multi-Linguagem ✅ IMPLEMENTADO

# Node.js APIs (NestJS + MongoDB) ✅ IMPLEMENTADO
nodejs/apis/
├── apps/
│   ├── apis-monorepo/          # API Gateway principal ✅
│   ├── life-tracker/          # Life Tracker API ✅
│   │   ├── src/modules/        # Módulos implementados ✅
│   │   │   ├── analytics/      # Analytics e métricas ✅
│   │   │   ├── business/       # Oportunidades de negócio ✅
│   │   │   ├── financial/      # Dados financeiros ✅
│   │   │   ├── gamification/   # Sistema de gamificação ✅
│   │   │   ├── habits/         # Gerenciamento de hábitos ✅
│   │   │   ├── health/         # Dados de saúde ✅
│   │   │   ├── productivity/   # Metas de produtividade ✅
│   │   │   └── routines/       # Rotinas integradas ✅
│   │   ├── schemas/            # Schemas MongoDB ✅
│   │   └── tests/              # Testes de contrato ✅
│   ├── sys-assistente-estudos/ # Assistente de estudos ✅
│   ├── sys-pagamentos/         # Sistema de pagamentos ✅
│   └── sys-produtos/           # Catálogo de produtos ✅
├── libs/                       # Bibliotecas compartilhadas ✅
└── tests/                      # Testes de integração ✅

# Python Services (FastAPI + PostgreSQL) ✅ IMPLEMENTADO
python/
├── life-tracker/
│   └── agent-onboarding/       # Agente IA com Agno ✅
│       ├── core/               # Core do agente ✅
│       ├── tools/              # Ferramentas especializadas ✅
│       ├── memory/             # Memória PostgreSQL ✅
│       └── api/                # Endpoints FastAPI ✅
└── meu-nutri/                  # Sistema de nutrição ✅

# Golang Services (Gin + MongoDB) ✅ IMPLEMENTADO
golang/
├── invest-tracker/             # Rastreador de investimentos ✅
│   ├── internal/               # Clean Architecture ✅
│   ├── pkg/                    # Pacotes compartilhados ✅
│   └── cmd/                    # Aplicações ✅
└── zen-launcher/               # Launcher de bem-estar ✅

# Documentação e Configuração ✅ IMPLEMENTADO
docs/                           # Documentação do ecossistema ✅
├── architecture/               # Arquitetura detalhada ✅
├── business/                  # Modelos de negócio ✅
├── gamification/              # Sistema de gamificação ✅
└── security/                  # SYS-SEGURANÇA architecture ✅
```

**Decisão de Estrutura**: microserviços backend - APIs RESTful para frontend e aplicações externas

## Fase 0: Esboço e Pesquisa

1. **Extrair incógnitas do Contexto Técnico** acima:
   - Para cada PRECISA ESCLARECIMENTO → tarefa de pesquisa
   - Para cada dependência → tarefa de melhores práticas
   - Para cada integração → tarefa de padrões

2. **Gerar e despachar agentes de pesquisa**:

   ```
   Para cada incógnita no Contexto Técnico:
     Tarefa: "Pesquisar {incógnita} para {contexto da funcionalidade}"
   Para cada escolha tecnológica:
     Tarefa: "Encontrar melhores práticas para {tech} em {domínio}"
   ```

3. **Consolidar descobertas** em `research.md` usando formato:
   - Decisão: [o que foi escolhido]
   - Justificativa: [por que escolhido]
   - Alternativas consideradas: [o que mais foi avaliado]

**Saída**: research.md com todos os PRECISA ESCLARECIMENTO resolvidos

## Fase 1: Design e Contratos

_Pré-requisitos: research.md completo_

1. **Extrair entidades da especificação de funcionalidade** → `data-model.md`:
   - Nome da entidade, campos, relacionamentos
   - Regras de validação dos requisitos
   - Transições de estado se aplicável

2. **Gerar contratos de API** dos requisitos funcionais:
   - Para cada ação do usuário → endpoint
   - Usar padrões REST/GraphQL padrão
   - Saída de schema OpenAPI/GraphQL para `/contracts/`

3. **Gerar testes de contrato** dos contratos:
   - Um arquivo de teste por endpoint
   - Assertar schemas de request/response
   - Testes devem falhar (sem implementação ainda)

4. **Extrair cenários de teste** das histórias de usuário:
   - Cada história → cenário de teste de integração
   - Teste quickstart = passos de validação da história

5. **Atualizar arquivo de agente incrementalmente** (operação O(1)):
   - Executar `/scripts/update-agent-context.sh [claude|gemini|copilot]` para
     seu assistente IA
   - Se existir: Adicionar apenas NOVA tech do plano atual
   - Preservar adições manuais entre marcadores
   - Atualizar mudanças recentes (manter últimas 3)
   - Manter abaixo de 150 linhas para eficiência de token
   - Saída para raiz do repositório

**Saída**: data-model.md, /contracts/\*, testes falhando, quickstart.md, arquivo
específico do agente

## Fase 2: Abordagem de Planejamento de Tarefas

_Esta seção descreve o que o comando /tasks fará - NÃO executar durante /plan_

**Estratégia de Geração de Tarefas**:

- Carregar `/templates/tasks-template.md` como base
- Gerar tarefas dos docs de design da Fase 1 (contratos, modelo de dados,
  quickstart)
- Cada contrato → tarefa de teste de contrato [P]
- Cada entidade → tarefa de criação de modelo [P]
- Cada história de usuário → tarefa de teste de integração
- Tarefas de implementação para fazer testes passarem

**Estratégia de Ordenação**:

- Ordem TDD: Testes antes da implementação
- Ordem de dependência: Modelos antes de serviços antes de UI
- Marcar [P] para execução paralela (arquivos independentes)

**Saída Estimada**: 25-30 tarefas numeradas e ordenadas em tasks.md

**IMPORTANTE**: Esta fase é executada pelo comando /tasks, NÃO por /plan

## Fase 3+: Implementação Futura

_Estas fases estão além do escopo do comando /plan_

**Fase 3**: Execução de tarefas (comando /tasks cria tasks.md)  
**Fase 4**: Implementação (executar tasks.md seguindo princípios
constitucionais)  
**Fase 5**: Validação (executar testes, executar quickstart.md, validação de
performance)

## Rastreamento de Complexidade

_Preencher APENAS se Verificação Constitucional tem violações que devem ser
justificadas_

| Violação                | Por Que Necessário    | Alternativa Mais Simples Rejeitada Porque  |
| ----------------------- | --------------------- | ------------------------------------------ |
| [ex: 4º projeto]        | [necessidade atual]   | [por que 3 projetos insuficientes]         |
| [ex: padrão Repository] | [problema específico] | [por que acesso direto ao DB insuficiente] |

## Rastreamento de Progresso

_Esta lista de verificação é atualizada durante o fluxo de execução_

**Status das Fases**:

- [ ] Fase 0: Pesquisa completa (comando /plan)
- [ ] Fase 1: Design completo (comando /plan)
- [ ] Fase 2: Planejamento de tarefas completo (comando /plan - descrever
      abordagem apenas)
- [ ] Fase 3: Tarefas geradas (comando /tasks)
- [ ] Fase 4: Implementação completa
- [ ] Fase 5: Validação aprovada

**Status das Portas**:

- [ ] Verificação Constitucional Inicial: APROVADO
- [ ] Verificação Constitucional Pós-Design: APROVADO
- [ ] Todos os PRECISA ESCLARECIMENTO resolvidos
- [ ] Desvios de complexidade documentados

---

_Baseado na Constituição v2.1.1 - Ver `/memory/constitution.md`_
