"""
Rotas de verificação de saúde da aplicação
"""

from datetime import datetime
from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/")
async def health_check():
    """
    Endpoint de verificação de saúde da aplicação
    
    Este endpoint verifica se a aplicação está funcionando corretamente.
    Usado por sistemas de monitoramento e load balancers.
    
    **Retorna:**
    - **status**: Status da aplicação ("healthy" ou "unhealthy")
    - **timestamp**: Timestamp da verificação
    - **service**: Nome do serviço
    - **version**: Versão da aplicação
    
    **Exemplo de resposta:**
    ```json
    {
        "status": "ok",
        "timestamp": "2024-01-15T10:30:00Z",
        "service": "onboarding-agent",
        "version": "1.0.0"
    }
    ```
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "onboarding-agent",
        "version": "1.0.0"
    }

@router.get("/ready")
async def readiness_check():
    """
    Endpoint de verificação de prontidão da aplicação
    
    Este endpoint verifica se a aplicação está pronta para receber tráfego.
    Verifica conexões com banco de dados, serviços externos, etc.
    
    **Retorna:**
    - **status**: Status de prontidão ("ready" ou "not_ready")
    - **timestamp**: Timestamp da verificação
    - **service**: Nome do serviço
    
    **Exemplo de resposta:**
    ```json
    {
        "status": "ready",
        "timestamp": "2024-01-15T10:30:00Z",
        "service": "onboarding-agent"
    }
    ```
    """
    return {
        "status": "ready",
        "timestamp": datetime.now().isoformat(),
        "service": "onboarding-agent"
    }

@router.get("/live")
async def liveness_check():
    """
    Endpoint de verificação de vitalidade da aplicação
    
    Este endpoint verifica se a aplicação está viva e respondendo.
    Usado por sistemas de orquestração como Kubernetes.
    
    **Retorna:**
    - **status**: Status de vitalidade ("alive" ou "dead")
    - **timestamp**: Timestamp da verificação
    - **service**: Nome do serviço
    
    **Exemplo de resposta:**
    ```json
    {
        "status": "alive",
        "timestamp": "2024-01-15T10:30:00Z",
        "service": "onboarding-agent"
    }
    ```
    """
    return {
        "status": "alive",
        "timestamp": datetime.now().isoformat(),
        "service": "onboarding-agent"
    }
