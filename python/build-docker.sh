#!/bin/bash

# Script de build Docker otimizado para resolver problemas de conectividade
set -e

echo "🚀 Iniciando build Docker otimizado..."

# Verificar se estamos no diretório correto
if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile não encontrado. Execute este script no diretório python/"
    exit 1
fi

# Testar conectividade antes do build
echo "🔍 Testando conectividade..."
./test-connectivity.sh

# Configurar variáveis de ambiente para o build
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Função para build com diferentes estratégias
build_with_strategy() {
    local strategy=$1
    local tag="python-app:${strategy}"
    
    echo "🏗️  Tentando build com estratégia: $strategy"
    
    case $strategy in
        "default")
            docker build -t $tag .
            ;;
        "host-network")
            docker build --network=host -t $tag .
            ;;
        "dns-google")
            docker build --dns=8.8.8.8 --dns=8.8.4.4 -t $tag .
            ;;
        "dns-cloudflare")
            docker build --dns=1.1.1.1 --dns=1.0.0.1 -t $tag .
            ;;
        "no-cache")
            docker build --no-cache -t $tag .
            ;;
        *)
            echo "❌ Estratégia desconhecida: $strategy"
            return 1
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        echo "✅ Build bem-sucedido com estratégia: $strategy"
        echo "🏷️  Imagem criada: $tag"
        return 0
    else
        echo "❌ Build falhou com estratégia: $strategy"
        return 1
    fi
}

# Tentar diferentes estratégias de build
strategies=("default" "host-network" "dns-google" "dns-cloudflare" "no-cache")

for strategy in "${strategies[@]}"; do
    if build_with_strategy $strategy; then
        echo ""
        echo "🎉 Build concluído com sucesso!"
        echo "📋 Para executar a aplicação:"
        echo "   docker run -p 8000:8000 python-app:$strategy"
        echo ""
        echo "🔧 Para debug:"
        echo "   docker run -it --entrypoint /bin/bash python-app:$strategy"
        exit 0
    fi
done

echo ""
echo "❌ Todas as estratégias de build falharam."
echo "🔧 Possíveis soluções:"
echo "1. Verifique sua conexão com a internet"
echo "2. Configure DNS alternativos no seu sistema"
echo "3. Se estiver atrás de proxy corporativo:"
echo "   export HTTP_PROXY=http://proxy:port"
echo "   export HTTPS_PROXY=http://proxy:port"
echo "4. Tente usar VPN"
echo "5. Configure DNS no daemon do Docker:"
echo "   sudo nano /etc/docker/daemon.json"
echo "   {"
echo "     \"dns\": [\"8.8.8.8\", \"8.8.4.4\"]"
echo "   }"
echo "   sudo systemctl restart docker"

exit 1
