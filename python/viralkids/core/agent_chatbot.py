"""
Agente Agno para Chatbot Viral Kids
Implementação usando o framework Agno com memória persistente
"""

import asyncio
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid
import os

from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.models.groq import Groq
from agno.memory.v2.memory import Memory
from agno.memory.v2.summarizer import SessionSummarizer
from agno.playground import Playground, serve_playground_app
from agno.memory.v2.db.sqlite import SqliteMemoryDb
from agno.storage.sqlite import SqliteStorage
from agno.tools.tavily import TavilyTools
from agno.tools.reasoning import ReasoningTools

logger = logging.getLogger(__name__)

class AgnoChatbotAgent:
    """
    Agente Agno responsável por conversas inteligentes do chatbot
    com capacidade de capturar leads e entender necessidades
    """
    
    def __init__(self):
        self.agent = None
        self.memory = None
        self.storage = None
        self.initialized = False
        
    async def initialize(self):
        """Inicializar o agente Agno"""
        if self.initialized:
            return
            
        logger.info("Inicializando AgnoChatbotAgent...")
        
        # Criar diretório para dados se não existir
        os.makedirs("data", exist_ok=True)
        
        # Configurações
        model_id = os.getenv("AGNO_MODEL_ID", "groq/llama-3.1-70b-versatile")
        summarizer_id = os.getenv("AGNO_SUMMARIZER_ID", "groq/llama-3.1-8b-instant")
        memory_db_file = os.getenv("AGNO_MEMORY_DB_FILE", "data/chatbot_memory.db")
        storage_db_file = os.getenv("AGNO_STORAGE_DB_FILE", "data/chatbot_storage.db")
        
        # Inicializar summarizer
        summarizer = SessionSummarizer(model=Groq(id=summarizer_id))
        
        # Configurar memória SQLite
        memory_db = SqliteMemoryDb(
            table_name="chatbot_memories",
            db_file=memory_db_file
        )
        
        self.memory = Memory(
            model=Groq(id=model_id),
            db=memory_db,
            summarizer=summarizer,
        )
        
        self.storage = SqliteStorage(
            table_name="chatbot_sessions",
            db_file=storage_db_file
        )
        
        # Criar agente Agno com ferramentas
        self.agent = Agent(
            model=Groq(id=model_id),
            name="ViralKidsChatbot",
            description="Assistente virtual inteligente da Viral Kids especializado em captação de leads e atendimento",
            instructions=[
                "Você é um assistente virtual amigável e profissional da Viral Kids",
                "Seu objetivo é entender as necessidades do cliente e capturar informações para leads",
                "Seja conversacional, natural e humano",
                "Faça perguntas relevantes para entender o interesse em franquias",
                "Capture informações como: nome, email, telefone, cidade, tipo de franquia de interesse, experiência, orçamento",
                "Seja empático e ajude o cliente a encontrar a melhor solução",
                "Use português brasileiro de forma natural e coloquial",
            ],
            memory=self.memory,
            storage=self.storage,
            tools=[
                ReasoningTools(),
                # Ferramentas customizadas serão adicionadas aqui
            ],
            markdown=True,
            show_tool_calls=True,
        )
        
        self.initialized = True
        logger.info("✓ AgnoChatbotAgent inicializado com sucesso")
    
    async def chat(
        self,
        message: str,
        session_id: Optional[str] = None,
        user_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Processa uma mensagem do usuário e retorna resposta do agente
        
        Args:
            message: Mensagem do usuário
            session_id: ID da sessão (opcional)
            user_id: ID do usuário (opcional)
            context: Contexto adicional (opcional)
            
        Returns:
            Dict com resposta do agente e metadados
        """
        if not self.initialized:
            await self.initialize()
        
        try:
            # Criar ou usar sessão existente
            if not session_id:
                session_id = f"session_{uuid.uuid4().hex[:12]}"
            
            # Preparar contexto
            run_context = {
                "session_id": session_id,
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
            }
            
            if context:
                run_context.update(context)
            
            # Executar agente
            response = await self.agent.run(
                message=message,
                stream=False,
                **run_context
            )
            
            # Extrair informações do lead se detectadas
            lead_data = self._extract_lead_data(response.content, context)
            
            return {
                "message": response.content,
                "session_id": session_id,
                "lead_data": lead_data,
                "metadata": {
                    "tool_calls": response.tool_calls if hasattr(response, 'tool_calls') else [],
                    "tokens_used": response.tokens_used if hasattr(response, 'tokens_used') else 0,
                }
            }
            
        except Exception as e:
            logger.error(f"Erro ao processar mensagem: {str(e)}")
            return {
                "message": "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
                "session_id": session_id,
                "error": str(e),
            }
    
    def _extract_lead_data(self, response: str, context: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """
        Extrai dados de lead da resposta do agente
        Usa análise simples de padrões (pode ser melhorado com NLP)
        """
        lead_data = {}
        
        # Tentar extrair informações do contexto se disponível
        if context:
            if 'name' in context:
                lead_data['name'] = context['name']
            if 'email' in context:
                lead_data['email'] = context['email']
            if 'phone' in context:
                lead_data['phone'] = context['phone']
            if 'city' in context:
                lead_data['city'] = context['city']
        
        return lead_data if lead_data else None
    
    async def get_session_history(self, session_id: str) -> List[Dict[str, Any]]:
        """Obtém histórico de uma sessão"""
        if not self.initialized:
            await self.initialize()
        
        try:
            # Buscar histórico da memória
            memories = await self.memory.get_memories(
                session_id=session_id,
                limit=50
            )
            
            return [
                {
                    "role": mem.get("role", "user"),
                    "content": mem.get("content", ""),
                    "timestamp": mem.get("timestamp"),
                }
                for mem in memories
            ]
        except Exception as e:
            logger.error(f"Erro ao buscar histórico: {str(e)}")
            return []

