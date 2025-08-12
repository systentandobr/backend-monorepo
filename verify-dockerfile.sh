#!/bin/bash

# Script para verificar qual Dockerfile está sendo usado

echo "=== VERIFICAÇÃO DE DOCKERFILE ==="
echo "Data/Hora: $(date)"
echo ""

echo "=== ARQUIVOS DOCKERFILE DISPONÍVEIS ==="
ls -la Dockerfile* 2>/dev/null || echo "Nenhum Dockerfile encontrado"
echo ""

echo "=== CONFIGURAÇÃO DO RAILWAY.TOML ==="
if [ -f "railway.toml" ]; then
    echo "railway.toml encontrado:"
    cat railway.toml
    echo ""
    
    # Extrair dockerfilePath do railway.toml
    DOCKERFILE_PATH=$(grep -E "^dockerfilePath" railway.toml | sed 's/dockerfilePath = "//' | sed 's/"//')
    
    if [ -n "$DOCKERFILE_PATH" ]; then
        echo "✅ Dockerfile configurado: $DOCKERFILE_PATH"
        if [ -f "$DOCKERFILE_PATH" ]; then
            echo "✅ Arquivo $DOCKERFILE_PATH existe"
            echo "Tamanho: $(ls -lh "$DOCKERFILE_PATH" | awk '{print $5}')"
        else
            echo "❌ Arquivo $DOCKERFILE_PATH NÃO existe"
        fi
    else
        echo "⚠️  Nenhum dockerfilePath especificado - usando Dockerfile padrão"
        if [ -f "Dockerfile" ]; then
            echo "✅ Dockerfile padrão existe"
            echo "Tamanho: $(ls -lh Dockerfile | awk '{print $5}')"
        else
            echo "❌ Dockerfile padrão NÃO existe"
        fi
    fi
else
    echo "❌ railway.toml não encontrado"
fi

echo ""
echo "=== CONTEÚDO DO DOCKERFILE ATIVO ==="
if [ -n "$DOCKERFILE_PATH" ] && [ -f "$DOCKERFILE_PATH" ]; then
    echo "Usando: $DOCKERFILE_PATH"
    echo "Primeiras 10 linhas:"
    head -10 "$DOCKERFILE_PATH"
    echo "..."
elif [ -f "Dockerfile" ]; then
    echo "Usando: Dockerfile (padrão)"
    echo "Primeiras 10 linhas:"
    head -10 Dockerfile
    echo "..."
else
    echo "❌ Nenhum Dockerfile encontrado"
fi

echo ""
echo "=== COMPARAÇÃO DE DOCKERFILES ==="
echo "Diferenças entre Dockerfile e Dockerfile.advanced-debug:"
if [ -f "Dockerfile" ] && [ -f "Dockerfile.advanced-debug" ]; then
    echo "Linhas diferentes (primeiras 20):"
    diff -u Dockerfile Dockerfile.advanced-debug | head -20
else
    echo "Não é possível comparar - arquivos não encontrados"
fi

echo ""
echo "=== TESTE DE BUILD LOCAL ==="
if [ -n "$DOCKERFILE_PATH" ] && [ -f "$DOCKERFILE_PATH" ]; then
    echo "Para testar o build localmente:"
    echo "docker build -f $DOCKERFILE_PATH -t railway-test ."
else
    echo "Para testar o build localmente:"
    echo "docker build -t railway-test ."
fi
echo ""

echo "=== FIM DA VERIFICAÇÃO ===" 