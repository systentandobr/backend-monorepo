# Guia de Integração com Alexa

Este documento fornece instruções detalhadas para integrar o Meu Nutri com a Amazon Alexa, permitindo interações por voz através de dispositivos Alexa.

## Visão Geral da Integração

A integração com Alexa permite que os usuários interajam com o sistema Meu Nutri usando comandos de voz como:

- "Alexa, pergunte ao Meu Nutri qual a melhor hora para exercícios"
- "Alexa, diga ao Meu Nutri que almocei salada e frango"
- "Alexa, peça ao Meu Nutri recomendações para a noite"

## Pré-requisitos

1. Conta de desenvolvedor Amazon (developer.amazon.com)
2. API Meu Nutri em execução e acessível pela internet
3. Compreensão básica do modelo de desenvolvimento de skills Alexa

## Etapas para Configuração da Skill Alexa

### 1. Configurar Ambiente Backend

O backend da skill Alexa pode ser implementado de duas formas:

#### Opção A: AWS Lambda Function (Recomendado para Produção)

1. Crie uma função Lambda no AWS Console
   - Runtime: Python 3.9
   - Gatilho: Alexa Skills Kit

2. Faça upload do código:
   ```bash
   # Prepare o pacote
   cd /home/marcelio/developing/systentando/backend-monorepo/python/meu-nutri
   mkdir -p deploy/alexa
   cp -r app/alexa deploy/alexa/
   pip install ask-sdk-core requests -t deploy/alexa/
   cd deploy/alexa
   zip -r lambda_package.zip .
   ```

3. Faça upload do arquivo zip para a função Lambda

4. Configure variáveis de ambiente na função Lambda:
   - `MEUNUTRI_API_ENDPOINT`: URL da sua API
   - `MEUNUTRI_API_KEY`: Chave de autenticação

#### Opção B: Endpoint HTTP (Útil para Desenvolvimento)

1. Garanta que sua API esteja acessível pela internet:
   ```bash
   # Usando ngrok para expor localhost (temporário)
   ngrok http 8000
   ```

2. Configure o endpoint `/api/alexa/webhook` para processar requisições Alexa

### 2. Criar a Skill no Console Alexa

