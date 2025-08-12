#!/bin/bash

# Script para testar conectividade com MongoDB Atlas durante o build
# Este script pode ser executado durante o build do Docker

echo "=== TESTE MONGODB ATLAS DURANTE BUILD ==="
echo "Data/Hora: $(date)"
echo ""

# Verificar se as variáveis de ambiente estão disponíveis
if [ -n "$USER_DB" ] && [ -n "$PASS_DB" ] && [ -n "$HOST_DB" ]; then
    echo "✅ Variáveis de ambiente do MongoDB encontradas"
    echo "USER_DB: $USER_DB"
    echo "PASS_DB: [OCULTA]"
    echo "HOST_DB: $HOST_DB"
    echo ""
    
    # Extrair hostname do HOST_DB
    HOSTNAME=$(echo "$HOST_DB" | sed 's/.*@//' | sed 's/\/.*//')
    echo "Hostname extraído: $HOSTNAME"
    echo ""
    
    # Testar resolução DNS
    echo "=== TESTE DE DNS ==="
    echo "Resolvendo $HOSTNAME:"
    nslookup "$HOSTNAME" || echo "❌ Falha na resolução DNS"
    echo ""
    
    # Testar conectividade de rede
    echo "=== TESTE DE CONECTIVIDADE ==="
    echo "Testando porta 27017:"
    nc -zv "$HOSTNAME" 27017 2>&1 && echo "✅ Conexão com porta 27017 OK" || echo "❌ Falha na conexão com porta 27017"
    echo ""
    
    # Testar com telnet como fallback
    echo "Testando com telnet (timeout 5s):"
    timeout 5 telnet "$HOSTNAME" 27017 2>&1 && echo "✅ Telnet OK" || echo "❌ Telnet falhou"
    echo ""
    
    # Testar com curl para verificar se há algum endpoint HTTP
    echo "Testando endpoint HTTP (se existir):"
    curl -s --max-time 5 "https://$HOSTNAME" || echo "❌ Sem endpoint HTTP"
    echo ""
    
else
    echo "⚠️  Variáveis de ambiente do MongoDB não encontradas"
    echo "USER_DB: ${USER_DB:-'NÃO DEFINIDA'}"
    echo "PASS_DB: ${PASS_DB:+'DEFINIDA'}"
    echo "HOST_DB: ${HOST_DB:-'NÃO DEFINIDA'}"
    echo ""
    echo "Para testar conectividade, defina as variáveis:"
    echo "USER_DB=seu_usuario"
    echo "PASS_DB=sua_senha"
    echo "HOST_DB=seu_cluster.mongodb.net"
    echo ""
fi

echo "=== INFORMAÇÕES DE REDE GERAIS ==="
echo "IP Público atual:"
curl -s --max-time 5 ifconfig.me || echo "❌ Não foi possível obter IP"
echo ""

echo "Interfaces de rede:"
ip addr show 2>/dev/null || ifconfig 2>/dev/null || echo "❌ Comandos de rede não disponíveis"
echo ""

echo "=== FIM DO TESTE MONGODB ===" 