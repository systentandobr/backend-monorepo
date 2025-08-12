#!/bin/bash

# Script para verificar qual Dockerfile está sendo usado no Railway

echo "=== VERIFICAÇÃO DE DOCKERFILE NO RAILWAY ==="
echo "Data/Hora: $(date)"
echo ""

echo "=== CONFIGURAÇÃO ATUAL ==="
echo "1. railway.toml:"
if [ -f "railway.toml" ]; then
    cat railway.toml
else
    echo "❌ railway.toml não encontrado"
fi
echo ""

echo "2. Dockerfiles disponíveis:"
ls -la Dockerfile* 2>/dev/null || echo "Nenhum Dockerfile encontrado"
echo ""

echo "=== COMO VERIFICAR NO RAILWAY ==="
echo ""
echo "1. Faça o deploy:"
echo "   railway up"
echo ""
echo "2. Verifique os logs do build:"
echo "   railway logs"
echo ""
echo "3. Procure por estas linhas nos logs:"
echo "   - 'Building with Dockerfile'"
echo "   - 'dockerfilePath'"
echo "   - '=== DEBUG DE REDE DURANTE BUILD ==='"
echo ""
echo "4. Se você vir '=== DEBUG DE REDE DURANTE BUILD ===',"
echo "   significa que o Dockerfile.advanced-debug está sendo usado."
echo ""
echo "5. Se você vir apenas '=== TESTE DE IP DURANTE BUILD ===',"
echo "   significa que o Dockerfile padrão está sendo usado."
echo ""

echo "=== TESTE LOCAL RÁPIDO ==="
echo "Para testar localmente sem build completo:"
echo ""
echo "1. Teste o Dockerfile padrão:"
echo "   docker build --target=0 -t test-default ."
echo ""
echo "2. Teste o Dockerfile.advanced-debug:"
echo "   docker build --target=0 -f Dockerfile.advanced-debug -t test-advanced ."
echo ""

echo "=== DIFERENÇAS PRINCIPAIS ==="
echo ""
echo "Dockerfile padrão:"
echo "  - Teste básico de IP"
echo "  - Inclui build args para variáveis de ambiente"
echo "  - Usa script de teste MongoDB"
echo ""
echo "Dockerfile.advanced-debug:"
echo "  - Teste completo de rede"
echo "  - Informações de sistema detalhadas"
echo "  - Teste de conectividade básica"
echo "  - NÃO inclui build args (mais simples)"
echo ""

echo "=== RECOMENDAÇÃO ==="
echo ""
echo "Para debug de MongoDB Atlas, use o Dockerfile padrão"
echo "pois ele inclui os build args necessários para as variáveis de ambiente."
echo ""
echo "Para debug geral de rede, use o Dockerfile.advanced-debug."
echo ""

echo "=== FIM DA VERIFICAÇÃO ===" 