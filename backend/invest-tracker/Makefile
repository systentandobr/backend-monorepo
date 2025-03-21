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
		docker build -t invest-tracker-$$service:latest -f deploy/docker/$$service/Dockerfile .; \
	done

docker-push:
	@echo "Pushing Docker images..."
	@for service in $(SERVICE_NAMES); do \
		echo "Pushing image for $$service..."; \
		docker push invest-tracker-$$service:latest; \
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
