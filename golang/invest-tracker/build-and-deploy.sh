#!/bin/bash

# Script de build e deploy para Railway
# Segue as melhores práticas do Go para produção

set -e  # Exit on any error

echo "🚀 Iniciando build e deploy do Invest Tracker..."

# Configurações
PROJECT_NAME="invest-tracker"
BUILD_DIR="./bin"
SERVICE_NAME="api"
VERSION=$(git describe --tags --always --dirty 2>/dev/null || echo "dev")

# Limpar builds anteriores
echo "🧹 Limpando builds anteriores..."
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR

# Gerar documentação Swagger (se necessário)
echo "📚 Gerando documentação Swagger..."
if command -v swag > /dev/null; then
    make swagger || echo "⚠️  Swagger generation failed, continuing..."
else
    echo "⚠️  Swagger not available, skipping..."
fi

# Gerar código (se necessário)
echo "🔧 Gerando código..."
make generate || echo "⚠️  Code generation failed, continuing..."

# Build do projeto
echo "🔨 Compilando aplicação..."
make build

# Verificar se o binário foi criado
if [ ! -f "$BUILD_DIR/$SERVICE_NAME" ]; then
    echo "❌ Erro: Binário não foi criado em $BUILD_DIR/$SERVICE_NAME"
    exit 1
fi

echo "✅ Build concluído com sucesso!"
echo "📦 Binário criado: $BUILD_DIR/$SERVICE_NAME"
echo "🏷️  Versão: $VERSION"

# Mostrar informações do binário
echo "📊 Informações do binário:"
ls -lh "$BUILD_DIR/$SERVICE_NAME"
file "$BUILD_DIR/$SERVICE_NAME"

echo "🎯 Pronto para deploy no Railway!"
echo "💡 Execute: railway up"
