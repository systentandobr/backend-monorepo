"""
Script simples para executar o playground do Agno
"""

import asyncio
import logging
import sys
import os

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configurar paths
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agno.playground import serve_playground_app, Playground
from core.agent_onboarding import AgnoOnboardingAgent

async def main():
    """Função principal para criar e servir o playground"""
    try:
        logger.info("🚀 Iniciando Life Tracker Playground...")
        
        # Inicializar o agente
        agent = AgnoOnboardingAgent()
        playground_agent = await agent.initialize()
        
        logger.info("✅ Agente inicializado com sucesso")
        
        # Criar playground
        playground = Playground(agents=[playground_agent])
        app = playground.get_app()
        
        logger.info("✅ Playground criado com sucesso")
        logger.info("🌐 Acesse: http://localhost:8000")
        
        # Servir a aplicação
        serve_playground_app("run_playground:app", reload=True)
        
    except Exception as e:
        logger.error(f"❌ Erro ao inicializar playground: {e}")
        sys.exit(1)

# Criar a aplicação global
app = None

async def create_app():
    """Cria a aplicação do playground"""
    global app
    if app is None:
        agent = AgnoOnboardingAgent()
        playground_agent = await agent.initialize()
        playground = Playground(agents=[playground_agent])
        app = playground.get_app()
    return app

# Inicializar a aplicação
try:
    app = asyncio.run(create_app())
except Exception as e:
    logger.error(f"Erro ao criar aplicação: {e}")
    app = None

if __name__ == "__main__":
    asyncio.run(main())
