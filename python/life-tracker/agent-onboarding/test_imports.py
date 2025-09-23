#!/usr/bin/env python3
"""
Script para testar se os imports estão funcionando
"""

import sys
import os

# Adicionar o diretório atual ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testando imports...")
    
    # Testar imports básicos
    import asyncio
    print("✓ asyncio importado")
    
    # Testar imports do Agno
    from agno.agent import Agent
    print("✓ agno.agent importado")
    
    from agno.models.openai import OpenAIChat
    print("✓ agno.models.openai importado")
    
    from agno.memory.v2.memory import Memory
    print("✓ agno.memory.v2.memory importado")
    
    from agno.memory.v2.db.sqlite import SqliteMemoryDb
    print("✓ agno.memory.v2.db.sqlite importado")
    
    from agno.tools.tavily import TavilyTools
    print("✓ agno.tools.tavily importado")
    
    # Testar imports locais
    from core.agent_onboarding import AgnoOnboardingAgent
    print("✓ AgnoOnboardingAgent importado")
    
    print("\n🎉 Todos os imports estão funcionando!")
    
except ImportError as e:
    print(f"❌ Erro de import: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Erro inesperado: {e}")
    sys.exit(1)
