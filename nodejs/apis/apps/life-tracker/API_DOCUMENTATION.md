# Life Tracker API - Documentação

## 📋 Visão Geral

A API do Life Tracker é um sistema backend desenvolvido em NestJS que consolida dados de múltiplos domínios (saúde, finanças, negócios, produtividade) para fornecer uma visão integrada do progresso do usuário.

## 🏗️ Arquitetura

### Módulos Principais

1. **Routines** - Gerenciamento de rotinas integradas
2. **Habits** - CRUD de hábitos e filtros
3. **Health** - Dados de saúde e exames
4. **Financial** - Portfólio e metas financeiras
5. **Business** - Oportunidades e projetos
6. **Productivity** - Metas de produtividade
7. **Analytics** - Análises e insights
8. **Gamification** - Sistema de pontuação

## 🚀 Endpoints Principais

### Health Check
```
GET /life-tracker/health
```
**Resposta:**
```json
{
  "status": "ok",
  "service": "life-tracker"
}
```

### Dashboard
```
GET /life-tracker/dashboard-summary
```
**Resposta:**
```json
{
  "success": true,
  "data": {
    "total_habits": 15,
    "completed_today": 8,
    "weekly_progress": 75,
    "healthness_progress": 80,
    "finances_progress": 65,
    "business_progress": 45,
    "productivity_progress": 70
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Progresso Entre Módulos
```
GET /life-tracker/cross-module-progress
```
**Resposta:**
```json
{
  "success": true,
  "data": {
    "healthness": {
      "progress": 80,
      "goals": [
        {
          "id": "renal_protection",
          "label": "Proteger a função renal",
          "priority": 10
        }
      ]
    },
    "finances": {
      "progress": 65,
      "goals": [
        {
          "id": "emergency_fund",
          "label": "Criar fundo de emergência",
          "priority": 9
        }
      ]
    },
    "business": {
      "progress": 45,
      "goals": [
        {
          "id": "business_plan",
          "label": "Desenvolver plano de negócios",
          "priority": 9
        }
      ]
    },
    "productivity": {
      "progress": 70,
      "goals": [
        {
          "id": "time_management",
          "label": "Melhorar gestão do tempo",
          "priority": 8
        }
      ]
    }
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## 🏥 Módulo de Rotinas

### Plano Integrado
```
GET /routines/integrated-plan
```
Carrega o plano completo integrado com todos os domínios.

### Hábitos por Domínio
```
GET /routines/habits/:domain
```
**Parâmetros:**
- `domain`: healthness, finances, business, productivity

### Metas Integradas
```
GET /routines/integrated-goals
```
Lista todas as metas que integram múltiplos domínios.

### Criar Hábito
```
POST /routines/habits
```
**Body:**
```json
{
  "name": "Hidratação controlada",
  "icon": "droplets",
  "color": "#2E86AB",
  "categoryId": 1,
  "description": "Respeitar limite diário de líquidos",
  "target": "Diário",
  "timeOfDay": "morning",
  "domain": "healthness"
}
```

### Completar Hábito
```
POST /routines/habits/complete
```
**Body:**
```json
{
  "habitId": "hidratacao",
  "domain": "healthness"
}
```

### Atualizar Progresso de Meta
```
PUT /routines/integrated-goals/:id/progress
```
**Body:**
```json
{
  "progress": 75
}
```

## 🏷️ Módulo de Hábitos

### Listar Todos os Hábitos
```
GET /habits
```

### Hábitos por Domínio
```
GET /habits/domain/:domain
```

### Hábitos por Categoria
```
GET /habits/category/:categoryId
```

### Filtrar Hábitos
```
GET /habits/filters?timeOfDay=morning&categoryId=1&completed=true
```

### Criar Hábito
```
POST /habits
```

### Atualizar Hábito
```
PUT /habits/:id
```

### Deletar Hábito
```
DELETE /habits/:id
```

### Alternar Hábito
```
POST /habits/:id/toggle
```

### Estatísticas
```
GET /habits/stats
```

## 🏥 Módulo de Saúde

### Carregar Plano de Saúde
```
POST /health/analytics/load
```

### Atualizar Progresso
```
POST /health/analytics/progress
```

### Marcar Refeição
```
POST /health/analytics/meals/mark
```

## 💰 Módulo Financeiro

### Resumo do Portfólio
```
GET /financial/portfolio
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Database
USER_DB=your_username
PASS_DB=your_password
HOST_DB=your_mongodb_host

# API
PORT=3001
NODE_ENV=development
```

### Docker

```bash
# Construir imagem
docker build -t life-tracker-api .

# Executar container
docker run -p 3001:3001 life-tracker-api
```

## 📊 Estrutura de Dados

### Tipos Principais

#### Habit
```typescript
interface Habit {
  id: string;
  name: string;
  icon: string;
  color?: string;
  categoryId: number;
  description?: string;
  target?: string;
  streak: number;
  completed: boolean;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'all';
  createdAt: string;
  updatedAt: string;
  domain?: string;
}
```

#### IntegratedRoutine
```typescript
interface IntegratedRoutine {
  schema_version: string;
  generated_at: string;
  locale: string;
  user_profile: UserProfile;
  domains: { [domain: string]: Domain };
  integrated_goals: IntegratedGoal[];
  routines: { daily_schedule: DailyRoutine[] };
  ui_hints: { colors: {}, icons: {} };
}
```

## 🎯 Casos de Uso

### 1. Dashboard Principal
- **Endpoint:** `GET /life-tracker/dashboard-summary`
- **Uso:** Carregar resumo geral para a página principal
- **Dados:** Total de hábitos, completados hoje, progresso semanal

### 2. Filtros de Hábitos
- **Endpoint:** `GET /habits/filters`
- **Uso:** Filtrar hábitos por período, categoria e status
- **Parâmetros:** timeOfDay, categoryId, completed

### 3. Progresso Entre Módulos
- **Endpoint:** `GET /life-tracker/cross-module-progress`
- **Uso:** Mostrar progresso integrado entre domínios
- **Dados:** Progresso e metas de cada domínio

### 4. Completar Hábito
- **Endpoint:** `POST /habits/:id/toggle`
- **Uso:** Marcar/desmarcar hábito como completo
- **Atualiza:** streak, completed, updatedAt

### 5. Plano Integrado
- **Endpoint:** `GET /routines/integrated-plan`
- **Uso:** Carregar dados completos do plano
- **Dados:** Todos os domínios, hábitos, metas e configurações

## 🔄 Integração com Frontend

### Exemplo de Uso no React

```typescript
// Carregar dados do dashboard
const loadDashboardData = async () => {
  const response = await fetch('/api/life-tracker/dashboard-summary');
  const data = await response.json();
  return data;
};

// Filtrar hábitos
const filterHabits = async (filters: any) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/habits/filters?${params}`);
  const data = await response.json();
  return data;
};

