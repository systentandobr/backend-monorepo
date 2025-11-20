"""
Viral Kids - Chatbot Agent API
API FastAPI para o agente de chatbot inteligente usando Agno
"""

import logging
import os
from typing import Dict, Any, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from core.agent_chatbot import AgnoChatbotAgent

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
load_dotenv()

# Criar aplicação FastAPI
app = FastAPI(
    title="Viral Kids Chatbot API",
    description="API do agente inteligente de chatbot usando Agno",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar origens
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instância global do agente
agent = AgnoChatbotAgent()

# Schemas
class ChatMessageRequest(BaseModel):
    message: str = Field(..., description="Mensagem do usuário")
    session_id: Optional[str] = Field(None, description="ID da sessão")
    user_id: Optional[str] = Field(None, description="ID do usuário")
    context: Optional[Dict[str, Any]] = Field(None, description="Contexto adicional")

class ChatMessageResponse(BaseModel):
    message: str
    session_id: str
    lead_data: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

class SessionHistoryResponse(BaseModel):
    session_id: str
    messages: list[Dict[str, Any]]

# Eventos
@app.on_event("startup")
async def startup_event():
    """Inicializar agente na inicialização da aplicação"""
    logger.info("Inicializando agente...")
    await agent.initialize()
    logger.info("Agente inicializado com sucesso")

# Rotas
@app.get("/health")
async def health_check():
    """Health check"""
    return {
        "status": "healthy",
        "agent_initialized": agent.initialized,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/chat", response_model=ChatMessageResponse)
async def chat(request: ChatMessageRequest):
    """
    Processa mensagem do usuário e retorna resposta do agente
    """
    try:
        result = await agent.chat(
            message=request.message,
            session_id=request.session_id,
            user_id=request.user_id,
            context=request.context
        )
        
        return ChatMessageResponse(**result)
    except Exception as e:
        logger.error(f"Erro ao processar chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sessions/{session_id}/history", response_model=SessionHistoryResponse)
async def get_session_history(session_id: str):
    """
    Obtém histórico de uma sessão
    """
    try:
        messages = await agent.get_session_history(session_id)
        return SessionHistoryResponse(
            session_id=session_id,
            messages=messages
        )
    except Exception as e:
        logger.error(f"Erro ao buscar histórico: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

