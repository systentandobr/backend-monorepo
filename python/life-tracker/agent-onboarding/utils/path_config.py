"""
Utilitário para configuração de paths
Resolve problemas de imports relativos de forma robusta
"""

import os
import sys
from pathlib import Path
from typing import Optional

def setup_project_paths(script_path: Optional[str] = None) -> str:
    """
    Configura os paths do projeto de forma robusta
    
    Args:
        script_path: Caminho do script sendo executado (opcional)
        
    Returns:
        Caminho raiz do projeto
    """
    # Determinar o caminho raiz do projeto
    if script_path:
        # Se o script_path foi fornecido, usar como referência
        script_file = Path(script_path)
        project_root = script_file.parent.parent
    else:
        # Tentar diferentes estratégias para encontrar o projeto
        current_file = Path(__file__)
        
        # Estratégia 1: Se estamos em utils/, subir 2 níveis
        if current_file.parent.name == "utils":
            project_root = current_file.parent.parent
        # Estratégia 2: Se estamos em agent-onboarding/, usar direto
        elif current_file.parent.parent.name == "agent-onboarding":
            project_root = current_file.parent.parent
        # Estratégia 3: Buscar recursivamente pelo diretório agent-onboarding
        else:
            project_root = find_agent_onboarding_root(current_file)
    
    # Adicionar ao sys.path se não estiver
    project_root_str = str(project_root.absolute())
    if project_root_str not in sys.path:
        sys.path.insert(0, project_root_str)
    
    return project_root_str

def find_agent_onboarding_root(start_path: Path) -> Path:
    """
    Busca recursivamente pelo diretório agent-onboarding
    
    Args:
        start_path: Caminho inicial para busca
        
    Returns:
        Caminho do diretório agent-onboarding
    """
    current = start_path
    
    # Buscar até 5 níveis acima
    for _ in range(5):
        # Verificar se estamos no diretório agent-onboarding
        if current.name == "agent-onboarding":
            return current
        
        # Verificar se existe um subdiretório agent-onboarding
        agent_onboarding_path = current / "agent-onboarding"
        if agent_onboarding_path.exists() and agent_onboarding_path.is_dir():
            return agent_onboarding_path
        
        # Subir um nível
        parent = current.parent
        if parent == current:  # Chegamos na raiz
            break
        current = parent
    
    # Se não encontrou, usar o diretório atual
    return start_path

def get_project_root() -> Path:
    """
    Obtém o caminho raiz do projeto
    
    Returns:
        Path do diretório raiz
    """
    return Path(setup_project_paths())

def ensure_project_in_path():
    """
    Garante que o projeto está no sys.path
    """
    setup_project_paths()

# Configuração automática quando o módulo é importado
ensure_project_in_path()
