# 🍃 MongoDB - Life Tracker Agent

Implementação completa do MongoDB para o agente de onboarding do Life Tracker, seguindo os princípios SOLID e Arquitetura Limpa.

## 🚀 Quick Start

### 1. Configuração

Configure o `.env`:

```bash
DATABASE_TYPE=mongodb
DATABASE_HOST=localhost
DATABASE_PORT=27017
DATABASE_NAME=backend-monorepo
DATABASE_USER=admin
DATABASE_PASSWORD=password
```

### 2. Instalação

```bash
pip install -r requirements.txt
```

### 3. Uso Básico

```python
from services.database_factory import DatabaseFactory

# Cria automaticamente MongoDB ou SQLAlchemy baseado na configuração
db_service = await DatabaseFactory.create_and_connect_database()

# Usar normalmente - mesma interface para ambos os bancos
analysis = await db_service.get_profile_analysis("user_123")
await db_service.save_profile_analysis("user_123", analysis)
```

## 📁 Estrutura de Arquivos

```
services/
├── database.py          # SQLAlchemy implementation
├── mongo_database.py    # MongoDB implementation
└── database_factory.py  # Factory pattern

examples/
└── mongodb_usage_example.py  # Exemplo completo

tests/
└── test_mongodb.py      # Testes unitários

docs/
└── MONGODB_SETUP.md     # Documentação completa
```

## 🏗️ Arquitetura

### Factory Pattern

```python
# Seleção transparente de banco
db_service = await DatabaseFactory.create_and_connect_database()

# Tipo retornado baseado em DATABASE_TYPE no .env
print(type(db_service))  # MongoDatabase ou DatabaseService
```

### Interface Unificada

Ambas as implementações seguem a mesma interface:

```python
# Métodos comuns
await db_service.connect()
await db_service.disconnect()

# CRUD Operations
await db_service.save_profile_analysis(user_id, analysis)
await db_service.get_profile_analysis(user_id)
await db_service.save_user_plan(user_id, plan)
await db_service.get_user_plan(user_id)
await db_service.save_onboarding_session(session)
await db_service.get_onboarding_session(user_id)
await db_service.delete_user_data(user_id)
```

## 🗄️ Estrutura do MongoDB

### Coleções

- **`profile_analyses`**: Análises de perfil dos usuários
- **`user_plans`**: Planos gerados para os usuários  
- **`onboarding_sessions`**: Sessões de onboarding

### Índices Automáticos

```javascript
// Criados automaticamente na conexão
db.profile_analyses.createIndex({"user_id": 1}, {unique: true})
db.user_plans.createIndex({"user_id": 1}, {unique: true})
db.onboarding_sessions.createIndex({"user_id": 1}, {unique: true})
```

## 🧪 Testes

```bash
# Executar testes
pytest tests/test_mongodb.py -v

# Executar exemplo
python examples/mongodb_usage_example.py
```

## 🔧 Operações Específicas do MongoDB

```python
# Operações genéricas (apenas MongoDB)
users = await db_service.execute(
    "find",
    "profile_analyses", 
    {"analysis_score": {"$gt": 70}}
)

# Buscar com agregação
result = await db_service.execute(
    "aggregate",
    "profile_analyses",
    [
        {"$match": {"analysis_score": {"$gt": 70}}},
        {"$group": {"_id": "$profile_type", "count": {"$sum": 1}}}
    ]
)
```

## 📊 Vantagens

### ✅ MongoDB
- **Flexibilidade**: Estrutura de documentos flexível
- **Performance**: Otimizado para JSON
- **Escalabilidade**: Sharding nativo
- **Índices**: Suporte a índices complexos

### ✅ SQLAlchemy  
- **ACID**: Transações completas
- **Relacionamentos**: Joins complexos
- **Migrations**: Alembic para versionamento
- **Maturidade**: Ecossistema maduro

## 🔄 Migração

### Trocar entre Bancos

```bash
# Para MongoDB
DATABASE_TYPE=mongodb

# Para PostgreSQL/SQLAlchemy  
DATABASE_TYPE=postgresql
```

### Migrar Dados

```python
# Exemplo de migração
async def migrate_data():
    sql_db = DatabaseService()
    mongo_db = MongoDatabase()
    
    await sql_db.connect()
    await mongo_db.connect()
    
    # Migrar dados
    analyses = await sql_db.get_all_profile_analyses()
    for analysis in analyses:
        await mongo_db.save_profile_analysis(analysis.user_id, analysis)
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de conexão**: Verificar se MongoDB está rodando
2. **Erro de autenticação**: Verificar credenciais no `.env`
3. **Erro de índice**: Usar `upsert=True` para atualizações
4. **Erro de import**: Instalar `motor==3.3.2`

### Logs de Debug

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📚 Documentação Completa

Veja `docs/MONGODB_SETUP.md` para documentação detalhada.

## 🎯 Próximos Passos

1. **Cache**: Implementar Redis para consultas frequentes
2. **Backup**: Scripts automáticos de backup
3. **Monitoramento**: Prometheus/Grafana
4. **Sharding**: Para escalabilidade horizontal
5. **Replicação**: Para alta disponibilidade

---

**Nota**: Esta implementação segue os princípios SOLID e Arquitetura Limpa, permitindo fácil manutenção e extensão.

