#!/bin/bash

# Script para testar o build localmente com variáveis de ambiente
# Útil para debugar antes do deploy no Railway

echo "=== TESTE DE BUILD LOCAL ==="
echo "Data/Hora: $(date)"
echo ""

# Verificar se as variáveis estão definidas
if [ -z "$USER_DB" ] || [ -z "$PASS_DB" ] || [ -z "$HOST_DB" ]; then
    echo "⚠️  Variáveis de ambiente não definidas!"
    echo ""
    echo "Para testar com variáveis, execute:"
    echo "export USER_DB=seu_usuario"
    echo "export PASS_DB=sua_senha"
    echo "export HOST_DB=seu_cluster.mongodb.net"
    echo ""
    echo "Ou execute este script com as variáveis:"
    echo "USER_DB=seu_usuario PASS_DB=sua_senha HOST_DB=seu_cluster.mongodb.net ./test-build-local.sh"
    echo ""
fi

# Executar o script de teste MongoDB
echo "Executando teste de conectividade MongoDB..."
./test-mongodb-build.sh

echo ""
echo "=== TESTE DE BUILD DOCKER ==="
echo "Para testar o build Docker com estas variáveis:"
echo ""
echo "docker build \\"
echo "  --build-arg USER_DB=\$USER_DB \\"
echo "  --build-arg PASS_DB=\$PASS_DB \\"
echo "  --build-arg HOST_DB=\$HOST_DB \\"
echo "  -t railway-test ."
echo ""

# Verificar se Docker está disponível
if command -v docker >/dev/null 2>&1; then
    echo "Docker encontrado. Deseja executar o build de teste? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "Executando build Docker de teste..."
        docker build \
          --build-arg USER_DB="$USER_DB" \
          --build-arg PASS_DB="$PASS_DB" \
          --build-arg HOST_DB="$HOST_DB" \
          -t railway-test .
    fi
else
    echo "Docker não encontrado. Instale o Docker para testar o build."
fi

echo ""
echo "=== FIM DO TESTE LOCAL ===" 