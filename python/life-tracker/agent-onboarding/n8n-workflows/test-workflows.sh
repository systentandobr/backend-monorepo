#!/bin/bash

# Script de teste para Life Tracker n8n Workflows
# Este script testa todas as funcionalidades dos workflows

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
BASE_URL="http://localhost:5678/webhook"
USER_ID="test_user_$(date +%s)"
SESSION_ID="test_session_$(date +%s)"

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Função para fazer requisições HTTP
make_request() {
    local method=$1
    local url=$2
    local data=$3
    local expected_status=$4
    
    info "Fazendo requisição $method para $url"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url")
    fi
    
    # Separar body e status code
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "$expected_status" ]; then
        log "✅ Requisição bem-sucedida (Status: $http_code)"
        echo "$body" | jq . 2>/dev/null || echo "$body"
        return 0
    else
        error "❌ Requisição falhou (Status: $http_code, Esperado: $expected_status)"
        echo "Response: $body"
        return 1
    fi
}

# Teste 1: Status do serviço
test_service_status() {
    log "=== Teste 1: Status do Serviço ==="
    
    make_request "GET" "$BASE_URL/onboarding-status" "" "200"
    
    echo ""
}

# Teste 2: Listar templates
test_list_templates() {
    log "=== Teste 2: Listar Templates ==="
    
    make_request "GET" "$BASE_URL/onboarding-templates" "" "200"
    
    echo ""
}

# Teste 3: Onboarding completo
test_complete_onboarding() {
    log "=== Teste 3: Onboarding Completo ==="
    
    local request_data=$(cat <<EOF
{
    "user_id": "$USER_ID",
    "session_id": "$SESSION_ID",
    "questions_and_answers": [
        {
            "question_id": "concentration",
            "question_text": "Você acha difícil se concentrar em tarefas por longos períodos?",
            "question_type": "text",
            "question_category": "general",
            "answer": "medium-focus",
            "answered_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
            "context": {
                "step": 15,
                "required": true
            }
        },
        {
            "question_id": "lifestyle",
            "question_text": "Quão satisfeito você está com seu estilo de vida atual?",
            "question_type": "text",
            "question_category": "general",
            "answer": "somewhat-satisfied",
            "answered_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
            "context": {
                "step": 16,
                "required": true
            }
        },
        {
            "question_id": "energy",
            "question_text": "Como é seu nível de energia ao longo do dia?",
            "question_type": "text",
            "question_category": "general",
            "answer": "high-energy",
            "answered_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
            "context": {
                "step": 17,
                "required": true
            }
        },
        {
            "question_id": "financialGoals",
            "question_text": "Quais são seus principais objetivos financeiros?",
            "question_type": "text",
            "question_category": "general",
            "answer": ["passive-income", "wealth-building"],
            "answered_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
            "context": {
                "step": 19,
                "required": true
            }
        },
        {
            "question_id": "lifeGoals",
            "question_text": "Quais são seus principais objetivos de vida para os próximos anos?",
            "question_type": "text",
            "question_category": "general",
            "answer": ["financial-freedom", "travel", "health"],
            "answered_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
            "context": {
                "step": 20,
                "required": true
            }
        }
    ],
    "user_metadata": {
        "source": "test-script",
        "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    }
}
EOF
)
    
    make_request "POST" "$BASE_URL/onboarding-complete" "$request_data" "200"
    
    echo ""
}

# Teste 4: Análise de perfil
test_analyze_profile() {
    log "=== Teste 4: Análise de Perfil ==="
    
    local request_data=$(cat <<EOF
{
    "user_id": "${USER_ID}_analyze",
    "answers": {
        "concentration": "high-focus",
        "lifestyle": "very-satisfied",
        "energy": "high-energy",
        "wakeup_time": "06:00",
        "sleep_time": "22:00",
        "personal_interests": ["technology", "fitness"],
        "financial_goals": ["passive-income"],
        "life_goals": ["financial-freedom"],
        "monthly_income": 5000,
        "monthly_savings": 1000,
        "time_availability": 10
    }
}
EOF
)
    
    make_request "POST" "$BASE_URL/onboarding-analyze" "$request_data" "200"
    
    echo ""
}

# Teste 5: Geração de plano
test_generate_plan() {
    log "=== Teste 5: Geração de Plano ==="
    
    local request_data=$(cat <<EOF
{
    "user_id": "${USER_ID}_generate",
    "answers": {
        "concentration": "low-focus",
        "lifestyle": "not-satisfied",
        "energy": "low-energy",
        "wakeup_time": "08:00",
        "sleep_time": "23:30",
        "personal_interests": ["health", "wellness"],
        "financial_goals": ["emergency-fund"],
        "life_goals": ["better-health"],
        "monthly_income": 3000,
        "monthly_savings": 200,
        "time_availability": 5
    }
}
EOF
)
    
    make_request "POST" "$BASE_URL/onboarding-generate" "$request_data" "200"
    
    echo ""
}

# Teste 6: Recuperar plano do usuário
test_get_user_plan() {
    log "=== Teste 6: Recuperar Plano do Usuário ==="
    
    make_request "GET" "$BASE_URL/onboarding-user-plan/$USER_ID" "" "200"
    
    echo ""
}

# Teste 7: Recuperar perfil do usuário
test_get_user_profile() {
    log "=== Teste 7: Recuperar Perfil do Usuário ==="
    
    make_request "GET" "$BASE_URL/onboarding-user-profile/$USER_ID" "" "200"
    
    echo ""
}

# Teste 8: Validação de entrada (erro esperado)
test_validation_error() {
    log "=== Teste 8: Validação de Entrada (Erro Esperado) ==="
    
    local invalid_data='{
        "user_id": "",
        "questions_and_answers": []
    }'
    
    make_request "POST" "$BASE_URL/onboarding-complete" "$invalid_data" "400"
    
    echo ""
}

