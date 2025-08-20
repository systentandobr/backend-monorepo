"""
Agente principal de onboarding
Orquestra todo o processo de análise e geração de planos
"""

import asyncio
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import uuid

from models.schemas import (
    OnboardingRequest,
    OnboardingResponse,
    ProfileAnalysis,
    GeneratedPlan,
    UserProfile,
    UserProfileType,
    LifeDomain
)
from .profile_analyzer import ProfileAnalyzer
from .template_matcher import TemplateMatcher
from .plan_generator import PlanGenerator
from services.database import DatabaseService
from utils.config import Settings

logger = logging.getLogger(__name__)

class OnboardingAgent:
    """
    Agente principal responsável por orquestrar o processo de onboarding
    """
    
    def __init__(self):
        self.settings = Settings()
        self.profile_analyzer = ProfileAnalyzer()
        self.template_matcher = TemplateMatcher()
        self.plan_generator = PlanGenerator()
        self.db_service = DatabaseService()
        self.initialized = False
        
    async def initialize(self):
        """Inicializar o agente"""
        if self.initialized:
            return
            
        logger.info("Inicializando OnboardingAgent...")
        
        # Inicializar componentes
        await self.profile_analyzer.initialize()
        await self.template_matcher.initialize()
        await self.plan_generator.initialize()
        
        self.initialized = True
        logger.info("OnboardingAgent inicializado com sucesso")
    
    async def process_onboarding(
        self, 
        user_id: str, 
        answers: Dict[str, Any]
    ) -> OnboardingResponse:
        """
        Processa o onboarding completo para um usuário
        
        Args:
            user_id: ID do usuário
            answers: Respostas do questionário de onboarding
            
        Returns:
            OnboardingResponse com análise e plano gerado
        """
        start_time = datetime.now()
        
        try:
            logger.info(f"Iniciando processamento de onboarding para usuário {user_id}")
            
            # 1. Analisar perfil do usuário
            logger.info("Etapa 1: Analisando perfil do usuário")
            profile_analysis = await self.profile_analyzer.analyze_responses(
                user_id=user_id,
                answers=answers
            )
            
            # 2. Encontrar template mais adequado
            logger.info("Etapa 2: Encontrando template adequado")
            template_match = await self.template_matcher.find_best_template(
                profile_analysis=profile_analysis
            )
            
            # 3. Gerar plano personalizado
            logger.info("Etapa 3: Gerando plano personalizado")
            generated_plan = await self.plan_generator.generate_plan(
                user_id=user_id,
                profile_analysis=profile_analysis,
                base_template=template_match.template,
                customizations=template_match.customizations
            )
            
            # 4. Salvar resultados no banco de dados
            logger.info("Etapa 4: Salvando resultados")
            await self._save_onboarding_results(
                user_id=user_id,
                profile_analysis=profile_analysis,
                generated_plan=generated_plan
            )
            
            # 5. Calcular tempo de processamento
            processing_time = (datetime.now() - start_time).total_seconds()
            
            logger.info(f"Onboarding completado com sucesso para usuário {user_id}")
            
            return OnboardingResponse(
                user_id=user_id,
                success=True,
                message="Onboarding processado com sucesso",
                profile_analysis=profile_analysis,
                generated_plan=generated_plan,
                processing_time=processing_time
            )
            
        except Exception as e:
            logger.error(f"Erro no processamento de onboarding: {str(e)}")
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return OnboardingResponse(
                user_id=user_id,
                success=False,
                message=f"Erro no processamento: {str(e)}",
                errors=[str(e)],
                processing_time=processing_time
            )
    
    async def analyze_profile_only(
        self, 
        user_id: str, 
        answers: Dict[str, Any]
    ) -> ProfileAnalysis:
        """
        Apenas analisa o perfil sem gerar plano
        
        Args:
            user_id: ID do usuário
            answers: Respostas do questionário
            
        Returns:
            ProfileAnalysis com análise do perfil
        """
        logger.info(f"Analisando apenas perfil para usuário {user_id}")
        
        return await self.profile_analyzer.analyze_responses(
            user_id=user_id,
            answers=answers
        )
    
    async def generate_plan_from_analysis(
        self,
        user_id: str,
        profile_analysis: ProfileAnalysis
    ) -> GeneratedPlan:
        """
        Gera plano a partir de uma análise existente
        
        Args:
            user_id: ID do usuário
            profile_analysis: Análise de perfil existente
            
        Returns:
            GeneratedPlan personalizado
        """
        logger.info(f"Gerando plano a partir de análise para usuário {user_id}")
        
        # Encontrar template adequado
        template_match = await self.template_matcher.find_best_template(
            profile_analysis=profile_analysis
        )
        
        # Gerar plano
        return await self.plan_generator.generate_plan(
            user_id=user_id,
            profile_analysis=profile_analysis,
            base_template=template_match.template,
            customizations=template_match.customizations
        )
    
    async def update_user_plan(
        self,
        user_id: str,
        updates: Dict[str, Any]
    ) -> GeneratedPlan:
        """
        Atualiza um plano existente do usuário
        
        Args:
            user_id: ID do usuário
            updates: Atualizações a serem aplicadas
            
        Returns:
            GeneratedPlan atualizado
        """
        logger.info(f"Atualizando plano para usuário {user_id}")
        
        # Recuperar plano atual
        current_plan = await self.db_service.get_user_plan(user_id)
        if not current_plan:
            raise ValueError(f"Plano não encontrado para usuário {user_id}")
        
        # Aplicar atualizações
        updated_plan = await self.plan_generator.update_plan(
            current_plan=current_plan,
            updates=updates
        )
        
        # Salvar plano atualizado
        await self.db_service.save_user_plan(
            user_id=user_id,
            plan=updated_plan
        )
        
        return updated_plan
    
    async def get_user_recommendations(
        self,
        user_id: str,
        domain: Optional[LifeDomain] = None
    ) -> Dict[str, Any]:
        """
        Obtém recomendações personalizadas para o usuário
        
        Args:
            user_id: ID do usuário
            domain: Domínio específico (opcional)
            
        Returns:
            Dicionário com recomendações
        """
        logger.info(f"Gerando recomendações para usuário {user_id}")
        
        # Recuperar análise de perfil
        profile_analysis = await self.db_service.get_profile_analysis(user_id)
        if not profile_analysis:
            raise ValueError(f"Análise de perfil não encontrada para usuário {user_id}")
        
        # Gerar recomendações
        recommendations = await self.profile_analyzer.generate_recommendations(
            profile_analysis=profile_analysis,
            domain=domain
        )
        
        return recommendations
    
    async def _save_onboarding_results(
        self,
        user_id: str,
        profile_analysis: ProfileAnalysis,
        generated_plan: GeneratedPlan
    ):
        """Salva os resultados do onboarding no banco de dados"""
        try:
            # Salvar análise de perfil
            await self.db_service.save_profile_analysis(
                user_id=user_id,
                analysis=profile_analysis
            )
            
            # Salvar plano gerado
            await self.db_service.save_user_plan(
                user_id=user_id,
                plan=generated_plan
            )
            
            logger.info(f"Resultados salvos com sucesso para usuário {user_id}")
            
        except Exception as e:
            logger.error(f"Erro ao salvar resultados: {str(e)}")
            raise
    
    async def get_onboarding_status(self, user_id: str) -> Dict[str, Any]:
        """
        Obtém o status do onboarding de um usuário
        
        Args:
            user_id: ID do usuário
            
        Returns:
            Status do onboarding
        """
        try:
            profile_analysis = await self.db_service.get_profile_analysis(user_id)
            user_plan = await self.db_service.get_user_plan(user_id)
            
            return {
                "user_id": user_id,
                "has_profile_analysis": profile_analysis is not None,
                "has_generated_plan": user_plan is not None,
                "profile_analysis_date": profile_analysis.created_at if profile_analysis else None,
                "plan_created_date": user_plan.created_at if user_plan else None,
                "status": "completed" if (profile_analysis and user_plan) else "incomplete"
            }
            
        except Exception as e:
            logger.error(f"Erro ao obter status do onboarding: {str(e)}")
            raise
