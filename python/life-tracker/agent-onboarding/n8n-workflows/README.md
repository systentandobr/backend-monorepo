# Life Tracker Onboarding - Workflow n8n

Este repositório contém workflows n8n que replicam todas as funcionalidades do sistema de onboarding do Life Tracker, incluindo análise de perfil, geração de planos personalizados e integração com MongoDB.

## 📋 Funcionalidades Implementadas

### ✅ Rotas Principais
- **POST** `/onboarding/complete` - Processo completo de onboarding
- **POST** `/onboarding/analyze-profile` - Análise de perfil apenas
- **POST** `/onboarding/generate-plan` - Geração de plano personalizado
- **GET** `/onboarding/templates` - Lista templates disponíveis
- **GET** `/onboarding/user/:user_id/plan` - Recupera plano do usuário
- **GET** `/onboarding/user/:user_id/profile` - Recupera perfil do usuário
- **GET** `/onboarding/status` - Status do serviço

### ✅ Funcionalidades Avançadas
- **Validação de entrada** com tratamento de erros
- **Rate limiting** e throttling
- **Monitoramento de performance**
- **Integração com MongoDB** para persistência
- **Análise de perfil** com IA/ML
- **Geração de planos** personalizados
- **Templates** configuráveis

## 🚀 Configuração

### Pré-requisitos
1. **n8n** instalado e configurado
2. **MongoDB** acessível
3. **Node.js** para execução dos workflows

### Instalação

1. **Importar workflows:**
   ```bash
   # Importar workflow principal
   n8n import:workflow --file=onboarding-workflow.json
   
   # Importar workflow de tratamento de erros
   n8n import:workflow --file=error-handling-workflow.json
   ```

2. **Configurar MongoDB:**
   - Criar conexão MongoDB no n8n
   - Configurar collections: `profile_analyses`, `user_plans`
   - Testar conectividade

3. **Configurar webhooks:**
   - Ativar webhooks no n8n
   - Configurar URLs base (ex: `https://seu-n8n.com/webhook/`)
   - Testar endpoints

## 📊 Estrutura dos Workflows

### Workflow Principal (`onboarding-workflow.json`)

```mermaid
graph TD
    A[Webhook Complete] --> B[Route Switch]
    B --> C[Process Data]
    C --> D[Analyze Profile]
    D --> E[Match Template]
    E --> F[Generate Plan]
    F --> G[Save to MongoDB]
    G --> H[Response]
    
    I[Webhook Analyze] --> J[Process Analyze]
    J --> D
    
    K[Webhook Generate] --> L[Process Generate]
    L --> D
    
    M[Webhook Templates] --> N[List Templates]
    N --> O[Response Templates]
    
    P[Webhook User Plan] --> Q[Get from MongoDB]
    Q --> R[Response Plan]
    
    S[Webhook User Profile] --> T[Get from MongoDB]
    T --> U[Response Profile]
    
    V[Webhook Status] --> W[Service Status]
    W --> X[Response Status]
```

### Workflow de Tratamento de Erros (`error-handling-workflow.json`)

```mermaid
graph TD
    A[Validate Input] --> B[Validation Switch]
    B --> C[Validation Error Response]
    
    D[Error Handler] --> E[Error Response]
    
    F[Performance Monitor] --> G[Rate Limiter]
    G --> H[Rate Limit Switch]
    H --> I[Rate Limit Response]
```

## 🔧 Configuração Detalhada

### 1. Configuração MongoDB

```javascript
// Configuração da conexão MongoDB
{
  "host": "localhost",
  "port": 27017,
  "database": "life_tracker",
  "username": "your_username",
  "password": "your_password",
  "ssl": false
}
```

### 2. Configuração de Webhooks

```javascript
// URLs dos webhooks
const webhookUrls = {
  complete: "https://seu-n8n.com/webhook/onboarding-complete",
  analyze: "https://seu-n8n.com/webhook/onboarding-analyze",
  generate: "https://seu-n8n.com/webhook/onboarding-generate",
  templates: "https://seu-n8n.com/webhook/onboarding-templates",
  userPlan: "https://seu-n8n.com/webhook/onboarding-user-plan",
  userProfile: "https://seu-n8n.com/webhook/onboarding-user-profile",
  status: "https://seu-n8n.com/webhook/onboarding-status"
};
```

## 📝 Exemplos de Uso

### 1. Onboarding Completo

```bash
curl -X POST https://seu-n8n.com/webhook/onboarding-complete \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "session_id": "session_456",
    "questions_and_answers": [
      {
        "question_id": "concentration",
        "question_text": "Você acha difícil se concentrar em tarefas por longos períodos?",
        "question_type": "text",
        "question_category": "general",
        "answer": "medium-focus",
        "answered_at": "2024-01-15T10:30:00Z",
        "context": {
          "step": 15,
          "required": true
        }
      },
      {
        "question_id": "lifestyle",
        "question_text": "Quão satisfeito você está com seu estilo de vida atual?",
        "question_type": "text",
        "question_category": "general",
        "answer": "somewhat-satisfied",
        "answered_at": "2024-01-15T10:30:00Z",
        "context": {
          "step": 16,
          "required": true
        }
      },
      {
        "question_id": "energy",
        "question_text": "Como é seu nível de energia ao longo do dia?",
        "question_type": "text",
        "question_category": "general",
        "answer": "high-energy",
        "answered_at": "2024-01-15T10:30:00Z",
        "context": {
          "step": 17,
          "required": true
        }
      }
    ],
    "user_metadata": {
      "source": "frontend-onboarding",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  }'
```

