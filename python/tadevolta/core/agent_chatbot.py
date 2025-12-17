"""
Agente Agno para Chatbot TaDeVolta
Implementação usando o framework Agno com memória persistente
Sistema de vendas por indicações (Member Get Member)
"""

import logging
import re
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid
import os

from agno.agent import Agent
from agno.models.groq import Groq
from agno.memory.v2.memory import Memory
from agno.memory.v2.summarizer import SessionSummarizer
from agno.memory.v2.db.sqlite import SqliteMemoryDb
from agno.storage.sqlite import SqliteStorage
from agno.tools.reasoning import ReasoningTools

logger = logging.getLogger(__name__)


class LeadDataExtractor:
    """
    Responsável por extrair dados de lead das conversas
    Segue Single Responsibility Principle
    """
    
    # Padrões regex para extração de dados
    EMAIL_PATTERN = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
    PHONE_PATTERN = re.compile(r'(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?(?:\d{4,5}[-.\s]?\d{4})')
    
    def extract(self, response_content: str, context: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        """
        Extrai dados de lead da resposta e contexto
        
        Args:
            response_content: Conteúdo da resposta do agente
            context: Contexto adicional da conversa
            
        Returns:
            Dict com dados do lead ou None se não houver dados suficientes
        """
        lead_data = {}
        
        # Extrair do contexto primeiro (mais confiável)
        if context:
            lead_data.update(self._extract_from_context(context))
        
        # Tentar extrair da resposta usando padrões
        extracted = self._extract_from_text(response_content)
        lead_data.update(extracted)
        
        # Retornar apenas se houver dados mínimos
        if lead_data and (lead_data.get('email') or lead_data.get('phone')):
            return lead_data
        
        return None
    
    def _extract_from_context(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Extrai dados do contexto"""
        lead_data = {}
        
        # Campos esperados do formulário TadeVolta
        field_mapping = {
            'name': 'name',
            'nome': 'name',
            'email': 'email',
            'phone': 'phone',
            'telefone': 'phone',
            'city': 'city',
            'cidade': 'city',
            'company': 'company',
            'empresa': 'company',
            'franchise': 'franchise',
            'franquia': 'franchise',
            'message': 'message',
            'mensagem': 'message',
        }
        
        for key, value in context.items():
            normalized_key = key.lower()
            if normalized_key in field_mapping and value:
                lead_data[field_mapping[normalized_key]] = value
        
        return lead_data
    
    def _extract_from_text(self, text: str) -> Dict[str, Any]:
        """Extrai dados usando padrões regex"""
        extracted = {}
        
        # Extrair email
        emails = self.EMAIL_PATTERN.findall(text)
        if emails:
            extracted['email'] = emails[0]
        
        # Extrair telefone
        phones = self.PHONE_PATTERN.findall(text)
        if phones:
            # Limpar formatação do telefone
            phone = re.sub(r'[\s\-\(\)]', '', phones[0])
            extracted['phone'] = phone
        
        return extracted


class AgentConfig:
    """
    Responsável por configurar o agente Agno
    Centraliza todas as configurações e instruções
    """
    
    @staticmethod
    def get_instructions() -> List[str]:
        """Retorna instruções do agente para o contexto TadeVolta"""
        return [
            "Você é um assistente virtual amigável e profissional do TaDeVolta",
            "O TaDeVolta é um sistema de vendas por indicações (Member Get Member) que ajuda associados e franqueados a multiplicar suas vendas",
            "",
            "Seu objetivo principal:",
            "- Entender o interesse do associado/franqueado no sistema de indicações",
            "- Explicar como funciona o sistema de campanhas de indicação",
            "- Capturar informações para qualificar o lead",
            "",
            "Informações sobre o sistema que você deve conhecer:",
            "- Tipos de recompensas: Cashback (dinheiro direto), Descontos (cupons), Pontos (fidelidade), Prêmios Físicos",
            "- Tipos de campanhas: Single-tier (uma indicação) e Multi-tier (múltiplas camadas)",
            "- Benefícios: Aumento de vendas, redução de CAC, engajamento de clientes, analytics em tempo real",
            "- Processo: Criar campanha → Compartilhar código → Cliente indica → Recompensas automáticas",
            "",
            "Informações que você deve capturar do lead:",
            "- Nome completo",
            "- Email",
            "- Telefone",
            "- Nome da empresa/franquia",
            "- Cidade/Estado",
            "- Mensagem/Interesse (opcional)",
            "",
            "Diretrizes de conversação:",
            "- Seja conversacional, natural e humano",
            "- Faça perguntas relevantes de forma gradual, não sobrecarregue o usuário",
            "- Explique benefícios de forma clara e objetiva",
            "- Use exemplos práticos quando possível",
            "- Seja empático e ajude o associado a entender como o sistema pode ajudar",
            "- Use português brasileiro de forma natural e coloquial",
            "- Se o usuário perguntar sobre preços ou planos, direcione para o formulário de contato",
        ]
    
    @staticmethod
    def get_agent_name() -> str:
        """Retorna o nome do agente"""
        return "TaDeVoltaChatbot"
    
    @staticmethod
    def get_agent_description() -> str:
        """Retorna a descrição do agente"""
        return "Assistente virtual inteligente do TaDeVolta especializado em explicar o sistema de vendas por indicações e captação de leads qualificados"


class AgnoChatbotAgent:
    """
    Agente Agno responsável por conversas inteligentes do chatbot TaDeVolta
    com capacidade de capturar leads e explicar o sistema de indicações
    """
    
    def __init__(self, lead_extractor: Optional[LeadDataExtractor] = None):
        """
        Inicializa o agente
        
        Args:
            lead_extractor: Extrator de dados de lead (injeta dependência para testabilidade)
        """
        self.agent = None
        self.memory = None
        self.storage = None
        self.initialized = False
        self.lead_extractor = lead_extractor or LeadDataExtractor()
        
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
        config = AgentConfig()
        self.agent = Agent(
            model=Groq(id=model_id),
            name=config.get_agent_name(),
            description=config.get_agent_description(),
            instructions=config.get_instructions(),
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
            lead_data = self.lead_extractor.extract(response.content, context)
            
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

