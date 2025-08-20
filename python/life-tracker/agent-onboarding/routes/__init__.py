"""
Rotas da aplicação de onboarding
"""

from .onboarding_routes import router as onboarding_router
from .health_routes import router as health_router

__all__ = ["onboarding_router", "health_router"]
