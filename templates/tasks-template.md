# Tarefas: [NOME DA FUNCIONALIDADE]

**Entrada**: Documentos de design de `/specs/[###-nome-da-funcionalidade]/`
**Pré-requisitos**: plan.md (obrigatório), research.md, data-model.md,
contracts/

## Fluxo de Execução (principal)

```
1. Carregar plan.md do diretório da funcionalidade
   → Se não encontrado: ERRO "Nenhum plano de implementação encontrado"
   → Extrair: stack tecnológico, bibliotecas, estrutura
2. Carregar documentos de design opcionais:
   → data-model.md: Extrair entidades → tarefas de modelo
   → contracts/: Cada arquivo → tarefa de teste de contrato
   → research.md: Extrair decisões → tarefas de setup
3. Gerar tarefas por categoria:
   → Setup: init do projeto, dependências, linting
   → Testes: testes de contrato, testes de integração
   → Core: modelos, serviços, comandos CLI
   → Integração: DB, middleware, logging
   → Polimento: testes unitários, performance, docs
4. Aplicar regras de tarefa:
   → Arquivos diferentes = marcar [P] para paralelo
   → Mesmo arquivo = sequencial (sem [P])
   → Testes antes da implementação (TDD)
5. Numerar tarefas sequencialmente (T001, T002...)
6. Gerar grafo de dependências
7. Criar exemplos de execução paralela
8. Validar completude das tarefas:
   → Todos os contratos têm testes?
   → Todas as entidades têm modelos?
   → Todos os endpoints implementados?
9. Retornar: SUCESSO (tarefas prontas para execução)
```

## Formato: `[ID] [P?] Descrição`

- **[P]**: Pode executar em paralelo (arquivos diferentes, sem dependências)
- Incluir caminhos exatos de arquivos nas descrições

## Convenções de Caminho

- **Life Tracker Frontend**: `react/life-tracker/src/`,
  `react/life-tracker/tests/`
- **Life Tracker Backend**:
  `backend-monorepo/nodejs/apis/apps/life-tracker/src/`
- **Agente Onboarding**:
  `backend-monorepo/python/life-tracker/agent-onboarding/src/`
- Caminhos mostrados abaixo assumem estrutura do Life Tracker - ajustar baseado
  na estrutura do plan.md

## Tarefas Específicas do Life Tracker

_Para funcionalidades relacionadas ao sistema de rastreamento de vida_

### Estado Atual do Sistema:

**✅ Backend Monorepo Implementado**:

- **Node.js APIs**: `nodejs/apis/apps/life-tracker/src/modules/` ✅
  - `analytics/` - Analytics e métricas ✅
  - `business/` - Oportunidades de negócio ✅
  - `financial/` - Dados financeiros ✅
  - `gamification/` - Sistema de gamificação ✅
  - `habits/` - Gerenciamento de hábitos ✅
  - `health/` - Dados de saúde ✅
  - `productivity/` - Metas de produtividade ✅
  - `routines/` - Rotinas integradas ✅
- **SYS-SEGURANÇA**: Integração implementada ✅
  - `guards/jwt-auth.guard.ts` - JWTGuard com validação remota ✅
  - `services/jwt-validator.service.ts` - Validação com fallback ✅
  - `config/sys-seguranca.config.ts` - Configuração SYS-SEGURANÇA ✅
- **Python Services**: `python/life-tracker/agent-onboarding/` ✅
  - Agente IA com Agno Framework ✅
  - Memória persistente PostgreSQL ✅
  - Ferramentas especializadas ✅
- **Golang Services**: `golang/invest-tracker/` ✅
  - Clean Architecture implementada ✅
  - Coleta de dados financeiros ✅
  - Análise de ativos ✅

**❌ Integrações Pendentes**:

- Client libraries para Python e Golang ❌
- API Keys para serviços externos ❌
- RBAC completo (Role-Based Access Control) ❌
- Monitoramento e observabilidade ❌

### Tipos de Implementação:

- **NOVO_RECURSO**: Criar funcionalidade completamente nova
- **INTEGRACAO_BACKEND**: Conectar frontend existente com backend
- **EXPANSAO_FUNCIONALIDADE**: Expandir funcionalidade existente
- **CORRECAO_BUG**: Corrigir problemas em código existente

### Dependências Principais:

