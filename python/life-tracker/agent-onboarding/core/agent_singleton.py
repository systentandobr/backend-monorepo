"""
Singleton para gerenciar instâncias dos agentes
"""

import asyncio
from typing import Optional
from core.agent_onboarding import AgnoOnboardingAgent
from core.agent import OnboardingAgent
import logging

logger = logging.getLogger(__name__)

class AgentManager:
    """Singleton para gerenciar agentes"""
    
    _instance = None
    _agent_onboarding: Optional[AgnoOnboardingAgent] = None
    _legacy_agent: Optional[OnboardingAgent] = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    async def initialize(self):
        """Inicializar agentes"""
        if self._initialized:
            return
            
        logger.info("Inicializando AgentManager...")
        
        # Inicializar Agno Agent
        self._agent_onboarding = AgnoOnboardingAgent()
        await self._agent_onboarding.initialize()
        logger.info("✓ Agente Agno inicializado")
        
        # Inicializar Legacy Agent
        self._legacy_agent = OnboardingAgent()
        await self._legacy_agent.initialize()
        logger.info("✓ Agente legado inicializado")
        
        self._initialized = True
        logger.info("✅ AgentManager inicializado com sucesso")
    
    @property
    def agent_onboarding(self) -> Optional[AgnoOnboardingAgent]:
        """Obter agente Agno"""
        return self._agent_onboarding
    
    @property
    def legacy_agent(self) -> Optional[OnboardingAgent]:
        """Obter agente legado"""
        return self._legacy_agent
    
    @property
    def is_initialized(self) -> bool:
        """Verificar se está inicializado"""
        return self._initialized

# Instância global
agent_manager = AgentManager()
