#!/bin/bash

# Script de configuração do projeto Meu Nutri

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sem cor

# Função de log
log() {
    echo -e "${GREEN}[SETUP]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

# Verificar Python
check_python() {
    log "Verificando versão do Python..."
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    log "Versão do Python: $PYTHON_VERSION"
    
    # Verificar versão mínima
    if [[ "$(printf '%s\n' "3.10" "$PYTHON_VERSION" | sort -V | head -n1)" != "3.10" ]]; then
        error "Versão do Python incompatível. Necessário Python 3.10 ou superior."
        exit 1
    fi
}

# Configurar ambiente virtual
setup_venv() {
    log "Configurando ambiente virtual..."
    
    # Verificar se o venv já existe
    if [ ! -d "venv" ]; then
        log "Criando ambiente virtual..."
        python3 -m venv venv
    else
        warning "Ambiente virtual já existe"
    fi
    
    # Ativar ambiente virtual
    source venv/bin/activate
}

# Atualizar pip e ferramentas de instalação
upgrade_pip() {
    log "Atualizando pip e ferramentas de instalação..."
    pip install --upgrade pip setuptools wheel
}

# Instalar dependências
install_dependencies() {
    log "Instalando dependências do projeto..."
    pip install -r requirements.txt
}

# Configurar variáveis de ambiente
setup_env() {
    log "Configurando variáveis de ambiente..."
    
    # Verificar se .env existe
    if [ ! -f ".env" ]; then
        warning "Arquivo .env não encontrado. Criando modelo..."
        cat > .env << EOL
# Configurações do Supabase
SUPABASE_URL=seu_url_do_supabase
SUPABASE_KEY=sua_chave_do_supabase

# Configurações de Segurança
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256

# Configurações de Banco de Dados
DATABASE_URL=postgresql://usuario:senha@localhost/meu_nutri
EOL
        warning "Por favor, edite o arquivo .env com suas configurações"
    fi
}

# Executar migrações do banco de dados
run_migrations() {
    log "Executando migrações do banco de dados..."
    # Se estiver usando SQLAlchemy ou Alembic
    # alembic upgrade head
}

# Função principal
main() {
    clear
    echo -e "${GREEN}Configuração do Projeto Meu Nutri${NC}"
    
    # Mudar para o diretório do projeto
    cd "$(dirname "$0")"
    
    check_python
    setup_venv
    upgrade_pip
    install_dependencies
    setup_env
    run_migrations
    
    log "Configuração concluída com sucesso!"
    log "Para ativar o ambiente virtual: source venv/bin/activate"
    log "Para iniciar o servidor: uvicorn app.main:app --reload"
}

# Executar o script
main