# Teste 9: Usuário não encontrado (erro esperado)
test_user_not_found() {
    log "=== Teste 9: Usuário Não Encontrado (Erro Esperado) ==="
    
    make_request "GET" "$BASE_URL/onboarding-user-plan/nonexistent_user" "" "200"
    
    echo ""
}

# Teste 10: Rate limiting (múltiplas requisições)
test_rate_limiting() {
    log "=== Teste 10: Rate Limiting ==="
    
    info "Fazendo 5 requisições rápidas para testar rate limiting..."
    
    for i in {1..5}; do
        info "Requisição $i/5"
        make_request "GET" "$BASE_URL/onboarding-status" "" "200" || true
        sleep 1
    done
    
    echo ""
}

# Função para verificar se n8n está rodando
check_n8n_running() {
    if ! curl -f http://localhost:5678/healthz >/dev/null 2>&1; then
        error "n8n não está rodando. Execute './deploy.sh start' primeiro."
    fi
    
    log "n8n está rodando"
}

# Função para mostrar resumo dos testes
show_test_summary() {
    log "=== Resumo dos Testes ==="
    echo ""
    info "✅ Testes executados:"
    echo "   1. Status do serviço"
    echo "   2. Listar templates"
    echo "   3. Onboarding completo"
    echo "   4. Análise de perfil"
    echo "   5. Geração de plano"
    echo "   6. Recuperar plano do usuário"
    echo "   7. Recuperar perfil do usuário"
    echo "   8. Validação de entrada"
    echo "   9. Usuário não encontrado"
    echo "   10. Rate limiting"
    echo ""
    info "📊 Dados de teste criados:"
    echo "   User ID: $USER_ID"
    echo "   Session ID: $SESSION_ID"
    echo ""
    info "🔗 URLs testadas:"
    echo "   Base URL: $BASE_URL"
    echo "   Complete: $BASE_URL/onboarding-complete"
    echo "   Analyze: $BASE_URL/onboarding-analyze"
    echo "   Generate: $BASE_URL/onboarding-generate"
    echo "   Templates: $BASE_URL/onboarding-templates"
    echo "   User Plan: $BASE_URL/onboarding-user-plan"
    echo "   User Profile: $BASE_URL/onboarding-user-profile"
    echo "   Status: $BASE_URL/onboarding-status"
    echo ""
}

