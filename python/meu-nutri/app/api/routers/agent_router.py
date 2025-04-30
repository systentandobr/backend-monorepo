"""
Router para endpoints do agente conversacional Meu Nutri.
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import OAuth2PasswordBearer
from typing import Dict, Any, Optional, List
from pydantic import BaseModel

from app.agent.hybrid_agent import HybridNutriAgent

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Modelos Pydantic para validação de entrada/saída
class AgentQueryInput(BaseModel):
    """Modelo para consultas ao agente."""
    query: str
    context: Optional[Dict[str, Any]] = None
    conversation_id: Optional[str] = None

class AgentResponse(BaseModel):
    """Modelo para respostas do agente."""
    response: str
    conversation_id: str
    metadata: Optional[Dict[str, Any]] = None

class ConversationHistory(BaseModel):
    """Modelo para histórico de conversação."""
    conversation_id: str
    messages: List[Dict[str, Any]]

# Função para obter o usuário atual
async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    """
    Valida o token e retorna o ID do usuário.
    
    Em uma implementação real, verificaria o token JWT e extrairia o ID do usuário.
    Para simplificar, usamos um valor fixo para demonstração.
    """
    # TODO: Implementar validação real de token
    return "user123"  # ID de usuário simulado

# Cache de agentes ativos para reutilização
active_agents = {}

async def get_agent(user_id: str, conversation_id: Optional[str] = None) -> HybridNutriAgent:
    """
    Obtém ou cria um agente para o usuário e conversa especificados.
    
    Args:
        user_id: ID do usuário
        conversation_id: ID da conversa (opcional)
        
    Returns:
        Instância do agente híbrido
    """
    cache_key = f"{user_id}:{conversation_id or 'new'}"
    
    if cache_key not in active_agents:
        agent = HybridNutriAgent(user_id=user_id, conversation_id=conversation_id)
        await agent.initialize()
        active_agents[cache_key] = agent
    
    return active_agents[cache_key]

@router.post("/query", response_model=AgentResponse)
async def query_agent(
    input_data: AgentQueryInput,
    user_id: str = Depends(get_current_user)
):
    """
    Endpoint para enviar uma consulta ao agente.
    
    Args:
        input_data: Dados da consulta
        user_id: ID do usuário (obtido do token)
        
    Returns:
        Resposta do agente
    """
    try:
        agent = await get_agent(user_id, input_data.conversation_id)
        
        response = await agent.process_query(
            query=input_data.query,
            context=input_data.context
        )
        
        return {
            "response": response["response"],
            "conversation_id": response["conversation_id"],
            "metadata": {
                "source": response.get("source", "hybrid_agent")
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar consulta: {str(e)}"
        )

@router.get("/conversations", response_model=List[Dict[str, Any]])
async def get_user_conversations(
    user_id: str = Depends(get_current_user),
    limit: int = 10,
    offset: int = 0
):
    """
    Obtém todas as conversas de um usuário.
    
    Args:
        user_id: ID do usuário
        limit: Número máximo de conversas
        offset: Deslocamento para paginação
        
    Returns:
        Lista de conversas
    """
    try:
        # Inicializa um agente temporário para acessar o context manager
        agent = await get_agent(user_id)
        
        conversations = await agent.context_manager.get_user_conversations(
            user_id=user_id,
            limit=limit,
            offset=offset
        )
        
        return conversations
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao obter conversas: {str(e)}"
        )

@router.get("/conversations/{conversation_id}/history", response_model=ConversationHistory)
async def get_conversation_history(
    conversation_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Obtém o histórico de uma conversa específica.
    
    Args:
        conversation_id: ID da conversa
        user_id: ID do usuário
        
    Returns:
        Histórico da conversa
    """
    try:
        agent = await get_agent(user_id, conversation_id)
        
        messages = await agent.get_conversation_history()
        
        return {
            "conversation_id": conversation_id,
            "messages": messages
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao obter histórico: {str(e)}"
        )

@router.post("/conversations/{conversation_id}/clear", response_model=Dict[str, Any])
async def clear_conversation(
    conversation_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Limpa o histórico de uma conversa e inicia uma nova.
    
    Args:
        conversation_id: ID da conversa
        user_id: ID do usuário
        
    Returns:
        Confirmação e ID da nova conversa
    """
    try:
        agent = await get_agent(user_id, conversation_id)
        
        await agent.clear_conversation_history()
        
        return {
            "message": "Histórico limpo e nova conversa iniciada",
            "new_conversation_id": agent.conversation_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao limpar conversa: {str(e)}"
        )

@router.delete("/conversations/{conversation_id}", response_model=Dict[str, Any])
async def delete_conversation(
    conversation_id: str,
    user_id: str = Depends(get_current_user)
):
    """
    Exclui permanentemente uma conversa.
    
    Args:
        conversation_id: ID da conversa
        user_id: ID do usuário
        
    Returns:
        Confirmação da exclusão
    """
    try:
        # Inicializa um agente temporário para acessar o context manager
        agent = await get_agent(user_id)
        
        success = await agent.context_manager.delete_conversation(conversation_id)
        
        # Remove o agente do cache se estiver ativo
        cache_key = f"{user_id}:{conversation_id}"
        if cache_key in active_agents:
            await active_agents[cache_key].close()
            del active_agents[cache_key]
        
        if success:
            return {"message": "Conversa excluída com sucesso"}
        else:
            raise HTTPException(
                status_code=404,
                detail="Conversa não encontrada"
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao excluir conversa: {str(e)}"
        )
