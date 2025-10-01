#!/bin/bash

# Script para executar desenvolvimento completo seguindo ORDEM_EXECUCAO.md
# Executa todas as funcionalidades em sequência usando Spec-Driven Development

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para mostrar uso
show_usage() {
    echo "Uso: $0 [OPÇÕES]"
    echo ""
    echo "Executa desenvolvimento completo seguindo ORDEM_EXECUCAO.md"
    echo ""
    echo "Opções:"
    echo "  --priority N    Executa apenas prioridade N (1-4)"
    echo "  --feature NAME  Executa apenas funcionalidade específica"
    echo "  --dry-run       Mostra o que seria executado sem executar"
    echo "  --help          Mostra esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0                           # Executa tudo"
    echo "  $0 --priority 1              # Executa apenas Prioridade 1"
    echo "  $0 --feature \"Sistema de Autenticação\""
    echo "  $0 --dry-run                 # Mostra o que seria executado"
}

# Função para log
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Função para sucesso
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Função para aviso
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Função para erro
error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Função para executar comando com retry
execute_with_retry() {
    local cmd="$1"
    local max_attempts=3
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log "Executando: $cmd (tentativa $attempt/$max_attempts)"
        
        if eval "$cmd"; then
            success "Comando executado com sucesso"
            return 0
        else
            warning "Falha na tentativa $attempt/$max_attempts"
            if [[ $attempt -eq $max_attempts ]]; then
                error "Falha após $max_attempts tentativas: $cmd"
            fi
            sleep 2
            ((attempt++))
        fi
    done
}

# Função para executar funcionalidade
execute_feature() {
    local feature_name="$1"
    local feature_desc="$2"
    
    log "🚀 Iniciando funcionalidade: $feature_name"
    
    # 1. Especificação
    log "📝 Criando especificação..."
    execute_with_retry "/specify \"$feature_desc\""
    
    # 2. Planejamento
    log "📋 Criando plano de implementação..."
    execute_with_retry "/plan"
    
    # 3. Tarefas
    log "📋 Criando tarefas..."
    execute_with_retry "/tasks"
    
    # 4. Implementação
    log "🔨 Implementando funcionalidade..."
    execute_with_retry "/implements"
    
    success "Funcionalidade '$feature_name' concluída com sucesso!"
}

# Função para executar prioridade
execute_priority() {
    local priority="$1"
    
    case $priority in
        1)
            log "🥇 Executando Prioridade 1 - Core Backend"
            
            execute_feature "Sistema de Autenticação" \
                "Sistema de autenticação JWT com refresh tokens, registro de usuários, login, logout e recuperação de senha"
            
            execute_feature "Sistema de Gamificação" \
                "Sistema de gamificação com pontos, tabuleiro, conquistas e ranking para motivar usuários a completar hábitos e rotinas"
            
            execute_feature "Gerenciamento de Hábitos" \
                "Sistema completo de gerenciamento de hábitos com CRUD, categorias, streaks, filtros por período e integração com gamificação"
            ;;
        2)
            log "🥈 Executando Prioridade 2 - Domínios de Vida"
            
            execute_feature "Domínio Healthness" \
                "Sistema de saúde com exames laboratoriais, parâmetros dietéticos, lista de compras, receitas e suplementação"
            
            execute_feature "Domínio Investiments" \
                "Sistema de investimentos com portfólio, metas financeiras, análise de risco e integração com simulador"
            
            execute_feature "Domínio Business" \
                "Sistema de oportunidades de negócio com projetos, análise de viabilidade e acompanhamento de progresso"
            ;;
        3)
            log "🥉 Executando Prioridade 3 - Integração e Otimização"
            
            execute_feature "Sistema de Rotinas Integradas" \
                "Sistema de rotinas integradas que conecta todos os domínios de vida em um plano unificado com cronograma diário"
            
            execute_feature "Sistema de Notificações" \
                "Sistema de notificações push e email para lembretes de hábitos, rotinas e metas"
            
            execute_feature "Sistema de Analytics" \
                "Sistema de analytics e relatórios para acompanhar progresso, tendências e insights personalizados"
            ;;
        4)
            log "🏆 Executando Prioridade 4 - Funcionalidades Avançadas"
            
            execute_feature "Sistema de IA e Insights" \
                "Sistema de IA para gerar insights personalizados, recomendações automáticas e análise preditiva"
            
            execute_feature "Sistema de Colaboração" \
                "Sistema de colaboração para compartilhar metas, competir com amigos e formar grupos de apoio"
            
            execute_feature "Sistema de Exportação/Importação" \
                "Sistema de exportação e importação de dados para backup, migração e integração com outros sistemas"
            ;;
        *)
            error "Prioridade inválida: $priority. Use 1-4."
            ;;
    esac
}

