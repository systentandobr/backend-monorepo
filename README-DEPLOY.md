# Backend Monorepo - Estrutura de Deploy

Este documento descreve a estrutura de deploy customizada para o Backend Monorepo, que agrupa serviços por tecnologia usando Docker multi-stage build.

## 🏗️ Arquitetura

### Estrutura de Serviços

```
backend-monorepo/
├── nodejs/
│   ├── apis/                 # APIs NestJS
│   └── catalog-products/     # Catalog Products
├── python/
│   └── meu-nutri/           # Meu Nutri (FastAPI)
├── golang/
│   ├── invest-tracker/      # Invest Tracker
│   ├── zen-launcher/        # Zen Launcher
│   ├── catalog-structure/   # Catalog Structure
│   └── business/            # Business
└── deploy/
    ├── scripts/             # Scripts de build e deploy
    ├── configs/             # Configurações
    └── dockerfiles/         # Dockerfiles específicos
```

### Tecnologias Agrupadas

| Tecnologia | Serviços | Portas |
|------------|----------|--------|
| **Node.js** | APIs, Catalog Products | 3000, 3001 |
| **Python** | Meu Nutri | 8000 |
| **Go** | Invest Tracker, Zen Launcher, Catalog Structure, Business | 8080-8083 |

## 🐳 Docker Multi-Stage Build

### Estrutura do Dockerfile Principal

O `Dockerfile` principal usa multi-stage build para otimizar o processo:

1. **Stage 1 - Node.js Builder**: Compila serviços Node.js
2. **Stage 2 - Python Builder**: Prepara ambiente Python
3. **Stage 3 - Go Builder**: Compila binários Go
4. **Stage 4 - Runtime**: Imagem final com todos os serviços

### Vantagens do Multi-Stage Build

- ✅ **Otimização de tamanho**: Apenas binários necessários na imagem final
- ✅ **Segurança**: Não inclui ferramentas de build no runtime
- ✅ **Eficiência**: Reutiliza layers entre builds
- ✅ **Isolamento**: Cada tecnologia tem seu próprio ambiente de build

## 🚀 Como Usar

### Pré-requisitos

- Docker e Docker Compose instalados
- Git para clonar o repositório
- Make (opcional, para usar comandos simplificados)

### Comandos Rápidos

```bash
# Ver todos os comandos disponíveis
make help

# Build e deploy completo
make build
make deploy

# Ambiente de desenvolvimento
make dev

# Produção
make prod

# Ver logs
make logs

# Status dos serviços
make status
```

### Comandos Detalhados

#### 1. Build Local

```bash
# Build de todos os serviços
./deploy/scripts/build.sh

# Ou usando Make
make build
```

#### 2. Deploy

```bash
# Deploy em desenvolvimento
./deploy/scripts/deploy.sh development

# Deploy em produção
./deploy/scripts/deploy.sh production

# Deploy com limpeza
./deploy/scripts/deploy.sh development --clean
```

#### 3. Docker Compose

```bash
# Iniciar todos os serviços
docker-compose up -d

# Build e iniciar
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

## 📊 Monitoramento

### Health Checks

Cada serviço possui health checks configurados:

- **Node.js**: `http://localhost:3000/health`
- **Python**: `http://localhost:8000/health`
- **Go**: `http://localhost:8080/health` (cada serviço)

### Ferramentas de Monitoramento

| Ferramenta | URL | Descrição |
|------------|-----|-----------|
| **Prometheus** | http://localhost:9090 | Coleta de métricas |
| **Grafana** | http://localhost:3001 | Visualização de dados |
| **PgAdmin** | http://localhost:5050 | Admin PostgreSQL |
| **Mongo Express** | http://localhost:8081 | Admin MongoDB |
| **Redis Commander** | http://localhost:8082 | Admin Redis |

## 🗄️ Bancos de Dados

### Configuração

- **PostgreSQL**: Porta 5432 (Meu Nutri)
- **MongoDB**: Porta 27017 (Serviços Go)
- **Redis**: Porta 6379 (Cache)

### Inicialização

Os bancos são inicializados automaticamente com:
- Scripts SQL para PostgreSQL
- Configurações de usuário e senha
- Health checks configurados

## 🔧 Configuração de Ambiente

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# APIs Externas
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_do_supabase
OPENAI_API_KEY=sua_chave_da_openai

# Bancos de Dados
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/meu_nutri
MONGODB_URI=mongodb://mongodb:27017
REDIS_URL=redis://redis:6379

