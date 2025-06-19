#!/usr/bin/env python3
"""
Script de diagnóstico detalhado de importação para Meu Nutri API
"""

import os
import sys
import importlib
import importlib.util
import traceback

def print_section(title):
    """Imprime um cabeçalho de seção."""
    print(f"\n{'=' * 50}")
    print(title)
    print('=' * 50)

def get_absolute_project_path():
    """Obtém o caminho absoluto do projeto."""
    return os.path.abspath(os.path.dirname(__file__))

def configure_python_path():
    """Configura o Python Path."""
    project_path = get_absolute_project_path()
    
    # Adiciona o diretório do projeto ao Python Path
    if project_path not in sys.path:
        sys.path.insert(0, project_path)
    
    print_section("Configuração do Python Path")
    print("Caminhos de importação:")
    for path in sys.path:
        print(f"  - {path}")

def diagnose_module_import(module_name):
    """
    Tenta importar um módulo e fornece diagnóstico detalhado.
    
    :param module_name: Nome do módulo a ser importado
    :return: Tupla (sucesso, mensagem)
    """
    try:
        # Primeiro, tenta a importação padrão
        print(f"\nTentando importar: {module_name}")
        module = importlib.import_module(module_name)
        print(f"✓ Importação bem-sucedida: {module_name}")
        return True, "Importação bem-sucedida"
    
    except ImportError as e:
        print(f"✗ Falha na importação de {module_name}")
        print(f"Erro de importação: {e}")
        
        # Diagnóstico adicional
        try:
            # Tenta encontrar o módulo manualmente
            project_path = get_absolute_project_path()
            module_path = os.path.join(project_path, *module_name.split('.'))
            
            # Tenta várias extensões de arquivo
            possible_files = [
                f"{module_path}.py", 
                os.path.join(module_path, "__init__.py")
            ]
            
            found_files = [f for f in possible_files if os.path.exists(f)]
            
            if found_files:
                print("Arquivos encontrados:")
                for f in found_files:
                    print(f"  - {f}")
                
                # Tenta carregar o módulo usando importlib
                spec = importlib.util.spec_from_file_location(module_name, found_files[0])
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                print(f"✓ Módulo carregado usando importlib: {module_name}")
                return True, "Módulo carregado via importlib"
            else:
                print(f"✗ Nenhum arquivo encontrado para {module_name}")
                return False, "Arquivo do módulo não encontrado"
        
        except Exception as detailed_error:
            print(f"✗ Erro detalhado ao tentar importar {module_name}")
            print(traceback.format_exc())
            return False, str(detailed_error)

def list_project_files():
    """Lista os arquivos do projeto para diagnóstico."""
    print_section("Estrutura de Arquivos do Projeto")
    
    project_path = get_absolute_project_path()
    
    def print_dir_contents(path, indent=""):
        try:
            for item in os.listdir(path):
                full_path = os.path.join(path, item)
                if os.path.isdir(full_path):
                    print(f"{indent}📁 {item}/")
                    # Evita loops em diretórios como venv
                    if item not in ['venv', '__pycache__']:
                        print_dir_contents(full_path, indent + "  ")
                else:
                    print(f"{indent}📄 {item}")
        except Exception as e:
            print(f"{indent}Erro ao listar {path}: {e}")

    print_dir_contents(project_path)

def main():
    """Função principal de diagnóstico."""
    print_section("Diagnóstico de Importação - Meu Nutri API")
    
    # Configura o Python Path
    configure_python_path()
    
    # Módulos a serem verificados
    modules_to_check = [
        'app',
        'app.main',
        'app.api',
        'app.api.routers',
        'app.api.routers.agent_router',
        'app.api.routers.vision_router',
        'app.api.routers.circadian_router',
        'app.api.routers.users_router'
    ]
    
    # Diagnóstico de importação para cada módulo
    print_section("Verificação de Importação de Módulos")
    for module in modules_to_check:
        diagnose_module_import(module)
    
    # Lista os arquivos do projeto
    list_project_files()

if __name__ == "__main__":
    main()
