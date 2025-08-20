"""
Rotas principais de onboarding
Implementação com suporte ao agente Agno
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel

from core.agno_agent import AgnoOnboardingAgent
from core.agent import OnboardingAgent
from models.schemas import (
    OnboardingRequest,
    OnboardingResponse,
    ProfileAnalysis,
    GeneratedPlan,
    LifeDomain
)
from services.database import DatabaseService
from services.api_client import APIClient
from utils.config import Settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/onboarding", tags=["onboarding"])

# Dependências
def get_agno_agent() -> AgnoOnboardingAgent:
    """Dependency para obter o agente Agno"""
    return AgnoOnboardingAgent()

def get_legacy_agent() -> OnboardingAgent:
    """Dependency para obter o agente legado"""
    return OnboardingAgent()

def get_db_service() -> DatabaseService:
    """Dependency para obter o serviço de banco de dados"""
    return DatabaseService()

def get_api_client() -> APIClient:
    """Dependency para obter o cliente de API"""
    return APIClient()

# Modelos de request
class AgnoOnboardingRequest(BaseModel):
    """Request para onboarding com Agno"""
    user_id: str
    answers: Dict[str, Any]
    use_memory: bool = True
    enable_agentic: bool = True

class MemoryQueryRequest(BaseModel):
    """Request para consulta de memória"""
    user_id: str
    query: Optional[str] = None
    limit: int = 10

# Rotas principais
@router.post("/complete", response_model=OnboardingResponse)
async def complete_onboarding_process(
    request: OnboardingRequest,
    background_tasks: BackgroundTasks,
    agno_agent: AgnoOnboardingAgent = Depends(get_agno_agent),
    api_client: APIClient = Depends(get_api_client)
):
    """
    Completa todo o processo de onboarding usando o agente Agno
    """
    try:
        logger.info(f"Completando onboarding com Agno para usuário: {request.user_id}")
        
        # Executar processo completo usando o agente Agno
        result = await agno_agent.process_onboarding(
            user_id=request.user_id,
            answers=request.answers
        )
        
        # Enviar plano para API principal (background task)
        if result.success and result.generated_plan:
            background_tasks.add_task(
                api_client.send_user_plan,
                user_id=request.user_id,
                plan=result.generated_plan
            )
        
        return result
        
    except Exception as e:
        logger.error(f"Erro no onboarding com Agno: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/complete-legacy", response_model=OnboardingResponse)
async def complete_onboarding_process_legacy(
    request: OnboardingRequest,
    background_tasks: BackgroundTasks,
    legacy_agent: OnboardingAgent = Depends(get_legacy_agent),
    api_client: APIClient = Depends(get_api_client)
):
    """
    Completa todo o processo de onboarding usando o agente legado
    """
    try:
        logger.info(f"Completando onboarding legado para usuário: {request.user_id}")
        
        # Executar processo completo usando o agente legado
        result = await legacy_agent.process_onboarding(
            user_id=request.user_id,
            answers=request.answers
        )
        
        # Enviar plano para API principal (background task)
        if result.success and result.generated_plan:
            background_tasks.add_task(
                api_client.send_user_plan,
                user_id=request.user_id,
                plan=result.generated_plan
            )
        
        return result
        
    except Exception as e:
        logger.error(f"Erro no onboarding legado: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-profile", response_model=ProfileAnalysis)
async def analyze_user_profile(
    request: OnboardingRequest,
    agno_agent: AgnoOnboardingAgent = Depends(get_agno_agent),
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Analisa as respostas do onboarding e identifica o perfil do usuário usando Agno
    """
    try:
        logger.info(f"Analisando perfil com Agno para usuário: {request.user_id}")
        
        # Analisar perfil usando Agno
        profile_analysis = await agno_agent.analyze_profile_only(
            user_id=request.user_id,
            answers=request.answers
        )
        
        return profile_analysis
        
    except Exception as e:
        logger.error(f"Erro ao analisar perfil com Agno: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-plan", response_model=GeneratedPlan)
async def generate_personalized_plan(
    request: OnboardingRequest,
    background_tasks: BackgroundTasks,
    agno_agent: AgnoOnboardingAgent = Depends(get_agno_agent),
    api_client: APIClient = Depends(get_api_client)
):
    """
    Gera um plano personalizado baseado no perfil do usuário usando Agno
    """
    try:
        logger.info(f"Gerando plano com Agno para usuário: {request.user_id}")
        
        # Analisar perfil primeiro
        profile_analysis = await agno_agent.analyze_profile_only(
            user_id=request.user_id,
            answers=request.answers
        )
        
        # Gerar plano a partir da análise
        personalized_plan = await agno_agent.generate_plan_from_analysis(
            user_id=request.user_id,
            profile_analysis=profile_analysis
        )
        
        # Enviar plano para API principal (background task)
        background_tasks.add_task(
            api_client.send_user_plan,
            user_id=request.user_id,
            plan=personalized_plan
        )
        
        return personalized_plan
        
    except Exception as e:
        logger.error(f"Erro ao gerar plano com Agno: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/templates")
async def list_available_templates(
    legacy_agent: OnboardingAgent = Depends(get_legacy_agent)
):
    """
    Lista todos os templates disponíveis
    """
    try:
        templates = await legacy_agent.template_matcher.list_all_templates()
        return {
            "templates": templates,
            "count": len(templates)
        }
    except Exception as e:
        logger.error(f"Erro ao listar templates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}/plan")
async def get_user_plan(
    user_id: str,
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Recupera o plano de um usuário específico
    """
    try:
        plan = await db_service.get_user_plan(user_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Plano não encontrado")
        return plan
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao recuperar plano: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}/profile")
async def get_user_profile(
    user_id: str,
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Recupera a análise de perfil de um usuário específico
    """
    try:
        profile = await db_service.get_profile_analysis(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Análise de perfil não encontrada")
        return profile
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao recuperar perfil: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}/recommendations")
async def get_user_recommendations(
    user_id: str,
    domain: Optional[LifeDomain] = None,
    agno_agent: AgnoOnboardingAgent = Depends(get_agno_agent)
):
    """
    Obtém recomendações personalizadas para o usuário usando Agno
    """
    try:
        recommendations = await agno_agent.get_user_recommendations(
            user_id=user_id,
            domain=domain
        )
        return recommendations
    except Exception as e:
        logger.error(f"Erro ao obter recomendações: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}/memory")
async def get_user_memory_summary(
    user_id: str,
    agno_agent: AgnoOnboardingAgent = Depends(get_agno_agent)
):
    """
    Obtém um resumo da memória do usuário no Agno
    """
    try:
        memory_summary = await agno_agent.get_memory_summary(user_id)
        return memory_summary
    except Exception as e:
        logger.error(f"Erro ao obter resumo da memória: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/user/{user_id}/update-plan")
async def update_user_plan(
    user_id: str,
    updates: Dict[str, Any],
    agno_agent: AgnoOnboardingAgent = Depends(get_agno_agent)
):
    """
    Atualiza um plano existente do usuário usando Agno
    """
    try:
        updated_plan = await agno_agent.update_user_plan(
            user_id=user_id,
            updates=updates
        )
        return updated_plan
    except Exception as e:
        logger.error(f"Erro ao atualizar plano: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_service_status():
    """
    Obtém o status geral do serviço
    """
    return {
        "service": "onboarding-agent",
        "version": "1.0.0",
        "status": "operational",
        "features": {
            "agno_agent": True,
            "legacy_agent": True,
            "memory": True,
            "postgres": True
        },
        "timestamp": datetime.now().isoformat()
    }
