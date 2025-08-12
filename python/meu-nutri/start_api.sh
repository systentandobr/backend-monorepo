#!/bin/bash
# Script de inicialização da API Meu Nutri

# Mudar para o diretório do projeto
cd /home/marcelio/developing/systentando/backend-monorepo/python/meu-nutri

# Ativar ambiente virtual
source venv/bin/activate

# Configurar PYTHONPATH explicitamente
export PYTHONPATH="$PWD:$PYTHONPATH"

# Iniciar o servidor Uvicorn com caminho completo
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