// Completar hábito
const toggleHabit = async (habitId: string) => {
  const response = await fetch(`/api/habits/${habitId}/toggle`, {
    method: 'POST',
  });
  const data = await response.json();
  return data;
};
```

## 🚀 Deploy

### Desenvolvimento
```bash
npm install
npm run start:dev
```

### Produção
```bash
npm run build
npm run start:prod
```

### Docker
```bash
docker-compose up -d
```

## 📈 Monitoramento

### Health Check
- **Endpoint:** `/life-tracker/health`
- **Frequência:** A cada 30 segundos
- **Alertas:** Status diferente de "ok"

### Logs
- **Nível:** INFO, WARN, ERROR
- **Formato:** JSON
- **Rotação:** Diária

## 🔒 Segurança

### Autenticação
- JWT tokens
- Middleware de autenticação
- Validação de permissões

### Validação
- DTOs com class-validator
- Sanitização de inputs
- Rate limiting

## 📝 Próximos Passos

1. **Implementar autenticação JWT**
2. **Adicionar cache Redis**
3. **Implementar WebSockets para atualizações em tempo real**
4. **Adicionar testes unitários e de integração**
5. **Implementar sistema de notificações**
6. **Adicionar analytics avançados**
7. **Implementar backup automático**
8. **Adicionar documentação Swagger** 