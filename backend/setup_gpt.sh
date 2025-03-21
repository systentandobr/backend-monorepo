#!/bin/bash
# Script para criar a estrutura de diretórios do Investment Tracker
nome_do_modulo=${1}

# Cores para saída formatada
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Criando estrutura do projeto Investment Tracker...${NC}"

# Criar diretório raiz
mkdir -p ${nome_do_modulo}
cd ${nome_do_modulo}

# Criar estrutura principal
mkdir -p cmd/{api,jobs,templates}
mkdir -p pkg/{common/{errors,logger,utils},infrastructure/{database/{mongodb,redis},http,messaging/{kafka,rabbitmq},services/{b3,binance,notifications}}}
mkdir -p internal/domain/{asset/{entity,repository,service,valueobject},analysis/{entity,repository,service,strategy},simulation/{entity,repository,service},notification/{entity,repository,service},user/{entity,repository,service}}
mkdir -p internal/{application/{asset,analysis,simulation,notification,user},ports/{input,output},adapter/{controller,presenter,persistence,external}}
mkdir -p web/{src/{components,pages,hooks,store},public}
mkdir -p deploy/{docker/{api,job-collector,job-analyzer},kubernetes}
mkdir -p test docs

# Criar arquivos base
touch go.mod README.md Makefile .gitignore

# Inicializar go.mod
cat > go.mod << 'EOF'
module github.com/systentandobr/life-tracker/backend/${nome_do_modulo}

go 1.21
EOF

# Criar README
cat > README.md << 'EOF'
# Sistema Inteligente de Análise e Monitoramento de Investimentos

## Visão Geral
Sistema composto por microsserviços que capturam, analisam e monitoram dados financeiros de diferentes tipos de ativos (fundos imobiliários, ações e criptomoedas) para construir uma carteira de investimentos inteligente baseada em dados.

## Componentes Principais

1. **Serviço de Coleta de Dados (GoLang)**
2. **Serviço de Análise (Python)**
3. **Serviço de Simulação**
4. **Sistema de Notificações**
5. **Interface de Usuário**

## Arquitetura

O projeto segue os princípios de Clean Architecture e SOLID:

- **Domain Layer**: Entidades e regras de negócio
- **Application Layer**: Casos de uso da aplicação
- **Ports Layer**: Interfaces para comunicação entre camadas
- **Adapter Layer**: Implementações concretas dos ports

## Microsserviços

Cada componente principal é implementado como um microsserviço independente, facilitando:
- Escalabilidade horizontal
- Desenvolvimento em paralelo
- Implantação e manutenção simplificadas

## Como executar

```bash
# Construir os containers
make build

# Executar localmente
make run

# Executar testes
make test
```

## Licença
Este projeto está licenciado sob a MIT License
EOF

# Criar Makefile
cat > Makefile << 'EOF'
.PHONY: build run test clean generate

# Variáveis
GO_BUILD_FLAGS=-ldflags="-s -w" -trimpath
SERVICE_NAMES=api data-collector analyzer simulator notifier

# Comandos principais
build: clean generate
	@echo "Building all services..."
	@for service in $(SERVICE_NAMES); do \
		echo "Building $$service..."; \
		go build $(GO_BUILD_FLAGS) -o bin/$$service ./cmd/$$service; \
	done

run:
	@echo "Starting services locally..."
	@docker-compose up -d

test:
	@echo "Running tests..."
	@go test -v ./...

clean:
	@echo "Cleaning up..."
	@rm -rf bin/
	@mkdir -p bin/

generate:
	@echo "Generating code..."
	@go generate ./...

# Docker commands
docker-build:
	@echo "Building Docker images..."
	@for service in $(SERVICE_NAMES); do \
		echo "Building image for $$service..."; \
		docker build -t ${nome_do_modulo}-$$service:latest -f deploy/docker/$$service/Dockerfile .; \
	done

docker-push:
	@echo "Pushing Docker images..."
	@for service in $(SERVICE_NAMES); do \
		echo "Pushing image for $$service..."; \
		docker push ${nome_do_modulo}-$$service:latest; \
	done

# Kubernetes commands
k8s-deploy:
	@echo "Deploying to Kubernetes..."
	@kubectl apply -f deploy/kubernetes/

k8s-delete:
	@echo "Removing from Kubernetes..."
	@kubectl delete -f deploy/kubernetes/

# Helper commands
help:
	@echo "Available commands:"
	@echo " - build: Build all services"
	@echo " - run: Run services locally using docker-compose"
	@echo " - test: Run all tests"
	@echo " - clean: Remove build artifacts"
	@echo " - generate: Generate code"
	@echo " - docker-build: Build Docker images"
	@echo " - docker-push: Push Docker images"
	@echo " - k8s-deploy: Deploy to Kubernetes"
	@echo " - k8s-delete: Remove from Kubernetes"
EOF

# Criar .gitignore
cat > .gitignore << 'EOF'
# Binaries
/bin/
*.exe
*.exe~
*.dll
*.so
*.dylib

# Test binary, built with `go test -c`
*.test

# Output of the go coverage tool
*.out

# Dependency directories
vendor/

# Go workspace file
go.work

# Environment variables
.env
.env.*
!.env.example

# IDE files
.idea/
.vscode/
*.swp
*.swo

# Logs
*.log

# macOS
.DS_Store

# Node modules
node_modules/

# Build directories
/dist/
/build/
/web/build/

# Debug files
__debug_bin
EOF

echo -e "${GREEN}Estrutura do projeto criada com sucesso!${NC}"
echo "Próximos passos:"
echo "1. cd ${nome_do_modulo}"
echo "2. git init"
echo "3. go mod tidy"