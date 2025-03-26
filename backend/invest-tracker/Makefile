.PHONY: build run test clean swagger generate templates lint docker docker-compose

# Variables
GO_BUILD_FLAGS=-ldflags="-s -w" -trimpath
SERVICE_NAMES=api #data-collector analyzer simulator notifier
BUILD_DIR=./bin
DOCKER_REGISTRY=systentando
PROJECT_NAME=invest-tracker
VERSION=$(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")

# Main commands
all: clean swagger generate build

build: 
	@echo "Building all services..."
	@mkdir -p $(BUILD_DIR)
	@for service in $(SERVICE_NAMES); do \
		echo "Building $$service..."; \
		go build $(GO_BUILD_FLAGS) -o $(BUILD_DIR)/$$service ./cmd/$$service; \
	done

run:
	@echo "Starting services locally..."
	@docker-compose up -d

run-api: build
	@echo "Starting API service locally..."
	@$(BUILD_DIR)/api

test:
	@echo "Running tests..."
	@go test -v ./...

clean:
	@echo "Cleaning up..."
	@rm -rf $(BUILD_DIR)
	@mkdir -p $(BUILD_DIR)

# Code generation
generate:
	@echo "Generating code..."
	@go generate ./...

swagger:
	@echo "Generating Swagger documentation..."
	@if ! command -v swag > /dev/null; then \
		echo "Installing swag..."; \
		go install github.com/swaggo/swag/cmd/swag@latest; \
	fi
	@cd cmd/api && swag init -g main.go -o ../../docs

templates:
	@echo "Setting up template generators..."
	@./scripts/setup_templates.sh

# Development tools
lint:
	@echo "Running linters..."
	@if ! command -v golangci-lint > /dev/null; then \
		echo "Installing golangci-lint..."; \
		curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(shell go env GOPATH)/bin; \
	fi
	@golangci-lint run

# Docker commands
docker:
	@echo "Building Docker images..."
	@for service in $(SERVICE_NAMES); do \
		echo "Building Docker image for $$service..."; \
		docker build -t $(DOCKER_REGISTRY)/$(PROJECT_NAME)-$$service:$(VERSION) -f deploy/docker/$$service/Dockerfile .; \
	done

docker-compose:
	@echo "Building and starting services with Docker Compose..."
	@docker compose up --build -d

# Generate new component using templates
gen-entity:
	@[ "${domain}" ] || ( echo "Error: domain parameter is required. Usage: make gen-entity domain=asset entity=Stock"; exit 1 )
	@[ "${entity}" ] || ( echo "Error: entity parameter is required. Usage: make gen-entity domain=asset entity=Stock"; exit 1 )
	@echo "Generating entity: $(entity) in domain: $(domain)"
	@cd cmd/templates && ./generate.sh entity $(domain) $(entity)

gen-all:
	@[ "${domain}" ] || ( echo "Error: domain parameter is required. Usage: make gen-all domain=asset entity=Stock"; exit 1 )
	@[ "${entity}" ] || ( echo "Error: entity parameter is required. Usage: make gen-all domain=asset entity=Stock"; exit 1 )
	@echo "Generating all components for entity: $(entity) in domain: $(domain)"
	@cd cmd/templates && ./generate.sh all $(domain) $(entity)

# Help
help:
	@echo "Investment Tracker Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make build              Build all services"
	@echo "  make run                Run services with Docker Compose"
	@echo "  make run-api            Run API service locally"
	@echo "  make test               Run tests"
	@echo "  make clean              Clean build artifacts"
	@echo "  make generate           Run Go generate"
	@echo "  make swagger            Generate Swagger documentation"
	@echo "  make templates          Set up template generators"
	@echo "  make lint               Run linters"
	@echo "  make docker             Build Docker images"
	@echo "  make docker-compose     Build and run with Docker Compose"
	@echo "  make gen-entity domain=<domain> entity=<Entity>    Generate a new entity"
	@echo "  make gen-all domain=<domain> entity=<Entity>       Generate all components for an entity"
	@echo "  make help               Show this help"
	@echo ""
	@echo "Examples:"
	@echo "  make gen-entity domain=asset entity=Stock"
	@echo "  make gen-all domain=analysis entity=ValueInvestment"