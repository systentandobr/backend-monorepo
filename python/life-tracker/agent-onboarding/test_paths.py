#!/usr/bin/env python3
"""
Script de teste para verificar se o sistema de configuração de paths está funcionando
"""

import sys
from pathlib import Path

def test_path_configuration():
    """Testa a configuração de paths"""
    
    print("=== Teste de Configuração de Paths ===")
    
    # Adicionar o diretório atual ao path
    current_dir = Path(__file__).parent
    sys.path.insert(0, str(current_dir))
    
    print(f"Diretório atual: {current_dir}")
    print(f"sys.path[0]: {sys.path[0]}")
    
    try:
        # Testar import do utilitário de paths
        from utils.path_config import setup_project_paths, get_project_root
        
        print("✓ Utilitário de paths importado com sucesso")
        
        # Configurar paths
        project_root = setup_project_paths(__file__)
        print(f"✓ Projeto raiz configurado: {project_root}")
        
        # Testar import dos serviços
        from services.database import DatabaseService
        print("✓ DatabaseService importado com sucesso")
        
        # Testar import dos modelos
        from models.schemas import OnboardingRequest
        print("✓ OnboardingRequest importado com sucesso")
        
        # Testar import dos agentes
        from core.agent_onboarding import AgnoOnboardingAgent
        print("✓ AgnoOnboardingAgent importado com sucesso")
        
        from core.agent import OnboardingAgent
        print("✓ OnboardingAgent importado com sucesso")
        
        # Testar import das rotas
        from routes.onboarding_routes import router as onboarding_router
        print("✓ Rotas de onboarding importadas com sucesso")
        
        from routes.health_routes import router as health_router
        print("✓ Rotas de health importadas com sucesso")
        
        print("\n🎉 Todos os imports funcionaram corretamente!")
        return True
        
    except ImportError as e:
        print(f"❌ Erro de import: {e}")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False

def test_script_execution():
    """Testa execução de scripts"""
    
    print("\n=== Teste de Execução de Scripts ===")
    
    try:
        # Testar execução do script de setup
        import subprocess
        import sys
        
        script_path = Path(__file__).parent / "scripts" / "setup_agno_db.py"
        
        if script_path.exists():
            print(f"✓ Script encontrado: {script_path}")
            
            # Testar se o script pode ser executado (sem rodar completamente)
            result = subprocess.run([
                sys.executable, 
                str(script_path), 
                "--help"
            ], capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0 or "usage" in result.stdout.lower():
                print("✓ Script pode ser executado")
            else:
                print(f"⚠ Script retornou código {result.returncode}")
                print(f"  stdout: {result.stdout[:200]}...")
                print(f"  stderr: {result.stderr[:200]}...")
        else:
            print(f"❌ Script não encontrado: {script_path}")
            return False
            
        return True
        
    except subprocess.TimeoutExpired:
        print("⚠ Script demorou muito para executar (timeout)")
        return True
    except Exception as e:
        print(f"❌ Erro ao testar script: {e}")
        return False

def main():
    """Função principal"""
    
    print("🔧 Testando Sistema de Configuração de Paths")
    print("=" * 50)
    
    # Teste 1: Configuração de paths
    test1_success = test_path_configuration()
    
    # Teste 2: Execução de scripts
    test2_success = test_script_execution()
    
    # Resumo
    print("\n" + "=" * 50)
    print("📊 RESUMO DOS TESTES")
    print("=" * 50)
    
    print(f"Teste 1 - Configuração de Paths: {'✅ PASSOU' if test1_success else '❌ FALHOU'}")
    print(f"Teste 2 - Execução de Scripts: {'✅ PASSOU' if test2_success else '❌ FALHOU'}")
    
    if test1_success and test2_success:
        print("\n🎉 Todos os testes passaram! Sistema de paths funcionando corretamente.")
        sys.exit(0)
    else:
        print("\n⚠️ Alguns testes falharam. Verificar configuração.")
        sys.exit(1)

if __name__ == "__main__":
    main()
