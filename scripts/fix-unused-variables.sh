#!/bin/bash

# Script para corrigir variáveis não utilizadas
# Remove ou comenta variáveis que não são usadas

set -e

echo "🔧 Iniciando correção de variáveis não utilizadas..."

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

# 1. Corrigir useMealProgress.ts
log "Corrigindo variáveis não utilizadas em useMealProgress.ts"
if [ -f "react/life-tracker/src/hooks/useMealProgress.ts" ]; then
    backup_file "react/life-tracker/src/hooks/useMealProgress.ts"
    
    # Comentar variáveis não utilizadas
    sed -i 's/const \[loading, setLoading\]/\/\/ const [loading, setLoading]/g' react/life-tracker/src/hooks/useMealProgress.ts
    sed -i 's/const \[error, setError\]/\/\/ const [error, setError]/g' react/life-tracker/src/hooks/useMealProgress.ts
    
    log "Variáveis não utilizadas comentadas em useMealProgress.ts"
fi

# 2. Corrigir useOnboarding.ts
log "Corrigindo imports não utilizados em useOnboarding.ts"
if [ -f "react/life-tracker/src/hooks/useOnboarding.ts" ]; then
    backup_file "react/life-tracker/src/hooks/useOnboarding.ts"
    
    # Remover import React não utilizado
    sed -i '/^import React from/d' react/life-tracker/src/hooks/useOnboarding.ts
    
    # Corrigir dependências do useEffect
    sed -i 's/}, \[currentStep\]);/}, [currentStep, answers, generateRemainingSequence]);/g' react/life-tracker/src/hooks/useOnboarding.ts
    
    log "Import React removido e dependências corrigidas em useOnboarding.ts"
fi

# 3. Corrigir useRoutineManagement.ts
log "Corrigindo variáveis não utilizadas em useRoutineManagement.ts"
if [ -f "react/life-tracker/src/hooks/useRoutineManagement.ts" ]; then
    backup_file "react/life-tracker/src/hooks/useRoutineManagement.ts"
    
    # Comentar variáveis não utilizadas
    sed -i 's/const integratedPlan/\/\/ const integratedPlan/g' react/life-tracker/src/hooks/useRoutineManagement.ts
    sed -i 's/const progress/\/\/ const progress/g' react/life-tracker/src/hooks/useRoutineManagement.ts
    sed -i 's/const getHabitsByTimeOfDay/\/\/ const getHabitsByTimeOfDay/g' react/life-tracker/src/hooks/useRoutineManagement.ts
    
    log "Variáveis não utilizadas comentadas em useRoutineManagement.ts"
fi

# 4. Corrigir imports não utilizados em queries
log "Corrigindo imports não utilizados em queries"

# businessQueries.ts
if [ -f "react/life-tracker/src/services/queries/businessQueries.ts" ]; then
    backup_file "react/life-tracker/src/services/queries/businessQueries.ts"
    
    # Remover imports não utilizados
    sed -i '/^import { BusinessAnalysis, BusinessHabit }/d' react/life-tracker/src/services/queries/businessQueries.ts
    
    log "Imports não utilizados removidos em businessQueries.ts"
fi

# financialQueries.ts
if [ -f "react/life-tracker/src/services/queries/financialQueries.ts" ]; then
    backup_file "react/life-tracker/src/services/queries/financialQueries.ts"
    
    # Remover imports não utilizados
    sed -i '/^import { PortfolioSummary, MarketData, InvestmentOpportunity }/d' react/life-tracker/src/services/queries/financialQueries.ts
    
    log "Imports não utilizados removidos em financialQueries.ts"
fi

# habitQueries.ts
if [ -f "react/life-tracker/src/services/queries/habitQueries.ts" ]; then
    backup_file "react/life-tracker/src/services/queries/habitQueries.ts"
    
    # Remover imports não utilizados
    sed -i '/^import { Category, HabitStats }/d' react/life-tracker/src/services/queries/habitQueries.ts
    
    log "Imports não utilizados removidos em habitQueries.ts"
fi

# routineQueries.ts
if [ -f "react/life-tracker/src/services/queries/routineQueries.ts" ]; then
    backup_file "react/life-tracker/src/services/queries/routineQueries.ts"
    
    # Remover imports não utilizados
    sed -i '/^import { IntegratedRoutine, Habit, IntegratedGoal }/d' react/life-tracker/src/services/queries/routineQueries.ts
    
    log "Imports não utilizados removidos em routineQueries.ts"
fi

# 5. Corrigir variáveis não utilizadas em stores
log "Corrigindo variáveis não utilizadas em stores"

# enhancedSimulationStore.ts
if [ -f "react/life-tracker/src/store/enhancedSimulationStore.ts" ]; then
    backup_file "react/life-tracker/src/store/enhancedSimulationStore.ts"
    
    # Comentar variável não utilizada
    sed -i 's/const DEFAULT_ANALYSIS_MONTHS/\/\/ const DEFAULT_ANALYSIS_MONTHS/g' react/life-tracker/src/store/enhancedSimulationStore.ts
    
    log "Variável não utilizada comentada em enhancedSimulationStore.ts"
fi

# 6. Corrigir imports não utilizados em services
log "Corrigindo imports não utilizados em services"

# OnboardingService.ts
if [ -f "react/life-tracker/src/services/onboarding/OnboardingService.ts" ]; then
    backup_file "react/life-tracker/src/services/onboarding/OnboardingService.ts"
    
    # Comentar import não utilizado
    sed -i 's/import { getApiBaseUrl }/\/\/ import { getApiBaseUrl }/g' react/life-tracker/src/services/onboarding/OnboardingService.ts
    
    log "Import não utilizado comentado em OnboardingService.ts"
fi

# 7. Corrigir variáveis não utilizadas em services
log "Corrigindo variáveis não utilizadas em services"

# healthIntegration.ts
if [ -f "react/life-tracker/src/services/health/healthIntegration.ts" ]; then
    backup_file "react/life-tracker/src/services/health/healthIntegration.ts"
    
    # Comentar variável não utilizada
    sed -i 's/const habitStore/\/\/ const habitStore/g' react/life-tracker/src/services/health/healthIntegration.ts
    
    log "Variável não utilizada comentada em healthIntegration.ts"
fi

# authService.ts
if [ -f "react/life-tracker/src/services/auth/authService.ts" ]; then
    backup_file "react/life-tracker/src/services/auth/authService.ts"
    
    # Comentar variável não utilizada
    sed -i 's/const response/\/\/ const response/g' react/life-tracker/src/services/auth/authService.ts
    
    log "Variável não utilizada comentada em authService.ts"
fi

# profileGeneratorService.ts
if [ -f "react/life-tracker/src/services/profileGeneratorService.ts" ]; then
    backup_file "react/life-tracker/src/services/profileGeneratorService.ts"
    
    # Comentar variável não utilizada
    sed -i 's/const domain/\/\/ const domain/g' react/life-tracker/src/services/profileGeneratorService.ts
    
    log "Variável não utilizada comentada em profileGeneratorService.ts"
fi

log "✅ Correção de variáveis não utilizadas concluída!"
log "📋 Resumo das correções:"
log "   - Variáveis não utilizadas comentadas"
log "   - Imports não utilizados removidos"
log "   - Dependências de React Hooks corrigidas"
log ""
log "🔍 Execute 'npm run lint' para verificar se ainda há erros"
log "💾 Backups criados com timestamp para todos os arquivos modificados"