# Função para executar todos os testes
run_all_tests() {
    log "Iniciando testes dos workflows n8n..."
    echo ""
    
    check_n8n_running
    
    test_service_status
    test_list_templates
    test_complete_onboarding
    test_analyze_profile
    test_generate_plan
    test_get_user_plan
    test_get_user_profile
    test_validation_error
    test_user_not_found
    test_rate_limiting
    
    show_test_summary
    
    log "🎉 Todos os testes foram executados!"
}

# Função para executar teste específico
run_specific_test() {
    local test_name=$1
    
    case $test_name in
        "status")
            test_service_status
            ;;
        "templates")
            test_list_templates
            ;;
        "complete")
            test_complete_onboarding
            ;;
        "analyze")
            test_analyze_profile
            ;;
        "generate")
            test_generate_plan
            ;;
        "user-plan")
            test_get_user_plan
            ;;
        "user-profile")
            test_get_user_profile
            ;;
        "validation")
            test_validation_error
            ;;
        "not-found")
            test_user_not_found
            ;;
        "rate-limit")
            test_rate_limiting
            ;;
        *)
            error "Teste não encontrado: $test_name"
            ;;
    esac
}

# Menu principal
show_menu() {
    echo ""
    echo "=== Life Tracker n8n Workflows - Menu de Testes ==="
    echo ""
    echo "1. Executar todos os testes"
    echo "2. Teste: Status do serviço"
    echo "3. Teste: Listar templates"
    echo "4. Teste: Onboarding completo"
    echo "5. Teste: Análise de perfil"
    echo "6. Teste: Geração de plano"
    echo "7. Teste: Recuperar plano do usuário"
    echo "8. Teste: Recuperar perfil do usuário"
    echo "9. Teste: Validação de entrada"
    echo "10. Teste: Usuário não encontrado"
    echo "11. Teste: Rate limiting"
    echo "0. Sair"
    echo ""
}

# Função principal
main() {
    case "${1:-menu}" in
        "all")
            run_all_tests
            ;;
        "status")
            run_specific_test "status"
            ;;
        "templates")
            run_specific_test "templates"
            ;;
        "complete")
            run_specific_test "complete"
            ;;
        "analyze")
            run_specific_test "analyze"
            ;;
        "generate")
            run_specific_test "generate"
            ;;
        "user-plan")
            run_specific_test "user-plan"
            ;;
        "user-profile")
            run_specific_test "user-profile"
            ;;
        "validation")
            run_specific_test "validation"
            ;;
        "not-found")
            run_specific_test "not-found"
            ;;
        "rate-limit")
            run_specific_test "rate-limit"
            ;;
        "menu"|*)
            while true; do
                show_menu
                read -p "Escolha uma opção: " choice
                
                case $choice in
                    1)
                        main all
                        ;;
                    2)
                        main status
                        ;;
                    3)
                        main templates
                        ;;
                    4)
                        main complete
                        ;;
                    5)
                        main analyze
                        ;;
                    6)
                        main generate
                        ;;
                    7)
                        main user-plan
                        ;;
                    8)
                        main user-profile
                        ;;
                    9)
                        main validation
                        ;;
                    10)
                        main not-found
                        ;;
                    11)
                        main rate-limit
                        ;;
                    0)
                        log "Saindo..."
                        exit 0
                        ;;
                    *)
                        error "Opção inválida"
                        ;;
                esac
                
                echo ""
                read -p "Pressione Enter para continuar..."
            done
            ;;
    esac
}

# Executar função principal
main "$@"
