#!/bin/bash

# Script para verificar pré-requisitos de implementação
# Verifica se todos os documentos necessários estão disponíveis

set -e

# Função para mostrar uso
show_usage() {
    echo "Uso: $0 [--json]"
    echo ""
    echo "Verifica pré-requisitos para implementação de funcionalidades"
    echo ""
    echo "Opções:"
    echo "  --json    Retorna resultado em formato JSON"
    echo ""
    echo "Exemplos:"
    echo "  $0                    # Verificação normal"
    echo "  $0 --json            # Retorna JSON para integração"
}

# Função para log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >&2
}

# Função para erro
error() {
    echo "ERRO: $1" >&2
    exit 1
}

# Função para verificar se arquivo existe
check_file() {
    local file="$1"
    if [[ -f "$file" ]]; then
        echo "✓ $file"
        return 0
    else
        echo "✗ $file (FALTANDO)"
        return 1
    fi
}

# Função para verificar se diretório existe
check_dir() {
    local dir="$1"
    if [[ -d "$dir" ]]; then
        echo "✓ $dir/"
        return 0
    else
        echo "✗ $dir/ (FALTANDO)"
        return 1
    fi
}

# Função para obter diretório da funcionalidade atual
get_feature_dir() {
    # Verificar se estamos em uma branch de funcionalidade
    local current_branch=$(git branch --show-current 2>/dev/null || echo "")
    
    if [[ "$current_branch" =~ ^[0-9]{3}- ]]; then
        # Branch de funcionalidade encontrada
        local feature_name=$(echo "$current_branch" | sed 's/^[0-9]\{3\}-//')
        echo "specs/$current_branch"
    else
        # Tentar encontrar diretório de funcionalidade mais recente
        local latest_spec=$(find specs -name "spec.md" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
        if [[ -n "$latest_spec" ]]; then
            dirname "$latest_spec"
        else
            echo ""
        fi
    fi
}

# Função principal
main() {
    local json_output=false
    
    # Parse argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --json)
                json_output=true
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
    if [[ ! -f "package.json" ]] && [[ ! -f "package.json" ]]; then
        error "Execute este script a partir da raiz do projeto"
    fi
    
    # Obter diretório da funcionalidade
    local feature_dir=$(get_feature_dir)
    
    if [[ -z "$feature_dir" ]]; then
        error "Nenhuma funcionalidade encontrada. Execute /specify primeiro."
    fi
    
    log "Verificando pré-requisitos para: $feature_dir"
    
    # Verificar documentos obrigatórios
    local missing_files=()
    local available_docs=()
    
    # Documentos obrigatórios
    local required_files=(
        "$feature_dir/plan.md"
        "$feature_dir/tasks.md"
    )
    
    # Documentos opcionais
    local optional_files=(
        "$feature_dir/research.md"
        "$feature_dir/data-model.md"
        "$feature_dir/quickstart.md"
        "$feature_dir/contracts"
    )
    
    # Verificar arquivos obrigatórios
    for file in "${required_files[@]}"; do
        if check_file "$file"; then
            available_docs+=("$(basename "$file")")
        else
            missing_files+=("$file")
        fi
    done
    
    # Verificar arquivos opcionais
    for file in "${optional_files[@]}"; do
        if [[ -f "$file" ]] || [[ -d "$file" ]]; then
            if check_file "$file"; then
                available_docs+=("$(basename "$file")")
            fi
        fi
    done
    
    # Verificar estrutura do projeto
    local project_structure_ok=true
    
    # Frontend
    if [[ ! -d "src" ]]; then
        echo "✗ src/ (FALTANDO)"
        project_structure_ok=false
    else
        echo "✓ src/"
    fi
    
    # Backend
    if [[ ! -d "../backend-monorepo/nodejs/apis/apps/life-tracker/src" ]]; then
        echo "✗ ../backend-monorepo/nodejs/apis/apps/life-tracker/src/ (FALTANDO)"
        project_structure_ok=false
    else
        echo "✓ ../backend-monorepo/nodejs/apis/apps/life-tracker/src/"
    fi
    
    # Agente
    if [[ ! -d "../backend-monorepo/python/life-tracker/agent-onboarding/src" ]]; then
        echo "✗ ../backend-monorepo/python/life-tracker/agent-onboarding/src/ (FALTANDO)"
        project_structure_ok=false
    else
        echo "✓ ../backend-monorepo/python/life-tracker/agent-onboarding/src/"
    fi
    
    # Verificar se há arquivos faltando
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        echo ""
        echo "❌ ARQUIVOS OBRIGATÓRIOS FALTANDO:"
        for file in "${missing_files[@]}"; do
            echo "   - $file"
        done
        echo ""
        echo "Execute /plan e /tasks primeiro para gerar os documentos necessários."
        exit 1
    fi
    
    # Verificar estrutura do projeto
    if [[ "$project_structure_ok" != "true" ]]; then
        echo ""
        echo "❌ ESTRUTURA DO PROJETO INCOMPLETA"
        echo "Configure a estrutura do projeto antes de implementar."
        exit 1
    fi
    
    # Sucesso
    echo ""
    echo "✅ PRÉ-REQUISITOS ATENDIDOS"
    echo ""
    echo "📁 Diretório da funcionalidade: $feature_dir"
    echo "📄 Documentos disponíveis: ${#available_docs[@]}"
    for doc in "${available_docs[@]}"; do
        echo "   - $doc"
    done
    
    # Saída JSON se solicitado
    if [[ "$json_output" == "true" ]]; then
        echo ""
        echo "JSON_OUTPUT:"
        cat << EOF
{
  "status": "success",
  "feature_dir": "$feature_dir",
  "impl_plan": "$feature_dir/plan.md",
  "tasks_file": "$feature_dir/tasks.md",
  "available_docs": [$(printf '"%s",' "${available_docs[@]}" | sed 's/,$//')],
  "project_structure": {
    "frontend": "src/",
    "backend": "../backend-monorepo/nodejs/apis/apps/life-tracker/src/",
    "agent": "../backend-monorepo/python/life-tracker/agent-onboarding/src/"
  },
  "ready_for_implementation": true
}
EOF
    fi
    
    log "Pré-requisitos verificados com sucesso"
}

# Executar função principal
main "$@"