**Resposta:**
```json
{
  "user_id": "user_123",
  "success": true,
  "message": "Onboarding completado com sucesso",
  "profile_analysis": {
    "user_id": "user_123",
    "profile": {
      "user_id": "user_123",
      "profile_type": "balanced",
      "energy_level": 8,
      "stress_level": 5,
      "wakeup_time": "07:00",
      "sleep_time": "23:00"
    },
    "domain_priorities": {
      "healthness": 50.0,
      "finances": 50.0,
      "business": 50.0,
      "productivity": 70.0,
      "learning": 50.0,
      "spirituality": 50.0,
      "relationships": 50.0
    },
    "key_insights": ["Foco em produtividade e organização"],
    "analysis_score": 55.7,
    "confidence_level": 90.0
  },
  "generated_plan": {
    "user_id": "user_123",
    "plan_id": "plan_1705312200000_abc123",
    "template_match": {
      "template_id": "balanced_template",
      "template_name": "Equilibrado",
      "match_score": 95.0
    },
    "domains": {
      "healthness": {
        "goals": [
          {
            "id": "maintain_health",
            "label": "Manter saúde equilibrada",
            "priority": 7,
            "target_date": "2024-02-15T10:30:00Z",
            "progress": 0.0
          }
        ],
        "habits": [
          {
            "id": "regular_exercise",
            "name": "Exercício regular",
            "target": "3x por semana",
            "difficulty": 5,
            "category": "healthness"
          }
        ]
      },
      "productivity": {
        "goals": [
          {
            "id": "work_life_balance",
            "label": "Equilíbrio trabalho-vida",
            "priority": 8,
            "target_date": "2024-02-15T10:30:00Z",
            "progress": 0.0
          }
        ],
        "habits": [
          {
            "id": "time_management",
            "name": "Gestão do tempo",
            "target": "Diário",
            "difficulty": 5,
            "category": "productivity"
          }
        ]
      }
    },
    "daily_schedule": [
      {
        "time": "07:00",
        "activity": "Café da manhã e planejamento do dia",
        "domain": "productivity",
        "duration_minutes": 30
      },
      {
        "time": "12:00",
        "activity": "Almoço e pausa",
        "domain": "healthness",
        "duration_minutes": 30
      },
      {
        "time": "18:00",
        "activity": "Exercício ou aprendizado",
        "domain": "healthness",
        "duration_minutes": 60
      }
    ],
    "weekly_goals": [
      {
        "id": "productivity_habits_week",
        "name": "Implementar hábitos de productivity",
        "domain": "productivity",
        "target": 1,
        "current": 0,
        "deadline": "2024-01-22T10:30:00Z"
      }
    ],
    "created_at": "2024-01-15T10:30:00Z"
  },
  "saved": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Análise de Perfil

```bash
curl -X POST https://seu-n8n.com/webhook/onboarding-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "answers": {
      "concentration": "high-focus",
      "lifestyle": "very-satisfied",
      "energy": "high-energy",
      "wakeup_time": "06:00",
      "sleep_time": "22:00",
      "personal_interests": ["technology", "fitness"],
      "financial_goals": ["passive-income"],
      "life_goals": ["financial-freedom"],
      "monthly_income": 5000,
      "monthly_savings": 1000,
      "time_availability": 10
    }
  }'
