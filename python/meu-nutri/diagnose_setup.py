#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Diagnóstico detalhado para API Meu Nutri
"""

import os
import sys
import importlib
import inspect

def print_section(title):
    """Imprime um cabeçalho de seção."""
    print(f"\n{'=' * 50}")
    print(title)
    print('=' * 50)

def check_project_structure():
    """Verifica a estrutura básica do projeto."""
    print_section("Verificação da Estrutura do Projeto")
    
    base_path = "/home/marcelio/developing/systentando/backend-monorepo/python/meu-nutri"
    required_dirs = ['app', 'venv']
    required_files = ['app/main.py', 'app/__init__.py', 'requirements.txt']
    
    for dir_name in required_dirs:
        full_path = os.path.join(base_path, dir_name)
        print(f"Diretório {dir_name}: {'✓ Existe' if os.path.exists(full_path) else '✗ Não Encontrado'}")
    
    for file_path in required_files:
        full_path = os.path.join(base_path, file_path)
        print(f"Arquivo {file_path}: {'✓ Existe' if os.path.exists(full_path) else '✗ Não Encontrado'}")

def check_import_paths():
    """Verifica os caminhos de importação."""
    print_section("Verificação de Caminhos de Importação")
    
    print("Sys Path:")
    for path in sys.path:
        print(f"  - {path}")

def check_dependencies():
    """Verifica as dependências principais."""
    print_section("Verificação de Dependências")
    
    dependencies = ['fastapi', 'uvicorn', 'dotenv']
    for dep in dependencies:
        try:
            module = importlib.import_module(dep)
            print(f"{dep}: ✓ Instalado (Versão: {getattr(module, '__version__', 'não disponível')})")
        except ImportError:
            print(f"{dep}: ✗ Não Instalado")

def inspect_main_module():
    """Inspeciona o módulo principal da aplicação."""
    print_section("Inspeção do Módulo Principal")
    
    try:
        import app.main as main_module
        
        # Verificar a existência da aplicação FastAPI
        if hasattr(main_module, 'app'):
            app = main_module.app
            print("Aplicação FastAPI encontrada.")
            
            # Verificar rotas
            print("\nRotas registradas:")
            if hasattr(app, 'routes'):
                for route in app.routes:
                    print(f"  - {route.path} ({route.methods})")
        else:
            print("✗ Não foi possível encontrar a aplicação FastAPI")
    
    except ImportError as e:
        print(f"✗ Erro ao importar o módulo principal: {e}")
    except Exception as e:
        print(f"✗ Erro inesperado: {e}")

def main():
    """Função principal de diagnóstico."""
    print_section("Diagnóstico da API Meu Nutri")
    
    check_project_structure()
    check_import_paths()
    check_dependencies()
    inspect_main_module()

if __name__ == "__main__":
    main()
