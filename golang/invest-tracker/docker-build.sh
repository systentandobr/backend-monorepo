#!/bin/bash

# Script de build usando Docker (mais confiável)
# Segue as melhores práticas do Go para produção

set -e  # Exit on any error

echo "🚀 Iniciando build com Docker..."

# Configurações
PROJECT_NAME="invest-tracker"
SERVICE_NAME="api"
VERSION=$(git describe --tags --always --dirty 2>/dev/null || echo "dev")

# Limpar builds anteriores
echo "🧹 Limpando builds anteriores..."
rm -rf ./bin
mkdir -p ./bin

# Build usando Docker
echo "🔨 Compilando aplicação com Docker..."
docker run --rm \
    -v "$(pwd)":/app \
    -w /app \
    golang:1.23-alpine \
    sh -c "
        apk add --no-cache git ca-certificates tzdata &&
        go mod download &&
        CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
            -ldflags='-s -w -X main.version=$VERSION' \
            -trimpath \
            -o /app/bin/$SERVICE_NAME \
            ./cmd/api
    "

# Verificar se o binário foi criado
if [ ! -f "./bin/$SERVICE_NAME" ]; then
    echo "❌ Erro: Binário não foi criado em ./bin/$SERVICE_NAME"
    exit 1
fi

echo "✅ Build concluído com sucesso!"
echo "📦 Binário criado: ./bin/$SERVICE_NAME"
echo "🏷️  Versão: $VERSION"

# Mostrar informações do binário
echo "📊 Informações do binário:"
ls -lh "./bin/$SERVICE_NAME"
file "./bin/$SERVICE_NAME"

echo "🎯 Pronto para deploy no Railway!"
echo "💡 Execute: railway up"