- **Backend**: NestJS, MongoDB, JWT, Zod
- **Agente**: FastAPI, PostgreSQL, Agno (IA)
- **Autenticação**: SYS-SEGURANÇA API, Client Libraries (Python, Node.js,
  Golang)
- **Testes**: Jest, React Testing Library, MSW

## Fase 3.1: Setup e Verificação

- [ ] T001 Verificar estrutura existente do projeto Life Tracker
- [ ] T002 [P] Verificar configuração ESLint, Prettier e Husky
- [ ] T003 [P] Verificar configuração Jest e React Testing Library
- [ ] T004 [P] Verificar configuração MSW para mock de APIs
- [ ] T005 [P] Verificar integração com agente de onboarding existente

## Fase 3.2: Análise de Recursos do Backend-Monorepo

- [ ] T006 [P] Analisar APIs existentes no backend-monorepo
- [ ] T007 [P] Mapear módulos e estruturas existentes
- [ ] T008 [P] Identificar schemas e validações disponíveis
- [ ] T009 [P] Verificar contratos e interfaces existentes
- [ ] T010 [P] Analisar integrações com SYS-SEGURANÇA API
- [ ] T011 [P] Documentar padrões de arquitetura utilizados

## Fase 3.3: Testes Primeiro (TDD) ⚠️ DEVE COMPLETAR ANTES DE 3.4

**CRÍTICO: Estes testes DEVEM ser escritos e DEVEM FALHAR antes de QUALQUER
implementação**

- [ ] T012 [P] Teste de contrato POST /api/habits em
      tests/contract/test_habits_post.ts
- [ ] T013 [P] Teste de contrato GET /api/health/progress em
      tests/contract/test_health_progress.ts
- [ ] T014 [P] Teste de contrato POST /api/gamification/points em
      tests/contract/test_gamification_points.ts
- [ ] T015 [P] Teste de integração SYS-SEGURANÇA em
      tests/integration/test_sys_seguranca.ts

## Fase 3.4: Implementação Core (APENAS após testes falharem)

- [ ] T016 [P] Atualizar Store Zustand para hábitos em src/store/habitStore.ts
- [ ] T017 [P] Atualizar Serviço de hábitos em
      src/services/habits/HabitService.ts
- [ ] T018 [P] Atualizar Hook useHabits em src/hooks/useHabits.ts
- [ ] T019 [P] Atualizar Componente HabitList em
      src/components/habit/HabitList.tsx
- [ ] T020 [P] Atualizar Página de hábitos em
      src/app/(dashboard)/habits/page.tsx
- [ ] T021 [P] Implementar validação de dados com Zod
- [ ] T022 [P] Implementar tratamento de erro e loading states

## Fase 3.5: Integração Backend

- [ ] T023 [P] Implementar módulo de gamificação em
      ../backend-monorepo/nodejs/apis/apps/life-tracker/src/modules/gamification/
- [ ] T024 [P] Implementar módulo de hábitos em
      ../backend-monorepo/nodejs/apis/apps/life-tracker/src/modules/habits/
- [ ] T025 [P] Implementar módulo de saúde em
      ../backend-monorepo/nodejs/apis/apps/life-tracker/src/modules/health/
- [ ] T026 [P] Implementar schemas MongoDB em
      ../backend-monorepo/nodejs/apis/apps/life-tracker/src/schemas/

## Fase 3.6: Integração SYS-SEGURANÇA

- [ ] T027 [P] Integrar com SYS-SEGURANÇA API (auth.systentando.com)
- [ ] T028 [P] Configurar client libraries para autenticação
- [ ] T029 [P] Implementar API Keys para serviços
- [ ] T030 [P] Implementar middleware de autenticação JWT
- [ ] T031 [P] Implementar sistema RBAC (Role-Based Access Control)

## Fase 3.7: Polimento

- [ ] T032 [P] Testes unitários para componentes em tests/components/
- [ ] T033 [P] Testes de performance com Lighthouse
- [ ] T034 [P] Atualizar documentação em docs/
- [ ] T035 Remover código duplicado
- [ ] T036 Executar testes E2E

## Dependências

