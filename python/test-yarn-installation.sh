#!/bin/bash

# Script para testar diferentes formas de instalar Yarn no Docker

echo "🧪 Testando diferentes formas de instalar Yarn"
echo "=============================================="

# Função para testar um Dockerfile
test_dockerfile() {
    local dockerfile=$1
    local tag=$2
    local description=$3
    
    echo ""
    echo "🔍 Testando: $description"
    echo "   Dockerfile: $dockerfile"
    echo "   Tag: $tag"
    
    # Construir imagem
    echo "   🔨 Construindo imagem..."
    if docker build -f $dockerfile -t $tag . > /tmp/docker-build.log 2>&1; then
        echo "   ✅ Build bem-sucedido!"
        
        # Testar se yarn está disponível
        echo "   🧪 Testando se yarn está disponível..."
        if docker run --rm $tag yarn --version > /dev/null 2>&1; then
            local yarn_version=$(docker run --rm $tag yarn --version 2>/dev/null)
            echo "   ✅ Yarn instalado: $yarn_version"
        else
            echo "   ❌ Yarn não encontrado"
        fi
        
        # Testar se node está disponível
        if docker run --rm $tag node --version > /dev/null 2>&1; then
            local node_version=$(docker run --rm $tag node --version 2>/dev/null)
            echo "   ✅ Node.js instalado: $node_version"
        else
            echo "   ❌ Node.js não encontrado"
        fi
        
        # Limpar imagem
        docker rmi $tag > /dev/null 2>&1
        
    else
        echo "   ❌ Build falhou!"
        echo "   📋 Logs:"
        tail -10 /tmp/docker-build.log
    fi
}

# Verificar se estamos no diretório correto
if [ ! -f "Dockerfile" ]; then
    echo "❌ Erro: Execute este script no diretório railway-python"
    exit 1
fi

echo "📋 Opções disponíveis:"
echo "1. Dockerfile (npm install -g yarn)"
echo "2. Dockerfile.optimized (repositório oficial)"
echo "3. Dockerfile.corepack (corepack - mais moderno)"

# Testar cada opção
test_dockerfile "Dockerfile" "yarn-test-npm" "Yarn via npm (npm install -g yarn)"

if [ -f "Dockerfile.optimized" ]; then
    test_dockerfile "Dockerfile.optimized" "yarn-test-repo" "Yarn via repositório oficial"
fi

if [ -f "Dockerfile.corepack" ]; then
    test_dockerfile "Dockerfile.corepack" "yarn-test-corepack" "Yarn via corepack"
fi

echo ""
echo "🎯 Recomendação:"
echo "   - Para projetos novos: Use Dockerfile.corepack (mais moderno)"
echo "   - Para compatibilidade: Use Dockerfile.optimized (repositório oficial)"
echo "   - Para simplicidade: Use Dockerfile (npm install)"

echo ""
echo "📊 Comparação de tamanhos:"
echo "   (Execute 'docker images | grep yarn-test' para ver os tamanhos)"

echo ""
echo "✅ Teste concluído!"
