#!/bin/bash

# Script de debug para Railway
# Verifica IP de saída e variáveis de ambiente

echo "=== DEBUG RAILWAY - MONGODB ATLAS ==="
echo "Data/Hora: $(date)"
echo ""

echo "=== INFORMAÇÕES DO SISTEMA ==="
echo "Hostname: $(hostname)"
echo "Sistema: $(uname -a)"
echo ""

echo "=== IP DE SAÍDA ==="
echo "IP Público (curl ifconfig.me):"
curl -s ifconfig.me || echo "Erro ao obter IP via ifconfig.me"
echo ""

echo "IP Público (curl ipinfo.io):"
curl -s ipinfo.io/ip || echo "Erro ao obter IP via ipinfo.io"
echo ""

echo "IP Público (curl icanhazip.com):"
curl -s icanhazip.com || echo "Erro ao obter IP via icanhazip.com"
echo ""

echo "=== VARIÁVEIS DE AMBIENTE ==="
echo "USER_DB: ${USER_DB:-'NÃO DEFINIDA'}"
echo "PASS_DB: ${PASS_DB:+'DEFINIDA'}"
echo "HOST_DB: ${HOST_DB:-'NÃO DEFINIDA'}"
echo "NODE_ENV: ${NODE_ENV:-'NÃO DEFINIDA'}"
echo ""

echo "=== TESTE DE CONECTIVIDADE ==="
if [ -n "$HOST_DB" ]; then
    echo "Testando conectividade com MongoDB Atlas..."
    echo "Host: $HOST_DB"
    
    # Extrair hostname do HOST_DB
    HOSTNAME=$(echo "$HOST_DB" | sed 's/.*@//' | sed 's/\/.*//')
    echo "Hostname extraído: $HOSTNAME"
    
    # Testar conectividade
    if command -v nc >/dev/null 2>&1; then
        echo "Testando porta 27017..."
        nc -zv "$HOSTNAME" 27017 2>&1 || echo "Falha na conexão com porta 27017"
    else
        echo "nc não disponível, testando com telnet..."
        timeout 5 telnet "$HOSTNAME" 27017 2>&1 || echo "Falha na conexão com telnet"
    fi
else
    echo "HOST_DB não definida, não é possível testar conectividade"
fi

echo ""
echo "=== LOGS DE CONEXÃO MONGODB ==="
echo "Para ver logs detalhados do MongoDB, execute:"
echo "tail -f /app/logs/mongodb.log"
echo ""

echo "=== DEBUG COMPLETO ===" 