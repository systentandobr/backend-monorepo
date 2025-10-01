# Especificação de Funcionalidade: [NOME DA FUNCIONALIDADE]

**Branch da Funcionalidade**: `[###-nome-da-funcionalidade]`  
**Criado**: [DATA]  
**Status**: Rascunho  
**Entrada**: Descrição do usuário: "$ARGUMENTS"

## Fluxo de Execução (principal)

```
1. Analisar descrição do usuário da Entrada
   → Se vazio: ERRO "Nenhuma descrição de funcionalidade fornecida"
2. Extrair conceitos-chave da descrição
   → Identificar: atores, ações, dados, restrições
3. Para cada aspecto não claro:
   → Marcar com [PRECISA ESCLARECIMENTO: pergunta específica]
4. Preencher seção Cenários de Usuário e Testes
   → Se não há fluxo de usuário claro: ERRO "Não é possível determinar cenários de usuário"
5. Gerar Requisitos Funcionais
   → Cada requisito deve ser testável
   → Marcar requisitos ambíguos
6. Identificar Entidades-Chave (se houver dados envolvidos)
7. Executar Lista de Verificação
   → Se houver [PRECISA ESCLARECIMENTO]: AVISO "Especificação tem incertezas"
   → Se detalhes de implementação encontrados: ERRO "Remover detalhes técnicos"
8. Retornar: SUCESSO (especificação pronta para planejamento)
```

---

## ⚡ Diretrizes Rápidas

- ✅ Foque no QUE os usuários precisam e POR QUÊ
- ❌ Evite COMO implementar (sem stack tecnológico, APIs, estrutura de código)
- 👥 Escrito para stakeholders de negócio, não desenvolvedores

### Requisitos de Seção

- **Seções obrigatórias**: Devem ser completadas para toda funcionalidade
- **Seções opcionais**: Incluir apenas quando relevante para a funcionalidade
- Quando uma seção não se aplica, remova-a completamente (não deixe como "N/A")

### Para Geração por IA

Ao criar esta especificação a partir de um prompt do usuário:

1. **Marque todas as ambiguidades**: Use [PRECISA ESCLARECIMENTO: pergunta
   específica] para qualquer suposição que você precisaria fazer
2. **Não adivinhe**: Se o prompt não especificar algo (ex: "sistema de login"
   sem método de autenticação), marque-o
3. **Pense como um testador**: Todo requisito vago deve falhar no item "testável
   e não ambíguo" da lista de verificação
4. **Áreas comumente subespecificadas**:
   - Tipos de usuário e permissões
   - Políticas de retenção/exclusão de dados
   - Metas de performance e escala
   - Comportamentos de tratamento de erro
   - Requisitos de integração
   - Necessidades de segurança/compliance

---

## Cenários de Usuário e Testes _(obrigatório)_

### História Principal do Usuário

[Descreva a jornada principal do usuário em linguagem simples]

### Cenários de Aceitação

1. **Dado** [estado inicial], **Quando** [ação], **Então** [resultado esperado]
2. **Dado** [estado inicial], **Quando** [ação], **Então** [resultado esperado]

### Casos Extremos

- O que acontece quando [condição de limite]?
- Como o sistema lida com [cenário de erro]?

## Requisitos _(obrigatório)_

### Requisitos Funcionais

