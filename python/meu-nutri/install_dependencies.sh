#!/bin/bash
# Script de instalação de dependências para Meu Nutri

# Configurações
PROJECT_DIR="/home/marcelio/developing/systentando/backend-monorepo/python/meu-nutri"
VENV_DIR="$PROJECT_DIR/venv"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # Sem cor

# Função de log
log() {
    echo -e "${GREEN}[INSTALAÇÃO]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

# Verificar Python
check_python() {
    log "Verificando versão do Python..."
    python3 --version
    if [ $? -ne 0 ]; then
        error "Python 3 não encontrado. Por favor, instale o Python 3.10 ou superior."
        exit 1
    fi
}

# Criar ambiente virtual
create_venv() {
    log "Criando ambiente virtual..."
    if [ ! -d "$VENV_DIR" ]; then
        python3 -m venv "$VENV_DIR"
        if [ $? -ne 0 ]; then
            error "Falha ao criar ambiente virtual"
            exit 1
        fi
    else
        warning "Ambiente virtual já existe"
    fi
}

# Ativar ambiente virtual
activate_venv() {
    log "Ativando ambiente virtual..."
    source "$VENV_DIR/bin/activate"
    if [ $? -ne 0 ]; then
        error "Falha ao ativar ambiente virtual"
        exit 1
    fi
}

# Atualizar pip
upgrade_pip() {
    log "Atualizando pip..."
    pip install --upgrade pip setuptools wheel
}

# Instalar dependências
install_dependencies() {
    log "Instalando dependências..."
    pip install -r "$PROJECT_DIR/requirements.txt"
    if [ $? -ne 0 ]; then
        error "Falha ao instalar dependências"
        exit 1
    fi
}

# Verificar instalação
verify_installation() {
    log "Verificando instalação..."
    python3 "$PROJECT_DIR/diagnose_setup.py"
}

# Função principal
main() {
    clear
    echo -e "${GREEN}Instalação de Dependências - Meu Nutri${NC}"
    
    # Mudar para o diretório do projeto
    cd "$PROJECT_DIR"
    
    check_python
    create_venv
    activate_venv
    upgrade_pip
    install_dependencies
    verify_installation
    
    log "Instalação concluída com sucesso!"
}

# Executar o script
main
