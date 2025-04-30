# Arquitetura do Sistema Meu Nutri

Este documento descreve a arquitetura do sistema Meu Nutri, um agente inteligente em Python que utiliza visão computacional e modelo de ritmo circadiano para fornecer orientação nutricional personalizada, com integração com Alexa.

## Visão Geral da Arquitetura

O sistema é composto por quatro componentes principais que trabalham de forma integrada:

1. **Agente Conversacional Híbrido (MCP + LangChain)**
2. **Módulo de Visão Computacional**
3. **Engine de Recomendação Circadiana**
4. **Integração com Alexa**

Todos os componentes são orquestrados por uma API REST implementada com FastAPI, que fornece endpoints para interação com o sistema.

## Agente Conversacional Híbrido

### Abordagem Híbrida MCP + LangChain

O sistema utiliza uma abordagem híbrida que combina:

- **LangChain**: Para orquestração de ferramentas e fluxos de agente
- **Model Context Protocol (MCP)**: Para persistência e gerenciamento de contexto em PostgreSQL

Esta abordagem híbrida permite:

1. Aproveitar o framework maduro do LangChain para gerenciar ferramentas e prompts
2. Utilizar a persistência otimizada do MCP para manter conversas e aprendizado contínuo
3. Criar um agente com memória de longo prazo e capacidade de aprimoramento contínuo

### Diagrama do Fluxo do Agente

```
+----------------+      +------------------------+      +---------------------+
| Entrada Usuário| ---> | Processador de Contexto| ---> | Executor do Agente  |
+----------------+      +------------------------+      +---------------------+
                                   |                             |
                                   v                             v
                        +---------------------+        +-------------------+
                        | MCP Context Storage |        | Ferramentas/Tools |
                        +---------------------+        +-------------------+
                                                                |
                                                                v
                         +-------------------+         +-------------------+
                         | Resposta ao Usuário| <----- | Gerador de Saída  |
                         +-------------------+         +-------------------+
```

### Ferramentas Disponíveis

O agente híbrido tem acesso às seguintes ferramentas especializadas:

1. **CircadianTool**: Fornece recomendações baseadas no ritmo circadiano
2. **NutritionTool**: Acessa e processa informações nutricionais
3. **VisionTool**: Interface com o módulo de visão computacional
4. **SearchTool**: Busca informações em fontes externas
5. **PlanTool**: Gera planos personalizados para o usuário

## Módulo de Visão Computacional

### Funcionalidades

O módulo de visão computacional é responsável por:

1. Detectar pontos-chave corporais usando MediaPipe Pose
2. Calcular proporções e métricas corporais
3. Analisar postura e alinhamento
4. Estimar informações de composição corporal (simplificada)
5. Gerar visualizações da análise

### Pipeline de Processamento

```
+----------------+     +-------------------+     +--------------------+
| Imagem Original| --> | Detector de Pose  | --> | Extração de Pontos |
+----------------+     +-------------------+     +--------------------+
                                                          |
                                                          v
+--------------------+     +-------------------+     +--------------------+
| Gerador de Relatório| <-- | Analisador de Dados| <-- | Cálculo de Métricas|
+--------------------+     +-------------------+     +--------------------+
        |
        v
+--------------------+
| Visualização       |
+--------------------+
```

## Engine de Recomendação Circadiana

### Modelo Circadiano

O engine implementa um modelo de ritmo biológico que considera:

1. **Cronotipo do usuário**: Determinado a partir de horários de sono/vigília
2. **Curvas circadianas**: Modelagem de parâmetros fisiológicos ao longo do dia
   - Cortisol
   - Sensibilidade à insulina
   - Níveis de energia
   - Síntese proteica
   - Capacidade de foco
   - Eficiência digestiva

### Tipos de Recomendações

Com base no modelo circadiano, o engine gera:

1. **Recomendações Nutricionais**: Composição ideal de macronutrientes para cada momento
2. **Horários de Refeições**: Cronograma otimizado para alimentação
3. **Recomendações de Exercício**: Tipo e intensidade ideal para cada horário
4. **Otimização de Atividades**: Sugestões para atividades diversas ao longo do dia

## Integração com Alexa

### Arquitetura da Skill Alexa

```
+-------------+     +----------------+     +---------------+
| Alexa Device | --> | Alexa Service  | --> | Lambda Handler|
+-------------+     +----------------+     +---------------+
                                                   |
                                                   v
                                           +---------------+
                                           | API Meu Nutri |
                                           +---------------+
                                                   |
                                                   v
                               +--------------------------------------+
                               | Agente Híbrido com Contexto & Tools  |
                               +--------------------------------------+
```

### Fluxo de Processamento

1. Usuário faz um pedido ao dispositivo Alexa
2. Alexa Service identifica intent e slots
3. Lambda Handler processa a requisição e chama API
4. API Meu Nutri processa a requisição através do agente
5. Resposta é enviada de volta ao usuário via Alexa

