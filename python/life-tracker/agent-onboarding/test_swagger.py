#!/usr/bin/env python3
"""
Script para testar a documentação Swagger da API
"""

import requests
import json
import sys
from typing import Dict, Any

def test_swagger_documentation(base_url: str = "http://0.0.0.0:8000") -> Dict[str, Any]:
    """
    Testa a documentação Swagger da API
    
    Args:
        base_url: URL base da API
        
    Returns:
        Dict com os resultados dos testes
    """
    results = {
        "success": True,
        "tests": [],
        "errors": []
    }
    
    # Teste 1: Verificar se a aplicação está rodando
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            results["tests"].append({
                "name": "Aplicação rodando",
                "status": "✅ PASS",
                "details": f"Status: {response.status_code}"
            })
        else:
            results["tests"].append({
                "name": "Aplicação rodando",
                "status": "❌ FAIL",
                "details": f"Status: {response.status_code}"
            })
            results["success"] = False
    except Exception as e:
        results["tests"].append({
            "name": "Aplicação rodando",
            "status": "❌ FAIL",
            "details": f"Erro: {str(e)}"
        })
        results["success"] = False
        results["errors"].append(f"Erro ao conectar com {base_url}: {str(e)}")
    
    # Teste 2: Verificar endpoint de saúde
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            health_data = response.json()
            results["tests"].append({
                "name": "Health check",
                "status": "✅ PASS",
                "details": f"Status: {health_data.get('status', 'unknown')}"
            })
        else:
            results["tests"].append({
                "name": "Health check",
                "status": "❌ FAIL",
                "details": f"Status: {response.status_code}"
            })
            results["success"] = False
    except Exception as e:
        results["tests"].append({
            "name": "Health check",
            "status": "❌ FAIL",
            "details": f"Erro: {str(e)}"
        })
        results["success"] = False
    
    # Teste 3: Verificar OpenAPI JSON
    try:
        response = requests.get(f"{base_url}/openapi.json")
        if response.status_code == 200:
            openapi_data = response.json()
            paths_count = len(openapi_data.get("paths", {}))
            results["tests"].append({
                "name": "OpenAPI JSON",
                "status": "✅ PASS",
                "details": f"Endpoints encontrados: {paths_count}"
            })
            
            # Verificar se tem endpoints de onboarding
            paths = openapi_data.get("paths", {})
            onboarding_paths = [p for p in paths.keys() if "/onboarding" in p]
            results["tests"].append({
                "name": "Endpoints de Onboarding",
                "status": "✅ PASS" if onboarding_paths else "❌ FAIL",
                "details": f"Encontrados: {len(onboarding_paths)} endpoints"
            })
            
        else:
            results["tests"].append({
                "name": "OpenAPI JSON",
                "status": "❌ FAIL",
                "details": f"Status: {response.status_code}"
            })
            results["success"] = False
    except Exception as e:
        results["tests"].append({
            "name": "OpenAPI JSON",
            "status": "❌ FAIL",
            "details": f"Erro: {str(e)}"
        })
        results["success"] = False
    
    # Teste 4: Verificar templates
    try:
        response = requests.get(f"{base_url}/onboarding/templates")
        if response.status_code == 200:
            templates_data = response.json()
            templates_count = templates_data.get("count", 0)
            results["tests"].append({
                "name": "Templates disponíveis",
                "status": "✅ PASS",
                "details": f"Templates: {templates_count}"
            })
        else:
            results["tests"].append({
                "name": "Templates disponíveis",
                "status": "❌ FAIL",
                "details": f"Status: {response.status_code}"
            })
            results["success"] = False
    except Exception as e:
        results["tests"].append({
            "name": "Templates disponíveis",
            "status": "❌ FAIL",
            "details": f"Erro: {str(e)}"
        })
        results["success"] = False
    
    return results

def print_results(results: Dict[str, Any]) -> None:
    """
    Imprime os resultados dos testes de forma organizada
    """
    print("=" * 60)
    print("🧪 TESTE DA DOCUMENTAÇÃO SWAGGER")
    print("=" * 60)
    
    for test in results["tests"]:
        print(f"{test['status']} {test['name']}")
        print(f"   {test['details']}")
        print()
    
    if results["errors"]:
        print("❌ ERROS ENCONTRADOS:")
        for error in results["errors"]:
            print(f"   - {error}")
        print()
    
    print("=" * 60)
    if results["success"]:
        print("✅ TODOS OS TESTES PASSARAM!")
        print("\n📖 URLs da Documentação:")
        print("   - Swagger UI: http://0.0.0.0:8000/docs")
        print("   - ReDoc: http://0.0.0.0:8000/redoc")
        print("   - OpenAPI JSON: http://0.0.0.0:8000/openapi.json")
    else:
        print("❌ ALGUNS TESTES FALHARAM!")
        print("\n💡 Verifique se a aplicação está rodando:")
        print("   python main.py")
    print("=" * 60)

def main():
    """
    Função principal do script
    """
    base_url = "http://0.0.0.0:8000"
    
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    
    print(f"🔍 Testando documentação em: {base_url}")
    print()
    
    results = test_swagger_documentation(base_url)
    print_results(results)
    
    # Retornar código de saída apropriado
    sys.exit(0 if results["success"] else 1)

if __name__ == "__main__":
    main()
