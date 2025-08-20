"""
Rotas de verificação de saúde da aplicação
"""

from datetime import datetime
from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/")
async def health_check():
    """Endpoint de verificação de saúde"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "onboarding-agent",
        "version": "1.0.0"
    }

@router.get("/ready")
async def readiness_check():
    """Endpoint de verificação de prontidão"""
    return {
        "status": "ready",
        "timestamp": datetime.now().isoformat(),
        "service": "onboarding-agent"
    }

@router.get("/live")
async def liveness_check():
    """Endpoint de verificação de vitalidade"""
    return {
        "status": "alive",
        "timestamp": datetime.now().isoformat(),
        "service": "onboarding-agent"
    }
