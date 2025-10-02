#!/bin/bash

# Script para executar Prioridade 2 - Domínios de Vida
# Executa funcionalidades dos domínios de vida

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

log "🥈 Executando Prioridade 2 - Domínios de Vida"

# Executar funcionalidades da Prioridade 2
./scripts/execute-full-development.sh --feature "Domínio Healthness"
./scripts/execute-full-development.sh --feature "Domínio Investiments"
./scripts/execute-full-development.sh --feature "Domínio Business"

success "Prioridade 2 concluída com sucesso!"
