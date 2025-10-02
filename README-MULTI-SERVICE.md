# 🚀 Backend Monorepo - Multi-Service Architecture

## 📋 Visão Geral

Este projeto implementa uma arquitetura multi-service para o Railway, separando as APIs por tecnologia (Node.js, Python, Go) em serviços independentes.

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Node.js APIs  │    │  Python APIs    │    │    Go APIs      │
│   (Port 3000)   │    │   (Port 8000)   │    │   (Port 7777)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Railway       │
                    │   Platform      │
                    └─────────────────┘
```

## 🎯 Estratégias Implementadas

### 1. **Multi-Service Railway** (RECOMENDADA)
- Cada tecnologia em um serviço separado no Railway
- Deploy independente
- Escalabilidade individual
- Monitoramento específico

### 2. **Docker Compose Local**
- Desenvolvimento local com todos os serviços
- Nginx como reverse proxy
- Monitoramento com Prometheus + Grafana

## 🚀 Quick Start

### Opção 1: Deploy no Railway (Produção)

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login no Railway
railway login

# 3. Executar deploy automatizado
chmod +x deploy-multi-service.sh
./deploy-multi-service.sh
```

### Opção 2: Desenvolvimento Local

```bash
# 1. Iniciar todos os serviços
docker-compose -f docker-compose.multi-service.yml up -d

# 2. Verificar status
docker-compose -f docker-compose.multi-service.yml ps

# 3. Ver logs
docker-compose -f docker-compose.multi-service.yml logs -f
```

## 📁 Estrutura de Diretórios

```
backend-monorepo/
├── railway-nodejs/           # Serviços Node.js
│   ├── Dockerfile
│   ├── railway.toml
│   └── apps/
├── railway-python/           # Serviços Python
│   ├── Dockerfile
│   ├── railway.toml
│   └── services/
├── railway-golang/           # Serviços Go
│   ├── Dockerfile
│   ├── railway.toml
│   └── services/
├── nginx/                    # Configuração Nginx
│   └── nginx.conf
├── monitoring/               # Configuração monitoramento
├── deploy-multi-service.sh   # Script de deploy
└── docker-compose.multi-service.yml
```

## 🔧 Configuração

### Variáveis de Ambiente (Railway Dashboard)

```bash
# Databases
DATABASE_URL=postgresql://user:pass@host:5432/dbname
MONGODB_URI=mongodb://user:pass@host:27017/dbname
REDIS_URL=redis://user:pass@host:6379

# External APIs
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key

# Service Discovery
NODEJS_API_URL=https://nodejs-service.railway.app
PYTHON_API_URL=https://python-service.railway.app
GOLANG_API_URL=https://golang-service.railway.app

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

## 🌐 Endpoints

### Node.js Services
- **Health**: `GET /health`
- **APIs**: `GET /api/nodejs/`
- **Life Tracker**: `GET /api/life-tracker/`
- **Segurança**: `GET /api/seguranca/`
- **Produtos**: `GET /api/produtos/`

### Python Services
- **Health**: `GET /health`
- **APIs**: `GET /api/python/`
- **Meu Nutri**: `GET /api/meu-nutri/`
- **Life Tracker**: `GET /api/life-tracker-python/`

### Go Services
- **Health**: `GET /health`
- **APIs**: `GET /api/golang/`
- **Invest Tracker**: `GET /api/invest-tracker/`
- **Zen Launcher**: `GET /api/zen-launcher/`

## 📊 Monitoramento

### Local Development
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

### Railway Production
- **Railway Dashboard**: Monitoramento nativo
- **Logs**: `railway logs --service <service-name>`
- **Status**: `railway status --service <service-name>`

## 🔄 Deploy Commands

### Deploy Individual
```bash
# Node.js apenas
./deploy-multi-service.sh --nodejs-only

# Python apenas
./deploy-multi-service.sh --python-only

# Go apenas
./deploy-multi-service.sh --golang-only
```

### Verificar Status
```bash
./deploy-multi-service.sh --check-status
```

## 🛠️ Desenvolvimento

### Adicionar Novo Serviço

1. **Criar diretório do serviço**:
```bash
mkdir railway-newservice
cd railway-newservice
```

2. **Criar Dockerfile**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

3. **Criar railway.toml**:
```toml
[build]
builder = "DOCKERFILE"

[deploy]
healthcheckPath = "/health"
```

4. **Adicionar ao script de deploy**:
```bash
# Editar deploy-multi-service.sh
create_project "backend-newservice" "railway-newservice"
deploy_service "New Service" "railway-newservice"
```

### Health Checks

Cada serviço deve implementar um endpoint `/health`:

```javascript
// Node.js
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});
```

```python
# Python
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}
```

```go
// Go
func healthHandler(c *gin.Context) {
    c.JSON(200, gin.H{
        "status": "healthy",
        "timestamp": time.Now(),
    })
}
```

## 🔒 Segurança

### Rate Limiting
- API endpoints: 10 requests/second
- Login endpoints: 1 request/second

### Headers de Segurança
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Content-Security-Policy configurado

### Autenticação
- JWT tokens para APIs
- Basic auth para monitoramento
- HTTPS obrigatório em produção

## 💰 Custos e Otimização

### Resource Allocation
- **Node.js**: 512MB RAM, 0.5 CPU
- **Python**: 256MB RAM, 0.25 CPU
- **Go**: 256MB RAM, 0.25 CPU

### Auto-scaling
- CPU usage > 70%
- Memory usage > 80%
- Request rate > 100 req/min

## 🐛 Troubleshooting

### Problemas Comuns

1. **Serviço não inicia**:
```bash
# Verificar logs
railway logs --service <service-name>

# Verificar variáveis de ambiente
railway variables --service <service-name>
```

2. **Health check falha**:
```bash
# Verificar endpoint
curl https://<service>.railway.app/health

# Verificar configuração
cat railway-<service>/railway.toml
```

3. **Comunicação entre serviços**:
```bash
# Verificar URLs configuradas
railway variables --service <service-name> | grep API_URL
```

### Logs Úteis

```bash
# Logs em tempo real
railway logs --service backend-nodejs --follow

# Logs dos últimos 1000 eventos
railway logs --service backend-python --limit 1000

# Logs de erro apenas
railway logs --service backend-golang --level error
```

## 📈 Vantagens desta Arquitetura

✅ **Deploy Independente**: Cada serviço pode ser atualizado sem afetar outros
✅ **Escalabilidade**: Escalar apenas serviços com alta demanda
✅ **Monitoramento**: Métricas específicas por tecnologia
✅ **Debugging**: Logs isolados por serviço
✅ **Custos**: Otimização de recursos por serviço
✅ **Manutenção**: Equipes podem trabalhar independentemente
✅ **Tecnologia**: Usar a melhor tecnologia para cada caso de uso

## ⚠️ Considerações

⚠️ **Complexidade**: Mais serviços para gerenciar
⚠️ **Latência**: Comunicação entre serviços
⚠️ **Custos**: Múltiplos serviços podem custar mais
⚠️ **Debugging**: Mais complexo para issues distribuídos

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Implemente seguindo os padrões estabelecidos
4. Teste localmente com Docker Compose
5. Deploy no Railway para testes
6. Abra um Pull Request

## 📞 Suporte

- **Documentação**: Este README
- **Issues**: GitHub Issues
- **Railway**: Railway Dashboard
- **Logs**: `railway logs --service <service-name>`

---

**Desenvolvido com ❤️ seguindo os princípios SOLID e Clean Architecture**
