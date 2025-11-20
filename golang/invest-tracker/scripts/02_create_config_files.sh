#!/bin/bash
# 02_create_config_files.sh - Cria os arquivos de configuração básicos do projeto

# Cores para formatação do output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Verifica se os parâmetros foram fornecidos
if [ $# -lt 2 ]; then
  echo "Uso: $0 <base_dir> <import_path>"
  exit 1
fi

BASE_DIR=$1
IMPORT_PATH=$2

echo "Criando arquivos de configuração em: $BASE_DIR"

# Função para criar um arquivo
create_file() {
  local file_path="$1"
  local content="$2"
  
  if [ ! -f "$file_path" ]; then
    echo -e "${GREEN}Criando arquivo:${NC} $file_path"
    echo "$content" > "$file_path"
  else
    echo -e "${YELLOW}Arquivo já existe:${NC} $file_path"
    echo -e "${YELLOW}Atualizando conteúdo...${NC}"
    echo "$content" > "$file_path"
  fi
}

# Entrar no diretório base
cd "$BASE_DIR" || exit 1

# Criar go.mod
GO_MOD_CONTENT="module $IMPORT_PATH

go 1.21

require (
	go.mongodb.org/mongo-driver v1.12.1
	go.uber.org/zap v1.26.0
)

require (
	github.com/golang/snappy v0.0.4 // indirect
	github.com/klauspost/compress v1.17.0 // indirect
	github.com/montanaflynn/stats v0.7.0 // indirect
	github.com/xdg-go/pbkdf2 v1.0.0 // indirect
	github.com/xdg-go/scram v1.1.2 // indirect
	github.com/xdg-go/stringprep v1.0.4 // indirect
	github.com/youmark/pkcs8 v0.0.0-20201027041543-1326539a0a0a // indirect
	go.uber.org/multierr v1.11.0 // indirect
	golang.org/x/crypto v0.14.0 // indirect
	golang.org/x/sync v0.3.0 // indirect
	golang.org/x/text v0.13.0 // indirect
)
"
create_file "go.mod" "$GO_MOD_CONTENT"

# Criar .gitignore
GITIGNORE_CONTENT="# Binaries
/bin/
*.exe
*.exe~
*.dll
*.so
*.dylib

# Test binary, built with \`go test -c\`
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
"
create_file ".gitignore" "$GITIGNORE_CONTENT"

# Criar README.md
README_CONTENT="# Sistema Inteligente de Análise e Monitoramento de Investimentos

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

\`\`\`bash
# Construir os containers
make build

# Executar localmente
make run

# Executar testes
make test
\`\`\`

## Licença
Este projeto está licenciado sob a MIT License
"
create_file "README.md" "$README_CONTENT"

# Criar Makefile
MAKEFILE_CONTENT=".PHONY: build run test clean generate

# Variáveis
GO_BUILD_FLAGS=-ldflags=\"-s -w\" -trimpath
SERVICE_NAMES=api data-collector analyzer simulator notifier

# Comandos principais
build: clean generate
	@echo \"Building all services...\"
	@for service in \$(SERVICE_NAMES); do \
		echo \"Building \$\$service...\"; \
		go build \$(GO_BUILD_FLAGS) -o bin/\$\$service ./cmd/\$\$service; \
	done

run:
	@echo \"Starting services locally...\"
	@docker-compose up -d

test:
	@echo \"Running tests...\"
	@go test -v ./...

clean:
	@echo \"Cleaning up...\"
	@rm -rf bin/
	@mkdir -p bin/

generate:
	@echo \"Generating code...\"
	@go generate ./...

# Docker commands
docker-build:
	@echo \"Building Docker images...\"
	@for service in \$(SERVICE_NAMES); do \
		echo \"Building image for \$\$service...\"; \
		docker build -t invest-tracker-\$\$service:latest -f deploy/docker/\$\$service/Dockerfile .; \
	done

docker-push:
	@echo \"Pushing Docker images...\"
	@for service in \$(SERVICE_NAMES); do \
		echo \"Pushing image for \$\$service...\"; \
		docker push invest-tracker-\$\$service:latest; \
	done

# Kubernetes commands
k8s-deploy:
	@echo \"Deploying to Kubernetes...\"
	@kubectl apply -f deploy/kubernetes/

k8s-delete:
	@echo \"Removing from Kubernetes...\"
	@kubectl delete -f deploy/kubernetes/

# Helper commands
help:
	@echo \"Available commands:\"
	@echo \" - build: Build all services\"
	@echo \" - run: Run services locally using docker-compose\"
	@echo \" - test: Run all tests\"
	@echo \" - clean: Remove build artifacts\"
	@echo \" - generate: Generate code\"
	@echo \" - docker-build: Build Docker images\"
	@echo \" - docker-push: Push Docker images\"
	@echo \" - k8s-deploy: Deploy to Kubernetes\"
	@echo \" - k8s-delete: Remove from Kubernetes\"
"
create_file "Makefile" "$MAKEFILE_CONTENT"

# Criar .env.example
ENV_EXAMPLE_CONTENT="# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=invest_tracker
MONGODB_TIMEOUT=10

# API Configuration
API_PORT=8888
API_SECRET=your_secret_key_here
API_CORS_ORIGIN=*

# External Services
B3_API_URL=https://api.example.com/b3
B3_API_KEY=your_api_key_here
BINANCE_API_URL=https://api.binance.com/api/v3
BINANCE_API_KEY=your_api_key_here
BINANCE_API_SECRET=your_api_secret_here

# Notification Settings
EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_PORT=587
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@example.com

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
"
create_file ".env.example" "$ENV_EXAMPLE_CONTENT"

# Criar docker-compose.yml
DOCKER_COMPOSE_CONTENT="version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: deploy/docker/api/Dockerfile
    ports:
      - \"8888:8888\"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017
      - MONGODB_DATABASE=invest_tracker
      - API_PORT=8888
      - LOG_LEVEL=info
    depends_on:
      - mongodb
    restart: unless-stopped

  data-collector:
    build:
      context: .
      dockerfile: deploy/docker/job-collector/Dockerfile
    environment:
      - MONGODB_URI=mongodb://mongodb:27017
      - MONGODB_DATABASE=invest_tracker
      - LOG_LEVEL=info
    depends_on:
      - mongodb
    restart: unless-stopped

  analyzer:
    build:
      context: .
      dockerfile: deploy/docker/job-analyzer/Dockerfile
    environment:
      - MONGODB_URI=mongodb://mongodb:27017
      - MONGODB_DATABASE=invest_tracker
      - LOG_LEVEL=info
    depends_on:
      - mongodb
    restart: unless-stopped

  mongodb:
    image: mongo:6
    ports:
      - \"27017:27017\"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - \"6379:6379\"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  mongodb_data:
  redis_data:
"
create_file "docker-compose.yml" "$DOCKER_COMPOSE_CONTENT"

echo "Arquivos de configuração criados com sucesso!"