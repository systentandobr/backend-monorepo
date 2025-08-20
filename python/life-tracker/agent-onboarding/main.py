"""
Life Tracker - Agente de Onboarding
Aplicação principal com suporte ao framework Agno
"""

import json
import logging
import sys
from typing import Dict, List, Optional, Any
from datetime import datetime

from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Configurar paths antes de qualquer import
from utils.path_config import setup_project_paths
setup_project_paths(__file__)

from core.agno_agent import AgnoOnboardingAgent
from core.agent import OnboardingAgent
from models.schemas import (
    OnboardingRequest,
    OnboardingResponse,
    ProfileAnalysis,
    GeneratedPlan
)
from services.database import DatabaseService
from services.api_client import APIClient
from utils.config import Settings
from routes import onboarding_router, health_router

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
load_dotenv()

# Configurações da aplicação
APP_VERSION = "2.0.0"
APP_NAME = "Life Tracker - Agente de Onboarding"
APP_DESCRIPTION = "Agente inteligente de onboarding com suporte ao framework Agno"

# Criar aplicação FastAPI
app = FastAPI(
    title=APP_NAME,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Variáveis globais para agentes
agno_agent = None
legacy_agent = None

@app.on_event("startup")
async def startup_event():
    """Evento de inicialização da aplicação"""
    global agno_agent, legacy_agent
    
    logger.info(f"Iniciando {APP_NAME} v{APP_VERSION}")
    
    try:
        # Inicializar agentes
        agno_agent = AgnoOnboardingAgent()
        await agno_agent.initialize()
        logger.info("✓ Agente Agno inicializado")
        
        legacy_agent = OnboardingAgent()
        await legacy_agent.initialize()
        logger.info("✓ Agente legado inicializado")
        
        logger.info("✅ Aplicação inicializada com sucesso")
        
    except Exception as e:
        logger.error(f"❌ Erro na inicialização: {str(e)}")
        raise

# Incluir rotas organizadas
app.include_router(health_router)
app.include_router(onboarding_router)

# Endpoint raiz
@app.get("/")
async def root():
    """Endpoint raiz da aplicação"""
    return {
        "app": APP_NAME,
        "version": APP_VERSION,
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "onboarding": "/onboarding",
            "legacy": "Endpoints legados com redirecionamento automático"
        }
    }

# Endpoints de compatibilidade (redirecionamento)
@app.post("/complete-onboarding", response_model=OnboardingResponse)
async def complete_onboarding_legacy(request: OnboardingRequest, background_tasks: BackgroundTasks):
    """Endpoint legado - redireciona para novo endpoint"""
    logger.warning(f"Endpoint legado /complete-onboarding usado - redirecionando para /onboarding/complete")
    return RedirectResponse(url="/onboarding/complete", status_code=307)

@app.post("/analyze-profile", response_model=ProfileAnalysis)
async def analyze_profile_legacy(request: OnboardingRequest):
    """Endpoint legado - redireciona para novo endpoint"""
    logger.warning(f"Endpoint legado /analyze-profile usado - redirecionando para /onboarding/analyze-profile")
    return RedirectResponse(url="/onboarding/analyze-profile", status_code=307)

@app.post("/generate-plan", response_model=GeneratedPlan)
async def generate_plan_legacy(request: OnboardingRequest, background_tasks: BackgroundTasks):
    """Endpoint legado - redireciona para novo endpoint"""
    logger.warning(f"Endpoint legado /generate-plan usado - redirecionando para /onboarding/generate-plan")
    return RedirectResponse(url="/onboarding/generate-plan", status_code=307)

@app.get("/templates")
async def templates_legacy():
    """Endpoint legado - redireciona para novo endpoint"""
    logger.warning(f"Endpoint legado /templates usado - redirecionando para /onboarding/templates")
    return RedirectResponse(url="/onboarding/templates", status_code=307)

@app.get("/user/{user_id}/plan")
async def user_plan_legacy(user_id: str):
    """Endpoint legado - redireciona para novo endpoint"""
    logger.warning(f"Endpoint legado /user/{user_id}/plan usado - redirecionando para /onboarding/user/{user_id}/plan")
    return RedirectResponse(url=f"/onboarding/user/{user_id}/plan", status_code=307)

@app.get("/health")
async def health_legacy():
    """Endpoint legado - redireciona para novo endpoint"""
    logger.warning(f"Endpoint legado /health usado - redirecionando para /health")
    return RedirectResponse(url="/health", status_code=307)

if __name__ == "__main__":
    import uvicorn
    
    logger.info("Iniciando servidor de desenvolvimento...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )









