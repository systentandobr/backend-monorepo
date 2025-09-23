"""
Script robusto para playground do Agno - Life Tracker
Versão que resolve problemas de event loop
"""

import logging
import sys
import os
import asyncio
from contextlib import asynccontextmanager

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Adicionar o diretório atual ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agno.playground import serve_playground_app, Playground
from core.agent_onboarding import AgnoOnboardingAgent

@asynccontextmanager
async def create_agent_context():
    """Contexto para criar o agente de forma segura"""
    agent = None
    try:
        agent = AgnoOnboardingAgent()
        playground_agent = await agent.initialize()
        yield playground_agent
    except Exception as e:
        logger.error(f"❌ Erro ao inicializar agente: {e}")
        raise
    finally:
        if agent:
            # Cleanup se necessário
            pass

async def create_playground_async():
    """Cria o playground de forma assíncrona"""
    logger.info("🚀 Inicializando Life Tracker Playground...")
    
    try:
        async with create_agent_context() as playground_agent:
            logger.info("✅ Agente inicializado")
            
            # Criar playground
            playground = Playground(agents=[playground_agent])
            app = playground.get_app()
            
            logger.info("✅ Playground criado")
            return app
            
    except Exception as e:
        logger.error(f"❌ Erro ao criar playground: {e}")
        raise

def create_playground_safe():
    """Cria o playground de forma segura, evitando problemas de event loop"""
    logger.info("🔧 Criando playground de forma segura...")
    
    try:
        # Verificar se já existe um event loop
        try:
            loop = asyncio.get_running_loop()
            logger.info("⚠️ Event loop já está rodando, usando abordagem alternativa")
            
            # Se já existe um loop, usar uma abordagem diferente
            import concurrent.futures
            import threading
            
            def run_in_thread():
                """Executa a criação do playground em uma thread separada"""
                new_loop = asyncio.new_event_loop()
                asyncio.set_event_loop(new_loop)
                try:
                    return new_loop.run_until_complete(create_playground_async())
                finally:
                    new_loop.close()
            
            # Executar em thread separada
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(run_in_thread)
                app = future.result()
            
        except RuntimeError:
            # Se não existe loop, criar um novo
            logger.info("✅ Criando novo event loop")
            app = asyncio.run(create_playground_async())
        
        logger.info("✅ Playground criado com sucesso")
        return app
        
    except Exception as e:
        logger.error(f"❌ Falha ao criar playground: {e}")
        raise

# Variável global para a aplicação
app = None

def get_app():
    """Função para obter a aplicação do playground"""
    global app
    if app is None:
        app = create_playground_safe()
    return app

# Inicializar a aplicação
try:
    app = get_app()
except Exception as e:
    logger.error(f"❌ Erro na inicialização: {e}")
    app = None

if __name__ == "__main__":
    if app is None:
        logger.error("❌ Não foi possível criar a aplicação")
        sys.exit(1)
    
    logger.info("🌐 Iniciando servidor em http://localhost:7777")
    logger.info("📝 Acesse: http://localhost:7777 para usar o playground")
    
    # Servir a aplicação
    serve_playground_app("playground_robust:app", reload=True)
