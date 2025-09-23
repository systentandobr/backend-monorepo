"""
Life Tracker - Agente de Onboarding com Agno Framework
Pacote principal para o agente de onboarding otimizado
"""

__version__ = "2.0.0"
__author__ = "Life Tracker Team"
__description__ = "Agente de onboarding inteligente usando Agno Framework"

# Imports principais para facilitar o uso
try:
    from .agent_onboarding import onboarding_agent, LifeTrackerOnboardingAgent
    from .main_agno import app
    from .agno_config import get_config, validate_config
except ImportError:
    # Fallback para execução direta
    pass
