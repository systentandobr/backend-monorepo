# Makefile - Backend Monorepo
# Comandos para facilitar o desenvolvimento e deploy

.PHONY: help build deploy dev prod clean logs status test lint

# Configurações
DOCKER_COMPOSE = docker-compose
DOCKER_IMAGE = backend-monorepo
ENVIRONMENT ?= development

# Cores para output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m # No Color

# Função para log colorido
define log
	@echo "$(BLUE)[$(shell date '+%Y-%m-%d %H:%M:%S')]$(NC) $1"
endef

define log_success
	@echo "$(GREEN)[SUCCESS]$(NC) $1"
endef

define log_error
	@echo "$(RED)[ERROR]$(NC) $1"
endef

# Comando padrão
help: ## Mostra esta ajuda
	@echo "$(BLUE)Backend Monorepo - Comandos disponíveis:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BLUE)Exemplos:$(NC)"
	@echo "  make build          # Build local dos serviços"
	@echo "  make deploy         # Deploy em desenvolvimento"
	@echo "  make prod           # Deploy em produção"
	@echo "  make dev            # Iniciar ambiente de desenvolvimento"
	@echo "  make logs           # Ver logs dos serviços"
	@echo "  make build-docker   # Build da imagem Docker"

# ===========================================
# BUILD E COMPILAÇÃO
# ===========================================
build: ## Build local dos serviços
	$(call log,"Iniciando build dos serviços...")
	@chmod +x deploy/scripts/build.sh
	@./deploy/scripts/build.sh
	$(call log_success,"Build concluído!")

build-docker: ## Build da imagem Docker
	$(call log,"Buildando imagem Docker...")
	@docker build -t $(DOCKER_IMAGE):latest .
	$(call log_success,"Imagem Docker buildada!")

# ===========================================
# DEPLOY
# ===========================================
deploy: ## Deploy em desenvolvimento
	$(call log,"Iniciando deploy em desenvolvimento...")
	@chmod +x deploy/scripts/deploy.sh
	@./deploy/scripts/deploy.sh development
	$(call log_success,"Deploy em desenvolvimento concluído!")

prod: ## Deploy em produção
	$(call log,"Iniciando deploy em produção...")
	@chmod +x deploy/scripts/deploy.sh
	@./deploy/scripts/deploy.sh production
	$(call log_success,"Deploy em produção concluído!")

staging: ## Deploy em staging
	$(call log,"Iniciando deploy em staging...")
	@chmod +x deploy/scripts/deploy.sh
	@./deploy/scripts/deploy.sh staging
	$(call log_success,"Deploy em staging concluído!")

# ===========================================
# DESENVOLVIMENTO
# ===========================================
dev: ## Iniciar ambiente de desenvolvimento
	$(call log,"Iniciando ambiente de desenvolvimento...")
	@$(DOCKER_COMPOSE) up -d
	$(call log_success,"Ambiente de desenvolvimento iniciado!")
	@echo "$(GREEN)APIs disponíveis:$(NC)"
	@echo "  - Node.js APIs: http://localhost:3000"
	@echo "  - Catalog Products: http://localhost:3001"
	@echo "  - Meu Nutri (Python): http://localhost:8000"
	@echo "  - Invest Tracker (Go): http://localhost:8080"
	@echo "  - Zen Launcher (Go): http://localhost:8081"
	@echo "  - Catalog Structure (Go): http://localhost:8082"
	@echo "  - Business (Go): http://localhost:8083"

dev-build: ## Build e iniciar ambiente de desenvolvimento
	$(call log,"Build e iniciando ambiente de desenvolvimento...")
	@$(DOCKER_COMPOSE) up -d --build
	$(call log_success,"Ambiente de desenvolvimento iniciado!")

# ===========================================
# GERENCIAMENTO
# ===========================================
up: ## Iniciar todos os serviços
	$(call log,"Iniciando todos os serviços...")
	@$(DOCKER_COMPOSE) up -d
	$(call log_success,"Serviços iniciados!")

down: ## Parar todos os serviços
	$(call log,"Parando todos os serviços...")
	@$(DOCKER_COMPOSE) down
	$(call log_success,"Serviços parados!")

restart: ## Reiniciar todos os serviços
	$(call log,"Reiniciando todos os serviços...")
	@$(DOCKER_COMPOSE) restart
	$(call log_success,"Serviços reiniciados!")

status: ## Ver status dos serviços
	$(call log,"Status dos serviços:")
	@$(DOCKER_COMPOSE) ps

logs: ## Ver logs dos serviços
	$(call log,"Logs dos serviços:")
	@$(DOCKER_COMPOSE) logs -f

logs-backend: ## Ver logs apenas do backend
	$(call log,"Logs do backend:")
	@$(DOCKER_COMPOSE) logs -f backend-monorepo

logs-db: ## Ver logs dos bancos de dados
	$(call log,"Logs dos bancos de dados:")
	@$(DOCKER_COMPOSE) logs -f postgres mongodb redis

# ===========================================
# LIMPEZA
# ===========================================
clean: ## Limpeza completa (containers, volumes, imagens)
	$(call log,"Executando limpeza completa...")
	@$(DOCKER_COMPOSE) down -v
	@docker image prune -f
	@docker volume prune -f
	@docker system prune -f
	$(call log_success,"Limpeza concluída!")

