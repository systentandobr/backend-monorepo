#!/bin/bash

# Script para testar build Docker localmente
# Executa na máquina host (WSL Ubuntu)

set -e

echo "🚀 Testando build Docker localmente..."
echo "======================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
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
log_info "Arquivos encontrados:"
ls -la

echo ""
log_info "🧪 Testando Dockerfile.production..."
echo "======================================"

# Testar build do Dockerfile.production
if docker build -f Dockerfile.production -t invest-tracker:test-production .; then
    log_success "✅ Build do Dockerfile.production concluído com sucesso!"
else
    log_error "❌ Falha no build do Dockerfile.production"
    exit 1
fi

echo ""
log_info "🧪 Testando Dockerfile.script..."
echo "=================================="

# Testar build do Dockerfile.script
if docker build -f Dockerfile.script -t invest-tracker:test-script .; then
    log_success "✅ Build do Dockerfile.script concluído com sucesso!"
else
    log_error "❌ Falha no build do Dockerfile.script"
    exit 1
fi

echo ""
log_info "🔍 Verificando imagens criadas..."
echo "=================================="

docker images | grep invest-tracker

echo ""
log_info "🧪 Testando execução dos containers..."
echo "======================================="

# Testar execução do container production
log_info "Testando container production..."
if docker run --rm -d --name test-production -p 7777:7777 invest-tracker:test-production; then
    log_success "✅ Container production iniciado com sucesso!"
    
    # Aguardar um pouco para o container inicializar
    sleep 5
    
    # Testar health check
    if curl -f http://localhost:7777/health 2>/dev/null; then
        log_success "✅ Health check do container production funcionando!"
    else
        log_warning "⚠️  Health check do container production falhou (pode ser normal se não houver endpoint /health)"
    fi
    
    # Parar container
    docker stop test-production
else
    log_error "❌ Falha ao iniciar container production"
fi

# Testar execução do container script
log_info "Testando container script..."
if docker run --rm -d --name test-script -p 7778:7777 invest-tracker:test-script; then
    log_success "✅ Container script iniciado com sucesso!"
    
    # Aguardar um pouco para o container inicializar
    sleep 5
    
    # Testar health check
    if curl -f http://localhost:7778/health 2>/dev/null; then
        log_success "✅ Health check do container script funcionando!"
    else
        log_warning "⚠️  Health check do container script falhou (pode ser normal se não houver endpoint /health)"
    fi
    
    # Parar container
    docker stop test-script
else
    log_error "❌ Falha ao iniciar container script"
fi

echo ""
log_success "🎉 Todos os testes concluídos!"
echo "================================"
log_info "Imagens criadas:"
docker images | grep invest-tracker

echo ""
log_info "💡 Para limpar as imagens de teste, execute:"
echo "docker rmi invest-tracker:test-production invest-tracker:test-script"

echo ""
log_info "💡 Para testar manualmente um container, execute:"
echo "docker run --rm -p 7777:7777 invest-tracker:test-production"
echo "docker run --rm -p 7777:7777 invest-tracker:test-script"
