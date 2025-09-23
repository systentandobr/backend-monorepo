# 🎮 Playground do Agno - Life Tracker

Este documento explica como executar o playground do Agno para testar e interagir com o agente de onboarding do Life Tracker.

## 🚀 Opções de Execução

### **Opção 1: Script Robusto (RECOMENDADO)**

```bash
python playground_robust.py
```

**Vantagens:**
- ✅ Resolve problemas de event loop
- ✅ Funciona em qualquer contexto
- ✅ Tratamento de erros avançado
- ✅ Suporte a threads separadas

### **Opção 2: Script Simples**

```bash
python playground_simple.py
```

**Vantagens:**
- ✅ Mais simples e direto
- ✅ Menos propenso a erros
- ✅ Inicialização rápida
- ✅ Fácil de debugar

### **Opção 3: Script Original (Corrigido)**

```bash
python main_playground.py
```

**Vantagens:**
- ✅ Mais funcionalidades
- ✅ Suporte a múltiplos agentes
- ✅ Configurações avançadas

### **Opção 4: Scripts Legados**

```bash
python simple_playground.py
python run_playground.py
```

## 🔧 Configuração Necessária

### **1. Variáveis de Ambiente**

Certifique-se de que o arquivo `.env` está configurado:

```env
# OpenAI
OPENAI_API_KEY=sk-your-key-here

# Banco de dados
DATABASE_URL=postgresql://user:pass@localhost/life_tracker

# Agno
AGNO_MODEL_ID=gpt-4o-mini
AGNO_MODEL_SUMMARIZER_ID=gpt-4o-mini
AGNO_MEMORY_ENABLE=true
AGNO_MEMORY_TABLE_NAME=user_memories
AGNO_MEMORY_DB_FILE=data/agno_memory.db
```

### **2. Dependências**

```bash
pip install agno fastapi uvicorn python-dotenv
```

### **3. Diretórios**

```bash
mkdir -p data templates
```

## 🎯 Como Usar o Playground

### **1. Iniciar o Servidor (RECOMENDADO)**

```bash
python playground_robust.py
```

### **2. Acessar a Interface**

Abra o navegador e acesse: `http://localhost:8000`

### **3. Interagir com o Agente**

No playground, você pode:

- **Fazer perguntas diretas** sobre onboarding
- **Testar as ferramentas** do agente
- **Ver o histórico** de conversas
- **Analisar respostas** em tempo real

## 📝 Exemplos de Uso

### **Exemplo 1: Análise de Perfil**

```
Analise o perfil de um usuário com as seguintes características:
- Idade: 30 anos
- Profissão: Desenvolvedor
- Objetivos: Melhorar finanças e saúde
- Tempo disponível: 2 horas por dia
```

### **Exemplo 2: Geração de Plano**

```
Gere um plano personalizado para um usuário focado em finanças
que tem R$ 5.000 de renda mensal e quer economizar 20%.
```

### **Exemplo 3: Recomendações**

```
Quais são as melhores práticas para um usuário que quer
começar a investir com pouco dinheiro?
```

## 🔍 Troubleshooting

### **Erro: "asyncio.run() cannot be called from a running event loop"**

**Solução:** Use o script robusto:

```bash
python playground_robust.py
```

**Causa:** Este erro ocorre quando você tenta usar `asyncio.run()` dentro de um contexto que já tem um event loop rodando.

### **Erro: "Module not found"**

```bash
# Verificar se está no diretório correto
pwd  # Deve mostrar: .../agent-onboarding

# Verificar se o ambiente virtual está ativo
which python
```

### **Erro: "OPENAI_API_KEY not found"**

```bash
# Verificar arquivo .env
cat .env

# Ou definir temporariamente
export OPENAI_API_KEY=sk-your-key-here
```

### **Erro: "Port 8000 already in use"**

```bash
# Mudar porta no script
# Ou matar processo na porta
lsof -ti:8000 | xargs kill -9
```

### **Erro: "Database connection failed"**

```bash
# Verificar se o banco está rodando
# Ou usar SQLite temporariamente
export DATABASE_URL=sqlite:///data/test.db
```

## 📊 Logs e Debug

### **Ver Logs em Tempo Real**

```bash
# Terminal 1
python playground_robust.py

# Terminal 2
tail -f logs/playground.log
```

### **Modo Debug**

```bash
# Ativar debug no .env
AGNO_DEBUG_MODE=true
```

## 🎯 Funcionalidades do Playground

### **Interface Web**
- Chat interativo com o agente
- Histórico de conversas
- Visualização de ferramentas usadas
- Configurações do agente

### **Ferramentas Disponíveis**
- `analyze_profile_tool` - Análise de perfil
- `match_template_tool` - Match de templates
- `generate_plan_tool` - Geração de planos
- `save_results_tool` - Salvamento de resultados
- `get_user_history_tool` - Histórico do usuário

### **Memória do Agno**
- Contexto persistente entre sessões
- Histórico de interações
- Embeddings para busca semântica
- Metadados estruturados

## 🔄 Desenvolvimento

### **Modificar o Agente**

Para modificar o comportamento do agente, edite:

```python
# core/agent_onboarding.py
def _get_agent_instructions(self) -> str:
    return """
    Suas instruções personalizadas aqui...
    """
```

### **Adicionar Ferramentas**

```python
# core/tools/onboarding_tools.py
def minha_ferramenta(parametro: str):
    """Descrição da ferramenta"""
    return {"resultado": "valor"}
```

### **Testar Mudanças**

```bash
# Reiniciar o playground
python playground_robust.py
```

## 🚨 Problemas Comuns e Soluções

### **1. Event Loop Issues**

**Problema:** `asyncio.run() cannot be called from a running event loop`

**Solução:** Use `playground_robust.py` que resolve automaticamente este problema.

### **2. Import Errors**

**Problema:** `ModuleNotFoundError`

**Solução:** Verifique se está no diretório correto e se o ambiente virtual está ativo.

### **3. Memory Issues**

**Problema:** Erros relacionados à memória do Agno

**Solução:** Verifique as configurações do banco de dados no `.env`.

## 📚 Próximos Passos

1. **Teste o playground** com `python playground_robust.py`
2. **Explore as ferramentas** disponíveis
3. **Analise as respostas** do agente
4. **Personalize** conforme necessário
5. **Integre** com sua aplicação principal

---

**🎉 Agora você pode usar o playground do Agno sem problemas de event loop!**