clean-build: ## Limpar e rebuildar
	$(call log,"Limpando e rebuildando...")
	@make clean
	@make build
	$(call log_success,"Limpeza e rebuild concluídos!")

# ===========================================
# TESTES
# ===========================================
test: ## Executar testes
	$(call log,"Executando testes...")
	@echo "Testes ainda não implementados"
	$(call log_success,"Testes concluídos!")

test-nodejs: ## Executar testes Node.js
	$(call log,"Executando testes Node.js...")
	@cd nodejs/apis && npm test
	@cd nodejs/catalog-products && npm test
	$(call log_success,"Testes Node.js concluídos!")

test-python: ## Executar testes Python
	$(call log,"Executando testes Python...")
	@cd python/meu-nutri && python -m pytest
	$(call log_success,"Testes Python concluídos!")

test-golang: ## Executar testes Go
	$(call log,"Executando testes Go...")
	@cd golang && go test ./...
	$(call log_success,"Testes Go concluídos!")

# ===========================================
# LINTING E FORMATTING
# ===========================================
lint: ## Executar linting em todos os serviços
	$(call log,"Executando linting...")
	@make lint-nodejs
	@make lint-python
	@make lint-golang
	$(call log_success,"Linting concluído!")

lint-nodejs: ## Linting Node.js
	$(call log,"Linting Node.js...")
	@cd nodejs/apis && npm run lint
	@cd nodejs/catalog-products && npm run lint
	$(call log_success,"Linting Node.js concluído!")

lint-python: ## Linting Python
	$(call log,"Linting Python...")
	@cd python/meu-nutri && python -m flake8 app/
	$(call log_success,"Linting Python concluído!")

lint-golang: ## Linting Go
	$(call log,"Linting Go...")
	@cd golang && go vet ./...
	@cd golang && golangci-lint run
	$(call log_success,"Linting Go concluído!")

# ===========================================
# MONITORAMENTO
# ===========================================
monitoring: ## Abrir interfaces de monitoramento
	$(call log,"Abrindo interfaces de monitoramento...")
	@echo "$(GREEN)Interfaces disponíveis:$(NC)"
	@echo "  - Prometheus: http://localhost:9090"
	@echo "  - Grafana: http://localhost:3001"
	@echo "  - PgAdmin: http://localhost:5050"
	@echo "  - Mongo Express: http://localhost:8081"
	@echo "  - Redis Commander: http://localhost:8082"

# ===========================================
# UTILITÁRIOS
# ===========================================
shell: ## Acessar shell do container backend
	$(call log,"Acessando shell do backend...")
	@$(DOCKER_COMPOSE) exec backend-monorepo /bin/bash

shell-postgres: ## Acessar shell do PostgreSQL
	$(call log,"Acessando shell do PostgreSQL...")
	@$(DOCKER_COMPOSE) exec postgres psql -U postgres -d meu_nutri

shell-mongodb: ## Acessar shell do MongoDB
	$(call log,"Acessando shell do MongoDB...")
	@$(DOCKER_COMPOSE) exec mongodb mongosh

shell-redis: ## Acessar shell do Redis
	$(call log,"Acessando shell do Redis...")
	@$(DOCKER_COMPOSE) exec redis redis-cli

# ===========================================
# BACKUP E RESTORE
# ===========================================
backup: ## Criar backup dos bancos de dados
	$(call log,"Criando backup dos bancos...")
	@mkdir -p backups
	@$(DOCKER_COMPOSE) exec postgres pg_dump -U postgres meu_nutri > backups/postgres_$(shell date +%Y%m%d_%H%M%S).sql
	@$(DOCKER_COMPOSE) exec mongodb mongodump --out backups/mongodb_$(shell date +%Y%m%d_%H%M%S)
	$(call log_success,"Backup criado!")

restore: ## Restaurar backup (especificar arquivo com BACKUP_FILE=arquivo.sql)
	$(call log,"Restaurando backup...")
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "$(RED)Especifique o arquivo de backup: make restore BACKUP_FILE=arquivo.sql$(NC)"; \
		exit 1; \
	fi
	@$(DOCKER_COMPOSE) exec -T postgres psql -U postgres meu_nutri < backups/$(BACKUP_FILE)
	$(call log_success,"Backup restaurado!")

# ===========================================
# INFORMAÇÕES
# ===========================================
info: ## Mostrar informações do sistema
	$(call log,"Informações do sistema:")
	@echo "$(GREEN)Docker:$(NC)"
	@docker --version
	@echo "$(GREEN)Docker Compose:$(NC)"
	@docker-compose --version
	@echo "$(GREEN)Containers rodando:$(NC)"
	@$(DOCKER_COMPOSE) ps
	@echo "$(GREEN)Uso de recursos:$(NC)"
	@docker stats --no-stream

version: ## Mostrar versões dos serviços
	$(call log,"Versões dos serviços:")
	@echo "$(GREEN)Node.js APIs:$(NC)"
	@$(DOCKER_COMPOSE) exec backend-monorepo node --version
	@echo "$(GREEN)Python:$(NC)"
	@$(DOCKER_COMPOSE) exec backend-monorepo python --version
	@echo "$(GREEN)Go:$(NC)"
	@$(DOCKER_COMPOSE) exec backend-monorepo go version 