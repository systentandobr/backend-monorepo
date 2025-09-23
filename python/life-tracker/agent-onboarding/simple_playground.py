"""
Script simples para playground do Agno - Life Tracker
"""

import asyncio
import logging
import sys
import os

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Adicionar o diretório atual ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agno.playground import serve_playground_app, Playground
from core.agent_onboarding import AgnoOnboardingAgent

async def create_playground():
    """Cria o playground do Agno"""
    logger.info("🚀 Inicializando Life Tracker Playground...")
    
    # Inicializar o agente
    agent = AgnoOnboardingAgent()
    playground_agent = await agent.initialize()
    
    logger.info("✅ Agente inicializado")
    
    # Criar playground
    playground = Playground(agents=[playground_agent])
    app = playground.get_app()
    
    logger.info("✅ Playground criado")
    return app

# Criar a aplicação
app = asyncio.run(create_playground())

if __name__ == "__main__":
    logger.info("🌐 Iniciando servidor em http://localhost:8000")
    serve_playground_app("simple_playground:app", reload=True)
