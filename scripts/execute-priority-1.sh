#!/bin/bash

# Script para executar Prioridade 1 - Core Backend
# Executa funcionalidades essenciais do backend

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Função para sucesso
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log "🥇 Executando Prioridade 1 - Core Backend"

# Executar funcionalidades da Prioridade 1
./scripts/execute-full-development.sh --feature "Sistema de Autenticação"
./scripts/execute-full-development.sh --feature "Sistema de Gamificação"
./scripts/execute-full-development.sh --feature "Gerenciamento de Hábitos"

success "Prioridade 1 concluída com sucesso!"
