"""
Rotas principais de onboarding
Implementação com suporte ao agente Agno
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel

from core.agent_onboarding import AgnoOnboardingAgent
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

# Importar instâncias globais do main
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Dependências atualizadas para usar instâncias globais
def get_agent_onboarding() -> AgnoOnboardingAgent:
    """Dependency para obter o agente Agno global"""
    # Importar aqui para evitar circular imports
    from main import agent_onboarding
    
    if agent_onboarding is None:
        logger.error("❌ AgnoAgent não está inicializado!")
        raise HTTPException(
            status_code=503,
            detail="Agente Agno não está inicializado. Tente novamente em alguns segundos."
        )
    
    logger.info(f"✅ Usando AgnoAgent global: {id(agent_onboarding)}")
    return agent_onboarding

def get_legacy_agent() -> OnboardingAgent:
    """Dependency para obter o agente legado global"""
    # Importar aqui para evitar circular imports
    from main import legacy_agent
    
    if legacy_agent is None:
        logger.error("❌ LegacyAgent não está inicializado!")
        raise HTTPException(
            status_code=503,
            detail="Agente legado não está inicializado. Tente novamente em alguns segundos."
        )
    
    logger.info(f"✅ Usando LegacyAgent global: {id(legacy_agent)}")
    return legacy_agent

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
    agent_onboarding: AgnoOnboardingAgent = Depends(get_agent_onboarding),
    api_client: APIClient = Depends(get_api_client)
):
    """
    Completa todo o processo de onboarding usando o agente Agno
    
    Este endpoint executa o processo completo de onboarding:
    1. Análise do perfil do usuário
    2. Geração de plano personalizado
    3. Envio para API principal (em background)
    
    **Parâmetros:**
    - **request**: Dados do usuário e respostas do questionário
    - **background_tasks**: Tarefas em background para envio de dados
    
    **Retorna:**
    - **OnboardingResponse**: Resultado completo do processo
    
    **Exemplo de uso:**
    ```json
    {
        "user_id": "user123",
        "answers": {
            "age": 30,
            "goals": ["health", "productivity"],
            "time_availability": 60
        }
    }
    ```
    """
    try:
        logger.info(f"Completando onboarding com Agno para usuário: {request.user_id}")
        
        # Executar processo completo usando o agente Agno
        result = await agent_onboarding.process_onboarding(
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
    Completa o processo de onboarding usando o agente legado
    
    **⚠️ DEPRECATED**: Use `/complete` para o novo agente Agno
    
    Este endpoint usa o sistema legado de onboarding.
    
    **Parâmetros:**
    - **request**: Dados do usuário e respostas do questionário
    - **background_tasks**: Tarefas em background para envio de dados
    
    **Retorna:**
    - **OnboardingResponse**: Resultado do processo legado
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
    agent_onboarding: AgnoOnboardingAgent = Depends(get_agent_onboarding),
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Analisa as respostas do onboarding e identifica o perfil do usuário usando Agno
    
    Este endpoint analisa as respostas do questionário de onboarding para:
    - Identificar o tipo de perfil do usuário
    - Determinar prioridades por domínio da vida
    - Gerar insights e recomendações
    - Calcular score de análise e nível de confiança
    
    **Parâmetros:**
    - **request**: Dados do usuário e respostas do questionário
    
    **Retorna:**
    - **ProfileAnalysis**: Análise detalhada do perfil com insights
    
    **Exemplo de resposta:**
    ```json
    {
        "user_id": "user123",
        "profile": {
            "user_id": "user123",
            "profile_type": "health_focused",
            "age": 30,
            "primary_concerns": ["stress", "sleep"]
        },
        "domain_priorities": {
            "healthness": 0.8,
            "productivity": 0.6
        },
        "key_insights": ["Usuário com foco em saúde", "Necessita melhorar sono"],
        "analysis_score": 85.5,
        "confidence_level": 92.0
    }
    ```
    """
    try:
        logger.info(f"Analisando perfil com Agno para usuário: {request.user_id}")
        
        # Analisar perfil usando Agno
        profile_analysis = await agent_onboarding.analyze_profile_only(
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
    agent_onboarding: AgnoOnboardingAgent = Depends(get_agent_onboarding),
    api_client: APIClient = Depends(get_api_client)
):
    """
    Gera um plano personalizado baseado no perfil do usuário usando Agno
    
    Este endpoint gera um plano completo de desenvolvimento pessoal:
    1. Analisa o perfil do usuário
    2. Seleciona template mais adequado
    3. Personaliza o plano com base nas respostas
    4. Envia para API principal (em background)
    
    **Parâmetros:**
    - **request**: Dados do usuário e respostas do questionário
    - **background_tasks**: Tarefas em background para envio de dados
    
    **Retorna:**
    - **GeneratedPlan**: Plano personalizado com rotinas, hábitos e objetivos
    
    **Exemplo de resposta:**
    ```json
    {
        "user_id": "user123",
        "plan": {
            "routines": [
                {
                    "time": "07:00",
                    "activity": "Meditação matinal",
                    "domain": "healthness",
                    "duration_minutes": 15
                }
            ],
            "habits": [
                {
                    "id": "habit1",
                    "name": "Beber água",
                    "icon": "💧",
                    "color": "#4CAF50",
                    "description": "Beber 8 copos de água por dia",
                    "target": "Diário",
                    "timeOfDay": "all"
                }
            ]
        },
        "success": true,
        "message": "Plano gerado com sucesso"
    }
    ```
    """
    try:
        logger.info(f"Gerando plano com Agno para usuário: {request.user_id}")
        
        # Analisar perfil primeiro
        profile_analysis = await agent_onboarding.analyze_profile_only(
            user_id=request.user_id,
            answers=request.answers
        )
        
        # Gerar plano a partir da análise
        personalized_plan = await agent_onboarding.generate_plan_from_analysis(
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
    Lista todos os templates disponíveis para onboarding
    
    Este endpoint retorna todos os templates de planos disponíveis no sistema,
    incluindo templates focados em saúde, finanças, produtividade, etc.
    
    **Retorna:**
    - **templates**: Lista de todos os templates disponíveis
    - **count**: Número total de templates
    
    **Exemplo de resposta:**
    ```json
    {
        "templates": [
            {
                "id": "health_focused",
                "name": "Foco em Saúde",
                "description": "Template para melhorar saúde e bem-estar",
                "domains": ["healthness", "productivity"]
            },
            {
                "id": "financial_focused", 
                "name": "Foco em Finanças",
                "description": "Template para organização financeira",
                "domains": ["finances", "productivity"]
            }
        ],
        "count": 2
    }
    ```
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
    
    Este endpoint busca o plano personalizado gerado para um usuário específico
    no banco de dados.
    
    **Parâmetros:**
    - **user_id**: ID único do usuário
    
    **Retorna:**
    - **GeneratedPlan**: Plano personalizado do usuário
    
    **Códigos de erro:**
    - **404**: Plano não encontrado para o usuário
    - **500**: Erro interno do servidor
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
    
    Este endpoint busca a análise de perfil gerada durante o onboarding
    para um usuário específico.
    
    **Parâmetros:**
    - **user_id**: ID único do usuário
    
    **Retorna:**
    - **ProfileAnalysis**: Análise detalhada do perfil do usuário
    
    **Códigos de erro:**
    - **404**: Análise de perfil não encontrada
    - **500**: Erro interno do servidor
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
    agent_onboarding: AgnoOnboardingAgent = Depends(get_agent_onboarding)
):
    """
    Obtém recomendações personalizadas para o usuário usando Agno
    
    Este endpoint gera recomendações personalizadas baseadas no histórico
    e perfil do usuário, usando a memória do agente Agno.
    
    **Parâmetros:**
    - **user_id**: {user_id}
    - **domain**: (Opcional) Domínio específico para filtrar recomendações
    
    **Retorna:**
    - **Dict**: Recomendações personalizadas organizadas por domínio
    
    **Exemplo de resposta:**
    ```json
    {
        "healthness": [
            {
                "type": "habit",
                "title": "Meditação matinal",
                "description": "Baseado no seu perfil, recomendamos meditação",
                "priority": "high"
            }
        ],
        "productivity": [
            {
                "type": "routine", 
                "title": "Planejamento semanal",
                "description": "Organize sua semana aos domingos",
                "priority": "medium"
            }
        ]
    }
    ```
    """
    try:
        recommendations = await agent_onboarding.get_user_recommendations(
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
    agent_onboarding: AgnoOnboardingAgent = Depends(get_agent_onboarding)
):
    """
    Obtém um resumo da memória do usuário no Agno
    
    Este endpoint retorna um resumo das informações armazenadas
    na memória do agente Agno para um usuário específico.
    
    **Parâmetros:**
    - **user_id**: ID único do usuário
    
    **Retorna:**
    - **Dict**: Resumo da memória do usuário
    
    **Exemplo de resposta:**
    ```json
    {
        "user_id": "user123",
        "total_entries": 15,
        "last_updated": "2024-01-15T10:30:00Z",
        "domains": ["healthness", "productivity"],
        "key_insights": [
            "Usuário prefere atividades matinais",
            "Tem dificuldade com consistência"
        ]
    }
    ```
    """
    try:
        memory_summary = await agent_onboarding.get_memory_summary(user_id)
        return memory_summary
    except Exception as e:
        logger.error(f"Erro ao obter resumo da memória: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/user/{user_id}/update-plan")
