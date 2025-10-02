#!/bin/bash

# Script para executar funcionalidade específica
# Executa uma funcionalidade específica usando Spec-Driven Development

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para mostrar uso
show_usage() {
    echo "Uso: $0 \"NOME DA FUNCIONALIDADE\""
    echo ""
    echo "Executa uma funcionalidade específica usando Spec-Driven Development"
    echo ""
    echo "Funcionalidades disponíveis:"
    echo "  - Sistema de Autenticação"
    echo "  - Sistema de Gamificação"
    echo "  - Gerenciamento de Hábitos"
    echo "  - Domínio Healthness"
    echo "  - Domínio Investiments"
    echo "  - Domínio Business"
    echo "  - Sistema de Rotinas Integradas"
    echo "  - Sistema de Notificações"
    echo "  - Sistema de Analytics"
    echo "  - Sistema de IA e Insights"
    echo "  - Sistema de Colaboração"
    echo "  - Sistema de Exportação/Importação"
    echo ""
    echo "Exemplos:"
    echo "  $0 \"Sistema de Autenticação\""
    echo "  $0 \"Domínio Healthness\""
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

# Função principal
main() {
    local feature_name="$1"
    
    # Verificar argumentos
    if [[ $# -eq 0 ]]; then
        show_usage
        exit 1
    fi
    
    if [[ "$feature_name" == "--help" ]] || [[ "$feature_name" == "-h" ]]; then
        show_usage
        exit 0
    fi
    
    # Verificar se estamos no diretório raiz do projeto
    if [[ ! -f "ORDEM_EXECUCAO.md" ]]; then
        error "Execute este script a partir da raiz do projeto (onde está ORDEM_EXECUCAO.md)"
    fi
    
    # Verificar se comandos estão disponíveis
    if ! command -v /specify &> /dev/null; then
        error "Comando /specify não encontrado. Configure o ambiente primeiro."
    fi
    
    log "🚀 Executando funcionalidade: $feature_name"
    
    # Executar funcionalidade baseada no nome
    case "$feature_name" in
        "Sistema de Autenticação")
            execute_with_retry "/specify \"Sistema de autenticação JWT com refresh tokens, registro de usuários, login, logout e recuperação de senha\""
            execute_with_retry "/plan"
            execute_with_retry "/tasks"
            execute_with_retry "/implements"
            ;;
        "Sistema de Gamificação")
            execute_with_retry "/specify \"Sistema de gamificação com pontos, tabuleiro, conquistas e ranking para motivar usuários a completar hábitos e rotinas\""
            execute_with_retry "/plan"
            execute_with_retry "/tasks"
            execute_with_retry "/implements"
            ;;
        "Gerenciamento de Hábitos")
            execute_with_retry "/specify \"Sistema completo de gerenciamento de hábitos com CRUD, categorias, streaks, filtros por período e integração com gamificação\""
            execute_with_retry "/plan"
            execute_with_retry "/tasks"
            execute_with_retry "/implements"
            ;;
        "Domínio Healthness")
            execute_with_retry "/specify \"Sistema de saúde com exames laboratoriais, parâmetros dietéticos, lista de compras, receitas e suplementação\""
            execute_with_retry "/plan"
            execute_with_retry "/tasks"
            execute_with_retry "/implements"
            ;;
        "Domínio Investiments")
            execute_with_retry "/specify \"Sistema de investimentos com portfólio, metas financeiras, análise de risco e integração com simulador\""
            execute_with_retry "/plan"
            execute_with_retry "/tasks"
            execute_with_retry "/implements"
            ;;
        "Domínio Business")
            execute_with_retry "/specify \"Sistema de oportunidades de negócio com projetos, análise de viabilidade e acompanhamento de progresso\""
            execute_with_retry "/plan"
            execute_with_retry "/tasks"
            execute_with_retry "/implements"
            ;;
        "Sistema de Rotinas Integradas")
            execute_with_retry "/specify \"Sistema de rotinas integradas que conecta todos os domínios de vida em um plano unificado com cronograma diário\""
            execute_with_retry "/plan"
            execute_with_retry "/tasks"
            execute_with_retry "/implements"
            ;;
        "Sistema de Notificações")
            execute_with_retry "/specify \"Sistema de notificações push e email para lembretes de hábitos, rotinas e metas\""
            execute_with_retry "/plan"
            execute_with_retry "/tasks"
            execute_with_retry "/implements"
            ;;
        "Sistema de Analytics")
            execute_with_retry "/specify \"Sistema de analytics e relatórios para acompanhar progresso, tendências e insights personalizados\""
            execute_with_retry "/plan"
            execute_with_retry "/tasks"
            execute_with_retry "/implements"
            ;;
        "Sistema de IA e Insights")
            execute_with_retry "/specify \"Sistema de IA para gerar insights personalizados, recomendações automáticas e análise preditiva\""
            execute_with_retry "/plan"
            execute_with_retry "/tasks"
            execute_with_retry "/implements"
            ;;
        "Sistema de Colaboração")
            execute_with_retry "/specify \"Sistema de colaboração para compartilhar metas, competir com amigos e formar grupos de apoio\""
            execute_with_retry "/plan"
            execute_with_retry "/tasks"
            execute_with_retry "/implements"
            ;;
        "Sistema de Exportação/Importação")
            execute_with_retry "/specify \"Sistema de exportação e importação de dados para backup, migração e integração com outros sistemas\""
            execute_with_retry "/plan"
            execute_with_retry "/tasks"
            execute_with_retry "/implements"
            ;;
        *)
            error "Funcionalidade desconhecida: $feature_name"
            echo ""
            echo "Funcionalidades disponíveis:"
            echo "  - Sistema de Autenticação"
            echo "  - Sistema de Gamificação"
            echo "  - Gerenciamento de Hábitos"
            echo "  - Domínio Healthness"
            echo "  - Domínio Investiments"
            echo "  - Domínio Business"
            echo "  - Sistema de Rotinas Integradas"
            echo "  - Sistema de Notificações"
            echo "  - Sistema de Analytics"
            echo "  - Sistema de IA e Insights"
            echo "  - Sistema de Colaboração"
            echo "  - Sistema de Exportação/Importação"
            ;;
    esac
    
    success "Funcionalidade '$feature_name' concluída com sucesso!"
}

# Executar função principal
main "$@"
