# 🚀 Quick Start - Life Tracker Agno Agent

## ⚠️ Problema Resolvido: Imports Relativos

O erro `ImportError: attempted relative import with no known parent package` foi corrigido. Agora você tem **3 opções** para executar a aplicação:

## 🎯 Opções de Execução

### Opção 1: Scripts Otimizados (RECOMENDADO)

```bash
# Para API FastAPI
python run_agno_api.py

# Para Playground
python run_agno_playground.py

# Para Demonstrações
python examples/agno_demo.py
```

### Opção 2: Execução Direta

```bash
# Para API FastAPI
python main_agno.py

# Para Playground
python agno_agent.py
```

### Opção 3: Como Módulo Python

```bash
# Navegar para o diretório pai
cd ..

# Executar como módulo
python -m agent-onboarding.main_agno
python -m agent-onboarding.agno_agent
```

## 🔧 Configuração Rápida

### 1. Instalar Dependências

```bash
# Instalar Agno Framework
pip install agno

# Instalar outras dependências
pip install fastapi uvicorn python-dotenv pydantic
```

### 2. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
echo "OPENAI_API_KEY=sk-your-key-here" > .env
echo "DATABASE_URL=postgresql://user:pass@localhost/life_tracker" >> .env
```

### 3. Criar Diretórios Necessários

```bash
mkdir -p data templates examples
```

## 🧪 Teste Rápido

### 1. Verificar Configuração

```bash
python -c "from agno_config import validate_config; print(validate_config())"
```

### 2. Testar Agente

```bash
# Iniciar API
python run_agno_api.py

# Em outro terminal, testar
curl http://localhost:8001/health
curl http://localhost:8001/agent/status
```

### 3. Usar Playground

```bash
# Iniciar playground
python run_agno_playground.py

# Acessar: http://localhost:8000
```

## 📊 Endpoints Disponíveis

- **Health Check**: `GET /health`
- **Status do Agente**: `GET /agent/status`
- **Teste do Agente**: `POST /agent/test`
- **Onboarding Completo**: `POST /complete-onboarding`
- **Análise de Perfil**: `POST /analyze-profile`
- **Geração de Plano**: `POST /generate-plan`
- **Recomendações**: `GET /user/{user_id}/recommendations`

## 🔍 Troubleshooting

### Erro: "Module not found"
```bash
# Verificar se está no diretório correto
pwd  # Deve mostrar: .../agent-onboarding

# Verificar se o ambiente virtual está ativo
which python  # Deve mostrar: .../venv/bin/python
```

### Erro: "OPENAI_API_KEY not found"
```bash
# Verificar arquivo .env
cat .env

# Ou definir temporariamente
export OPENAI_API_KEY=sk-your-key-here
```

### Erro: "Port already in use"
```bash
# Mudar porta no script ou usar porta diferente
python run_agno_api.py  # Usa porta 8001
python run_agno_playground.py  # Usa porta 8000
```

## 📚 Próximos Passos

1. **Teste a API**: Use os endpoints para validar funcionamento
2. **Explore o Playground**: Interface interativa para desenvolvimento
3. **Execute Demonstrações**: Veja exemplos práticos de uso
4. **Leia a Documentação**: `README_AGNO.md` para detalhes completos

---

**✅ Problema resolvido! Agora você pode executar a aplicação sem erros de importação.**
