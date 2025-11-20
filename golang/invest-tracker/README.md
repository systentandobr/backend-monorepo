# 🚀 Invest Tracker - Sistema de Rastreamento de Investimentos

Um sistema completo que monitora, analisa e simula investimentos em vários tipos de ativos financeiros, implementado com **Clean Architecture** e princípios **SOLID**.

## 🌐 **Deploy em Produção**

**URL**: https://invest-tracker-production-f332.up.railway.app

- ✅ **API REST** funcionando
- ✅ **Health Check**: `/health`
- ✅ **Documentação Swagger**: `/swagger/index.html`
- ✅ **Deploy automatizado** no Railway

## 🎯 **Recursos Implementados**

- 📊 **Coleta de dados** de APIs financeiras (Binance, etc.)
- 🔍 **Análise fundamental** de ativos
- 💡 **Detecção de oportunidades** de investimento
- 📈 **Simulação de portfólio** com diferentes estratégias
- 🔔 **Sistema de notificações** em tempo real
- 📚 **Documentação Swagger** automática
- 🐳 **Docker multi-stage** para produção
- 🚀 **Deploy automatizado** no Railway

## 🏗️ **Arquitetura**

Este projeto segue os princípios da **Clean Architecture** e design **SOLID**:

```
📁 cmd/                    # Pontos de entrada da aplicação
├── api/                   # API REST principal
└── jobs/                  # Jobs de coleta de dados

📁 internal/               # Código interno da aplicação
├── domain/               # Camada de Domínio
│   ├── analysis/         # Entidades de análise
│   ├── asset/           # Entidades de ativos
│   ├── notification/    # Entidades de notificação
│   └── simulation/      # Entidades de simulação
├── application/         # Camada de Aplicação
│   ├── analysis/        # Casos de uso de análise
│   ├── asset/          # Casos de uso de ativos
│   ├── notification/   # Casos de uso de notificação
│   └── simulation/     # Casos de uso de simulação
├── adapter/            # Camada de Adaptador
│   ├── controller/     # Controllers REST
│   ├── external/       # Integrações externas
│   ├── factory/       # Factories de injeção
│   └── persistence/   # Repositórios
└── bootstrap/         # Inicialização da aplicação

📁 pkg/                   # Pacotes reutilizáveis
├── common/             # Utilitários comuns
├── config/           # Configurações
└── infrastructure/   # Infraestrutura
```

## 🚀 **Como Começar**

### **1. Acesso à API em Produção**
```bash
# Health Check
curl https://invest-tracker-production-f332.up.railway.app/health

# Documentação Swagger
# Acesse: https://invest-tracker-production-f332.up.railway.app/swagger/index.html
```

### **2. Desenvolvimento Local**

```bash
# Clone o repositório
git clone <repository-url>
cd golang/invest-tracker

# Instalar dependências
go mod download

# Build dos serviços
make build

# Executar com Docker
make run

# Executar testes
make test

# Gerar documentação Swagger
make swagger

# Executar API localmente
make run-api
```

### **3. Docker**

```bash
# Build da imagem
docker build -f Dockerfile.script -t invest-tracker .

# Executar container
docker run -p 8888:8888 invest-tracker

# Testar health check
curl http://localhost:8888/health
```

### **4. Deploy no Railway**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login no Railway
railway login

# Deploy
railway up
```

## 📚 **Endpoints Principais**

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/health` | GET | Status da aplicação |
| `/swagger/index.html` | GET | Documentação Swagger |
| `/api/v1/assets` | GET | Listar ativos |
| `/api/v1/analysis` | GET | Análises de mercado |
| `/api/v1/simulation` | POST | Simular estratégias |
| `/api/v1/notifications` | GET | Notificações |

## 🔧 **Configuração**

### **Variáveis de Ambiente**
```bash
PORT=8888                    # Porta da aplicação
GIN_MODE=release             # Modo do Gin (release/debug)
ENVIRONMENT=production       # Ambiente (development/production)
```

### **Dependências Externas**
- **MongoDB**: Para persistência de dados
- **Redis**: Para cache e sessões
- **APIs Financeiras**: Binance, Alpha Vantage, etc.

## 🧪 **Testes**

```bash
# Executar todos os testes
make test

# Executar testes específicos
go test ./internal/domain/...

# Testes com cobertura
go test -cover ./...
```

## 📦 **Build e Deploy**

```bash
# Build para produção
make build

# Build Docker
docker build -f Dockerfile.script -t invest-tracker .

# Deploy no Railway
railway up --detach
```

## 🛠️ **Comandos Úteis**

```bash
# Limpar builds
make clean

# Gerar código
make generate

# Linting
make lint

# Docker Compose
make docker-compose

# Help
make help
```

## 📖 **Documentação Adicional**

- **Swagger**: https://invest-tracker-production-f332.up.railway.app/swagger/index.html
- **Arquitetura**: Ver `docs/architecture/`
- **Deploy**: Ver `deploy_guide.md`
- **LLMs**: Ver `llms-full.md`

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está sob a licença Apache 2.0. Veja o arquivo `LICENSE` para mais detalhes.
