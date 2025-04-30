# Guia de Testes do Meu Nutri

Este documento fornece instruções para testar os diversos componentes do sistema Meu Nutri, incluindo o agente MCP, o módulo de visão computacional, o engine circadiano e a integração com Alexa.

## Pré-requisitos

1. Python 3.9 ou superior
2. Ambiente virtual configurado
3. Dependências instaladas via `pip install -r requirements.txt`
4. Arquivo `.env` configurado com as variáveis necessárias

## Configuração do ambiente

1. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
# API Keys
OPENAI_API_KEY=sua_chave_openai
ANTHROPIC_API_KEY=sua_chave_anthropic

# Configurações PostgreSQL
POSTGRES_CONNECTION_STRING=postgresql://usuario:senha@localhost:5432/meu_nutri

# Configurações de armazenamento
VISUALIZATIONS_DIR=/caminho/para/armazenar/visualizacoes

# Configurações Alexa (para ambiente de produção)
MEUNUTRI_API_ENDPOINT=https://api.systentando.com/meu-nutri
MEUNUTRI_API_KEY=chave_api
```

2. Crie o banco de dados PostgreSQL:

```bash
# No terminal
createdb meu_nutri
```

## Testes do Agente Híbrido

O agente híbrido combina LangChain com Model Context Protocol para fornecer uma experiência conversacional contextualizada e com persistência.

### Como testar:

```bash
# Executar somente o teste do agente
python test_agent.py --agent

# Ou via menu interativo
python test_agent.py
# Selecione a opção 1
```

Durante o teste, você poderá interagir com o agente via linha de comando. Experimente fazer perguntas como:

- "Quais são os melhores alimentos para consumir pela manhã?"
- "Como meu ritmo circadiano afeta minha alimentação?"
- "Que exercícios são recomendados para o fim da tarde?"
- "Como melhorar minha saúde sendo uma pessoa de cronotipo matutino?"

O agente deve responder considerando contextos como o momento do dia e preferências do usuário.

## Testes do Módulo de Visão Computacional

O módulo de visão computacional analisa imagens do usuário para avaliar aspectos físicos e fornecer orientações personalizadas.

### Como testar:

```bash
# Executar somente o teste de visão
python test_agent.py --vision

# Ou via menu interativo
python test_agent.py
# Selecione a opção 2
```

Para o teste de visão, você precisará:

1. Uma imagem de corpo inteiro de uma pessoa (pose frontal)
2. Fornecer o caminho dessa imagem quando solicitado

O teste irá:
- Processar a imagem para detectar pontos-chave corporais
- Calcular proporções e métricas corporais
- Analisar postura
- Gerar uma visualização com os pontos-chave desenhados

## Testes do Engine Circadiano

O engine circadiano modela o ritmo biológico do usuário para fornecer recomendações personalizadas sobre nutrição e atividades.

### Como testar:

```bash
# Executar somente o teste circadiano
python test_agent.py --circadian

# Ou via menu interativo
python test_agent.py
# Selecione a opção 3
```

O teste mostrará:
- O cronotipo detectado com base nos horários de sono
- Horários ideais para refeições
- Recomendações nutricionais para diferentes momentos do dia
- Recomendações de exercícios para diferentes momentos do dia

## Teste da Integração Alexa (Simulada)

Este teste simula a integração com dispositivos Alexa, mostrando como o processamento de intents e slots funciona.

### Como testar:

```bash
# Executar somente o teste de Alexa
python test_agent.py --alexa

