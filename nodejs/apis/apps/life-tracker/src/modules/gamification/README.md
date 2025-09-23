# Sistema de Gamificação - Backend

Este módulo implementa o sistema de gamificação no backend do Life Tracker, fornecendo APIs para gerenciar pontos, conquistas e rankings.

## 🏗️ Arquitetura

### Estrutura do Módulo
```
gamification/
├── controllers/
│   └── gamification.controller.ts
├── services/
│   ├── gamification.service.ts
│   ├── points.service.ts
│   └── achievement.service.ts
├── schemas/
│   ├── gamification-profile.schema.ts
│   ├── achievement.schema.ts
│   ├── user-achievement.schema.ts
│   └── point-transaction.schema.ts
├── listeners/
│   └── habit.listener.ts
├── gamification.module.ts
└── README.md
```

### Schemas MongoDB

#### GamificationProfile
```typescript
{
  userId: string;
  totalPoints: number;
  level: number;
  pointsToNextLevel: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Achievement
```typescript
{
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  criteria: {
    type: 'STREAK' | 'POINTS' | 'HABIT_COUNT' | 'ROUTINE_COUNT';
    value: number;
  };
}
```

#### UserAchievement
```typescript
{
  userId: string;
  achievementId: string;
  unlockedAt: Date;
}
```

#### PointTransaction
```typescript
{
  userId: string;
  points: number;
  sourceType: 'HABIT_COMPLETION' | 'ROUTINE_COMPLETION' | 'ACHIEVEMENT' | 'BONUS';
  sourceId: string;
  description: string;
  createdAt: Date;
}
```

## 🚀 Endpoints da API

### GET /gamification/profile
Obtém o perfil de gamificação do usuário.

**Query Parameters:**
- `userId` (string, obrigatório): ID do usuário

**Resposta:**
```json
{
  "success": true,
  "data": {
    "userId": "user-123",
    "totalPoints": 1250,
    "level": 5,
    "pointsToNextLevel": 200,
    "hasProfile": true,
    "totalTransactions": 15,
    "todayPoints": 50
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /gamification/achievements
Obtém as conquistas do usuário com status de desbloqueio.

**Query Parameters:**
- `userId` (string, obrigatório): ID do usuário

**Resposta:**
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "achievementId": "first_habit",
        "name": "Primeiro Hábito",
        "description": "Complete seu primeiro hábito",
        "icon": "star",
        "criteria": { "type": "HABIT_COUNT", "value": 1 },
        "unlocked": true,
        "unlockedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "unlockedCount": 3,
    "totalCount": 7
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /gamification/leaderboard
Obtém o ranking de usuários.

**Query Parameters:**
- `period` (string, opcional): 'daily' | 'weekly' | 'monthly' | 'all' (padrão: 'all')

**Resposta:**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "userId": "user-1",
        "totalPoints": 1000,
        "level": 5,
        "position": 1
      }
    ],
    "totalUsers": 50,
    "period": "all"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST /gamification/transaction
Adiciona pontos para um usuário.

**Body:**
```json
{
  "userId": "user-123",
  "points": 25,
  "sourceType": "HABIT_COMPLETION",
  "sourceId": "habit-456",
  "description": "Completou o hábito: Beber água"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "profile": { /* perfil atualizado */ },
    "transaction": { /* transação criada */ },
    "newAchievements": [ /* conquistas desbloqueadas */ ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST /gamification/initialize-achievements
Inicializa as conquistas padrão do sistema.

**Resposta:**
```json
{
  "success": true,
  "data": [ /* conquistas criadas */ ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🎮 Sistema de Pontos

### Cálculo de Pontos
- **Hábito Completo**: 10 pontos (base)
- **Rotina Completa**: 25 pontos (base)
- **Multiplicadores de Dificuldade**:
  - Fácil: 1x
  - Médio: 1.5x
  - Difícil: 2x

### Níveis
- **Pontos por Nível**: 100 pontos
- **Fórmula**: `nível = Math.floor(pontos / 100) + 1`

## 🏆 Conquistas

### Conquistas Padrão
1. **Primeiro Hábito** - Complete 1 hábito
2. **Série de 7 Dias** - Complete um hábito por 7 dias seguidos
3. **Mil Pontos** - Acumule 1000 pontos
4. **Mestre das Rotinas** - Complete 10 rotinas
5. **Mestre dos Hábitos** - Complete 50 hábitos
6. **Mestre da Consistência** - Complete um hábito por 30 dias seguidos
7. **Lenda dos Pontos** - Acumule 5000 pontos

### Tipos de Critérios
- **STREAK**: Dias consecutivos
- **POINTS**: Total de pontos
- **HABIT_COUNT**: Número de hábitos completados
- **ROUTINE_COUNT**: Número de rotinas completadas

## 🔄 Sistema de Eventos

### Evento: habit.completed
```typescript
interface HabitCompletedEvent {
  userId: string;
  habitId: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  streak?: number;
  habitName?: string;
}
```

O `HabitListener` escuta este evento e:
1. Calcula pontos baseado na dificuldade
2. Adiciona pontos ao perfil do usuário
3. Registra a transação
4. Verifica conquistas desbloqueadas

## 🧪 Testes

### Testes de Contrato
```bash
# Executar testes de contrato
npm test tests/contract/gamification.profile.test.ts
npm test tests/contract/gamification.achievements.test.ts
npm test tests/contract/gamification.leaderboard.test.ts
```

### Testes de Integração
```bash
# Executar testes de integração
npm test tests/integration/gamification.flow.test.ts
```

## 🚀 Inicialização

### Script de Inicialização
```bash
# Executar script para criar conquistas padrão
node scripts/initialize-gamification.js
```

### Endpoint de Inicialização
```bash
# Via API
POST /gamification/initialize-achievements
```

## 🔧 Configuração

### Variáveis de Ambiente
```env
MONGODB_URI=mongodb://localhost:27017/life-tracker
```

### Dependências
- `@nestjs/mongoose` - Integração com MongoDB
- `@nestjs/event-emitter` - Sistema de eventos
- `mongoose` - ODM para MongoDB

## 📊 Monitoramento

### Logs
- Pontos adicionados: `console.log`
- Conquistas desbloqueadas: `console.log`
- Erros: `console.error`

### Métricas
- Total de usuários com perfil
- Total de transações por dia
- Conquistas mais desbloqueadas
- Ranking de usuários mais ativos

## 🔄 Integração com Outros Módulos

### HabitsModule
```typescript
// Emitir evento ao completar hábito
this.eventEmitter.emit('habit.completed', {
  userId,
  habitId,
  difficulty: 'medium',
  habitName: 'Beber água',
});
```

### RoutinesModule
```typescript
// Emitir evento ao completar rotina
this.eventEmitter.emit('routine.completed', {
  userId,
  routineId,
  difficulty: 'hard',
  routineName: 'Exercícios matinais',
});
```

## 🚀 Próximos Passos

1. **Autenticação**: Implementar guards de autenticação
2. **Cache**: Implementar cache para rankings
3. **Notificações**: Sistema de notificações em tempo real
4. **Analytics**: Métricas avançadas de gamificação
5. **Badges**: Sistema de badges visuais
6. **Desafios**: Desafios semanais/mensais

## 📝 Notas de Implementação

- Todos os endpoints retornam `ApiResponse<T>`
- Validação de entrada em todos os endpoints
- Tratamento de erros consistente
- Logs para debugging
- Testes de contrato e integração
- Documentação completa da API
