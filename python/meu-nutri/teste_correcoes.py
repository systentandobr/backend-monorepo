#!/usr/bin/env python3
"""
Script para testar as correções do gerenciador de contexto.
"""

import asyncio
import logging
import warnings
from app.agent.migration_helper import suppress_langchain_warnings, warning_suppressor_decorator

# Configura logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Função de teste que dispara avisos
def gera_aviso():
    warnings.warn("Este é um aviso de teste", DeprecationWarning)
    print("Função chamada com sucesso!")

# Função decorada para teste
@warning_suppressor_decorator
def funcao_decorada():
    gera_aviso()
    print("Função decorada executada!")

async def teste_gerenciador_contexto():
    """
    Testa o gerenciador de contexto para supressão de avisos.
    """
    print("\n=== Testando Gerenciador de Contexto ===\n")
    
    # Teste 1: Sem supressão (deve mostrar o aviso)
    print("Teste 1: Sem supressão (você deve ver um aviso)")
    gera_aviso()
    
    # Teste 2: Com gerenciador de contexto
    print("\nTeste 2: Com gerenciador de contexto (nenhum aviso deve aparecer)")
    with suppress_langchain_warnings:
        gera_aviso()
        
    # Teste 3: Com função decorada
    print("\nTeste 3: Com função decorada (nenhum aviso deve aparecer)")
    funcao_decorada()
    
    print("\nTestes de gerenciador de contexto concluídos!")

async def teste_ambiente_agente():
    """
    Verifica se o ambiente está correto para o agente.
    """
    print("\n=== Verificando Ambiente do Agente ===\n")
    
    # Importa necessário para o agente
    try:
        from app.agent.hybrid_agent import HybridNutriAgent
        print("✅ Módulo HybridNutriAgent importado com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao importar HybridNutriAgent: {str(e)}")
        return
    
    # Cria uma instância do agente
    try:
        agent = HybridNutriAgent(user_id="test_user_diagnostico")
        print("✅ Instância do agente criada com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao criar instância do agente: {str(e)}")
        return
    
    print("\nVerificação do ambiente concluída!")

async def main():
    """Função principal para executar testes."""
    print("=== Diagnóstico de Correções ===")
    
    await teste_gerenciador_contexto()
    await teste_ambiente_agente()

if __name__ == "__main__":
    asyncio.run(main())
