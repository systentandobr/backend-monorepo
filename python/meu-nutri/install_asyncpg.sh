#!/bin/bash

# Ativar o ambiente virtual
source venv/bin/activate

# Instalar asyncpg
pip install asyncpg>=0.27.0

echo "Pacote asyncpg instalado com sucesso!"