async def update_user_plan(
    user_id: str,
    updates: Dict[str, Any],
    agent_onboarding: AgnoOnboardingAgent = Depends(get_agent_onboarding)
):
    """
    Atualiza um plano existente do usuário usando Agno
    
    Este endpoint permite atualizar um plano existente com base em
    feedback do usuário ou mudanças de circunstâncias.
    
    **Parâmetros:**
    - **user_id**: ID único do usuário
    - **updates**: Dicionário com as atualizações a serem aplicadas
    
    **Retorna:**
    - **GeneratedPlan**: Plano atualizado
    
    **Exemplo de request:**
    ```json
    {
        "habits": [
            {
                "id": "habit1",
                "difficulty": 3
            }
        ],
        "routines": [
            {
                "time": "08:00",
                "activity": "Exercício matinal"
            }
        ]
    }
    ```
    """
    try:
        updated_plan = await agent_onboarding.update_user_plan(
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
    
    Este endpoint retorna informações sobre o status atual do serviço,
    incluindo versão, funcionalidades disponíveis e timestamp.
    
    **Retorna:**
    - **Dict**: Status completo do serviço
    
    **Exemplo de resposta:**
    ```json
    {
        "service": "onboarding-agent",
        "version": "1.0.0",
        "status": "operational",
        "features": {
            "agent_onboarding": true,
            "legacy_agent": true,
            "memory": true,
            "postgres": true
        },
        "timestamp": "2024-01-15T10:30:00Z"
    }
    ```
    """
    return {
        "service": "onboarding-agent",
        "version": "1.0.0",
        "status": "operational",
        "features": {
            "agent_onboarding": True,
            "legacy_agent": True,
            "memory": True,
            "postgres": True
        },
        "timestamp": datetime.now().isoformat()
    }
