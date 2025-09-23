"""
Sistema de dependency injection com estado
"""

import logging
from typing import Optional
from fastapi import HTTPException

from core.agent_onboarding import AgnoOnboardingAgent
from core.agent import OnboardingAgent
from services.database import DatabaseService
from services.api_client import APIClient

logger = logging.getLogger(__name__)

class DependencyContainer:
    """Container para gerenciar dependências com estado"""
    
    def __init__(self):
        self._agent_onboarding: Optional[AgnoOnboardingAgent] = None
        self._legacy_agent: Optional[OnboardingAgent] = None
        self._db_service: Optional[DatabaseService] = None
        self._api_client: Optional[APIClient] = None
        self._initialized = False
    
    async def initialize(self):
        """Inicializar todas as dependências"""
        if self._initialized:
            return
            
        logger.info("Inicializando DependencyContainer...")
        
        # Inicializar agentes
        self._agent_onboarding = AgnoOnboardingAgent()
        await self._agent_onboarding.initialize()
        
        self._legacy_agent = OnboardingAgent()
        await self._legacy_agent.initialize()
        
        # Inicializar serviços
        self._db_service = DatabaseService()
        self._api_client = APIClient()
        
        self._initialized = True
        logger.info("✅ DependencyContainer inicializado")
    
    def get_agent_onboarding(self) -> AgnoOnboardingAgent:
        """Obter agente Agno"""
        if not self._initialized or self._agent_onboarding is None:
            raise HTTPException(
                status_code=503,
                detail="Sistema não inicializado. Tente novamente."
            )
        return self._agent_onboarding
    
    def get_legacy_agent(self) -> OnboardingAgent:
        """Obter agente legado"""
        if not self._initialized or self._legacy_agent is None:
            raise HTTPException(
                status_code=503,
                detail="Sistema não inicializado. Tente novamente."
            )
        return self._legacy_agent
    
    def get_db_service(self) -> DatabaseService:
        """Obter serviço de banco"""
        if not self._initialized:
            self._db_service = DatabaseService()
        return self._db_service
    
    def get_api_client(self) -> APIClient:
        """Obter cliente de API"""
        if not self._initialized:
            self._api_client = APIClient()
        return self._api_client

# Instância global
container = DependencyContainer()
