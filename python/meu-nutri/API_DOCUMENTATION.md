# Meu Nutri API - Documentação de Endpoints

## Visão Geral

A API do Meu Nutri oferece endpoints abrangentes para gerenciamento de usuários, perfil nutricional e análises de saúde.

## Configuração do Supabase

### Variáveis de Ambiente
Crie um arquivo `.env` com as seguintes variáveis:
```
SUPABASE_URL=seu_url_do_supabase
SUPABASE_KEY=sua_chave_do_supabase
```

## Estrutura de Endpoints

### Autenticação de Usuários `/api/users`

#### Registro de Usuário
- **POST** `/register`
  - Cria novo usuário no Supabase
  - Campos necessários:
    - `username`: Nome de usuário (3-50 caracteres)
    - `email`: Endereço de email válido
    - `password`: Senha (mínimo 8 caracteres)
    - `full_name` (opcional)
    - `bio` (opcional)

#### Login de Usuário
- **POST** `/login`
  - Autentica usuário
  - Retorna token de acesso

### Perfil de Usuário `/api/profile`

#### Obter Perfil
- **GET** `/me`
  - Recupera informações detalhadas do perfil do usuário

#### Atualizar Perfil
- **PUT** `/update`
  - Atualiza informações do perfil do usuário
  - Permite atualização de nome, email, biografia e senha

### Nutrição `/api/nutrition`

#### Metas Nutricionais
- **POST** `/goals`
  - Define metas nutricionais para o usuário
  - Campos:
    - `weight_goal`: Meta de peso
    - `calorie_target`: Objetivo calórico
    - `diet_type`: Tipo de dieta
    - `health_conditions`: Condições de saúde

- **GET** `/goals/{user_id}`
  - Recupera metas nutricionais do usuário

#### Análise Nutricional
- **POST** `/analysis`
  - Registra nova análise nutricional
  - Inclui insights e recomendações

- **GET** `/analysis/{user_id}`
  - Recupera histórico de análises nutricionais

#### Registro de Refeições
- **POST** `/meal-log`
  - Registra uma refeição consumida
  - Inclui tipo de refeição, itens alimentares, calorias

- **GET** `/meal-logs/{user_id}`
  - Recupera registros de refeições
  - Opcional: filtrar por data de início e fim

## Modelo de Dados Exemplo

### Usuário
```json
{
  "id": "uuid_do_usuario",
  "username": "nutri_user",
  "email": "usuario@exemplo.com",
  "full_name": "Nome Completo",
  "bio": "Descrição pessoal"
}
```

### Meta Nutricional
```json
{
  "user_id": "uuid_do_usuario",
  "weight_goal": 70.5,
  "calorie_target": 2000,
  "diet_type": "low-carb",
  "health_conditions": ["diabetes"]
}
```

### Registro de Refeição
```json
{
  "user_id": "uuid_do_usuario",
  "meal_type": "café da manhã",
  "food_items": [
    {
      "name": "Ovo",
      "quantity": 2,
      "calories": 140
    }
  ],
  "total_calories": 140,
  "timestamp": "2024-02-15T08:30:00Z"
}
```

## Considerações de Segurança

- Todos os endpoints sensíveis requerem autenticação
- Senhas são criptografadas pelo Supabase
- Use HTTPS em produção
- Gerencie tokens de acesso com cuidado

## Próximos Passos

1. Implementar middleware de autenticação
2. Adicionar validações mais robustas
3. Implementar testes de integração
4. Configurar logging e monitoramento

## Suporte

Em caso de dúvidas, entre em contato com a equipe de desenvolvimento.
