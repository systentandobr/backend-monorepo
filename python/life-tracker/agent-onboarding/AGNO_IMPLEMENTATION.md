# Implementação do Agno no Agente de Onboarding

## 📋 Visão Geral

Este documento descreve a implementação do framework **Agno** no agente de onboarding do Life Tracker, seguindo as boas práticas e princípios de arquitetura limpa.

## 🎯 Objetivos da Implementação

1. **Memória Persistente**: Implementar memória PostgreSQL para histórico de usuários
2. **Ferramentas Especializadas**: Criar ferramentas específicas para onboarding
3. **Compatibilidade**: Manter compatibilidade com implementação existente
4. **Escalabilidade**: Preparar para crescimento e novas funcionalidades
5. **Monitoramento**: Implementar logs e métricas para acompanhamento

## 🏗️ Arquitetura Implementada

### Estrutura de Arquivos

```
agent-onboarding/
├── core/
│   ├── agno_agent.py          # Agente principal com Agno
│   ├── agent.py               # Agente legado (mantido)
│   └── tools/
│       ├── __init__.py
│       └── onboarding_tools.py # Ferramentas do Agno
├── routes/
│   ├── __init__.py
│   ├── health_routes.py       # Rotas de health check
│   └── onboarding_routes.py   # Rotas principais
├── scripts/
│   └── setup_agno_db.py       # Script de configuração do DB
├── main.py                    # Aplicação principal atualizada
└── requirements.txt           # Dependências atualizadas
```

### Componentes Principais

#### 1. AgnoOnboardingAgent (core/agno_agent.py)

**Responsabilidades:**
- Orquestrar processo de onboarding usando Agno
- Gerenciar memória persistente PostgreSQL
- Coordenar ferramentas especializadas
- Manter histórico de interações

**Características:**
- Memória PostgreSQL com embeddings
- Ferramentas especializadas para onboarding
- Contexto persistente entre sessões
- Logs estruturados para monitoramento

#### 2. OnboardingTools (core/tools/onboarding_tools.py)

**Ferramentas Implementadas:**

1. **analyze_profile_tool**
   - Analisa respostas do onboarding
   - Identifica perfil do usuário
   - Salva análise no banco de dados

2. **match_template_tool**
   - Encontra template mais adequado
   - Calcula score de matching
   - Gera customizações específicas

3. **generate_plan_tool**
   - Gera plano personalizado
   - Aplica customizações
   - Integra com templates

4. **save_results_tool**
   - Persiste resultados no banco
   - Salva análise e plano
   - Confirma operações

5. **get_user_history_tool**
   - Consulta histórico do usuário
   - Recupera análises anteriores
   - Fornece contexto para decisões

6. **update_user_plan_tool**
   - Atualiza planos existentes
   - Aplica modificações
   - Mantém consistência

7. **get_recommendations_tool**
   - Gera recomendações personalizadas
   - Baseado no histórico
   - Considera domínios específicos

#### 3. Rotas Organizadas (routes/)

**Estrutura:**
- **health_routes.py**: Endpoints de verificação de saúde
- **onboarding_routes.py**: Rotas principais de onboarding

**Endpoints Novos:**
- `/onboarding/complete` - Onboarding com Agno
- `/onboarding/complete-legacy` - Onboarding legado
- `/onboarding/analyze-profile` - Análise com Agno
- `/onboarding/generate-plan` - Geração com Agno
- `/onboarding/user/{user_id}/memory` - Consulta de memória
- `/onboarding/user/{user_id}/recommendations` - Recomendações
- `/onboarding/status` - Status do serviço

## 🗄️ Banco de Dados PostgreSQL

### Schema: agno_memory

#### Tabelas Principais