# Função para executar tudo
execute_all() {
    log "🚀 Iniciando desenvolvimento completo do Life Tracker"
    
    for priority in 1 2 3 4; do
        execute_priority $priority
        log "⏸️  Pausa entre prioridades (5 segundos)..."
        sleep 5
    done
    
    success "🎉 Desenvolvimento completo concluído!"
}

# Função para dry run
dry_run() {
    log "🔍 Modo dry-run - mostrando o que seria executado:"
    echo ""
    
    echo "🥇 Prioridade 1 - Core Backend:"
    echo "  1. Sistema de Autenticação"
    echo "  2. Sistema de Gamificação"
    echo "  3. Gerenciamento de Hábitos"
    echo ""
    
    echo "🥈 Prioridade 2 - Domínios de Vida:"
    echo "  1. Domínio Healthness"
    echo "  2. Domínio Investiments"
    echo "  3. Domínio Business"
    echo ""
    
    echo "🥉 Prioridade 3 - Integração e Otimização:"
    echo "  1. Sistema de Rotinas Integradas"
    echo "  2. Sistema de Notificações"
    echo "  3. Sistema de Analytics"
    echo ""
    
    echo "🏆 Prioridade 4 - Funcionalidades Avançadas:"
    echo "  1. Sistema de IA e Insights"
    echo "  2. Sistema de Colaboração"
    echo "  3. Sistema de Exportação/Importação"
    echo ""
    
    echo "Total: 12 funcionalidades"
    echo "Tempo estimado: 6-8 semanas"
}

# Função principal
main() {
    local priority=""
    local feature=""
    local dry_run_mode=false
    
    # Parse argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --priority)
                priority="$2"
                shift 2
                ;;
            --feature)
                feature="$2"
                shift 2
                ;;
            --dry-run)
                dry_run_mode=true
                shift
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                error "Argumento desconhecido: $1"
                ;;
        esac
    done
    
    # Verificar se estamos no diretório raiz do projeto
    if [[ ! -f "ORDEM_EXECUCAO.md" ]]; then
        error "Execute este script a partir da raiz do projeto (onde está ORDEM_EXECUCAO.md)"
    fi
    
    # Verificar se comandos estão disponíveis
    if ! command -v /specify &> /dev/null; then
        error "Comando /specify não encontrado. Configure o ambiente primeiro."
    fi
    
    # Executar baseado nos argumentos
    if [[ "$dry_run_mode" == "true" ]]; then
        dry_run
    elif [[ -n "$feature" ]]; then
        # Executar funcionalidade específica
        case "$feature" in
            "Sistema de Autenticação")
                execute_feature "$feature" "Sistema de autenticação JWT com refresh tokens, registro de usuários, login, logout e recuperação de senha"
                ;;
            "Sistema de Gamificação")
                execute_feature "$feature" "Sistema de gamificação com pontos, tabuleiro, conquistas e ranking para motivar usuários a completar hábitos e rotinas"
                ;;
            "Gerenciamento de Hábitos")
                execute_feature "$feature" "Sistema completo de gerenciamento de hábitos com CRUD, categorias, streaks, filtros por período e integração com gamificação"
                ;;
            "Domínio Healthness")
                execute_feature "$feature" "Sistema de saúde com exames laboratoriais, parâmetros dietéticos, lista de compras, receitas e suplementação"
                ;;
            "Domínio Investiments")
                execute_feature "$feature" "Sistema de investimentos com portfólio, metas financeiras, análise de risco e integração com simulador"
                ;;
            "Domínio Business")
                execute_feature "$feature" "Sistema de oportunidades de negócio com projetos, análise de viabilidade e acompanhamento de progresso"
                ;;
            "Sistema de Rotinas Integradas")
                execute_feature "$feature" "Sistema de rotinas integradas que conecta todos os domínios de vida em um plano unificado com cronograma diário"
                ;;
            "Sistema de Notificações")
                execute_feature "$feature" "Sistema de notificações push e email para lembretes de hábitos, rotinas e metas"
                ;;
            "Sistema de Analytics")
                execute_feature "$feature" "Sistema de analytics e relatórios para acompanhar progresso, tendências e insights personalizados"
                ;;
            "Sistema de IA e Insights")
                execute_feature "$feature" "Sistema de IA para gerar insights personalizados, recomendações automáticas e análise preditiva"
                ;;
            "Sistema de Colaboração")
                execute_feature "$feature" "Sistema de colaboração para compartilhar metas, competir com amigos e formar grupos de apoio"
                ;;
            "Sistema de Exportação/Importação")
                execute_feature "$feature" "Sistema de exportação e importação de dados para backup, migração e integração com outros sistemas"
                ;;
            *)
                error "Funcionalidade desconhecida: $feature"
                ;;
        esac
    elif [[ -n "$priority" ]]; then
        execute_priority "$priority"
    else
        execute_all
    fi
}

# Executar função principal
main "$@"
