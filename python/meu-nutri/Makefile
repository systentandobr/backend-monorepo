# Makefile para o projeto Meu Nutri

# Variáveis
PYTHON = python3
PIP = pip
VENV = venv
VENV_ACTIVATE = $(VENV)/bin/activate
DOCKER_COMPOSE = docker compose
DOCKER_COMPOSE_FILE = docker-compose.yml
APP_NAME = meu-nutri
POSTGRES_DB = meu_nutri
POSTGRES_USER = postgres
POSTGRES_PASSWORD = postgres
POSTGRES_PORT = 5432
TEST_SCRIPT = test_agent.py
SERVER_SCRIPT = app/main.py
TMP_DIR = /tmp/meu-nutri

# Cores para output
GREEN = \033[0;32m
RED = \033[0;31m
BLUE = \033[0;34m
YELLOW = \033[0;33m
NC = \033[0m # No Color

# Mensagens
DOCKER_START_MSG = "${GREEN}Iniciando PostgreSQL no Docker...${NC}"
DOCKER_STOP_MSG = "${YELLOW}Parando PostgreSQL no Docker...${NC}"
VENV_CREATE_MSG = "${GREEN}Criando ambiente virtual...${NC}"
INSTALL_DEPS_MSG = "${GREEN}Instalando dependências...${NC}"
API_START_MSG = "${GREEN}Iniciando API do Meu Nutri...${NC}"
TEST_START_MSG = "${BLUE}Executando testes...${NC}"
SETUP_COMPLETE_MSG = "${GREEN}Configuração completa!${NC}"
ENV_SETUP_MSG = "${GREEN}Configurando arquivo .env...${NC}"

# Diretório de visualizações
$(shell mkdir -p $(TMP_DIR)/visualizations)

.PHONY: all setup clean docker-start docker-stop venv install-deps api test create-env help validate-tools

# Alvo padrão
all: setup

# Configuração completa
setup: docker-start venv install-deps create-env
	@echo $(SETUP_COMPLETE_MSG)
	@echo "${BLUE}Use 'make api' para iniciar a API${NC}"
	@echo "${BLUE}Use 'make test' para executar os testes${NC}"

# Criar arquivo docker-compose.yml
docker-compose.yml:
	@echo "Criando arquivo docker-compose.yml..."
	@echo "version: '3.8'" > $(DOCKER_COMPOSE_FILE)
	@echo "services:" >> $(DOCKER_COMPOSE_FILE)
	@echo "  postgres:" >> $(DOCKER_COMPOSE_FILE)
	@echo "    image: postgres:14" >> $(DOCKER_COMPOSE_FILE)
	@echo "    container_name: $(APP_NAME)-postgres" >> $(DOCKER_COMPOSE_FILE)
	@echo "    environment:" >> $(DOCKER_COMPOSE_FILE)
	@echo "      POSTGRES_DB: $(POSTGRES_DB)" >> $(DOCKER_COMPOSE_FILE)
	@echo "      POSTGRES_USER: $(POSTGRES_USER)" >> $(DOCKER_COMPOSE_FILE)
	@echo "      POSTGRES_PASSWORD: $(POSTGRES_PASSWORD)" >> $(DOCKER_COMPOSE_FILE)
	@echo "    ports:" >> $(DOCKER_COMPOSE_FILE)
	@echo "      - \"$(POSTGRES_PORT):5432\"" >> $(DOCKER_COMPOSE_FILE)
	@echo "    volumes:" >> $(DOCKER_COMPOSE_FILE)
	@echo "      - $(APP_NAME)-pg-data:/var/lib/postgresql/data" >> $(DOCKER_COMPOSE_FILE)
	@echo "    healthcheck:" >> $(DOCKER_COMPOSE_FILE)
	@echo "      test: [\"CMD-SHELL\", \"pg_isready -U $(POSTGRES_USER) -d $(POSTGRES_DB)\"]" >> $(DOCKER_COMPOSE_FILE)
	@echo "      interval: 5s" >> $(DOCKER_COMPOSE_FILE)
	@echo "      timeout: 5s" >> $(DOCKER_COMPOSE_FILE)
	@echo "      retries: 5" >> $(DOCKER_COMPOSE_FILE)
	@echo "volumes:" >> $(DOCKER_COMPOSE_FILE)
	@echo "  $(APP_NAME)-pg-data:" >> $(DOCKER_COMPOSE_FILE)

# Iniciar PostgreSQL no Docker
docker-start: docker-compose.yml
	@echo $(DOCKER_START_MSG)
	@$(DOCKER_COMPOSE) up -d postgres
	@echo "${GREEN}PostgreSQL iniciado na porta $(POSTGRES_PORT)${NC}"
	@echo "${GREEN}Aguardando PostgreSQL ficar pronto...${NC}"
	@sleep 3  # Aguarda o contêiner iniciar completamente

# Parar PostgreSQL no Docker
docker-stop:
	@echo $(DOCKER_STOP_MSG)
	@$(DOCKER_COMPOSE) down

# Criar ambiente virtual
$(VENV_ACTIVATE):
	@echo $(VENV_CREATE_MSG)
	@$(PYTHON) -m venv $(VENV)
	@echo "${GREEN}Ambiente virtual criado em './$(VENV)'${NC}"

venv: $(VENV_ACTIVATE)

# Instalar dependências
install-deps: $(VENV_ACTIVATE) requirements.txt
	@echo $(INSTALL_DEPS_MSG)
	@. $(VENV_ACTIVATE) && $(PIP) install -r requirements.txt
	@echo "${GREEN}Dependências instaladas com sucesso!${NC}"

# Criar arquivo .env
create-env:
	@echo $(ENV_SETUP_MSG)
	@if [ ! -f .env ]; then \
		echo "# API Keys (substitua com suas chaves reais)" > .env; \
		echo "OPENAI_API_KEY=sua_chave_openai" >> .env; \
		echo "ANTHROPIC_API_KEY=sua_chave_anthropic" >> .env; \
		echo "" >> .env; \
		echo "# Configurações PostgreSQL" >> .env; \
		echo "POSTGRES_CONNECTION_STRING=postgresql://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@localhost:$(POSTGRES_PORT)/$(POSTGRES_DB)" >> .env; \
		echo "" >> .env; \
		echo "# Configurações de armazenamento" >> .env; \
		echo "VISUALIZATIONS_DIR=$(TMP_DIR)/visualizations" >> .env; \
		echo "" >> .env; \
		echo "# Configurações Alexa (para ambiente de produção)" >> .env; \
		echo "MEUNUTRI_API_ENDPOINT=http://localhost:8000" >> .env; \
		echo "MEUNUTRI_API_KEY=chave_teste_local" >> .env; \
		echo "${YELLOW}Arquivo .env criado. Edite-o para incluir suas chaves reais.${NC}"; \
	else \
		echo "${YELLOW}Arquivo .env já existe. Mantendo configuração atual.${NC}"; \
	fi

# Limpar ambiente
clean:
	@echo "${YELLOW}Limpando ambiente...${NC}"
	@$(DOCKER_COMPOSE) down -v
	@rm -rf $(VENV)
	@echo "${YELLOW}Ambiente limpo!${NC}"

# Iniciar API
api: setup
	@echo $(API_START_MSG)
	@. $(VENV_ACTIVATE) && uvicorn $(SERVER_SCRIPT):app --reload --host 0.0.0.0 --port 8000

# Executar testes
test: setup
	@echo $(TEST_START_MSG)
	@echo "${BLUE}Escolha um dos testes abaixo:${NC}"
	@echo "${BLUE}1. Testar todos os componentes${NC}"
	@echo "${BLUE}2. Testar apenas o agente híbrido${NC}"
	@echo "${BLUE}3. Testar apenas o módulo de visão${NC}"
	@echo "${BLUE}4. Testar apenas o engine circadiano${NC}"
	@echo "${BLUE}5. Testar apenas a integração Alexa${NC}"
	@read -p "Opção (1-5): " option; \
	case $$option in \
		1) . $(VENV_ACTIVATE) && $(PYTHON) $(TEST_SCRIPT) --all ;; \
		2) . $(VENV_ACTIVATE) && $(PYTHON) $(TEST_SCRIPT) --agent ;; \
		3) . $(VENV_ACTIVATE) && $(PYTHON) $(TEST_SCRIPT) --vision ;; \
		4) . $(VENV_ACTIVATE) && $(PYTHON) $(TEST_SCRIPT) --circadian ;; \
		5) . $(VENV_ACTIVATE) && $(PYTHON) $(TEST_SCRIPT) --alexa ;; \
		*) echo "${RED}Opção inválida!${NC}" ;; \
	esac

