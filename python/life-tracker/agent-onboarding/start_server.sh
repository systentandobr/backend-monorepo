#!/bin/bash

# Script para iniciar o servidor de desenvolvimento
# com documentação Swagger

echo "🚀 Iniciando Life Tracker - Agente de Onboarding"
echo "================================================"

# Verificar se estamos no diretório correto
if [ ! -f "main.py" ]; then
    echo "❌ Erro: Execute este script no diretório python/life-tracker/agent-onboarding"
    exit 1
fi

# Verificar se o Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Erro: Python 3 não está instalado"
    exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -f "requirements.txt" ]; then
    echo "⚠️  Aviso: requirements.txt não encontrado"
    echo "💡 Instalando dependências básicas..."
    pip install fastapi uvicorn pydantic python-dotenv
else
    echo "📦 Instalando dependências..."
    pip install -r requirements.txt
fi

echo ""
echo "✅ Dependências instaladas"
echo ""
echo "🌐 URLs da Documentação:"
echo "   - Swagger UI: http://localhost:8000/docs"
echo "   - ReDoc: http://localhost:8000/redoc"
echo "   - OpenAPI JSON: http://localhost:8000/openapi.json"
echo ""
echo "🔧 Endpoints Principais:"
echo "   - Health Check: http://localhost:8000/health"
echo "   - Onboarding: http://localhost:8000/onboarding"
echo "   - Status: http://localhost:8000/onboarding/status"
echo ""
echo "🚀 Iniciando servidor..."
echo "   Pressione Ctrl+C para parar"
echo ""

# Iniciar o servidor
python main.py
