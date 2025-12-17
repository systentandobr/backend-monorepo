#!/bin/bash

# Script para testar conectividade antes do build Docker
echo "🔍 Testando conectividade de rede..."

# Testar DNS
echo "📡 Testando resolução DNS..."
if nslookup pypi.org > /dev/null 2>&1; then
    echo "✅ DNS funcionando corretamente"
else
    echo "❌ Problema com DNS detectado"
    echo "🔧 Tentando usar DNS alternativos..."
    
    # Testar com DNS do Google
    if nslookup pypi.org 8.8.8.8 > /dev/null 2>&1; then
        echo "✅ DNS do Google (8.8.8.8) funcionando"
    else
        echo "❌ DNS do Google também falhou"
    fi
    
    # Testar com DNS da Cloudflare
    if nslookup pypi.org 1.1.1.1 > /dev/null 2>&1; then
        echo "✅ DNS da Cloudflare (1.1.1.1) funcionando"
    else
        echo "❌ DNS da Cloudflare também falhou"
    fi
fi

# Testar conectividade com PyPI
echo "🐍 Testando conectividade com PyPI..."
if curl -s --connect-timeout 10 https://pypi.org/simple/ > /dev/null; then
    echo "✅ Conectividade com PyPI OK"
else
    echo "❌ Falha na conectividade com PyPI"
fi

# Testar conectividade com GitHub (para dependências que podem vir de lá)
echo "🐙 Testando conectividade com GitHub..."
if curl -s --connect-timeout 10 https://github.com > /dev/null; then
    echo "✅ Conectividade com GitHub OK"
else
    echo "❌ Falha na conectividade com GitHub"
fi

# Verificar configuração de proxy
echo "🌐 Verificando configuração de proxy..."
if [ -n "$HTTP_PROXY" ] || [ -n "$HTTPS_PROXY" ]; then
    echo "⚠️  Proxy configurado:"
    echo "   HTTP_PROXY: $HTTP_PROXY"
    echo "   HTTPS_PROXY: $HTTPS_PROXY"
else
    echo "ℹ️  Nenhum proxy configurado"
fi

# Verificar configuração do Docker
echo "🐳 Verificando configuração do Docker..."
if docker info > /dev/null 2>&1; then
    echo "✅ Docker funcionando"
    
    # Verificar se o daemon do Docker está configurado com DNS
    DOCKER_DAEMON_CONFIG=$(docker info 2>/dev/null | grep -i "dns" || echo "Nenhuma configuração DNS específica")
    echo "   Configuração DNS do Docker: $DOCKER_DAEMON_CONFIG"
else
    echo "❌ Docker não está funcionando ou não está instalado"
fi

echo ""
echo "🎯 Dicas para resolver problemas de conectividade:"
echo "1. Verifique sua conexão com a internet"
echo "2. Configure DNS alternativos (8.8.8.8, 1.1.1.1)"
echo "3. Se estiver atrás de proxy corporativo, configure as variáveis HTTP_PROXY/HTTPS_PROXY"
echo "4. Tente usar VPN se houver restrições de rede"
echo "5. Execute: docker build --network=host ."
echo "6. Ou configure DNS no daemon do Docker: /etc/docker/daemon.json"
