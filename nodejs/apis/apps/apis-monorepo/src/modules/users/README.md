# Módulo de Usuários - Documentação

## Visão Geral

Este módulo fornece endpoints para consultar usuários disponíveis filtrados por domain (multi-tenancy). O domain é extraído automaticamente do usuário autenticado através do JWT.

## Funcionalidades Implementadas

### 1. Domain Interceptor
- **Arquivo**: `src/interceptors/domain.interceptor.ts`
- Extrai o `domain` do `user.profile.domain` e adiciona ao `request`
- Executado automaticamente quando o decorator `@UnitScope()` é usado

### 2. JwtAuthGuard Atualizado
- **Arquivo**: `src/guards/jwt-auth.guard.ts`
- Agora extrai e inclui o `domain` no `request.user`
- O domain vem de `user.profile.domain` ou `payload.profile.domain`

### 3. CurrentUserShape Atualizado
- **Arquivo**: `src/decorators/current-user.decorator.ts`
- Interface atualizada para incluir `domain?: string`

### 4. Endpoints de Usuários

#### GET `/users/available`
Lista usuários disponíveis filtrados pelo domain do usuário autenticado.

**Query Parameters:**
- `search` (opcional): Termo de busca para filtrar por nome, email ou username
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Limite de resultados por página (padrão: 50)

**Exemplo de uso:**
```bash
GET /users/available?search=franqueado&page=1&limit=20
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "68bddc927f1317a4d7e10091",
      "username": "franqueado1",
      "email": "franqueado1@example.com",
      "profile": {
        "firstName": "João",
        "lastName": "Silva",
        "domain": "viralkids-web"
      },
      "roles": [...],
      "isActive": true
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

#### GET `/users/:id`
Busca um usuário específico por ID do mesmo domain.

**Exemplo de uso:**
```bash
GET /users/68bddc927f1317a4d7e10091
Authorization: Bearer <token>
```

## Como Funciona

1. **Autenticação**: O usuário faz login e recebe um JWT token do SYS-SEGURANÇA
2. **Validação**: O `JwtAuthGuard` valida o token e extrai o `domain` do `user.profile.domain`
3. **Interceptor**: O `DomainInterceptor` adiciona o domain ao `request.domain` e `request.user.domain`
4. **Consulta**: O endpoint `/users/available` usa o domain do usuário autenticado para filtrar usuários no SYS-SEGURANÇA

## Integração com SYS-SEGURANÇA

O módulo consulta o SYS-SEGURANÇA através do endpoint:
```
GET {SYS_SEGURANCA_URL}/api/v1/users?domain={domain}&search={search}&page={page}&limit={limit}
```

**Headers necessários:**
- `x-api-key`: API Key configurada em `EnvironmentConfig.sysSeguranca.apiKey`

## Configuração

As seguintes variáveis de ambiente são necessárias:

```env
SYS_SEGURANCA_URL=http://localhost:8888
SYS_SEGURANCA_API_KEY=your-api-key-secret
SYS_SEGURANCA_TIMEOUT=5000
```

## Uso em Outros Módulos

Para usar o domain em outros módulos, você pode:

1. **Usar o decorator `@CurrentUser()`**:
```typescript
@Get()
async list(@CurrentUser() user: CurrentUserShape) {
  const domain = user.domain || user.profile?.domain;
  // Usar domain para filtrar recursos
}
```

2. **Acessar diretamente do request**:
```typescript
@Get()
async list(@Req() request: any) {
  const domain = request.domain || request.user?.domain;
  // Usar domain para filtrar recursos
}
```

3. **Usar o interceptor automaticamente**:
O `DomainInterceptor` é aplicado automaticamente quando você usa `@UnitScope()`.

## Tratamento de Erros

- **404**: Se o endpoint `/api/v1/users` não existir no SYS-SEGURANÇA, retorna lista vazia
- **401**: Token inválido ou expirado
- **Domain não encontrado**: Erro se o usuário não tiver domain configurado

## Próximos Passos

- [ ] Adicionar cache de usuários por domain
- [ ] Implementar paginação mais robusta
- [ ] Adicionar filtros adicionais (roles, status, etc.)
- [ ] Implementar rate limiting por domain