# Ou via menu interativo
python test_agent.py
# Selecione a opção 4
```

Durante o teste, você poderá digitar frases como se estivesse falando com a Alexa. O sistema irá:
- Identificar o intent mais provável
- Extrair slots relevantes
- Simular uma resposta da Alexa baseada no processamento

Experimente frases como:
- "Qual o melhor momento para exercícios pela manhã?"
- "Registre que almocei arroz, feijão e salada"
- "Me dê uma recomendação circadiana para a noite"

## Executando o Servidor API

Para testar a API completa:

```bash
# A partir da raiz do projeto
uvicorn app.main:app --reload
```

A API estará disponível em http://localhost:8000, com documentação em http://localhost:8000/docs.

## Depuração

Se encontrar problemas durante os testes:

1. Verifique se todas as dependências estão instaladas:
   ```bash
   pip install -r requirements.txt
   ```

2. Verifique se o arquivo `.env` está configurado corretamente

3. Para problemas com o banco de dados:
   ```bash
   # Reinicie o banco
   dropdb meu_nutri
   createdb meu_nutri
   
   # Teste novamente
   python test_agent.py
   ```

4. Para problemas com o módulo de visão:
   - Certifique-se de que a imagem é clara e tem uma pessoa em posição frontal
   - Tente uma imagem diferente
   - Verifique se todas as dependências do OpenCV e MediaPipe estão instaladas

5. Ative o modo de depuração para logs mais detalhados:
   ```bash
   export DEBUG=1
   python test_agent.py
   ```

## Validação da Implementação MCP vs LangChain

### Comparando as Abordagens

O sistema implementa uma abordagem híbrida que combina as vantagens do LangChain com o Model Context Protocol:

1. **LangChain**: Usado para a orquestração das ferramentas e fluxos de agente
   - Verificável através do módulo `app.agent.hybrid_agent.py`
   - Teste interativo via `test_agent.py --agent`

2. **Model Context Protocol (MCP)**: Usado para persistência e gerenciamento de contexto
   - Implementação em PostgreSQL em `app.db.postgres_context.py`
   - Verificável através da persistência de conversas entre sessões

### Passos para Validação da Persistência MCP

1. Inicie uma sessão de teste:
   ```bash
   python test_agent.py --agent
   ```

2. Faça algumas perguntas e anote o ID da conversa exibido após cada interação

3. Encerre o teste (Ctrl+C ou digitando "sair")

4. Inicie uma nova sessão, informando o ID da conversa anterior:
   ```bash
   # Modifique o código em test_agent.py, linha ~40:
   # De:
   # agent = HybridNutriAgent(user_id=user_id)
   # Para:
   # agent = HybridNutriAgent(user_id=user_id, conversation_id="ID_ANOTADO_ANTERIORMENTE")
   
   python test_agent.py --agent
   ```

5. Verifique se o agente mantém o contexto da conversa anterior fazendo perguntas relacionadas

## Validação da Integração Alexa

Para validar completamente a integração Alexa além do teste simulado:

1. Configure sua conta de desenvolvedor Amazon:
   - Acesse https://developer.amazon.com
   - Crie uma nova skill Alexa

2. Configure os intents e slots conforme definido em `app/alexa/skill.py`

3. Deploy do serviço backend:
   ```bash
   # Configure a API
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   
   # Exponha via ngrok para teste (opcional)
   ngrok http 8000
   ```

4. Configure o endpoint da skill para apontar para sua API:
   - Endpoint: `https://seu-dominio/api/alexa/webhook`
   - Tipo de endpoint: HTTPS

5. Teste a skill usando a opção "Test" do console de desenvolvedor Alexa

## Validação da Visão Computacional em Produção

Para testar o módulo de visão em ambiente de produção:

1. Prepare um conjunto de imagens de teste variadas
   - Diferentes posições
   - Diferentes iluminações
   - Diferentes pessoas e tipos corporais

2. Execute o teste em lote:
   ```bash
   # Crie um script para processar múltiplas imagens
   python scripts/batch_vision_test.py --dir caminho/para/imagens
   ```

3. Analise os resultados para verificar consistência e precisão

4. Compare com avaliações conhecidas ou validadas por profissionais

## Logs e Telemetria

Para análise avançada e monitoramento:

1. Configure o sistema de logs para salvar em arquivo:
   ```python
   # Adicione no arquivo app/__init__.py
   import logging
   logging.basicConfig(
       level=logging.INFO,
       format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
       filename='meu_nutri.log'
   )
   ```

2. Monitore erros e desempenho:
   ```bash
   tail -f meu_nutri.log
   ```

3. Analyze padrões e métricas:
   ```bash
   # Exemplo de análise de tempos de resposta
   grep "response_time" meu_nutri.log | awk '{print $8}' | sort -n
   ```

## Próximos Passos para Produção

Após validar todos os componentes, considere:

1. **Containerização**:
   ```bash
   # Criar Dockerfile e docker-compose.yml
   docker-compose up -d
   ```

2. **Testes de Performance**:
   ```bash
   # Instalar locust
   pip install locust
   
   # Executar testes de carga
   locust -f tests/locustfile.py
   ```

3. **Integração Contínua**:
   - Configure GitHub Actions ou similar para executar testes automáticos
   - Implemente builds e deploys automáticos

4. **Monitoramento**:
   - Configure Prometheus/Grafana para métricas
   - Implemente alertas para erros críticos
