#!/usr/bin/env python3
"""
Script de diagnóstico para roteadores da API
"""

import sys
import os

def add_project_root_to_path():
    """
    Adiciona o diretório raiz do projeto ao Python path
    para garantir que as importações funcionem corretamente
    """
    project_root = "/home/marcelio/developing/systentando/backend-monorepo/python/meu-nutri"
    sys.path.insert(0, project_root)

def test_router_imports():
    """
    Tenta importar todos os roteadores para diagnóstico
    """
    try:
        # Tenta importar todos os roteadores
        from app.api.routers import (
            agent_router, 
            user_router, 
            vision_router, 
            circadian_router
        )
        
        print("Importações de roteadores bem-sucedidas:")
        print(f"Agent Router: {agent_router}")
        print(f"User Router: {user_router}")
        print(f"Vision Router: {vision_router}")
        print(f"Circadian Router: {circadian_router}")
    
    except ImportError as e:
        print(f"Erro de importação: {e}")
        print("\nDetalhes da importação:")
        print("Sys Path:", sys.path)
        
        # Tenta diagnóstico mais detalhado
        import importlib
        
        try:
            # Tenta importar módulos individualmente
            import app.api.routers.agent_router
            import app.api.routers.users_router
            import app.api.routers.vision_router
            import app.api.routers.circadian_router
        except Exception as detailed_error:
            print(f"Erro detalhado: {detailed_error}")

def main():
    """Função principal de diagnóstico"""
    add_project_root_to_path()
    test_router_imports()

if __name__ == "__main__":
    main()
