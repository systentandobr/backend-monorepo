# 🚀 Railway Python - Configuração Docker

Este diretório contém a configuração para deploy da aplicação Python no Railway usando Docker.

## 📁 Estrutura

```
railway-python/
├── Dockerfile                  # Configuração do container Docker
├── Dockerfile.optimized        # Dockerfile com Yarn via repositório oficial
├── Dockerfile.corepack         # Dockerfile com Yarn via corepack (moderno)
├── railway.toml                # Configuração do Railway
├── .dockerignore               # Arquivos ignorados no build
├── test-docker-build.sh        # Script para testar build local
├── test-yarn-installation.sh   # Script para testar instalação do Yarn
└── README.md                  # Este arquivo
```

## ⚙️ Configuração

### 1. Railway.toml

O arquivo `railway.toml` está configurado com:

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"  # Path do Dockerfile

[deploy]
healthcheckPath = "/health"    # Endpoint de health check
healthcheckTimeout = 300       # Timeout do health check
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

[deploy.multiRegionConfig.us-west2]
numReplicas = 1

[networking]
staticOutboundIp = false

[deploy.env]
PYTHONPATH = "/app"
PYTHONUNBUFFERED = "1"
PORT = "8000"
```

### 2. Opções de Dockerfile

#### **Opção 1: Dockerfile (Padrão)**
- **Método**: `npm install -g yarn`
- **Vantagens**: Simples, compatível
- **Desvantagens**: Mais lento, depende do npm

#### **Opção 2: Dockerfile.optimized**
- **Método**: Repositório oficial do Yarn
- **Vantagens**: Mais rápido, oficial
- **Desvantagens**: Requer configuração adicional

#### **Opção 3: Dockerfile.corepack (Recomendado)**
- **Método**: Corepack (Node.js 16.10+)
- **Vantagens**: Mais moderno, oficial, mais rápido
- **Desvantagens**: Requer Node.js 16.10+

## 🧪 Testando Localmente

### Testar Instalação do Yarn

```bash
cd railway-python
./test-yarn-installation.sh
```

### Testar Build Completo

```bash
# Opção 1: Script automatizado
./test-docker-build.sh

# Opção 2: Comandos manuais
docker build -t life-tracker-onboarding .
docker run --rm -it -p 8000:8000 life-tracker-onboarding
```

## 🚀 Deploy no Railway

### 1. Escolher Dockerfile

Para usar um Dockerfile específico, modifique o `railway.toml`:

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile.corepack"  # Usar versão com corepack
```

### 2. Deploy

```bash
# Instalar CLI
npm install -g @railway/cli

# Login e deploy
railway login
cd railway-python
railway init
railway up
```

## 🔧 Comparação das Opções de Yarn

| Método | Velocidade | Tamanho | Compatibilidade | Recomendação |
|--------|------------|---------|-----------------|--------------|
| `npm install -g yarn` | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Para compatibilidade |
| Repositório oficial | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Para performance |
| Corepack | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | **Para projetos novos** |

### Detalhes Técnicos

#### **1. npm install -g yarn**
```dockerfile
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn
```

#### **2. Repositório oficial**
```dockerfile
RUN curl -fsSL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor -o /usr/share/keyrings/yarnkey.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && apt-get update \
    && apt-get install -y nodejs yarn
```

#### **3. Corepack (Recomendado)**
```dockerfile
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && corepack enable \
    && corepack prepare yarn@stable --activate
```

## 🔧 Variáveis de Ambiente

Configure as seguintes variáveis no Railway:

```bash
# Banco de dados
DATABASE_URL=postgresql://user:pass@host:port/db

# Agno Framework
AGNO_API_KEY=your_agno_api_key

# Outras configurações
ENVIRONMENT=production
LOG_LEVEL=info
```

## 📊 Monitoramento

### Health Check

O Railway verifica automaticamente o endpoint `/health`:

```bash
curl https://your-app.railway.app/health
```

### Logs

Acesse os logs no Railway Dashboard ou via CLI:

```bash
railway logs --tail
```

## 🔍 Troubleshooting

### Problemas Comuns

1. **Build falha**
   - Verifique se o `requirements.txt` existe
   - Teste localmente com `./test-docker-build.sh`

2. **Yarn não encontrado**
   - Teste com `./test-yarn-installation.sh`
   - Verifique se o Dockerfile correto está sendo usado

3. **Container não inicia**
   - Verifique os logs: `railway logs`
   - Confirme se a porta 8000 está exposta

### Comandos Úteis

```bash
# Verificar status do deploy
railway status

# Ver logs em tempo real
railway logs --tail

# Reiniciar serviço
railway service restart

# Ver variáveis de ambiente
railway variables

# Acessar shell do container
railway shell
```

## 📚 Documentação

- [Railway Documentation](https://docs.railway.app/)
- [Docker Documentation](https://docs.docker.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Yarn Documentation](https://yarnpkg.com/)
- [Corepack Documentation](https://nodejs.org/api/corepack.html)

## 🤝 Contribuição

Para contribuir:

1. Teste localmente antes do deploy
2. Use o script `test-yarn-installation.sh` para testar diferentes opções
3. Verifique se o health check está funcionando
4. Atualize este README se necessário

---

**✨ Dica**: Use `Dockerfile.corepack` para projetos novos - é a forma mais moderna e eficiente!
