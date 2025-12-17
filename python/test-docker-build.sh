#!/bin/bash

# Script para testar o build Docker localmente
# antes de fazer deploy no Railway

echo "🐳 Testando build Docker para Railway"
echo "====================================="

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Erro: Docker não está instalado"
    exit 1
fi

# Verificar se estamos no diretório correto
if [ ! -f "Dockerfile" ]; then
    echo "❌ Erro: Execute este script no diretório railway-python"
    exit 1
fi

# Nome da imagem
IMAGE_NAME="life-tracker-onboarding"
CONTAINER_NAME="life-tracker-test"

echo "🔨 Construindo imagem Docker..."
docker build -t $IMAGE_NAME .

if [ $? -eq 0 ]; then
    echo "✅ Imagem construída com sucesso!"
else
    echo "❌ Erro ao construir imagem"
    exit 1
fi

echo ""
echo "🧪 Testando container..."
echo "   Pressione Ctrl+C para parar o teste"
echo ""

# Executar container em modo interativo
docker run --rm -it \
    --name $CONTAINER_NAME \
    -p 8000:8000 \
    -e PORT=8000 \
    -e PYTHONPATH=/app \
    -e PYTHONUNBUFFERED=1 \
    $IMAGE_NAME

echo ""
echo "🧹 Limpando..."
docker rmi $IMAGE_NAME 2>/dev/null || true

echo "✅ Teste concluído!"