- Análise de recursos (T006-T011) antes de tudo
- Testes (T012-T015) antes da implementação (T016-T022)
- T016 bloqueia T017, T023
- T017 bloqueia T018, T019
- T019 bloqueia T020
- T027 (SYS-SEGURANÇA) bloqueia T028, T029, T030, T031
- T028 (Client Libraries) bloqueia T030, T031
- Backend (T023-T026) antes de integração SYS-SEGURANÇA (T027-T031)
- Implementação antes do polimento (T032-T036)

## Exemplo Paralelo

```
# Lançar T006-T011 juntos (análise de recursos do backend-monorepo):
Tarefa: "Analisar APIs existentes no backend-monorepo"
Tarefa: "Mapear módulos e estruturas existentes"
Tarefa: "Identificar schemas e validações disponíveis"
Tarefa: "Verificar contratos e interfaces existentes"
Tarefa: "Analisar integrações com SYS-SEGURANÇA API"
Tarefa: "Documentar padrões de arquitetura utilizados"

# Lançar T012-T015 juntos (testes de contrato):
Tarefa: "Teste de contrato POST /api/habits em tests/contract/test_habits_post.ts"
Tarefa: "Teste de contrato GET /api/health/progress em tests/contract/test_health_progress.ts"
Tarefa: "Teste de contrato POST /api/gamification/points em tests/contract/test_gamification_points.ts"
Tarefa: "Teste de integração SYS-SEGURANÇA em tests/integration/test_sys_seguranca.ts"

# Lançar T016-T022 juntos (frontend - após testes):
Tarefa: "Atualizar Store Zustand para hábitos em src/store/habitStore.ts"
Tarefa: "Atualizar Serviço de hábitos em src/services/habits/HabitService.ts"
Tarefa: "Atualizar Hook useHabits em src/hooks/useHabits.ts"
Tarefa: "Atualizar Componente HabitList em src/components/habit/HabitList.tsx"
Tarefa: "Atualizar Página de hábitos em src/app/(dashboard)/habits/page.tsx"
Tarefa: "Implementar validação de dados com Zod"
Tarefa: "Implementar tratamento de erro e loading states"

# Lançar T023-T026 juntos (backend - após frontend):
Tarefa: "Implementar módulo de gamificação em ../backend-monorepo/nodejs/apis/apps/life-tracker/src/modules/gamification/"
Tarefa: "Implementar módulo de hábitos em ../backend-monorepo/nodejs/apis/apps/life-tracker/src/modules/habits/"
Tarefa: "Implementar módulo de saúde em ../backend-monorepo/nodejs/apis/apps/life-tracker/src/modules/health/"
Tarefa: "Implementar schemas MongoDB em ../backend-monorepo/nodejs/apis/apps/life-tracker/src/schemas/"

# Lançar T027-T031 juntos (integração SYS-SEGURANÇA - após backend):
Tarefa: "Integrar com SYS-SEGURANÇA API (auth.systentando.com)"
Tarefa: "Configurar client libraries para autenticação"
Tarefa: "Implementar API Keys para serviços"
Tarefa: "Implementar middleware de autenticação JWT"
Tarefa: "Implementar sistema RBAC (Role-Based Access Control)"
```

## Notas

- Tarefas [P] = arquivos diferentes, sem dependências
- Verificar que testes falham antes de implementar
- Commit após cada tarefa
- Evitar: tarefas vagas, conflitos de mesmo arquivo

## Regras de Geração de Tarefas

_Aplicadas durante execução de main()_

1. **Dos Contratos**:
   - Cada arquivo de contrato → tarefa de teste de contrato [P]
   - Cada endpoint → tarefa de implementação
2. **Do Modelo de Dados**:
   - Cada entidade → tarefa de criação de modelo [P]
   - Relacionamentos → tarefas de camada de serviço
3. **Das Histórias de Usuário**:
   - Cada história → teste de integração [P]
   - Cenários quickstart → tarefas de validação

4. **Ordenação**:
   - Setup → Testes → Modelos → Serviços → Endpoints → Polimento
   - Dependências bloqueiam execução paralela

## Lista de Verificação de Validação

_PORTA: Verificada por main() antes de retornar_

- [ ] Todos os contratos têm testes correspondentes
- [ ] Todas as entidades têm tarefas de modelo
- [ ] Todos os testes vêm antes da implementação
- [ ] Tarefas paralelas verdadeiramente independentes
- [ ] Cada tarefa especifica caminho exato do arquivo
- [ ] Nenhuma tarefa modifica mesmo arquivo que outra tarefa [P]
