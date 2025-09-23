# 🍃 Configuração e Uso do MongoDB - Life Tracker

Este documento explica como configurar e usar o MongoDB como banco de dados para o agente de onboarding do Life Tracker.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração](#configuração)
3. [Arquitetura](#arquitetura)
4. [Uso](#uso)
5. [Exemplos](#exemplos)
6. [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O MongoDB foi implementado como uma alternativa ao SQLAlchemy, seguindo os princípios SOLID e Arquitetura Limpa. A implementação permite trocar entre bancos de dados de forma transparente.

### ✅ Vantagens do MongoDB

- **Flexibilidade**: Estrutura de documentos flexível para dados não estruturados
- **Performance**: Otimizado para operações de leitura/escrita
- **Escalabilidade**: Suporte nativo a sharding e replicação
- **JSON Nativo**: Dados armazenados em formato JSON
- **Índices**: Suporte a índices complexos e geoespaciais

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Configure as seguintes variáveis no arquivo `.env`:

```bash
# Tipo de banco de dados
DATABASE_TYPE=mongodb

# Configurações do MongoDB
DATABASE_HOST=localhost
DATABASE_PORT=27017
DATABASE_NAME=backend-monorepo
DATABASE_USER=admin
DATABASE_PASSWORD=password

# URL completa (opcional, será gerada automaticamente)
DATABASE_URL_MONGODB=mongodb://admin:password@localhost:27017/backend-monorepo
```

### 2. Dependências

As dependências necessárias já estão no `requirements.txt`:

```txt
pymongo==4.10.1
motor==3.3.2  # Driver assíncrono para MongoDB
```

### 3. Instalação

```bash
# Instalar dependências
pip install -r requirements.txt

# Ou usando pnpm/yarn
pnpm install
```

## 🏗️ Arquitetura

### Factory Pattern

O projeto usa um factory pattern para seleção transparente de banco de dados:

```python
from services.database_factory import DatabaseFactory

# Cria automaticamente MongoDB ou SQLAlchemy baseado na configuração
db_service = await DatabaseFactory.create_and_connect_database()
```

### Estrutura de Coleções

O MongoDB organiza os dados nas seguintes coleções:

#### 1. `profile_analyses`
Armazena análises de perfil dos usuários:

```json
{
  "_id": "user_123",
  "user_id": "user_123",
  "profile_data": {
    "user_id": "user_123",
    "name": "João Silva",
    "age": 30,
    "occupation": "Desenvolvedor",
    "profile_type": "BALANCED"
  },
  "domain_priorities": {
    "HEALTH": 0.8,
    "CAREER": 0.7,
    "RELATIONSHIPS": 0.6
  },
  "key_insights": ["Precisa de mais exercício"],
  "recommended_focus": ["HEALTH", "CAREER"],
  "risk_factors": ["Sedentarismo"],
  "opportunities": ["Academia próxima"],
  "analysis_score": 75.5,
  "confidence_level": 0.85,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### 2. `user_plans`
Armazena planos gerados para os usuários:

```json
{
  "_id": "user_123",
  "user_id": "user_123",
  "plan_id": "plan_456",
  "template_match": {
    "template_name": "balanced_template",
    "match_score": 0.85,
    "customization_level": "medium"
  },
  "domains": {
    "HEALTH": {
      "goals": [
        {
          "id": "g1",
          "title": "Exercitar 3x por semana",
          "description": "Treino de força"
        }
      ],
      "habits": [
        {
          "id": "h1",
          "title": "Beber água",
          "description": "2L por dia"
        }
      ],
      "routines": [
        {
          "id": "r1",
          "title": "Treino matinal",
          "time": "07:00",
          "duration": 60
        }
      ]
    }
  },
  "integrated_goals": ["Melhorar saúde geral"],
  "daily_schedule": [...],
  "weekly_goals": ["3 treinos", "Beber água regularmente"],
  "customizations": {"workout_intensity": "moderate"},
  "metadata": {"version": "1.0", "created_by": "agent"},
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "expires_at": "2024-02-15T10:30:00Z"
}
```

#### 3. `onboarding_sessions`
Armazena sessões de onboarding:

```json
{
  "_id": "session_789",
  "user_id": "user_123",
  "status": "completed",
  "current_step": "plan_generated",
  "answers": {
    "question1": "Sim",
    "question2": "Não"
  },
  "profile_analysis_id": "user_123",
  "generated_plan_id": "plan_456",
  "started_at": "2024-01-15T10:00:00Z",
  "completed_at": "2024-01-15T10:30:00Z",
  "session_data": {
    "steps_completed": 5,
    "total_steps": 5
  }
}
```

### Índices

O MongoDB cria automaticamente os seguintes índices para otimizar consultas:

```javascript
// profile_analyses
db.profile_analyses.createIndex({"user_id": 1}, {unique: true})
db.profile_analyses.createIndex({"created_at": 1})

// user_plans
db.user_plans.createIndex({"user_id": 1}, {unique: true})
db.user_plans.createIndex({"plan_id": 1}, {unique: true})
db.user_plans.createIndex({"created_at": 1})

// onboarding_sessions
db.onboarding_sessions.createIndex({"user_id": 1}, {unique: true})
db.onboarding_sessions.createIndex({"status": 1})
db.onboarding_sessions.createIndex({"started_at": 1})
```

## 🚀 Uso

### 1. Uso Básico

```python
from services.database_factory import DatabaseFactory

async def main():
    # Criar e conectar ao banco
    db_service = await DatabaseFactory.create_and_connect_database()
    
    try:
        # Usar o banco normalmente
        analysis = await db_service.get_profile_analysis("user_123")
        if analysis:
            print(f"Score: {analysis.analysis_score}")
        
    finally:
        # Sempre desconectar
        await db_service.disconnect()
```

### 2. Operações CRUD

#### Salvar Análise de Perfil

```python
from models.schemas import ProfileAnalysis, UserProfile, UserProfileType, LifeDomain

# Criar dados
profile = UserProfile(
    user_id="user_123",
    name="João Silva",
    age=30,
    occupation="Desenvolvedor",
    profile_type=UserProfileType.BALANCED
)

analysis = ProfileAnalysis(
    user_id="user_123",
    profile=profile,
    domain_priorities={LifeDomain.HEALTH: 0.8},
    key_insights=["Precisa de exercício"],
    recommended_focus=[LifeDomain.HEALTH],
    risk_factors=["Sedentarismo"],
    opportunities=["Academia próxima"],
    analysis_score=75.5,
    confidence_level=0.85
)

# Salvar
await db_service.save_profile_analysis("user_123", analysis)
```

#### Recuperar Análise de Perfil

```python
analysis = await db_service.get_profile_analysis("user_123")
if analysis:
    print(f"Score: {analysis.analysis_score}")
    print(f"Insights: {analysis.key_insights}")
```

#### Salvar Plano

```python
from models.schemas import GeneratedPlan, TemplateMatch, LifeDomainData

plan = GeneratedPlan(
    user_id="user_123",
    plan_id="plan_456",
    template_match=TemplateMatch(
        template_name="balanced_template",
        match_score=0.85
    ),
    domains={},
    integrated_goals=["Melhorar saúde"],
    daily_schedule=[],
    weekly_goals=["3 treinos"],
    customizations={},
    metadata={"version": "1.0"}
)

await db_service.save_user_plan("user_123", plan)
```

#### Recuperar Plano

```python
plan = await db_service.get_user_plan("user_123")
if plan:
    print(f"Plano ID: {plan.plan_id}")
    print(f"Template: {plan.template_match.template_name}")
```

### 3. Operações Genéricas (MongoDB)

```python
# Buscar documentos
users = await db_service.execute(
    "find",
    "profile_analyses",
    {"analysis_score": {"$gt": 70}}
)

# Buscar um documento
user = await db_service.execute(
    "find_one",
    "profile_analyses",
    {"user_id": "user_123"}
)

# Inserir documento
result = await db_service.execute(
    "insert_one",
    "custom_collection",
    data={"name": "test", "value": 123}
)

# Atualizar documento
result = await db_service.execute(
    "update_one",
    "profile_analyses",
    {"user_id": "user_123"},
    {"analysis_score": 80.0}
)

# Deletar documento
result = await db_service.execute(
    "delete_one",
    "profile_analyses",
    {"user_id": "user_123"}
)
```

## 📝 Exemplos

### Exemplo Completo

Veja o arquivo `examples/mongodb_usage_example.py` para um exemplo completo de uso.

### Executar Exemplo

```bash
cd python/life-tracker/agent-onboarding
python examples/mongodb_usage_example.py
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão

```
ConnectionFailure: Could not connect to MongoDB
```

**Solução:**
- Verificar se o MongoDB está rodando
- Verificar credenciais no `.env`
- Verificar firewall/porta

#### 2. Erro de Autenticação

```
AuthenticationFailed: Authentication failed
```

**Solução:**
- Verificar usuário/senha no `.env`
- Verificar se o usuário tem permissões no banco

#### 3. Erro de Índice

```
DuplicateKeyError: E11000 duplicate key error
```

**Solução:**
- Verificar se o `user_id` já existe
- Usar `upsert=True` para atualizar automaticamente

#### 4. Erro de Import

```
ModuleNotFoundError: No module named 'motor'
```

**Solução:**
```bash
pip install motor==3.3.2
```

### Logs de Debug

Para ativar logs detalhados:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Verificar Conexão

```python
# Testar conexão
await db_service.client.admin.command('ping')
print("Conexão OK!")
```

## 🔄 Migração de Dados

### Do SQLAlchemy para MongoDB

```python
# Exemplo de migração
async def migrate_data():
    # Conectar aos dois bancos
    sql_db = DatabaseService()
    mongo_db = MongoDatabase()
    
    await sql_db.connect()
    await mongo_db.connect()
    
    try:
        # Migrar análises de perfil
        analyses = await sql_db.get_all_profile_analyses()
        for analysis in analyses:
            await mongo_db.save_profile_analysis(analysis.user_id, analysis)
        
        # Migrar planos
        plans = await sql_db.get_all_user_plans()
        for plan in plans:
            await mongo_db.save_user_plan(plan.user_id, plan)
            
    finally:
        await sql_db.disconnect()
        await mongo_db.disconnect()
```

## 📊 Monitoramento

### Métricas Importantes

- **Tempo de resposta**: < 100ms para consultas simples
- **Throughput**: > 1000 operações/segundo
- **Uso de memória**: < 80% da RAM disponível
- **Espaço em disco**: Monitorar crescimento

### Comandos Úteis

```javascript
// Ver estatísticas do banco
db.stats()

// Ver estatísticas das coleções
db.profile_analyses.stats()
db.user_plans.stats()
db.onboarding_sessions.stats()

// Ver índices
db.profile_analyses.getIndexes()

// Ver queries lentas
db.getProfilingStatus()
db.setProfilingLevel(1, 100)  // Log queries > 100ms
```

## 🎯 Próximos Passos

1. **Implementar cache**: Redis para consultas frequentes
2. **Adicionar backup**: Scripts automáticos de backup
3. **Monitoramento**: Integração com Prometheus/Grafana
4. **Sharding**: Para escalabilidade horizontal
5. **Replicação**: Para alta disponibilidade

---

**Nota**: Esta implementação segue os princípios SOLID e Arquitetura Limpa, permitindo fácil manutenção e extensão do código.

