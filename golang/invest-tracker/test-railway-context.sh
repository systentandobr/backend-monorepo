#!/bin/bash

# Script para testar o contexto exato do Railway
# Simula o comando que o Railway executa

set -e

echo "🚀 Testando contexto Railway..."
echo "=============================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "go.mod" ]; then
    log_error "go.mod não encontrado. Execute este script dentro do diretório golang/invest-tracker"
    exit 1
fi

log_info "Diretório atual: $(pwd)"
log_info "Conteúdo do diretório:"
ls -la

echo ""
log_info "📋 Verificando railway.toml..."
echo "=============================="

if [ -f "railway.toml" ]; then
    log_success "✅ railway.toml encontrado"
    cat railway.toml
else
    log_error "❌ railway.toml não encontrado"
fi

echo ""
log_info "🧪 Testando comando Railway exato..."
echo "===================================="

# Simular o comando exato do Railway
log_info "Comando que o Railway executa:"
echo "docker build -f golang/invest-tracker/Dockerfile.script -t invest-tracker ."

echo ""
log_info "🧪 Testando build com contexto correto..."
echo "==========================================="

# Ir para o diretório raiz do projeto (como o Railway faz)
cd ../..

log_info "Diretório raiz do projeto: $(pwd)"
log_info "Conteúdo do diretório raiz:"
ls -la

echo ""
log_info "🧪 Testando build do diretório raiz..."
echo "======================================="

# Testar build do diretório raiz (como o Railway faz)
if docker build -f golang/invest-tracker/Dockerfile.script -t invest-tracker:railway-test .; then
    log_success "✅ Build Railway simulado concluído com sucesso!"
else
    log_error "❌ Falha no build Railway simulado"
    exit 1
fi

echo ""
log_info "🔍 Verificando imagem criada..."
echo "================================="

docker images | grep invest-tracker

echo ""
log_info "🧪 Testando execução do container Railway..."
echo "============================================="

# Testar execução
if docker run --rm -d --name test-railway -p 8888:8888 invest-tracker:railway-test; then
    log_success "✅ Container Railway iniciado com sucesso!"
    
    # Aguardar inicialização
    sleep 5
    
    # Testar health check
    if curl -f http://localhost:8888/health 2>/dev/null; then
        log_success "✅ Health check funcionando!"
    else
        log_warning "⚠️  Health check falhou (pode ser normal se não houver endpoint /health)"
    fi
    
    # Parar container
    docker stop test-railway
else
    log_error "❌ Falha ao iniciar container Railway"
fi

echo ""
log_success "🎉 Teste Railway concluído!"
echo "============================="

echo ""
log_info "💡 Para limpar a imagem de teste, execute:"
echo "docker rmi invest-tracker:railway-test"
