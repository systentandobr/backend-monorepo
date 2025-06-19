# Importações dos roteadores para facilitar a importação
from .agent_router import agent_router
from .users_router import users_router
from .vision_router import vision_router
from .circadian_router import circadian_router
from .profile_router import profile_router
from .nutrition_router import nutrition_router

__all__ = [
    'agent_router',
    'users_router', 
    'vision_router', 
    'circadian_router',
    'profile_router',
    'nutrition_router'
]
