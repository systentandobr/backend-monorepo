#!/bin/bash

# Script para diagnosticar e corrigir problemas de conectividade do Docker
set -e

echo "🔧 Diagnóstico e Correção de Conectividade do Docker"
echo "=================================================="

# Verificar se o Docker está rodando
echo "�� Verificando status do Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando ou não está instalado"
    echo "🔧 Iniciando Docker..."
    sudo systemctl start docker
    sleep 3
fi

# Verificar configuração atual do Docker
echo "🔍 Verificando configuração atual do Docker..."
DOCKER_CONFIG_FILE="/etc/docker/daemon.json"

# Backup da configuração atual
if [ -f "$DOCKER_CONFIG_FILE" ]; then
    echo "📦 Fazendo backup da configuração atual..."
    sudo cp "$DOCKER_CONFIG_FILE" "${DOCKER_CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Criar configuração otimizada para conectividade
echo "⚙️  Configurando Docker para melhor conectividade..."

sudo tee "$DOCKER_CONFIG_FILE" > /dev/null <<EOF
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"],
  "dns-opts": ["timeout:2", "attempts:3", "rotate"],
  "max-concurrent-downloads": 10,
  "max-concurrent-uploads": 5,
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "features": {
    "buildkit": true
  }
}
EOF

echo "✅ Configuração do Docker atualizada"

# Reiniciar Docker para aplicar as mudanças
echo "�� Reiniciando Docker..."
sudo systemctl restart docker
sleep 5

# Verificar se o Docker está funcionando
echo "🔍 Verificando se o Docker está funcionando..."
if docker info > /dev/null 2>&1; then
    echo "✅ Docker está funcionando corretamente"
else
    echo "❌ Docker ainda não está funcionando"
    exit 1
fi

# Testar conectividade básica
echo "🌐 Testando conectividade básica..."
if docker run --rm alpine:latest ping -c 3 8.8.8.8 > /dev/null 2>&1; then
    echo "✅ Conectividade IP funcionando"
else
    echo "❌ Problema com conectividade IP"
fi

# Testar resolução DNS
echo "�� Testando resolução DNS..."
if docker run --rm alpine:latest nslookup google.com > /dev/null 2>&1; then
    echo "✅ Resolução DNS funcionando"
else
    echo "❌ Problema com resolução DNS"
fi

# Testar download de imagem
echo "📦 Testando download de imagem..."
if docker pull hello-world:latest > /dev/null 2>&1; then
    echo "✅ Download de imagens funcionando"
else
    echo "❌ Problema com download de imagens"
fi

# Configurar variáveis de ambiente para builds
echo "🔧 Configurando variáveis de ambiente..."
cat >> ~/.bashrc <<EOF

# Docker BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Docker DNS
export DOCKER_DNS_OPTS="--dns=8.8.8.8 --dns=8.8.4.4"
EOF

# Criar alias para builds com DNS
echo "📝 Criando aliases úteis..."
cat >> ~/.bashrc <<EOF

# Aliases para Docker
alias docker-build-dns='docker build --dns=8.8.8.8 --dns=8.8.4.4'
alias docker-build-host='docker build --network=host'
alias docker-build-no-cache='docker build --no-cache --dns=8.8.8.8 --dns=8.8.4.4'
EOF

# Recarregar bashrc
source ~/.bashrc

echo ""
echo "�� Configuração concluída!"
echo ""
echo "�� Próximos passos:"
echo "1. Teste o build: cd python && ./build-docker.sh"
echo "2. Ou use: docker build --dns=8.8.8.8 --dns=8.8.4.4 -t python-app ."
echo "3. Se ainda houver problemas, tente: docker build --network=host -t python-app ."
echo ""
echo "�� Comandos úteis criados:"
echo "   docker-build-dns    - Build com DNS otimizado"
echo "   docker-build-host   - Build usando rede do host"
echo "   docker-build-no-cache - Build sem cache e com DNS otimizado"
echo ""
echo "📞 Se ainda houver problemas:"
echo "   - Verifique firewall: sudo ufw status"
echo "   - Verifique proxy: env | grep -i proxy"
echo "   - Teste VPN: pode estar bloqueando conexões"