### Intents Principais

A skill Alexa implementa os seguintes intents principais:

1. **NutritionQueryIntent**: Para consultas sobre nutrição e alimentação
2. **CircadianRecommendationIntent**: Para recomendações baseadas no ritmo circadiano
3. **MealLogIntent**: Para registro de refeições
4. **LaunchRequest**: Para iniciar a skill
5. **HelpIntent, CancelIntent, StopIntent**: Para intents padrão da Alexa

## Persistência de Dados

### Banco de Dados PostgreSQL

O sistema utiliza PostgreSQL para persistência de:

1. **Perfis de Usuário**: Dados demográficos, preferências e objetivos
2. **Contexto de Conversas**: Histórico e metadados (via MCP)
3. **Análises Corporais**: Resultados de análises de imagem
4. **Registros de Refeições**: Histórico alimentar
5. **Métricas de Usuário**: Dados de progresso

### Modelo de Dados

Principais tabelas no banco de dados:

1. **users**: Informações básicas de usuário
2. **user_profiles**: Perfil detalhado do usuário
3. **conversations**: Conversas (MCP)
4. **messages**: Mensagens de conversas (MCP)
5. **learning_data**: Dados de aprendizado (MCP)
6. **body_analyses**: Análises corporais
7. **meals**: Registros de refeições
8. **user_metrics**: Métricas de progresso

## API REST

### Endpoints Principais

A API REST implementa os seguintes endpoints:

1. **`/api/agent/query`**: Processamento de consultas ao agente
2. **`/api/vision/analyze`**: Análise de imagens corporais
3. **`/api/circadian/recommendations`**: Recomendações circadianas
4. **`/api/users/*`**: Gestão de usuários e perfis
5. **`/api/alexa/webhook`**: Webhook para integração com Alexa

## Implementação Técnica

### Linguagens e Frameworks

- **Python 3.9+**: Linguagem principal
- **FastAPI**: Framework para API REST
- **PostgreSQL**: Banco de dados relacional
- **LangChain**: Framework para orquestração de agentes
- **OpenCV/MediaPipe**: Processamento de imagem e visão computacional
- **ASK SDK**: Desenvolvimento de skill Alexa

### Dependências Principais

- **langchain**: Orquestração de LLMs
- **openai/anthropic**: Acesso a LLMs
- **opencv-python/mediapipe**: Visão computacional
- **fastapi/uvicorn**: API e servidor
- **asyncpg**: Cliente PostgreSQL assíncrono
- **ask-sdk-core**: Desenvolvimento de skill Alexa

## Fluxo de Dados

### Processamento de Consulta

1. Usuário envia consulta (API ou Alexa)
2. Contexto é recuperado ou criado via MCP
3. Agente LangChain processa a consulta com ferramentas
4. Resposta é gerada e armazenada no contexto
5. Dados de aprendizado são extraídos
6. Resposta é enviada ao usuário

### Análise de Imagem

1. Usuário envia imagem
2. Módulo de visão processa a imagem
3. Pontos-chave são detectados e métricas calculadas
4. Visualização é gerada
5. Resultados são persistidos no banco
6. Relatório é enviado ao usuário

## Considerações de Escalabilidade

### Arquitetura Modular

O sistema é projetado com componentes independentes que podem ser escalados separadamente:

1. **API**: Pode ser distribuída entre múltiplas instâncias
2. **Processamento de Visão**: Pode ser isolado em serviços específicos para processamento intensivo
3. **Banco de Dados**: Suporta sharding e replicação

### Containers e Microsserviços

Para ambientes de produção em larga escala, a arquitetura pode ser adaptada para:

1. **Docker containers**: Encapsulamento de cada componente
2. **Kubernetes**: Orquestração de containers
3. **Microsserviços**: Separação funcional dos componentes principais

## Segurança

### Considerações de Segurança

O sistema implementa práticas de segurança incluindo:

1. **Autenticação JWT**: Para API e endpoints
2. **Criptografia de Dados**: Para informações sensíveis de usuários
3. **Sanitização de Entrada**: Para prevenir injeções e ataques
4. **Validação de Dados**: Em todos os níveis de entrada

## Conclusão

A arquitetura híbrida do sistema Meu Nutri combina o melhor do LangChain para orquestração de agentes com o Model Context Protocol para persistência otimizada. Esta abordagem permite criar um assistente nutricional inteligente que:

1. Aprende continuamente com interações
2. Fornece recomendações personalizadas baseadas em ciência
3. Adapta-se ao ritmo biológico individual
4. Integra-se com dispositivos de voz para uma experiência natural

A modularidade do sistema permite expansão contínua de funcionalidades e adaptação para diferentes casos de uso no domínio de saúde e bem-estar.