1. Acesse [developer.amazon.com](https://developer.amazon.com) e entre em Developer Console

2. Selecione "Alexa Skills" e clique em "Create Skill"

3. Complete as informações básicas:
   - Nome da Skill: "Meu Nutri"
   - Modelo: Custom
   - Método de hospedagem: 
     - Para opção A: "Alexa-hosted"
     - Para opção B: "Provision your own"

4. Selecione "Start from scratch" e clique em "Create skill"

### 3. Configurar o Modelo de Interação

1. No console de desenvolvedor, vá para "Interaction Model" > "JSON Editor"

2. Cole o seguinte modelo (adapte conforme necessário):

```json
{
  "interactionModel": {
    "languageModel": {
      "invocationName": "meu nutri",
      "intents": [
        {
          "name": "AMAZON.CancelIntent",
          "samples": []
        },
        {
          "name": "AMAZON.HelpIntent",
          "samples": []
        },
        {
          "name": "AMAZON.StopIntent",
          "samples": []
        },
        {
          "name": "NutritionQueryIntent",
          "slots": [
            {
              "name": "query",
              "type": "AMAZON.SearchQuery"
            }
          ],
          "samples": [
            "me fale sobre {query}",
            "quais alimentos são {query}",
            "como melhorar {query}",
            "o que devo comer para {query}",
            "nutrientes em {query}",
            "dê informações sobre {query}",
            "me explique sobre {query}"
          ]
        },
        {
          "name": "CircadianRecommendationIntent",
          "slots": [
            {
              "name": "activityType",
              "type": "ActivityType"
            },
            {
              "name": "timeFrame",
              "type": "TimeFrame"
            }
          ],
          "samples": [
            "recomendação para {activityType} {timeFrame}",
            "melhor hora para {activityType}",
            "o que fazer {timeFrame}",
            "recomendação circadiana para {timeFrame}",
            "quando devo {activityType}",
            "qual é o melhor momento para {activityType}"
          ]
        },
        {
          "name": "MealLogIntent",
          "slots": [
            {
              "name": "mealType",
              "type": "MealType"
            },
            {
              "name": "foodItems",
              "type": "AMAZON.Food"
            }
          ],
          "samples": [
            "registre que comi {foodItems}",
            "anote que {mealType} foi {foodItems}",
            "registre {foodItems} como {mealType}",
            "acabei de comer {foodItems}",
            "meu {mealType} foi {foodItems}"
          ]
        }
      ],
      "types": [
        {
          "name": "ActivityType",
          "values": [
            {
              "name": {
                "value": "exercício"
              }
            },
            {
              "name": {
                "value": "treino"
              }
            },
            {
              "name": {
                "value": "alimentação"
              }
            },
            {
              "name": {
                "value": "comer"
              }
            },
            {
              "name": {
                "value": "trabalho"
              }
            },
            {
              "name": {
                "value": "estudo"
              }
            },
            {
              "name": {
                "value": "sono"
              }
            },
            {
              "name": {
                "value": "meditação"
              }
            }
          ]
        },
        {
          "name": "TimeFrame",
          "values": [
            {
              "name": {
                "value": "manhã"
              }
            },
            {
              "name": {
                "value": "tarde"
              }
            },
            {
              "name": {
                "value": "noite"
              }
            },
            {
              "name": {
                "value": "hoje"
              }
            },
            {
              "name": {
                "value": "agora"
              }
            }
          ]
        },
        {
          "name": "MealType",
          "values": [
            {
              "name": {
                "value": "café da manhã"
              }
            },
            {
              "name": {
                "value": "almoço"
              }
            },
            {
              "name": {
                "value": "jantar"
              }
            },
            {
              "name": {
                "value": "lanche"
              }
            },
            {
              "name": {
                "value": "ceia"
              }
            }
          ]
        }
      ]
    }
  }
}
```

3. Salve o modelo e construa o modelo de voz

### 4. Configurar o Endpoint

1. Vá para "Endpoint" no menu lateral

2. Selecione o tipo de endpoint:
   - Para opção A (Lambda): Escolha "AWS Lambda ARN" e insira o ARN da sua função
   - Para opção B (HTTP): Escolha "HTTPS" e insira a URL do seu webhook

3. Se usar um endpoint HTTP, configure o cabeçalho de verificação de skill

4. Salve o endpoint

### 5. Testar a Skill

1. Vá para a aba "Test" no topo do console

2. Habilite o teste para a skill

3. Digite ou fale comandos para testar a integração:
   - "Alexa, pergunte ao Meu Nutri qual o melhor momento para exercícios"
   - "Alexa, diga ao Meu Nutri que almocei arroz, feijão e salada"
   - "Alexa, peça ao Meu Nutri dicas para a noite"

## Implementação da Skill no Backend

Para implementar a skill no backend, siga os passos abaixo:

### 1. Configurar o Endpoint Alexa

Adicione o endpoint webhook no arquivo `app/main.py`:

```python
from app.alexa.skill import lambda_handler
from fastapi import Request

@app.post("/api/alexa/webhook", include_in_schema=False)
async def alexa_webhook(request: Request):
    """Endpoint para receber webhooks da Alexa."""
    # Converte a requisição para o formato que o ASK SDK espera
    body = await request.json()
    
    # Processa com o handler Lambda
    result = lambda_handler(body, None)
    
    # Retorna a resposta
    return result
```

### 2. Ajustar o Handler Lambda

O arquivo `app/alexa/skill.py` já contém a implementação básica do handler Lambda. Para adicionar mais funcionalidades:

1. Adicione novos handlers para intents específicos
2. Implemente lógica de negócio para cada intent
3. Adicione tratamento de erro e fallbacks

### 3. Linkando Contas (Opcional)

Para personalizar a experiência para usuários específicos:

1. Configure Account Linking no console Alexa:
   - Vá para "Account Linking" no menu lateral
   - Configure o fluxo OAuth 2.0 para seu serviço

2. Implemente o mecanismo de autenticação na sua API

3. Obtenha o ID do usuário nas requisições da Alexa:
   ```python
   user_id = handler_input.request_envelope.context.system.user.user_id
   access_token = handler_input.request_envelope.context.system.user.access_token
   ```

## Melhores Práticas

### Respostas Vocais

1. **Seja Conciso**: Mantenha respostas curtas e diretas
2. **Forneça Contexto**: Inclua contexto suficiente para o usuário entender a resposta
3. **Use Variações**: Varie as respostas para evitar repetição
4. **Considere Reprompts**: Inclua sugestões sobre o que o usuário pode perguntar a seguir

### Tratamento de Erros

1. **Erros de Entendimento**: Quando a Alexa não entende a solicitação, forneça exemplos claros
2. **Timeout da API**: Tenha respostas de fallback quando o backend não responde
3. **Informação Incompleta**: Solicite informações adicionais quando necessário

### Persistência

1. **Gerenciamento de Estado**: Use o DynamoDB para persistir dados entre sessões
2. **Recuperação de Contexto**: Implemente mecanismos para recuperar o contexto da conversa
3. **Sincronização com API**: Mantenha os dados sincronizados entre Alexa e backend

## Exemplo de Diálogo

**Usuário**: "Alexa, abra Meu Nutri"

**Alexa**: "Bem-vindo ao Meu Nutri. Posso ajudar com recomendações nutricionais personalizadas, registrar suas refeições ou fornecer dicas baseadas no seu ritmo circadiano. O que você gostaria de saber hoje?"

**Usuário**: "Qual o melhor momento para exercícios hoje?"

**Alexa**: "Com base no seu ritmo circadiano, o melhor momento para exercícios hoje seria no final da tarde, entre 17h e 19h. Nesse período, sua temperatura corporal está elevada e seu desempenho físico tende a estar no auge. Você gostaria de saber que tipo de exercício é mais recomendado para esse horário?"

**Usuário**: "Sim, por favor"

**Alexa**: "Para o final da tarde, são recomendados exercícios de intensidade moderada a alta, como corrida, ciclismo ou treinamento com pesos. Sua capacidade cardiovascular e força muscular estão próximas do pico nesse horário, permitindo um treino mais eficiente. Posso te ajudar com mais alguma dúvida sobre seu ritmo circadiano?"

## Depuração

### Logs do Lambda

Para depurar problemas na função Lambda:
1. Configure o nível de log em `app/alexa/skill.py`
2. Acesse os logs no CloudWatch
3. Analise erros e fluxos de conversa

### Testes Locais

Para testar localmente antes de implantar:
1. Use o simulador do console Alexa
2. Execute testes automatizados:
   ```bash
   python -m unittest tests/test_alexa_skill.py
   ```

## Certificação e Publicação

Quando estiver pronto para publicar sua skill:

1. Preencha todas as informações da skill:
   - Descrição
   - Ícones e imagens
   - Exemplos de frases
   - Política de privacidade

2. Submeta para certificação e aguarde a aprovação

3. Após aprovada, promova a skill para seus usuários

## Recursos Adicionais

- [Documentação Oficial da ASK SDK](https://developer.amazon.com/en-US/docs/alexa/alexa-skills-kit-sdk-for-python/overview.html)
- [Melhores Práticas de Voice Design](https://developer.amazon.com/en-US/docs/alexa/alexa-design/get-started.html)
- [Ferramentas de Teste para Skills](https://developer.amazon.com/en-US/docs/alexa/test/test-tools.html)