# Ambiente
NODE_ENV=production
PYTHONPATH=/app/services/python/meu-nutri
GIN_MODE=release
```

### Portas dos Serviços

| Serviço | Porta | Tecnologia |
|---------|-------|------------|
| APIs | 3000 | Node.js |
| Catalog Products | 3001 | Node.js |
| Meu Nutri | 8000 | Python |
| Invest Tracker | 8080 | Go |
| Zen Launcher | 8081 | Go |
| Catalog Structure | 8082 | Go |
| Business | 8083 | Go |

## 📝 Scripts Disponíveis

### Scripts de Build

- `deploy/scripts/build.sh`: Build completo de todos os serviços
- `deploy/scripts/start-services.sh`: Inicialização dos serviços no container

### Scripts de Deploy

- `deploy/scripts/deploy.sh`: Deploy automatizado com verificações

### Comandos Make

```bash
# Desenvolvimento
make dev              # Iniciar ambiente de desenvolvimento
make dev-build        # Build e iniciar desenvolvimento

# Deploy
make deploy           # Deploy em desenvolvimento
make prod             # Deploy em produção
make staging          # Deploy em staging

# Gerenciamento
make up               # Iniciar serviços
make down             # Parar serviços
make restart          # Reiniciar serviços
make status           # Status dos serviços
make logs             # Ver logs

# Limpeza
make clean            # Limpeza completa
make clean-build      # Limpar e rebuildar

# Testes
make test             # Executar todos os testes
make test-nodejs      # Testes Node.js
make test-python      # Testes Python
make test-golang      # Testes Go

# Linting
make lint             # Linting de todos os serviços
make lint-nodejs      # Linting Node.js
make lint-python      # Linting Python
make lint-golang      # Linting Go

# Monitoramento
make monitoring       # Abrir interfaces de monitoramento

# Utilitários
make shell            # Shell do container backend
make shell-postgres   # Shell PostgreSQL
make shell-mongodb    # Shell MongoDB
make shell-redis      # Shell Redis

# Backup
make backup           # Backup dos bancos
make restore          # Restaurar backup

# Informações
make info             # Informações do sistema
make version          # Versões dos serviços
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. Porta já em uso

```bash
# Verificar portas em uso
netstat -tulpn | grep :3000

# Parar serviços conflitantes
sudo systemctl stop nginx  # exemplo
```

#### 2. Erro de permissão

```bash
# Dar permissão aos scripts
chmod +x deploy/scripts/*.sh
```

#### 3. Container não inicia

```bash
# Ver logs detalhados
docker-compose logs backend-monorepo

# Verificar configuração
docker-compose config
```

#### 4. Banco de dados não conecta

```bash
# Verificar se os bancos estão rodando
docker-compose ps

# Testar conexão
docker-compose exec postgres pg_isready -U postgres
```

### Logs e Debug

```bash
# Logs em tempo real
make logs

# Logs específicos
make logs-backend
make logs-db

# Logs de um serviço específico
docker-compose logs -f backend-monorepo
```

## 🚀 Deploy em Produção

### Preparação

1. **Configurar variáveis de ambiente**:
   ```bash
   export SUPABASE_URL=sua_url
   export SUPABASE_KEY=sua_chave
   export OPENAI_API_KEY=sua_chave
   ```

2. **Build da imagem**:
   ```bash
   make build
   ```

3. **Deploy**:
   ```bash
   make prod
   ```

### Verificações Pós-Deploy

```bash
# Verificar status
make status

# Health checks
curl http://localhost:3000/health
curl http://localhost:8000/health
curl http://localhost:8080/health

# Ver logs
make logs
```

## 📈 Monitoramento em Produção

### Métricas Importantes

- **CPU e Memória**: Uso por container
- **Latência**: Tempo de resposta das APIs
- **Throughput**: Requisições por segundo
- **Erros**: Taxa de erro por serviço
- **Disco**: Uso de espaço em banco de dados

### Alertas

Configure alertas no Prometheus/Grafana para:
- Uso de CPU > 80%
- Uso de memória > 85%
- Taxa de erro > 5%
- Latência > 2s

## 🔄 CI/CD

### Pipeline Sugerido

```yaml
# .github/workflows/deploy.yml
name: Deploy Backend Monorepo

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and Deploy
        run: |
          make build
          make prod
```

## 📚 Recursos Adicionais

- [Docker Multi-Stage Build](https://docs.docker.com/develop/dev-best-practices/multistage-build/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Prometheus](https://prometheus.io/docs/)
- [Grafana](https://grafana.com/docs/)

## 🤝 Contribuição

Para contribuir com melhorias na estrutura de deploy:

1. Crie uma branch para sua feature
2. Implemente as mudanças
3. Teste localmente com `make dev`
4. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique a seção de troubleshooting
2. Consulte os logs com `make logs`
3. Abra uma issue no repositório 