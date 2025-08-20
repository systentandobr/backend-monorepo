#!/usr/bin/env python3
"""
Script universal para executar qualquer script do projeto
Configura automaticamente os paths e executa o script especificado
"""

import sys
import os
import subprocess
from pathlib import Path
from typing import List, Optional

def setup_environment():
    """Configura o ambiente para execução de scripts"""
    
    # Obter o diretório do projeto
    project_dir = Path(__file__).parent
    project_root = str(project_dir.absolute())
    
    # Adicionar ao PYTHONPATH
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    
    # Configurar variáveis de ambiente
    os.environ['PYTHONPATH'] = project_root + os.pathsep + os.environ.get('PYTHONPATH', '')
    
    return project_dir

def run_script(script_name: str, args: Optional[List[str]] = None) -> int:
    """
    Executa um script específico
    
    Args:
        script_name: Nome do script (com ou sem .py)
        args: Argumentos adicionais para o script
        
    Returns:
        Código de retorno do script
    """
    
    project_dir = setup_environment()
    
    # Normalizar nome do script
    if not script_name.endswith('.py'):
        script_name += '.py'
    
    # Procurar o script em diferentes locais
    possible_paths = [
        project_dir / script_name,
        project_dir / "scripts" / script_name,
        project_dir / "core" / script_name,
        project_dir / "utils" / script_name,
    ]
    
    script_path = None
    for path in possible_paths:
        if path.exists():
            script_path = path
            break
    
    if not script_path:
        print(f"❌ Script não encontrado: {script_name}")
        print("Locais verificados:")
        for path in possible_paths:
            print(f"  - {path}")
        return 1
    
    print(f"🚀 Executando: {script_path}")
    print(f"📁 Diretório: {project_dir}")
    print(f"🔧 Args: {args or []}")
    print("-" * 50)
    
    # Executar o script
    try:
        cmd = [sys.executable, str(script_path)]
        if args:
            cmd.extend(args)
        
        result = subprocess.run(cmd, cwd=project_dir)
        return result.returncode
        
    except KeyboardInterrupt:
        print("\n⚠️ Execução interrompida pelo usuário")
        return 130
    except Exception as e:
        print(f"❌ Erro ao executar script: {e}")
        return 1

def list_available_scripts():
    """Lista scripts disponíveis"""
    
    project_dir = setup_environment()
    
    print("📋 Scripts disponíveis:")
    print("=" * 50)
    
    # Scripts no diretório raiz
    root_scripts = list(project_dir.glob("*.py"))
    if root_scripts:
        print("\n📁 Diretório raiz:")
        for script in sorted(root_scripts):
            if script.name != "run_script.py":
                print(f"  - {script.stem}")
    
    # Scripts no diretório scripts/
    scripts_dir = project_dir / "scripts"
    if scripts_dir.exists():
        script_files = list(scripts_dir.glob("*.py"))
        if script_files:
            print("\n📁 scripts/")
            for script in sorted(script_files):
                print(f"  - scripts/{script.stem}")
    
    # Scripts no diretório core/
    core_dir = project_dir / "core"
    if core_dir.exists():
        core_files = list(core_dir.glob("*.py"))
        if core_files:
            print("\n📁 core/")
            for script in sorted(core_files):
                print(f"  - core/{script.stem}")
    
    # Scripts no diretório utils/
    utils_dir = project_dir / "utils"
    if utils_dir.exists():
        utils_files = list(utils_dir.glob("*.py"))
        if utils_files:
            print("\n📁 utils/")
            for script in sorted(utils_files):
                print(f"  - utils/{script.stem}")

def main():
    """Função principal"""
    
    if len(sys.argv) < 2:
        print("🔧 Script Universal - Life Tracker Agent Onboarding")
        print("=" * 50)
        print("Uso:")
        print("  python run_script.py <script_name> [args...]")
        print("  python run_script.py --list")
        print("\nExemplos:")
        print("  python run_script.py setup_agno_db")
        print("  python run_script.py test_agno_implementation")
        print("  python run_script.py main")
        print("  python run_script.py test_paths")
        print("\nScripts disponíveis:")
        list_available_scripts()
        sys.exit(1)
    
    if sys.argv[1] == "--list":
        list_available_scripts()
        sys.exit(0)
    
    # Executar script especificado
    script_name = sys.argv[1]
    args = sys.argv[2:] if len(sys.argv) > 2 else None
    
    exit_code = run_script(script_name, args)
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
