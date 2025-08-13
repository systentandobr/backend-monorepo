# 🔧 Configuração CORS - Life Tracker API

## 📋 Visão Geral

Este documento explica como o CORS (Cross-Origin Resource Sharing) foi configurado na aplicação Life Tracker API para permitir requisições do frontend.

## 🚀 Configuração Implementada

### Localização da Configuração
A configuração do CORS está no arquivo: `apps/apis-monorepo/src/main.ts`

### Configuração Atual

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8080',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
});
```

## 🔍 Explicação dos Parâmetros

### `origin`
- **Descrição**: Lista de origens permitidas para fazer requisições
- **Valores configurados**:
  - `localhost:3000` - React/Next.js padrão
  - `localhost:3001` - Porta alternativa
  - `localhost:5173` - Vite dev server
  - `localhost:8080` - Porta alternativa
  - `127.0.0.1:*` - IP local (equivalente ao localhost)

### `methods`
- **Descrição**: Métodos HTTP permitidos
- **Valores**: GET, POST, PUT, DELETE, PATCH, OPTIONS

### `allowedHeaders`
- **Descrição**: Headers HTTP permitidos nas requisições
- **Headers incluídos**:
  - `Origin` - Origem da requisição
  - `X-Requested-With` - Identifica requisições AJAX
  - `Content-Type` - Tipo de conteúdo
  - `Accept` - Tipos aceitos
  - `Authorization` - Token de autenticação
  - `Cache-Control` - Controle de cache
  - `Pragma` - Controle de cache (legacy)

### `credentials: true`
- **Descrição**: Permite o envio de cookies e headers de autenticação
- **Importante**: Necessário para autenticação com JWT

### `preflightContinue: false`
- **Descrição**: Termina a requisição preflight automaticamente
- **Benefício**: Simplifica o tratamento de requisições OPTIONS

### `optionsSuccessStatus: 204`
- **Descrição**: Status HTTP retornado para requisições OPTIONS bem-sucedidas
- **Padrão**: 204 (No Content)

## 🧪 Como Testar

### 1. Usando o Arquivo de Teste
Execute o arquivo `test-cors.html` em um navegador:

```bash
# Abra o arquivo no navegador
open test-cors.html
```

### 2. Teste Manual com cURL

```bash
# Teste de requisição simples
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:9090/habits

# Teste de requisição real
curl -H "Origin: http://localhost:3000" \
     -H "Content-Type: application/json" \
     http://localhost:9090/habits
```

### 3. Teste no Frontend

```javascript
// Exemplo de requisição do frontend
fetch('http://localhost:9090/habits', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Para cookies/auth
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erro CORS:', error));
```

## 🔧 Personalização

### Adicionar Novas Origem
Para adicionar uma nova origem (ex: produção):

```typescript
origin: [
  'http://localhost:3000',
  'https://seu-dominio.com', // Nova origem
  'https://app.seu-dominio.com', // Subdomínio
],
```

### Configuração para Desenvolvimento
Para permitir todas as origens em desenvolvimento:

```typescript
origin: process.env.NODE_ENV === 'production' 
  ? ['https://seu-dominio.com'] 
  : true, // Permite todas as origens
```

### Configuração Dinâmica
Para configuração baseada em variáveis de ambiente:

```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001',
];

app.enableCors({
  origin: allowedOrigins,
  // ... outras configurações
});
```

## 🚨 Troubleshooting

### Erro: "No 'Access-Control-Allow-Origin' header"
- **Causa**: Origem não está na lista de origens permitidas
- **Solução**: Adicione a origem à lista `origin`

### Erro: "Method not allowed"
- **Causa**: Método HTTP não está na lista de métodos permitidos
- **Solução**: Adicione o método à lista `methods`

### Erro: "Header not allowed"
- **Causa**: Header não está na lista de headers permitidos
- **Solução**: Adicione o header à lista `allowedHeaders`

### Erro com Credentials
- **Causa**: `credentials: true` não está configurado
- **Solução**: Verifique se `credentials: true` está definido

## 📚 Recursos Adicionais

- [Documentação NestJS CORS](https://docs.nestjs.com/security/cors)
- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [CORS Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#cors)

## ✅ Checklist de Verificação

- [ ] Aplicação está rodando na porta 9090
- [ ] CORS está habilitado no main.ts
- [ ] Origem do frontend está na lista de origens permitidas
- [ ] Métodos HTTP necessários estão permitidos
- [ ] Headers necessários estão permitidos
- [ ] Credentials está configurado (se necessário)
- [ ] Teste CORS está passando

---

**Última atualização**: 13/08/2025  
**Versão**: 1.0.0 