# Executar teste específico diretamente
test-all: setup
	@. $(VENV_ACTIVATE) && $(PYTHON) $(TEST_SCRIPT) --all

test-agent: setup
	@. $(VENV_ACTIVATE) && $(PYTHON) $(TEST_SCRIPT) --agent

test-vision: setup
	@. $(VENV_ACTIVATE) && $(PYTHON) $(TEST_SCRIPT) --vision

test-circadian: setup
	@. $(VENV_ACTIVATE) && $(PYTHON) $(TEST_SCRIPT) --circadian

test-alexa: setup
	@. $(VENV_ACTIVATE) && $(PYTHON) $(TEST_SCRIPT) --alexa

# Validar ferramentas
validate-tools: venv
	@echo "${BLUE}Validando ferramentas do agente...${NC}"
	@chmod +x tools_validator.py
	@. $(VENV_ACTIVATE) && ./tools_validator.py

# Ajuda
help:
	@echo "Uso: make <comando>"
	@echo ""
	@echo "Comandos:"
	@echo "  setup          - Configura todo o ambiente (Docker, ambiente virtual, dependências, etc.)"
	@echo "  api            - Inicia a API do Meu Nutri"
	@echo "  test           - Executa testes interativamente (pergunta qual teste executar)"
	@echo "  test-all       - Executa todos os testes"
	@echo "  test-agent     - Testa apenas o agente híbrido"
	@echo "  test-vision    - Testa apenas o módulo de visão"
	@echo "  test-circadian - Testa apenas o engine circadiano"
	@echo "  test-alexa     - Testa apenas a integração Alexa"
	@echo "  validate-tools - Valida todas as ferramentas do agente"
	@echo "  docker-start   - Inicia apenas o PostgreSQL no Docker"
	@echo "  docker-stop    - Para o PostgreSQL no Docker"
	@echo "  venv           - Cria apenas o ambiente virtual"
	@echo "  install-deps   - Instala apenas as dependências"
	@echo "  create-env     - Cria apenas o arquivo .env"
	@echo "  clean          - Remove Docker, ambiente virtual e limpa o ambiente"
	@echo "  help           - Exibe esta ajuda"
