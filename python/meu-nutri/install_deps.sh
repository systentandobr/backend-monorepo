#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Instalando dependências adicionais para o projeto Meu Nutri...${NC}"

# Ativa o ambiente virtual
source venv/bin/activate

# Instala o pacote asyncpg
echo -e "${GREEN}Instalando asyncpg...${NC}"
pip install asyncpg>=0.27.0

# Verifica se a instalação foi bem-sucedida
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Dependências adicionais instaladas com sucesso!${NC}"
    echo -e "${GREEN}Agora você pode executar 'make test-agent' para testar o agente.${NC}"
else
    echo -e "${RED}Erro ao instalar dependências adicionais.${NC}"
fi
