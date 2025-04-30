#!/bin/bash

# Script para iniciar o servidor Meu Nutri

# Verifica se o ambiente virtual existe, se não, cria
if [ ! -d "venv" ]; then
    echo "Criando ambiente virtual..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Verifica se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "Arquivo .env não encontrado. Criando modelo inicial..."
    cat > .env << EOL
# API Keys (substitua com suas chaves reais)
OPENAI_API_KEY=sua_chave_openai
ANTHROPIC_API_KEY=sua_chave_anthropic

# Configurações PostgreSQL
POSTGRES_CONNECTION_STRING=postgresql://postgres:postgres@localhost:5432/meu_nutri

# Configurações de armazenamento
VISUALIZATIONS_DIR=/tmp/meu-nutri/visualizations

# Configurações Alexa (para ambiente de produção)
MEUNUTRI_API_ENDPOINT=http://localhost:8000
MEUNUTRI_API_KEY=chave_teste_local
EOL
    echo "Modelo de .env criado. Por favor, edite o arquivo com suas configurações reais."
fi

# Verifica se o banco de dados existe
if command -v psql > /dev/null; then
    DB_EXISTS=$(psql -lqt | cut -d \| -f 1 | grep -w meu_nutri | wc -l)
    if [ $DB_EXISTS -eq 0 ]; then
        echo "Criando banco de dados meu_nutri..."
        createdb meu_nutri
    fi
fi

# Cria diretório para visualizações
mkdir -p /tmp/meu-nutri/visualizations

# Inicia o servidor
echo "Iniciando servidor Meu Nutri..."
export DEBUG=1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
