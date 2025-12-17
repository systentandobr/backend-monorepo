#!/bin/bash
# Creates configuration files for the project
if [ $# -lt 2 ]; then echo "Usage: $0 <base_dir> <import_path>"; exit 1; fi
BASE_DIR=$1
IMPORT_PATH=$2

# go.mod
cat > $BASE_DIR/go.mod << EOT
module $IMPORT_PATH

go 1.21

require (
	go.mongodb.org/mongo-driver v1.12.1
	go.uber.org/zap v1.26.0
)
EOT

# Makefile
cat > $BASE_DIR/Makefile << 'EOT'
.PHONY: build run test clean generate

# Variables
GO_BUILD_FLAGS=-ldflags="-s -w" -trimpath
SERVICE_NAMES=api data-collector analyzer simulator notifier

# Main commands
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
EOT

# .gitignore
cat > $BASE_DIR/.gitignore << 'EOT'
# Binaries
/bin/
*.exe
*.dll
*.so
*.dylib

# Test binary
*.test

# Output of go coverage tool
*.out

# Dependency directories
vendor/

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

# Build directories
/dist/
/build/
/web/build/
EOT

# README.md
cat > $BASE_DIR/README.md << 'EOT'
# Investment Tracker

A system that monitors, analyzes, and simulates investments across various asset types.

## Features

- Data collection from financial APIs
- Asset fundamental analysis
- Investment opportunity detection
- Portfolio simulation
- Real-time notifications

## Architecture

This project follows Clean Architecture principles and SOLID design:

- **Domain Layer**: Core business entities and rules
- **Application Layer**: Use cases and business logic
- **Adapter Layer**: Implementation of interfaces
- **Infrastructure Layer**: External services integration

## Getting Started

```bash
# Build the services
make build

# Run with Docker
make run

# Run tests
make test
```
EOT

# docker-compose.yml
cat > $BASE_DIR/docker-compose.yml << 'EOT'
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: deploy/docker/api/Dockerfile
    ports:
      - "8080:8080"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017
      - MONGODB_DATABASE=invest_tracker
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
    depends_on:
      - mongodb
    restart: unless-stopped

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
EOT

echo "Configuration files created successfully"
