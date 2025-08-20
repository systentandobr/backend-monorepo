"""
Cliente de API
Responsável por comunicação com a API principal do Life Tracker
"""

import logging
import json
from typing import Dict, Any, Optional
import httpx
from datetime import datetime

from models.schemas import GeneratedPlan, ProfileAnalysis
from utils.config import Settings

logger = logging.getLogger(__name__)

class APIClient:
    """Cliente para comunicação com a API principal"""
    
    def __init__(self):
        self.settings = Settings()
        self.base_url = self.settings.api_base_url
        self.timeout = self.settings.api_timeout
        self.client = None
    
    async def _get_client(self) -> httpx.AsyncClient:
        """Obtém cliente HTTP assíncrono"""
        if not self.client:
            self.client = httpx.AsyncClient(
                timeout=self.timeout,
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": f"LifeTracker-Agent/{self.settings.app_version}"
                }
            )
        return self.client
    
    async def send_user_plan(
        self,
        user_id: str,
        plan: GeneratedPlan
    ) -> bool:
        """
        Envia plano do usuário para a API principal
        
        Args:
            user_id: ID do usuário
            plan: Plano gerado
            
        Returns:
            True se enviado com sucesso, False caso contrário
        """
        try:
            client = await self._get_client()
            
            # Preparar dados do plano
            plan_data = {
                "user_id": user_id,
                "plan_id": plan.plan_id,
                "template_match": plan.template_match.dict(),
                "domains": {
                    k.value: v.dict() for k, v in plan.domains.items()
                },
                "integrated_goals": plan.integrated_goals,
                "daily_schedule": [r.dict() for r in plan.daily_schedule],
                "weekly_goals": plan.weekly_goals,
                "customizations": plan.customizations,
                "metadata": plan.metadata,
                "created_at": plan.created_at.isoformat(),
                "expires_at": plan.expires_at.isoformat() if plan.expires_at else None
            }
            
            # Enviar para API principal
            response = await client.post(
                f"{self.base_url}/api/users/{user_id}/plans",
                json=plan_data
            )
            
            if response.status_code == 200 or response.status_code == 201:
                logger.info(f"Plano enviado com sucesso para usuário {user_id}")
                return True
            else:
                logger.error(f"Erro ao enviar plano: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Erro ao enviar plano para API: {str(e)}")
            return False
    
    async def send_profile_analysis(
        self,
        user_id: str,
        analysis: ProfileAnalysis
    ) -> bool:
        """
        Envia análise de perfil para a API principal
        
        Args:
            user_id: ID do usuário
            analysis: Análise de perfil
            
        Returns:
            True se enviado com sucesso, False caso contrário
        """
        try:
            client = await self._get_client()
            
            # Preparar dados da análise
            analysis_data = {
                "user_id": user_id,
                "profile": analysis.profile.dict(),
                "domain_priorities": {
                    k.value: v for k, v in analysis.domain_priorities.items()
                },
                "key_insights": analysis.key_insights,
                "recommended_focus": [d.value for d in analysis.recommended_focus],
                "risk_factors": analysis.risk_factors,
                "opportunities": analysis.opportunities,
                "analysis_score": analysis.analysis_score,
                "confidence_level": analysis.confidence_level,
                "created_at": analysis.created_at.isoformat()
            }
            
            # Enviar para API principal
            response = await client.post(
                f"{self.base_url}/api/users/{user_id}/profile-analysis",
                json=analysis_data
            )
            
            if response.status_code == 200 or response.status_code == 201:
                logger.info(f"Análise de perfil enviada com sucesso para usuário {user_id}")
                return True
            else:
                logger.error(f"Erro ao enviar análise: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Erro ao enviar análise para API: {str(e)}")
            return False
    
    async def update_user_plan(
        self,
        user_id: str,
        plan_id: str,
        updates: Dict[str, Any]
    ) -> bool:
        """
        Atualiza plano do usuário na API principal
        
        Args:
            user_id: ID do usuário
            plan_id: ID do plano
            updates: Atualizações a serem aplicadas
            
        Returns:
            True se atualizado com sucesso, False caso contrário
        """
        try:
            client = await self._get_client()
            
            # Enviar atualizações para API principal
            response = await client.patch(
                f"{self.base_url}/api/users/{user_id}/plans/{plan_id}",
                json=updates
            )
            
            if response.status_code == 200:
                logger.info(f"Plano atualizado com sucesso para usuário {user_id}")
                return True
            else:
                logger.error(f"Erro ao atualizar plano: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Erro ao atualizar plano na API: {str(e)}")
            return False
    
    async def get_user_data(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Obtém dados do usuário da API principal
        
        Args:
            user_id: ID do usuário
            
        Returns:
            Dados do usuário ou None se não encontrado
        """
        try:
            client = await self._get_client()
            
            response = await client.get(f"{self.base_url}/api/users/{user_id}")
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                logger.info(f"Usuário {user_id} não encontrado na API principal")
                return None
            else:
                logger.error(f"Erro ao obter dados do usuário: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Erro ao obter dados do usuário da API: {str(e)}")
            return None
    
    async def notify_onboarding_completion(
        self,
        user_id: str,
        success: bool,
        message: str,
        processing_time: Optional[float] = None
    ) -> bool:
        """
        Notifica a API principal sobre a conclusão do onboarding
        
        Args:
            user_id: ID do usuário
            success: Se o onboarding foi bem-sucedido
            message: Mensagem de status
            processing_time: Tempo de processamento
            
        Returns:
            True se notificado com sucesso, False caso contrário
        """
        try:
            client = await self._get_client()
            
            notification_data = {
                "user_id": user_id,
                "success": success,
                "message": message,
                "processing_time": processing_time,
                "completed_at": datetime.now().isoformat()
            }
            
            response = await client.post(
                f"{self.base_url}/api/onboarding/notifications",
                json=notification_data
            )
            
            if response.status_code == 200:
                logger.info(f"Notificação de onboarding enviada para usuário {user_id}")
                return True
            else:
                logger.error(f"Erro ao enviar notificação: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Erro ao enviar notificação para API: {str(e)}")
            return False
    
    async def health_check(self) -> bool:
        """
        Verifica se a API principal está funcionando
        
        Returns:
            True se a API está funcionando, False caso contrário
        """
        try:
            client = await self._get_client()
            
            response = await client.get(f"{self.base_url}/health")
            
            if response.status_code == 200:
                logger.info("API principal está funcionando")
                return True
            else:
                logger.warning(f"API principal retornou status {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Erro ao verificar saúde da API: {str(e)}")
            return False
    
    async def close(self):
        """Fecha o cliente HTTP"""
        if self.client:
            await self.client.aclose()
            self.client = None
            logger.info("Cliente HTTP fechado")
