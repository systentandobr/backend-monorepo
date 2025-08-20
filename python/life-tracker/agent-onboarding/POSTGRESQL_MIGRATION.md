# Migração para PostgreSQL - Agno Framework

## 🚨 Problema Atual

O framework Agno não possui suporte nativo para PostgreSQL na versão atual. O erro ocorre porque a classe `PgMemoryDb` não aceita o argumento `connection_string`.

### Erro Encontrado:
```
TypeError: PgMemoryDb.__init__() got an unexpected keyword argument 'connection_string'
```

## 🔧 Solução Temporária

### Implementação Atual (SQLite)

Por enquanto, estamos usando **SQLite** como banco de dados para a memória do Agno:

```python
from agno.memory.v2.memory import Memory
from agno.memory.v2.db.sqlite import SqliteMemoryDb

self.memory = Memory(
    model=OpenAIChat(id="gpt-4"),
    db=SqliteMemoryDb(
        table_name="user_memories",
        db_file="data/agno_memory.db"
    ),
)
```

### Vantagens da Solução Temporária:
- ✅ Funciona imediatamente
- ✅ Compatível com a versão atual do Agno
- ✅ Dados persistidos localmente
- ✅ Fácil de testar e desenvolver

### Limitações:
- ❌ Não é PostgreSQL (não atende ao requisito original)
- ❌ Não suporta múltiplas instâncias simultâneas
- ❌ Limitações de concorrência
- ❌ Não integrado com o banco principal

## 🎯 Soluções Futuras

### Opção 1: Aguardar Suporte Oficial do Agno

O framework Agno pode adicionar suporte oficial para PostgreSQL em versões futuras.

**Monitorar:**
- [GitHub do Agno](https://github.com/agno-ai/agno)
- Releases e documentação oficial
- Issues relacionadas ao PostgreSQL

### Opção 2: Implementar Adaptador Customizado

Criar um adaptador personalizado que implemente a interface do Agno usando PostgreSQL:

```python
class CustomPostgresMemoryDb:
    def __init__(self, connection_string: str, table_name: str):
        self.connection_string = connection_string
        self.table_name = table_name
    
    async def add_memory(self, content: str, metadata: dict):
        # Implementar lógica PostgreSQL
        pass
    
    async def search_memories(self, query: str, limit: int = 10):
        # Implementar busca PostgreSQL
        pass
```

### Opção 3: Usar Outro Framework de Memória

Considerar alternativas como:
- **LangChain Memory** com PostgreSQL
- **Custom Memory Implementation**
- **Redis + PostgreSQL Hybrid**

## 🔄 Plano de Migração

### Fase 1: Desenvolvimento (Atual)
- ✅ Usar SQLite para desenvolvimento
- ✅ Implementar todas as funcionalidades
- ✅ Testar com dados reais
- ✅ Validar performance

### Fase 2: Preparação para Produção
- [ ] Implementar adaptador PostgreSQL customizado
- [ ] Criar scripts de migração de dados
- [ ] Testar com carga real
- [ ] Validar performance

### Fase 3: Migração
- [ ] Backup de dados SQLite
- [ ] Migração para PostgreSQL
- [ ] Validação de integridade
- [ ] Deploy em produção

## 📊 Comparação de Soluções

| Aspecto | SQLite (Atual) | PostgreSQL Custom | Aguardar Oficial |
|---------|----------------|-------------------|------------------|
| **Implementação** | ✅ Imediata | 🔄 Desenvolvimento | ⏳ Futuro |
| **Performance** | ⚠️ Limitada | ✅ Boa | ❓ Desconhecida |
| **Escalabilidade** | ❌ Baixa | ✅ Alta | ❓ Desconhecida |
| **Manutenção** | ✅ Simples | ⚠️ Média | ✅ Simples |
| **Compatibilidade** | ✅ Total | ⚠️ Parcial | ✅ Total |

## 🛠️ Implementação do Adaptador Customizado

### Estrutura Proposta:

```python
# core/memory/postgres_adapter.py
class PostgresMemoryAdapter:
    def __init__(self, connection_string: str, table_name: str = "agno_memories"):
        self.connection_string = connection_string
        self.table_name = table_name
        self.pool = None
    
    async def initialize(self):
        # Criar pool de conexões
        # Criar tabelas se não existirem
        pass
    
    async def add_memory(self, content: str, metadata: dict, embedding: List[float] = None):
        # Inserir memória no PostgreSQL
        pass
    
    async def search_memories(self, query: str, limit: int = 10):
        # Buscar memórias usando embeddings
        pass
    
    async def get_memories_by_user(self, user_id: str, limit: int = 50):
        # Buscar memórias por usuário
        pass
```

### Tabela PostgreSQL Necessária:

```sql
CREATE TABLE agno_memories (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    content TEXT NOT NULL,
    metadata JSONB,
    embedding VECTOR(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_agno_memories_user_id ON agno_memories(user_id);
CREATE INDEX idx_agno_memories_session_id ON agno_memories(session_id);
CREATE INDEX idx_agno_memories_created_at ON agno_memories(created_at);
```

## 🧪 Testes Necessários

### Testes de Performance:
```python
async def test_memory_performance():
    # Testar inserção de 1000 memórias
    # Testar busca com embeddings
    # Testar concorrência
    pass
```

### Testes de Integração:
```python
async def test_postgres_integration():
    # Testar conexão com PostgreSQL
    # Testar criação de tabelas
    # Testar operações CRUD
    pass
```

## 📝 Próximos Passos

1. **Imediato**: Continuar desenvolvimento com SQLite
2. **Curto Prazo**: Implementar adaptador PostgreSQL customizado
3. **Médio Prazo**: Migrar para PostgreSQL em produção
4. **Longo Prazo**: Avaliar suporte oficial do Agno

## 🔗 Links Úteis

- [Documentação do Agno](https://docs.agno.ai/)
- [GitHub do Agno](https://github.com/agno-ai/agno)
- [PostgreSQL com Python](https://www.postgresql.org/docs/current/libpq.html)
- [AsyncPG Documentation](https://magicstack.github.io/asyncpg/)

---

**Nota**: Esta é uma solução temporária. O objetivo é migrar para PostgreSQL assim que possível, mantendo a funcionalidade completa durante o desenvolvimento.
