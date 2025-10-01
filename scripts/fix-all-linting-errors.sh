#!/bin/bash

# Script master para corrigir todos os erros de linting
# Executa todos os scripts de correção em sequência

set -e

echo "🚀 Iniciando correção completa de erros de linting..."
echo "=================================================="

# Função para log
log() {
    echo ">>> $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Função para executar script com verificação
run_script() {
    local script_name="$1"
    local script_path="scripts/$script_name"
    
    if [ -f "$script_path" ]; then
        log "Executando: $script_name"
        if bash "$script_path"; then
            log "✅ $script_name executado com sucesso"
        else
            log "❌ $script_name falhou"
            return 1
        fi
    else
        log "⚠️  Script não encontrado: $script_path"
        return 1
    fi
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    log "ERRO: Execute este script na raiz do projeto (onde está o package.json)"
    exit 1
fi

# Verificar se o diretório react/life-tracker existe
if [ ! -d "react/life-tracker" ]; then
    log "ERRO: Diretório react/life-tracker não encontrado"
    exit 1
fi

log "📋 Executando correções de linting em sequência..."

# 1. Corrigir variáveis não utilizadas primeiro
log "🔧 Passo 1: Corrigindo variáveis não utilizadas"
run_script "fix-unused-variables.sh"

# 2. Corrigir tipos TypeScript
log "🔧 Passo 2: Corrigindo tipos TypeScript"
run_script "fix-typescript-types.sh"

# 3. Executar linting para verificar se ainda há erros
log "🔍 Passo 3: Verificando erros restantes"
cd react/life-tracker

if npm run lint 2>&1 | grep -q "Error:"; then
    log "⚠️  Ainda há erros de linting. Verifique a saída acima."
    log "💡 Dica: Execute 'npm run lint' para ver os erros restantes"
else
    log "✅ Todos os erros de linting foram corrigidos!"
fi

# 4. Executar build para verificar se não há erros de TypeScript
log "🔨 Passo 4: Verificando build TypeScript"
if npm run build 2>&1 | grep -q "error"; then
    log "⚠️  Há erros de build TypeScript. Verifique a saída acima."
else
    log "✅ Build TypeScript executado com sucesso!"
fi

cd ../..

log "🎉 Correção completa de linting finalizada!"
log "=================================================="
log "📋 Resumo:"
log "   - Variáveis não utilizadas corrigidas"
log "   - Tipos TypeScript corrigidos"
log "   - Linting verificado"
log "   - Build TypeScript verificado"
log ""
log "💾 Backups criados para todos os arquivos modificados"
log "🔍 Execute 'npm run lint' no diretório react/life-tracker para verificar"
log "🔨 Execute 'npm run build' no diretório react/life-tracker para testar"