- **RF-001**: Sistema DEVE [capacidade específica, ex: "permitir que usuários
  criem contas"]
- **RF-002**: Sistema DEVE [capacidade específica, ex: "validar endereços de
  email"]
- **RF-003**: Usuários DEVEM conseguir [interação-chave, ex: "redefinir sua
  senha"]
- **RF-004**: Sistema DEVE [requisito de dados, ex: "persistir preferências do
  usuário"]
- **RF-005**: Sistema DEVE [comportamento, ex: "registrar todos os eventos de
  segurança"]

_Exemplo de marcação de requisitos não claros:_

- **RF-006**: Sistema DEVE autenticar usuários via [PRECISA ESCLARECIMENTO:
  método de autenticação não especificado - email/senha, SSO, OAuth?]
- **RF-007**: Sistema DEVE reter dados do usuário por [PRECISA ESCLARECIMENTO:
  período de retenção não especificado]

### Entidades-Chave _(incluir se a funcionalidade envolve dados)_

- **[Entidade 1]**: [O que representa, atributos-chave sem implementação]
- **[Entidade 2]**: [O que representa, relacionamentos com outras entidades]

---

## Lista de Verificação de Revisão e Aceitação

_PORTA: Verificações automatizadas executadas durante main()_

### Qualidade do Conteúdo

- [ ] Sem detalhes de implementação (linguagens, frameworks, APIs)
- [ ] Focado no valor do usuário e necessidades de negócio
- [ ] Escrito para stakeholders não-técnicos
- [ ] Todas as seções obrigatórias completadas

### Completude dos Requisitos

- [ ] Nenhum marcador [PRECISA ESCLARECIMENTO] permanece
- [ ] Requisitos são testáveis e não ambíguos
- [ ] Critérios de sucesso são mensuráveis
- [ ] Escopo é claramente delimitado
- [ ] Dependências e suposições identificadas

---

## Contexto Específico do Life Tracker

_Para funcionalidades relacionadas ao sistema de rastreamento de vida_

### Estado Atual do Sistema

**✅ Backend Monorepo Implementado**:

- **Node.js APIs**: NestJS + MongoDB com módulos completos (analytics, business, financial, gamification, habits, health, productivity, routines)
- **Python Services**: FastAPI + PostgreSQL com Agno Framework para IA
- **Golang Services**: Gin + MongoDB com Clean Architecture
- **Estrutura**: Monorepo multi-linguagem com APIs RESTful
- **SYS-SEGURANÇA API**: Integração implementada com JWT remoto + fallback local
- **JWTGuard**: Validação de tokens com SYS-SEGURANÇA + fallback local
- **Middleware**: Segurança, rate limiting e auditoria

**✅ APIs Implementadas**:

- **Life Tracker API**: NestJS + MongoDB - `http://localhost:9090`
- **Módulos**: analytics, business, financial, gamification, habits, health, productivity, routines
- **Schemas**: MongoDB com validação implementada
- **APIs**: Endpoints RESTful para todos os domínios de vida
- **Autenticação**: JWT com SYS-SEGURANÇA API integrada

**✅ Agente Implementado**:

- **Onboarding**: FastAPI + PostgreSQL (Python) - `http://localhost:8000`
- **IA**: Agente de onboarding personalizado com Agno Framework
- **APIs**: Endpoints para onboarding com memória persistente
- **Ferramentas**: 7 ferramentas especializadas para onboarding

**✅ Invest Tracker Implementado**:

- **Golang**: Gin + MongoDB com Clean Architecture
- **Funcionalidades**: Coleta de dados financeiros, análise de ativos, simulação de portfólio
- **APIs**: Endpoints para dados financeiros e análises

**❌ Integrações Pendentes**:

- **Client Libraries**: Python e Golang para SYS-SEGURANÇA
- **API Keys**: Configuração de chaves para serviços externos
- **RBAC Completo**: Sistema de permissões granular
- **Monitoramento**: Observabilidade e métricas avançadas

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

### Domínios de Vida Disponíveis

- **Healthness**: Saúde, exames, dieta, suplementação
- **Investiments**: Portfólio, simulação, análise de risco
- **Business**: Oportunidades, projetos, hábitos empresariais
- **Habits**: Sistema de hábitos e rotinas integradas

**Integrações Backend** (já existe algumas implementações iremos acompanhar ou
incrementar a adoção dos recursos):

- **API Principal**: NestJS + MongoDB (Node.js) - [dev] `http://localhost:9090`
  [prod] `https://api-prd.systentando.com/`
- **Agente Onboarding**: FastAPI + PostgreSQL (Python) - [dev]
  `http://localhost:8000` [prod] ``
- **Autenticação**: JWT com refresh tokens
- **Endpoints**: RESTful APIs com validação Zod

**Funcionalidades Core**:

- Sistema de gamificação com pontos e tabuleiro
- Integração com agente IA para onboarding personalizado
- Múltiplos domínios de vida com metas integradas
- Sistema de hábitos com streaks e categorias
- Simulador de investimentos com cenários
- Interface responsiva com tema dark/light

### Padrões de Desenvolvimento

- **TDD**: Testes de contrato, integração e unitários
- **Arquitetura Limpa**: Separação de responsabilidades
- **Estado**: Zustand + TanStack Query
- **UI Components reutilizáveis**: HeroUI + Radix UI + Tailwind CSS
- **Validação**: Zod + React Hook Form
- **Testes**: Jest + React Testing Library + MSW

---

## Status de Execução

_Atualizado por main() durante o processamento_

- [ ] Descrição do usuário analisada
- [ ] Conceitos-chave extraídos
- [ ] Ambiguidades marcadas
- [ ] Cenários de usuário definidos
- [ ] Requisitos gerados
- [ ] Entidades identificadas
- [ ] Lista de verificação aprovada

---
