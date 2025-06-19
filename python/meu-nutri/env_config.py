#!/usr/bin/env python3
"""
Script de configuração e diagnóstico de ambiente para Meu Nutri API
"""

import os
import sys
import importlib.util

def print_section(title):
    """Imprime um cabeçalho de seção."""
    print(f"\n{'=' * 50}")
    print(title)
    print('=' * 50)

def check_python_path():
    """Verifica e configura o Python Path."""
    print_section("Configuração do Python Path")
    
    # Diretório do projeto
    project_root = "/home/marcelio/developing/systentando/backend-monorepo/python/meu-nutri"
    
    # Adiciona o diretório do projeto ao Python Path
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
        print(f"Adicionado ao Python Path: {project_root}")
    
    # Imprime o Python Path atual
    print("\nCaminho de Importação Atual:")
    for path in sys.path:
        print(f"  - {path}")

def check_module_importability():
    """Verifica a importabilidade do módulo principal."""
    print_section("Verificação de Importação do Módulo Principal")
    
    try:
        # Tenta importar o módulo principal diretamente
        import app.main
        print("Módulo 'app.main' importado com sucesso!")
    except ImportError as e:
        print(f"Erro ao importar 'app.main': {e}")
        
        # Diagnóstico mais detalhado
        try:
            # Tenta localizar o módulo manualmente
            main_module_path = os.path.join(
                "/home/marcelio/developing/systentando/backend-monorepo/python/meu-nutri", 
                "app", 
                "main.py"
            )
            
            if os.path.exists(main_module_path):
                print(f"Arquivo 'main.py' encontrado em: {main_module_path}")
                
                # Tenta carregar o módulo usando importlib
                spec = importlib.util.spec_from_file_location("app.main", main_module_path)
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                print("Módulo carregado com sucesso usando importlib!")
            else:
                print(f"Arquivo 'main.py' não encontrado em: {main_module_path}")
        except Exception as detailed_error:
            print(f"Erro detalhado: {detailed_error}")

def check_uvicorn_configuration():
    """Verifica a configuração do Uvicorn."""
    print_section("Configuração do Uvicorn")
    
    try:
        import uvicorn
        print(f"Uvicorn versão: {uvicorn.__version__}")
    except ImportError:
        print("Uvicorn não instalado!")

def main():
    """Função principal de diagnóstico e configuração."""
    check_python_path()
    check_module_importability()
    check_uvicorn_configuration()

if __name__ == "__main__":
    main()
