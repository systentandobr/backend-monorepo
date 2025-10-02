#!/bin/bash

# Script para corrigir erros de linting no projeto Life Tracker
# Foca em eliminar tipos 'any' e variáveis não utilizadas

set -e

echo "🔧 Iniciando correção de erros de linting..."

# Função para log
log() {
    echo ">>> $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Função para verificar se arquivo existe
check_file() {
    if [ ! -f "$1" ]; then
        log "ERRO: Arquivo não encontrado: $1"
        return 1
    fi
    return 0
}

# Função para backup de arquivo
backup_file() {
    local file="$1"
    if [ -f "$file" ]; then
        cp "$file" "${file}.backup.$(date +%Y%m%d_%H%M%S)"
        log "Backup criado para: $file"
    fi
}

# 1. Corrigir tipos 'any' em src/types/onboarding.ts
log "Corrigindo tipos 'any' em src/types/onboarding.ts"
if check_file "react/life-tracker/src/types/onboarding.ts"; then
    backup_file "react/life-tracker/src/types/onboarding.ts"
    
    # Substituir tipos 'any' por tipos mais específicos
    sed -i 's/: any\[\]/: unknown[]/g' react/life-tracker/src/types/onboarding.ts
    sed -i 's/: any\b/: unknown/g' react/life-tracker/src/types/onboarding.ts
    sed -i 's/any\[\]/unknown[]/g' react/life-tracker/src/types/onboarding.ts
    sed -i 's/\bany\b/unknown/g' react/life-tracker/src/types/onboarding.ts
    
    log "Tipos 'any' substituídos por 'unknown' em onboarding.ts"
fi

# 2. Corrigir tipos 'any' em services
log "Corrigindo tipos 'any' em services"
for service_file in react/life-tracker/src/services/**/*.ts; do
    if [ -f "$service_file" ]; then
        backup_file "$service_file"
        
        # Substituir tipos 'any' por tipos mais específicos
        sed -i 's/: any\b/: unknown/g' "$service_file"
        sed -i 's/\bany\b/unknown/g' "$service_file"
        
        log "Corrigido: $service_file"
    fi
done

# 3. Corrigir tipos 'any' em stores
log "Corrigindo tipos 'any' em stores"
for store_file in react/life-tracker/src/store/*.ts; do
    if [ -f "$store_file" ]; then
        backup_file "$store_file"
        
        # Substituir tipos 'any' por tipos mais específicos
        sed -i 's/: any\b/: unknown/g' "$store_file"
        sed -i 's/\bany\b/unknown/g' "$store_file"
        
        log "Corrigido: $store_file"
    fi
done

# 4. Corrigir tipos 'any' em hooks
log "Corrigindo tipos 'any' em hooks"
for hook_file in react/life-tracker/src/hooks/*.ts; do
    if [ -f "$hook_file" ]; then
        backup_file "$hook_file"
        
        # Substituir tipos 'any' por tipos mais específicos
        sed -i 's/: any\b/: unknown/g' "$hook_file"
        sed -i 's/\bany\b/unknown/g' "$hook_file"
        
        log "Corrigido: $hook_file"
    fi
done

# 5. Corrigir tipos 'any' em providers
log "Corrigindo tipos 'any' em providers"
for provider_file in react/life-tracker/src/providers/*.tsx; do
    if [ -f "$provider_file" ]; then
        backup_file "$provider_file"
        
        # Substituir tipos 'any' por tipos mais específicos
        sed -i 's/: any\b/: unknown/g' "$provider_file"
        sed -i 's/\bany\b/unknown/g' "$provider_file"
        
        log "Corrigido: $provider_file"
    fi
done

# 6. Corrigir tipos 'any' em utils
log "Corrigindo tipos 'any' em utils"
for util_file in react/life-tracker/src/utils/*.ts; do
    if [ -f "$util_file" ]; then
        backup_file "$util_file"
        
        # Substituir tipos 'any' por tipos mais específicos
        sed -i 's/: any\b/: unknown/g' "$util_file"
        sed -i 's/\bany\b/unknown/g' "$util_file"
        
        log "Corrigido: $util_file"
    fi
done

# 7. Corrigir tipos 'any' em config
log "Corrigindo tipos 'any' em config"
for config_file in react/life-tracker/src/config/**/*.ts; do
    if [ -f "$config_file" ]; then
        backup_file "$config_file"
        
        # Substituir tipos 'any' por tipos mais específicos
        sed -i 's/: any\b/: unknown/g' "$config_file"
        sed -i 's/\bany\b/unknown/g' "$config_file"
        
        log "Corrigido: $config_file"
    fi
done

# 8. Remover imports não utilizados
log "Removendo imports não utilizados"

# React import não utilizado em useOnboarding.ts
if check_file "react/life-tracker/src/hooks/useOnboarding.ts"; then
    backup_file "react/life-tracker/src/hooks/useOnboarding.ts"
    sed -i '/^import React from/d' react/life-tracker/src/hooks/useOnboarding.ts
    log "Removido import React não utilizado em useOnboarding.ts"
fi

# 9. Remover variáveis não utilizadas
log "Removendo variáveis não utilizadas"

# useMealProgress.ts
if check_file "react/life-tracker/src/hooks/useMealProgress.ts"; then
    backup_file "react/life-tracker/src/hooks/useMealProgress.ts"
    # Comentar variáveis não utilizadas
    sed -i 's/const \[loading, setLoading\]/\/\/ const [loading, setLoading]/g' react/life-tracker/src/hooks/useMealProgress.ts
    sed -i 's/const \[error, setError\]/\/\/ const [error, setError]/g' react/life-tracker/src/hooks/useMealProgress.ts
    log "Comentadas variáveis não utilizadas em useMealProgress.ts"
fi

# 10. Corrigir dependências de React Hooks
log "Corrigindo dependências de React Hooks"

# useOnboarding.ts - adicionar dependências faltantes
if check_file "react/life-tracker/src/hooks/useOnboarding.ts"; then
    backup_file "react/life-tracker/src/hooks/useOnboarding.ts"
    
    # Adicionar dependências faltantes no useEffect
    sed -i 's/}, \[currentStep\]);/}, [currentStep, answers, generateRemainingSequence]);/g' react/life-tracker/src/hooks/useOnboarding.ts
    
    log "Corrigidas dependências do useEffect em useOnboarding.ts"
fi

# 11. Remover variáveis não utilizadas em useRoutineManagement.ts
if check_file "react/life-tracker/src/hooks/useRoutineManagement.ts"; then
    backup_file "react/life-tracker/src/hooks/useRoutineManagement.ts"
    
    # Comentar variáveis não utilizadas
    sed -i 's/const integratedPlan/\/\/ const integratedPlan/g' react/life-tracker/src/hooks/useRoutineManagement.ts
    sed -i 's/const progress/\/\/ const progress/g' react/life-tracker/src/hooks/useRoutineManagement.ts
    sed -i 's/const getHabitsByTimeOfDay/\/\/ const getHabitsByTimeOfDay/g' react/life-tracker/src/hooks/useRoutineManagement.ts
    
    log "Comentadas variáveis não utilizadas em useRoutineManagement.ts"
fi

# 12. Remover imports não utilizados em queries
log "Removendo imports não utilizados em queries"

# businessQueries.ts
if check_file "react/life-tracker/src/services/queries/businessQueries.ts"; then
    backup_file "react/life-tracker/src/services/queries/businessQueries.ts"
    sed -i '/^import { BusinessAnalysis, BusinessHabit }/d' react/life-tracker/src/services/queries/businessQueries.ts
    log "Removidos imports não utilizados em businessQueries.ts"
fi

# financialQueries.ts
if check_file "react/life-tracker/src/services/queries/financialQueries.ts"; then
    backup_file "react/life-tracker/src/services/queries/financialQueries.ts"
    sed -i '/^import { PortfolioSummary, MarketData, InvestmentOpportunity }/d' react/life-tracker/src/services/queries/financialQueries.ts
    log "Removidos imports não utilizados em financialQueries.ts"
fi

# habitQueries.ts
if check_file "react/life-tracker/src/services/queries/habitQueries.ts"; then
    backup_file "react/life-tracker/src/services/queries/habitQueries.ts"
    sed -i '/^import { Category, HabitStats }/d' react/life-tracker/src/services/queries/habitQueries.ts
    log "Removidos imports não utilizados em habitQueries.ts"
fi

# routineQueries.ts
if check_file "react/life-tracker/src/services/queries/routineQueries.ts"; then
    backup_file "react/life-tracker/src/services/queries/routineQueries.ts"
    sed -i '/^import { IntegratedRoutine, Habit, IntegratedGoal }/d' react/life-tracker/src/services/queries/routineQueries.ts
    log "Removidos imports não utilizados em routineQueries.ts"
fi

# 13. Remover variáveis não utilizadas em stores
log "Removendo variáveis não utilizadas em stores"

# enhancedSimulationStore.ts
if check_file "react/life-tracker/src/store/enhancedSimulationStore.ts"; then
    backup_file "react/life-tracker/src/store/enhancedSimulationStore.ts"
    sed -i 's/const DEFAULT_ANALYSIS_MONTHS/\/\/ const DEFAULT_ANALYSIS_MONTHS/g' react/life-tracker/src/store/enhancedSimulationStore.ts
    log "Comentada variável não utilizada em enhancedSimulationStore.ts"
fi

# 14. Remover variáveis não utilizadas em services
log "Removendo variáveis não utilizadas em services"

# OnboardingService.ts
if check_file "react/life-tracker/src/services/onboarding/OnboardingService.ts"; then
    backup_file "react/life-tracker/src/services/onboarding/OnboardingService.ts"
    sed -i 's/import { getApiBaseUrl }/\/\/ import { getApiBaseUrl }/g' react/life-tracker/src/services/onboarding/OnboardingService.ts
    log "Comentado import não utilizado em OnboardingService.ts"
fi

# healthIntegration.ts
if check_file "react/life-tracker/src/services/health/healthIntegration.ts"; then
    backup_file "react/life-tracker/src/services/health/healthIntegration.ts"
    sed -i 's/const habitStore/\/\/ const habitStore/g' react/life-tracker/src/services/health/healthIntegration.ts
    log "Comentada variável não utilizada em healthIntegration.ts"
fi

# authService.ts
if check_file "react/life-tracker/src/services/auth/authService.ts"; then
    backup_file "react/life-tracker/src/services/auth/authService.ts"
    sed -i 's/const response/\/\/ const response/g' react/life-tracker/src/services/auth/authService.ts
    log "Comentada variável não utilizada em authService.ts"
fi

# profileGeneratorService.ts
if check_file "react/life-tracker/src/services/profileGeneratorService.ts"; then
    backup_file "react/life-tracker/src/services/profileGeneratorService.ts"
    sed -i 's/const domain/\/\/ const domain/g' react/life-tracker/src/services/profileGeneratorService.ts
    log "Comentada variável não utilizada em profileGeneratorService.ts"
fi

log "✅ Correções de linting concluídas!"
log "📋 Resumo das correções:"
log "   - Tipos 'any' substituídos por 'unknown'"
log "   - Imports não utilizados removidos"
log "   - Variáveis não utilizadas comentadas"
log "   - Dependências de React Hooks corrigidas"
log ""
log "🔍 Execute 'npm run lint' para verificar se ainda há erros"
log "💾 Backups criados com timestamp para todos os arquivos modificados"
