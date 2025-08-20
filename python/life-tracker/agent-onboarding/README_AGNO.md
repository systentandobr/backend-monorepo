# Life Tracker - Agente de Onboarding com Agno

## 🚀 Implementação do Framework Agno

Este projeto implementa o framework **Agno** para criar um agente inteligente de onboarding com memória persistente e ferramentas especializadas.

## 📋 Características Principais

### ✨ **Memória Persistente PostgreSQL**
- Histórico completo de interações dos usuários
- Embeddings para busca semântica
- Contexto persistente entre sessões
- Metadados estruturados

### 🛠️ **Ferramentas Especializadas**
- `analyze_profile_tool` - Análise de perfil inteligente
- `match_template_tool` - Match de templates otimizado
- `generate_plan_tool` - Geração de planos personalizados
- `save_results_tool` - Persistência de resultados
- `get_user_history_tool` - Consulta de histórico
- `update_user_plan_tool` - Atualização de planos
- `get_recommendations_tool` - Recomendações personalizadas

### 🔄 **Compatibilidade Total**
- Agente legado mantido para transição
- Endpoints de compatibilidade
- Redirecionamentos automáticos
- Funcionalidades existentes preservadas

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Application                      │
├─────────────────────────────────────────────────────────────┤
│  Routes:                                                    │
│  ├── /onboarding/* (Novos endpoints)                       │
│  ├── /health/* (Health checks)                             │
│  └── / (Endpoints legados com redirecionamento)            │
├─────────────────────────────────────────────────────────────┤
│  Agents:                                                    │
│  ├── AgnoOnboardingAgent (Principal)                       │
│  └── OnboardingAgent (Legado)                              │
├─────────────────────────────────────────────────────────────┤
│  Tools:                                                     │
│  ├── OnboardingTools (Ferramentas especializadas)          │
│  └── TavilyTools (Pesquisa web)                            │
├─────────────────────────────────────────────────────────────┤
│  Memory:                                                    │
│  └── PostgreSQL Memory (Persistente)                       │
├─────────────────────────────────────────────────────────────┤
│  Database:                                                  │
│  ├── agno_memory.user_memories                             │
│  ├── agno_memory.user_sessions                             │
│  └── agno_memory.tool_usage                                │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. **Instalação**

```bash
# Clonar e navegar para o diretório
cd python/life-tracker/agent-onboarding

# Instalar dependências
pip install -r requirements.txt

# Configurar ambiente
cp env.example .env
nano .env  # Editar configurações
```

### 2. **Configuração do Banco de Dados**

```bash
# Executar script de configuração do Agno
python scripts/setup_agno_db.py
```

### 3. **Executar Aplicação**

```bash
# Desenvolvimento
python main.py

# Produção
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4. **Testar Implementação**

```bash
# Executar testes de validação
python test_agno_implementation.py
```

## 📡 Endpoints Disponíveis

### **Novos Endpoints (Recomendados)**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/onboarding/complete` | Onboarding completo com Agno |
| `POST` | `/onboarding/analyze-profile` | Análise de perfil com Agno |
| `POST` | `/onboarding/generate-plan` | Geração de plano com Agno |
| `GET` | `/onboarding/user/{user_id}/memory` | Consulta de memória |
| `GET` | `/onboarding/user/{user_id}/recommendations` | Recomendações |
| `GET` | `/onboarding/status` | Status do serviço |

### **Endpoints Legados (Compatibilidade)**

| Método | Endpoint | Redireciona para |
|--------|----------|------------------|
| `POST` | `/complete-onboarding` | `/onboarding/complete` |
| `POST` | `/analyze-profile` | `/onboarding/analyze-profile` |
| `POST` | `/generate-plan` | `/onboarding/generate-plan` |
| `GET` | `/templates` | `/onboarding/templates` |
| `GET` | `/user/{user_id}/plan` | `/onboarding/user/{user_id}/plan` |

## 🔧 Configuração

### **Variáveis de Ambiente Obrigatórias**

```env
# Banco de dados
DATABASE_URL=postgresql://user:password@localhost:5432/life_tracker

# OpenAI (para o Agno)
OPENAI_API_KEY=your_openai_api_key

# Tavily (para pesquisa web)
TAVILY_API_KEY=your_tavily_api_key
```

### **Configurações do Agno**

```env
# Configurações do Agno Framework
AGNO_DEBUG_MODE=false
AGNO_MEMORY_ENABLED=true
AGNO_AGENTIC_MEMORY=true
AGNO_MODEL_ID=gpt-4
AGNO_MEMORY_TABLE_NAME=user_memories
AGNO_MEMORY_SCHEMA=agno_memory
```

## 📊 Exemplo de Uso

### **Onboarding Completo com Agno**

```bash
curl -X POST "http://localhost:8000/onboarding/complete" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "answers": {
      "concentration": "high-focus",
      "lifestyle": "very-satisfied",
      "energy": "high-energy",
      "wakeupTime": "06:00",
      "sleepTime": "22:00",
      "financial_goals": ["emergency_fund", "investment_start"],
      "learning_areas": ["programming", "business"],
      "business_interests": ["startup", "consulting"]
    }
  }'
```

### **Consulta de Memória**

```bash
curl -X GET "http://localhost:8000/onboarding/user/user123/memory"
```

### **Recomendações Personalizadas**

```bash
curl -X GET "http://localhost:8000/onboarding/user/user123/recommendations?domain=finances"
```

## 🧪 Testes e Validação

### **Executar Testes Completos**

```bash
python test_agno_implementation.py
```

### **Testes Específicos**

```bash
# Teste de inicialização
python -c "
import asyncio
from core.agno_agent import AgnoOnboardingAgent
agent = AgnoOnboardingAgent()
asyncio.run(agent.initialize())
print('✓ Agente inicializado com sucesso')
"

# Teste de memória
python -c "
import asyncio
from core.agno_agent import AgnoOnboardingAgent
agent = AgnoOnboardingAgent()
asyncio.run(agent.initialize())
memory = asyncio.run(agent.get_memory_summary('test_user'))
print(f'✓ Memória: {memory}')
"
```

## 📈 Monitoramento

### **Logs Estruturados**

```bash
# Ver logs em tempo real
tail -f logs/agno_agent.log

# Filtrar por usuário
grep "user123" logs/agno_agent.log

# Filtrar por ferramenta
grep "analyze_profile_tool" logs/agno_agent.log
```

### **Métricas de Performance**

- Tempo de execução por ferramenta
- Taxa de sucesso das operações
- Uso de memória por usuário
- Performance de consultas

### **Health Checks**

```bash
# Verificar saúde da aplicação
curl http://localhost:8000/health

# Verificar prontidão
curl http://localhost:8000/health/ready

# Verificar vitalidade
curl http://localhost:8000/health/live
```

## 🔍 Troubleshooting

### **Problemas Comuns**

1. **Erro de Conexão com PostgreSQL**
   ```bash
   # Verificar se PostgreSQL está rodando
   sudo systemctl status postgresql
   
   # Verificar conexão
   psql -h localhost -U postgres -d life_tracker
   ```

2. **Erro de API Key**
   ```bash
   # Verificar variáveis de ambiente
   echo $OPENAI_API_KEY
   echo $TAVILY_API_KEY
   ```

3. **Erro de Memória**
   ```bash
   # Reconfigurar banco de dados
   python scripts/setup_agno_db.py
   ```

### **Debug Mode**

```bash
# Habilitar debug
export AGNO_DEBUG_MODE=true

# Executar com logs detalhados
python main.py
```

## 📚 Documentação Adicional

- [Documentação Completa](README.md)
- [Implementação do Agno](AGNO_IMPLEMENTATION.md)
- [Arquitetura Detalhada](docs/architecture/)
- [Exemplos de Uso](docs/examples/)

## 🤝 Contribuição

### **Desenvolvimento**

1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Adicione testes
5. Execute validação
6. Abra um Pull Request

### **Padrões de Código**

- **Python**: PEP 8, type hints
- **Documentação**: Docstrings em português
- **Testes**: Cobertura mínima de 80%
- **Commits**: Conventional Commits

## 📈 Roadmap

### **Versão 2.1.0**
- [ ] Cache Redis para performance
- [ ] Ferramenta de análise de progresso
- [ ] Webhooks para eventos externos

### **Versão 2.2.0**
- [ ] Dashboard de métricas
- [ ] Ferramenta de notificações inteligentes
- [ ] Integração com APIs de terceiros

### **Versão 2.3.0**
- [ ] Machine Learning para otimização
- [ ] Análise de tendências
- [ ] Recomendações preditivas

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas:

- **Issues**: Abra uma issue no GitHub
- **Documentação**: Consulte esta documentação
- **Email**: contato@lifetracker.com

---

**Desenvolvido com ❤️ pela equipe Life Tracker**

*Versão: 2.0.0 | Agno Framework | Dezembro 2024*
