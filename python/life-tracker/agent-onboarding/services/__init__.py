"""
Serviços para o agente de onboarding
"""

# Configurar paths antes de qualquer import
from utils.path_config import ensure_project_in_path
ensure_project_in_path()

from .database import DatabaseService
from .api_client import APIClient

__all__ = [
    "DatabaseService",
    "APIClient"
]