```

### 3. Listar Templates

```bash
curl -X GET https://seu-n8n.com/webhook/onboarding-templates
```

**Resposta:**
```json
{
  "templates": [
    {
      "id": "balanced_template",
      "name": "Equilibrado",
      "description": "Template para usuários com interesses equilibrados",
      "domains": ["healthness", "finances", "productivity", "learning"]
    },
    {
      "id": "health_focused_template",
      "name": "Foco em Saúde",
      "description": "Template para melhorar saúde e bem-estar",
      "domains": ["healthness", "productivity"]
    },
    {
      "id": "financial_focused_template",
      "name": "Foco em Finanças",
      "description": "Template para organização financeira",
      "domains": ["finances", "productivity"]
    }
  ],
  "count": 3
}
```

### 4. Recuperar Plano do Usuário

```bash
curl -X GET https://seu-n8n.com/webhook/onboarding-user-plan/user_123
```

### 5. Status do Serviço

```bash
curl -X GET https://seu-n8n.com/webhook/onboarding-status
```

**Resposta:**
```json
{
  "service": "onboarding-agent",
  "version": "1.0.0",
  "status": "operational",
  "features": {
    "agent_onboarding": true,
    "legacy_agent": false,
    "memory": false,
    "mongodb": true
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🔍 Tratamento de Erros

### Códigos de Erro

| Código | Descrição | Exemplo |
|--------|-----------|---------|
| 400 | Dados de entrada inválidos | Campos obrigatórios ausentes |
| 404 | Recurso não encontrado | Usuário/plano não existe |
| 429 | Rate limit excedido | Muitas requisições |
| 500 | Erro interno do servidor | Erro de processamento |
| 503 | Serviço indisponível | MongoDB offline |

### Exemplo de Erro

```json
{
  "error": "Validation failed",
  "details": [
    "user_id é obrigatório e deve ser uma string",
    "questions_and_answers é obrigatório e deve ser um array"
  ],
  "warnings": [
    "user_metadata.source não fornecido"
  ]
}
```

## 📈 Monitoramento e Métricas

### Métricas Coletadas

- **Tempo de processamento** por endpoint
- **Taxa de sucesso/erro** por usuário
- **Uso de memória** e CPU
- **Rate limiting** por usuário
- **Logs de erro** detalhados

### Exemplo de Métricas

```json
{
  "user_id": "user_123",
  "endpoint": "/onboarding/complete",
  "processing_time_ms": 1250,
  "success": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "memory_usage": {
    "rss": 45678912,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1234567
  },
  "cpu_usage": {
    "user": 1234567,
    "system": 234567
  }
}
```

## 🚀 Deploy e Produção

### 1. Configuração de Produção

```bash
# Variáveis de ambiente
export N8N_MONGODB_URL="mongodb://user:pass@host:port/database"
export N8N_WEBHOOK_URL="https://seu-n8n.com/webhook"
export N8N_ENCRYPTION_KEY="sua-chave-de-criptografia"
export N8N_LOG_LEVEL="info"
```

### 2. Docker Compose

```yaml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_MONGODB_URL=mongodb://mongo:27017/life_tracker
      - N8N_WEBHOOK_URL=https://seu-n8n.com/webhook
      - N8N_ENCRYPTION_KEY=sua-chave-de-criptografia
    volumes:
      - n8n_data:/home/node/.n8n
      - ./workflows:/workflows
    depends_on:
      - mongo

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

volumes:
  n8n_data:
  mongo_data:
```

### 3. Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: n8n-onboarding
spec:
  replicas: 3
  selector:
    matchLabels:
      app: n8n-onboarding
  template:
    metadata:
      labels:
        app: n8n-onboarding
    spec:
      containers:
      - name: n8n
        image: n8nio/n8n:latest
        ports:
        - containerPort: 5678
        env:
        - name: N8N_MONGODB_URL
          valueFrom:
            secretKeyRef:
              name: n8n-secrets
              key: mongodb-url
        - name: N8N_WEBHOOK_URL
          value: "https://seu-n8n.com/webhook"
---
apiVersion: v1
kind: Service
metadata:
  name: n8n-onboarding-service
spec:
  selector:
    app: n8n-onboarding
  ports:
  - port: 80
    targetPort: 5678
  type: LoadBalancer
```

## 🔧 Personalização

### Adicionando Novos Templates

```javascript
// Adicionar novo template no código
const newTemplate = {
  id: 'wellness_template',
  name: 'Bem-estar',
  description: 'Template focado em bem-estar e mindfulness',
  domains: {
    healthness: {
      goals: [
        { id: 'mindfulness', label: 'Prática de mindfulness', priority: 9 }
      ],
      habits: [
        { id: 'meditation', name: 'Meditação diária', target: 'Diário' }
      ]
    },
    spirituality: {
      goals: [
        { id: 'inner_peace', label: 'Paz interior', priority: 8 }
      ],
      habits: [
        { id: 'gratitude', name: 'Gratidão diária', target: 'Diário' }
      ]
    }
  },
  daily_schedule: [
    { time: '06:00', activity: 'Meditação matinal', domain: 'spirituality' },
    { time: '07:00', activity: 'Café da manhã mindful', domain: 'healthness' },
    { time: '21:00', activity: 'Reflexão e gratidão', domain: 'spirituality' }
  ]
};
```

### Customizando Análise de Perfil

```javascript
// Adicionar nova lógica de análise
if (data.life_goals && data.life_goals.includes('mindfulness')) {
  domain_priorities.spirituality += 40;
  domain_priorities.healthness += 20;
  profile_type = 'wellness_focused';
}
```

## 📚 Recursos Adicionais

### Documentação n8n
- [n8n Documentation](https://docs.n8n.io/)
- [Webhook Nodes](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-base.webhook/)
- [MongoDB Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mongoDb/)
- [Code Node](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-base.code/)

### Comunidade
- [n8n Community](https://community.n8n.io/)
- [GitHub Issues](https://github.com/n8n-io/n8n/issues)
- [Discord](https://discord.gg/n8n)

## 🤝 Contribuição

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Entre em contato via email: suporte@lifetracker.com
- Consulte a documentação n8n

---

**Desenvolvido com ❤️ usando n8n**