1. **user_memories**
   ```sql
   CREATE TABLE agno_memory.user_memories (
       id SERIAL PRIMARY KEY,
       user_id VARCHAR(255) NOT NULL,
       session_id VARCHAR(255),
       content TEXT NOT NULL,
       metadata JSONB,
       embedding VECTOR(1536),
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. **user_sessions**
   ```sql
   CREATE TABLE agno_memory.user_sessions (
       id SERIAL PRIMARY KEY,
       user_id VARCHAR(255) NOT NULL,
       session_id VARCHAR(255) UNIQUE NOT NULL,
       session_data JSONB,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **tool_usage**
   ```sql
   CREATE TABLE agno_memory.tool_usage (
       id SERIAL PRIMARY KEY,
       user_id VARCHAR(255) NOT NULL,
       session_id VARCHAR(255),
       tool_name VARCHAR(255) NOT NULL,
       tool_input JSONB,
       tool_output JSONB,
       execution_time_ms INTEGER,
       success BOOLEAN DEFAULT TRUE,
       error_message TEXT,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

### Índices para Performance

- `idx_user_memories_user_id` - Busca por usuário
- `idx_user_memories_session_id` - Busca por sessão
- `idx_user_memories_created_at` - Busca por data
- `idx_user_memories_user_created` - Busca composta
- `idx_tool_usage_user_id` - Ferramentas por usuário
- `idx_tool_usage_tool_name` - Ferramentas por nome

## 🔧 Configuração e Instalação

### 1. Instalar Dependências

```bash
pip install -r requirements.txt
```

### 2. Configurar Banco de Dados

```bash
# Executar script de configuração
python scripts/setup_agno_db.py
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar configurações
nano .env
```

**Variáveis Necessárias:**
```env
# Banco de dados
DATABASE_URL=postgresql://user:password@localhost:5432/life_tracker

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Tavily (para pesquisa web)
TAVILY_API_KEY=your_tavily_api_key

# Configurações do Agno
AGNO_DEBUG_MODE=false
AGNO_MEMORY_ENABLED=true
```

### 4. Executar Aplicação

```bash
# Desenvolvimento
python main.py

# Produção
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🚀 Funcionalidades Implementadas

### 1. Memória Persistente

- **Histórico de Usuários**: Armazena todas as interações
- **Contexto Persistente**: Mantém contexto entre sessões
- **Embeddings**: Suporte a busca semântica
- **Metadados**: Informações estruturadas sobre interações

### 2. Ferramentas Especializadas

- **Análise de Perfil**: Identificação automática de perfis
- **Match de Templates**: Seleção inteligente de templates
- **Geração de Planos**: Criação personalizada de planos
- **Recomendações**: Sugestões baseadas no histórico

### 3. Monitoramento e Logs

- **Logs Estruturados**: Informações detalhadas de execução
- **Métricas de Performance**: Tempo de execução das ferramentas
- **Rastreamento de Erros**: Captura e registro de falhas
- **Histórico de Ferramentas**: Uso e resultados das ferramentas

### 4. Compatibilidade

- **Endpoints Legados**: Mantidos para transição
- **Redirecionamentos**: Migração automática para novos endpoints
- **Funcionalidades Existentes**: Preservadas e melhoradas

## 📊 Vantagens da Implementação

### 1. **Memória Inteligente**
- Lembra de interações anteriores
- Adapta recomendações baseado no histórico
- Mantém consistência entre sessões

### 2. **Ferramentas Especializadas**
- Cada ferramenta tem responsabilidade específica
- Fácil manutenção e extensão
- Logs detalhados para debugging

### 3. **Performance Otimizada**
- Índices PostgreSQL para consultas rápidas
- Cache de embeddings para busca semântica
- Background tasks para operações pesadas

### 4. **Escalabilidade**
- Arquitetura modular
- Separação clara de responsabilidades
- Fácil adição de novas ferramentas

### 5. **Monitoramento**
- Logs estruturados
- Métricas de performance
- Rastreamento de erros
- Histórico de uso

## 🔄 Migração e Compatibilidade

### Endpoints Legados Mantidos

- `/complete-onboarding` → `/onboarding/complete`
- `/analyze-profile` → `/onboarding/analyze-profile`
- `/generate-plan` → `/onboarding/generate-plan`
- `/templates` → `/onboarding/templates`
- `/user/{user_id}/plan` → `/onboarding/user/{user_id}/plan`

### Redirecionamentos Automáticos

Todos os endpoints legados redirecionam automaticamente para os novos endpoints, garantindo compatibilidade durante a transição.

## 🧪 Testes e Validação

### 1. Testes de Funcionalidade

```bash
# Executar testes
pytest tests/

# Com cobertura
pytest --cov=agent-onboarding tests/
```

### 2. Testes de Performance

```bash
# Teste de carga
python -m pytest tests/test_performance.py -v
```

### 3. Validação de Banco de Dados

```bash
# Verificar configuração
python scripts/setup_agno_db.py
```

## 📈 Próximos Passos

### 1. **Melhorias de Performance**
- Implementar cache Redis
- Otimizar consultas PostgreSQL
- Adicionar índices específicos

### 2. **Novas Ferramentas**
- Ferramenta de análise de progresso
- Ferramenta de ajuste automático de planos
- Ferramenta de notificações inteligentes

### 3. **Integrações**
- Webhooks para eventos externos
- APIs de terceiros (calendário, fitness, etc.)
- Integração com sistemas de analytics

### 4. **Monitoramento Avançado**
- Dashboard de métricas
- Alertas automáticos
- Análise de tendências

## 🛠️ Troubleshooting

### Problemas Comuns

1. **Erro de Conexão com PostgreSQL**
   - Verificar DATABASE_URL
   - Confirmar se PostgreSQL está rodando
   - Verificar permissões de usuário

2. **Erro de API Key**
   - Verificar OPENAI_API_KEY
   - Verificar TAVILY_API_KEY
   - Confirmar limites de uso

3. **Erro de Memória**
   - Verificar se tabelas foram criadas
   - Executar script de setup novamente
   - Verificar logs de erro

### Logs e Debugging

```bash
# Habilitar debug mode
export AGNO_DEBUG_MODE=true

# Ver logs detalhados
tail -f logs/agno_agent.log
```

## 📚 Referências

- [Documentação do Agno](https://github.com/agno-ai/agno)
- [PostgreSQL com Python](https://www.postgresql.org/docs/current/)
- [FastAPI Best Practices](https://fastapi.tiangolo.com/tutorial/)
- [Architecture Clean Code](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Desenvolvido com ❤️ pela equipe Life Tracker**

*Versão: 2.0.0 | Data: Dezembro 2024*
