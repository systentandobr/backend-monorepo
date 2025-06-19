from fastapi import APIRouter, HTTPException
from typing import Dict, Any

# Criar roteador para o agente
agent_router = APIRouter()

@agent_router.get("/")
async def get_agent_services():
    """Listar serviços disponíveis do agente de IA."""
    return {
        "services": [
            "nutritional_advice", 
            "meal_planning", 
            "diet_optimization"
        ]
    }

@agent_router.post("/query")
async def agent_query(query: Dict[str, Any]):
    """
    Endpoint para consultas ao agente de IA.
    
    :param query: Dicionário com detalhes da consulta
    :return: Resposta do agente
    """
    try:
        # Lógica de processamento da consulta seria implementada aqui
        return {
            "status": "success",
            "response": "Processamento da consulta simulado com sucesso"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
