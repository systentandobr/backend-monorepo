#!/bin/bash

# Script de debug para testar o build do Railway localmente

echo "=== DEBUG BUILD RAILWAY ==="

# Verificar se estamos no diretório correto
echo "Diretório atual: $(pwd)"
echo "Conteúdo do diretório:"
ls -la

echo ""
echo "=== VERIFICANDO ARQUIVOS NECESSÁRIOS ==="

# Verificar se os arquivos necessários existem
if [ -f "nodejs/apis/package.json" ]; then
    echo "✅ package.json encontrado"
else
    echo "❌ package.json não encontrado"
    exit 1
fi

if [ -f "nodejs/apis/tsconfig.json" ]; then
    echo "✅ tsconfig.json encontrado"
else
    echo "❌ tsconfig.json não encontrado"
    exit 1
fi

if [ -f "nodejs/apis/tsconfig.build.json" ]; then
    echo "✅ tsconfig.build.json encontrado"
else
    echo "❌ tsconfig.build.json não encontrado"
    exit 1
fi

if [ -d "nodejs/apis/apps" ]; then
    echo "✅ diretório apps encontrado"
else
    echo "❌ diretório apps não encontrado"
    exit 1
fi

if [ -d "nodejs/apis/libs" ]; then
    echo "✅ diretório libs encontrado"
else
    echo "❌ diretório libs não encontrado"
    exit 1
fi

echo ""
echo "=== TESTANDO BUILD LOCAL ==="

# Testar build local
cd nodejs/apis

echo "Instalando dependências..."
npm install

echo "Compilando TypeScript..."
npx tsc -p tsconfig.build.json

if [ $? -eq 0 ]; then
    echo "✅ Build local bem-sucedido"
    
    if [ -f "dist/apps/apis-monorepo/main.js" ]; then
        echo "✅ Arquivo main.js gerado"
    else
        echo "❌ Arquivo main.js não encontrado"
        echo "Conteúdo de dist/:"
        find dist/ -type f
    fi
else
    echo "❌ Build local falhou"
    exit 1
fi

echo ""
echo "=== DEBUG COMPLETO ===" 