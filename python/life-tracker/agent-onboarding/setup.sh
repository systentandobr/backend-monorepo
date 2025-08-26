#!/bin/bash

# Script de setup para o Agente de Onboarding - Life Tracker
# Este script automatiza a instalação e configuração inicial

set -e

echo "🚀 Iniciando setup do Agente de Onboarding - Life Tracker"
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Python 3.8+ está instalado
check_python() {
    print_status "Verificando versão do Python..."
    
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
        REQUIRED_VERSION="3.8"
        
        if python3 -c "import sys; exit(0 if sys.version_info >= (3, 8) else 1)"; then
            print_success "Python $PYTHON_VERSION encontrado"
        else
            print_error "Python 3.8+ é necessário. Versão atual: $PYTHON_VERSION"
            exit 1
        fi
    else
        print_error "Python 3 não encontrado. Por favor, instale Python 3.8+"
        exit 1
    fi
}

# Verificar se pip está instalado
check_pip() {
    print_status "Verificando pip..."
    
    if command -v pip3 &> /dev/null; then
        print_success "pip3 encontrado"
    else
        print_error "pip3 não encontrado. Por favor, instale pip"
        exit 1
    fi
}

# Verificar se PostgreSQL está instalado
check_postgresql() {
    print_status "Verificando PostgreSQL..."
    
    if command -v psql &> /dev/null; then
        print_success "PostgreSQL encontrado"
    else
        print_warning "PostgreSQL não encontrado. Você precisará instalá-lo manualmente."
        print_warning "Para Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
        print_warning "Para macOS: brew install postgresql"
        print_warning "Para Windows: https://www.postgresql.org/download/windows/"
    fi
}

# Verificar se Redis está instalado (opcional)
check_redis() {
    print_status "Verificando Redis..."
    
    if command -v redis-server &> /dev/null; then
        print_success "Redis encontrado"
    else
        print_warning "Redis não encontrado (opcional). Para melhor performance, considere instalar."
        print_warning "Para Ubuntu/Debian: sudo apt-get install redis-server"
        print_warning "Para macOS: brew install redis"
    fi
}

# Criar ambiente virtual
create_venv() {
    print_status "Criando ambiente virtual..."
    
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "Ambiente virtual criado"
    else
        print_warning "Ambiente virtual já existe"
    fi
}

# Ativar ambiente virtual
activate_venv() {
    print_status "Ativando ambiente virtual..."
    
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
        print_success "Ambiente virtual ativado"
    else
        print_error "Não foi possível ativar o ambiente virtual"
        exit 1
    fi
}

# Instalar dependências
install_dependencies() {
    print_status "Instalando dependências Python..."
    
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
        print_success "Dependências instaladas"
    else
        print_error "Arquivo requirements.txt não encontrado"
        exit 1
    fi
}

# Configurar arquivo de ambiente
setup_env() {
    print_status "Configurando arquivo de ambiente..."
    
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            cp env.example .env
            print_success "Arquivo .env criado a partir do exemplo"
            print_warning "Por favor, edite o arquivo .env com suas configurações"
        else
            print_error "Arquivo env.example não encontrado"
            exit 1
        fi
    else
        print_warning "Arquivo .env já existe"
    fi
}

# Criar diretórios necessários
create_directories() {
    print_status "Criando diretórios necessários..."
    
    mkdir -p templates
    mkdir -p data
    mkdir -p logs
    
    print_success "Diretórios criados"
}

# Verificar se o banco de dados está acessível
check_database() {
    print_status "Verificando conexão com banco de dados..."
    
    # Tentar conectar com PostgreSQL usando as configurações padrão
    if command -v psql &> /dev/null; then
        if psql -h localhost -U postgres -d postgres -c "SELECT 1;" &> /dev/null; then
            print_success "Conexão com PostgreSQL estabelecida"
        else
            print_warning "Não foi possível conectar com PostgreSQL"
            print_warning "Certifique-se de que o PostgreSQL está rodando e acessível"
            print_warning "Você pode precisar configurar as credenciais no arquivo .env"
        fi
    else
        print_warning "PostgreSQL não encontrado, pulando verificação de conexão"
    fi
}

# Executar testes básicos
run_basic_tests() {
    print_status "Executando testes básicos..."
    
    if python -c "import fastapi, pydantic, sqlalchemy" 2>/dev/null; then
        print_success "Testes básicos passaram"
    else
        print_error "Testes básicos falharam. Verifique se todas as dependências foram instaladas"
        exit 1
    fi
}

# Mostrar próximos passos
show_next_steps() {
    echo ""
    echo "🎉 Setup concluído com sucesso!"
    echo "=================================================="
    echo ""
    echo "Próximos passos:"
    echo ""
    echo "1. ${BLUE}Configure o arquivo .env${NC}"
    echo "   - Edite o arquivo .env com suas configurações de banco de dados"
    echo "   - Configure a URL da API principal"
    echo "   - Ajuste outras configurações conforme necessário"
    echo ""
    echo "2. ${BLUE}Configure o banco de dados${NC}"
    echo "   - Crie o banco de dados: createdb life_tracker"
    echo "   - As tabelas serão criadas automaticamente na primeira execução"
    echo ""
    echo "3. ${BLUE}Execute o agente${NC}"
    echo "   - Ative o ambiente virtual: source venv/bin/activate"
    echo "   - Execute: python main.py"
    echo "   - Ou: uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
    echo ""
    echo "4. ${BLUE}Teste a API${NC}"
    echo "   - Acesse: http://0.0.0.0:8000/docs"
    echo "   - Teste o endpoint: GET /health"
    echo ""
    echo "5. ${BLUE}Integre com o frontend${NC}"
    echo "   - Configure a URL do agente no frontend"
    echo "   - Teste o processo completo de onboarding"
    echo ""
    echo "📚 Para mais informações, consulte o README.md"
    echo ""
}

# Função principal
main() {
    echo "Iniciando verificação de pré-requisitos..."
    check_python
    check_pip
    check_postgresql
    check_redis
    
    echo ""
    echo "Iniciando instalação..."
    create_venv
    activate_venv
    install_dependencies
    
    echo ""
    echo "Iniciando configuração..."
    setup_env
    create_directories
    check_database
    run_basic_tests
    
    show_next_steps
}

# Executar função principal
main "$@"
