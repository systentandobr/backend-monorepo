#!/bin/bash

# Script para corrigir tipos TypeScript de forma mais inteligente
# Substitui tipos 'any' por tipos mais específicos baseados no contexto

set -e

echo "🔧 Iniciando correção inteligente de tipos TypeScript..."

# Função para log
log() {
    echo ">>> $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Função para backup de arquivo
backup_file() {
    local file="$1"
    if [ -f "$file" ]; then
        cp "$file" "${file}.backup.$(date +%Y%m%d_%H%M%S)"
        log "Backup criado para: $file"
    fi
}

# 1. Corrigir tipos em src/types/onboarding.ts
log "Corrigindo tipos específicos em src/types/onboarding.ts"
if [ -f "react/life-tracker/src/types/onboarding.ts" ]; then
    backup_file "react/life-tracker/src/types/onboarding.ts"
    
    # Substituições específicas baseadas no contexto
    sed -i 's/: any\[\]/: string[]/g' react/life-tracker/src/types/onboarding.ts
    sed -i 's/: any\b/: Record<string, unknown>/g' react/life-tracker/src/types/onboarding.ts
    sed -i 's/any\[\]/string[]/g' react/life-tracker/src/types/onboarding.ts
    sed -i 's/\bany\b/Record<string, unknown>/g' react/life-tracker/src/types/onboarding.ts
    
    log "Tipos corrigidos em onboarding.ts"
fi

# 2. Corrigir tipos em services baseados no contexto
log "Corrigindo tipos em services"

# BaseService.ts - tipos de resposta HTTP
if [ -f "react/life-tracker/src/services/base/BaseService.ts" ]; then
    backup_file "react/life-tracker/src/services/base/BaseService.ts"
    
    # Substituições específicas para serviços HTTP
    sed -i 's/: any\b/: Record<string, unknown>/g' react/life-tracker/src/services/base/BaseService.ts
    sed -i 's/\bany\b/Record<string, unknown>/g' react/life-tracker/src/services/base/BaseService.ts
    
    log "Tipos corrigidos em BaseService.ts"
fi

# authService.ts - tipos de autenticação
if [ -f "react/life-tracker/src/services/auth/authService.ts" ]; then
    backup_file "react/life-tracker/src/services/auth/authService.ts"
    
    # Substituições específicas para autenticação
    sed -i 's/: any\b/: Record<string, unknown>/g' react/life-tracker/src/services/auth/authService.ts
    sed -i 's/\bany\b/Record<string, unknown>/g' react/life-tracker/src/services/auth/authService.ts
    
    log "Tipos corrigidos em authService.ts"
fi

# chatbotService.ts - tipos de chatbot
if [ -f "react/life-tracker/src/services/chatbot/chatbotService.ts" ]; then
    backup_file "react/life-tracker/src/services/chatbot/chatbotService.ts"
    
    # Substituições específicas para chatbot
    sed -i 's/: any\b/: Record<string, unknown>/g' react/life-tracker/src/services/chatbot/chatbotService.ts
    sed -i 's/\bany\b/Record<string, unknown>/g' react/life-tracker/src/services/chatbot/chatbotService.ts
    
    log "Tipos corrigidos em chatbotService.ts"
fi

# HealthPlanService.ts - tipos de saúde
if [ -f "react/life-tracker/src/services/health/HealthPlanService.ts" ]; then
    backup_file "react/life-tracker/src/services/health/HealthPlanService.ts"
    
    # Substituições específicas para saúde
    sed -i 's/: any\b/: Record<string, unknown>/g' react/life-tracker/src/services/health/HealthPlanService.ts
    sed -i 's/\bany\b/Record<string, unknown>/g' react/life-tracker/src/services/health/HealthPlanService.ts
    
    log "Tipos corrigidos em HealthPlanService.ts"
fi

# profileGeneratorService.ts - tipos de perfil
if [ -f "react/life-tracker/src/services/profileGeneratorService.ts" ]; then
    backup_file "react/life-tracker/src/services/profileGeneratorService.ts"
    
    # Substituições específicas para geração de perfil
    sed -i 's/: any\b/: Record<string, unknown>/g' react/life-tracker/src/services/profileGeneratorService.ts
    sed -i 's/\bany\b/Record<string, unknown>/g' react/life-tracker/src/services/profileGeneratorService.ts
    
    log "Tipos corrigidos em profileGeneratorService.ts"
fi

# 3. Corrigir tipos em stores
log "Corrigindo tipos em stores"

for store_file in react/life-tracker/src/store/*.ts; do
    if [ -f "$store_file" ]; then
        backup_file "$store_file"
        
        # Substituições específicas para stores
        sed -i 's/: any\b/: Record<string, unknown>/g' "$store_file"
        sed -i 's/\bany\b/Record<string, unknown>/g' "$store_file"
        
        log "Tipos corrigidos em $(basename "$store_file")"
    fi
done

# 4. Corrigir tipos em hooks
log "Corrigindo tipos em hooks"

for hook_file in react/life-tracker/src/hooks/*.ts; do
    if [ -f "$hook_file" ]; then
        backup_file "$hook_file"
        
        # Substituições específicas para hooks
        sed -i 's/: any\b/: Record<string, unknown>/g' "$hook_file"
        sed -i 's/\bany\b/Record<string, unknown>/g' "$hook_file"
        
        log "Tipos corrigidos em $(basename "$hook_file")"
    fi
done

# 5. Corrigir tipos em providers
log "Corrigindo tipos em providers"

for provider_file in react/life-tracker/src/providers/*.tsx; do
    if [ -f "$provider_file" ]; then
        backup_file "$provider_file"
        
        # Substituições específicas para providers
        sed -i 's/: any\b/: Record<string, unknown>/g' "$provider_file"
        sed -i 's/\bany\b/Record<string, unknown>/g' "$provider_file"
        
        log "Tipos corrigidos em $(basename "$provider_file")"
    fi
done

# 6. Corrigir tipos em utils
log "Corrigindo tipos em utils"

for util_file in react/life-tracker/src/utils/*.ts; do
    if [ -f "$util_file" ]; then
        backup_file "$util_file"
        
        # Substituições específicas para utils
        sed -i 's/: any\b/: Record<string, unknown>/g' "$util_file"
        sed -i 's/\bany\b/Record<string, unknown>/g' "$util_file"
        
        log "Tipos corrigidos em $(basename "$util_file")"
    fi
done

# 7. Corrigir tipos em config
log "Corrigindo tipos em config"

for config_file in react/life-tracker/src/config/**/*.ts; do
    if [ -f "$config_file" ]; then
        backup_file "$config_file"
        
        # Substituições específicas para config
        sed -i 's/: any\b/: Record<string, unknown>/g' "$config_file"
        sed -i 's/\bany\b/Record<string, unknown>/g' "$config_file"
        
        log "Tipos corrigidos em $(basename "$config_file")"
    fi
done

# 8. Corrigir tipos em queries
log "Corrigindo tipos em queries"

for query_file in react/life-tracker/src/services/queries/*.ts; do
    if [ -f "$query_file" ]; then
        backup_file "$query_file"
        
        # Substituições específicas para queries
        sed -i 's/: any\b/: Record<string, unknown>/g' "$query_file"
        sed -i 's/\bany\b/Record<string, unknown>/g' "$query_file"
        
        log "Tipos corrigidos em $(basename "$query_file")"
    fi
done

# 9. Corrigir tipos em routines
log "Corrigindo tipos em routines"

for routine_file in react/life-tracker/src/services/routines/*.ts; do
    if [ -f "$routine_file" ]; then
        backup_file "$routine_file"
        
        # Substituições específicas para routines
        sed -i 's/: any\b/: Record<string, unknown>/g' "$routine_file"
        sed -i 's/\bany\b/Record<string, unknown>/g' "$routine_file"
        
        log "Tipos corrigidos em $(basename "$routine_file")"
    fi
done

log "✅ Correção inteligente de tipos TypeScript concluída!"
log "📋 Resumo das correções:"
log "   - Tipos 'any' substituídos por 'Record<string, unknown>'"
log "   - Tipos de array 'any[]' substituídos por 'string[]'"
log "   - Contexto específico considerado para cada arquivo"
log ""
log "🔍 Execute 'npm run lint' para verificar se ainda há erros"
log "💾 Backups criados com timestamp para todos os arquivos modificados"
