"""
Implementação híbrida do agente que combina LangChain para agente e ferramentas
com Model Context Protocol para persistência e aprendizado contínuo.
"""

import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

# LangChain
from langchain_openai import ChatOpenAI

# Importações locais
from app.agent.tools.circadian_tool import CircadianTool
from app.agent.tools.nutrition_tool import NutritionTool
from app.agent.tools.vision_tool import VisionTool
from app.agent.tools.search_tool import SearchTool
from app.agent.tools.plan_tool import PlanTool
from app.db.postgres_context import PostgresContextManager

# Importação dos adaptadores para migração
from app.agent.migration_helper import (
    suppress_langchain_warnings, 
    warning_suppressor_decorator,
    update_agent_prompt,
    SafeMemoryAdapter
)
from app.agent.hybrid_agent_setup import setup_agent_with_updated_api

# Carrega variáveis de ambiente
load_dotenv()

class HybridNutriAgent:
    """
    Agente que combina LangChain para orquestração e Model Context Protocol
    para persistência e aprendizado contínuo em PostgreSQL.
    """
    
    def __init__(self, user_id: str, conversation_id: Optional[str] = None, verbose: bool = False):
        """
        Inicializa o agente híbrido.
        
        Args:
            user_id: ID do usuário para personalização
            conversation_id: ID de uma conversa existente para continuar (opcional)
            verbose: Se True, exibe logs detalhados da execução
        """
        self.user_id = user_id
        self.verbose = verbose
        self.conversation_id = conversation_id
        
        # Inicializa gerenciador de contexto PostgreSQL
        self.context_manager = PostgresContextManager()
        
        # Configura o modelo de linguagem
        self.llm = ChatOpenAI(
            model_name=os.getenv("OPENAI_MODEL", "gpt-4"),
            temperature=0.7,
            max_tokens=1000
        )
        
        # Inicializa a memória de conversa usando o adaptador seguro
        self.memory_adapter = SafeMemoryAdapter(memory_key="chat_history", return_messages=True)
        
        # Configura as ferramentas especializadas
        self.tools = self._setup_tools()
        
        # Inicializa o agente
        self.agent = self._setup_agent()
    
    async def initialize(self):
        """Inicializa o agente, carregando histórico de conversa se necessário."""
        await self.context_manager.initialize()
        
        # Se um conversation_id foi fornecido, carrega o histórico
        if self.conversation_id:
            messages = await self.context_manager.get_conversation_messages(self.conversation_id)
            
            # Popula a memória do LangChain com as mensagens existentes
            for message in messages:
                if message["role"] == "user":
                    self.memory_adapter.add_user_message(message["content"])
                elif message["role"] == "assistant":
                    self.memory_adapter.add_ai_message(message["content"])
                elif message["role"] == "system":
                    # LangChain não tem método direto para mensagens de sistema na memória,
                    # mas podemos adicionar como uma troca assistant-user
                    self.memory_adapter.add_ai_message("Entendi as instruções do sistema.")
                    self.memory_adapter.add_user_message(f"Instruções do sistema: {message['content']}")
        else:
            # Cria uma nova conversa
            self.conversation_id = await self.context_manager.create_conversation(
                user_id=self.user_id,
                title="Nova conversa nutricional",
                metadata={"agent_type": "hybrid_nutri_agent"}
            )
            
            # Adiciona uma mensagem de sistema com instruções iniciais
            system_message = """
            Você é um assistente nutricional inteligente especializado em saúde e bem-estar.
            
            Seu objetivo é ajudar o usuário a melhorar seus hábitos alimentares e atividade física,
            considerando seu ritmo circadiano e características pessoais.
            """
            
            await self.context_manager.add_message(
                conversation_id=self.conversation_id,
                role="system", 
                content=system_message
            )
    
    def _setup_tools(self) -> List[Any]:
        """Configura as ferramentas disponíveis para o agente."""
        # Configuração de caminho para o banco de dados nutricional
        nutrition_db_path = os.getenv("NUTRITION_DB_PATH", None)
        
        tools = [
            CircadianTool(user_id=self.user_id),
            NutritionTool(database_path=nutrition_db_path),
            VisionTool(user_id=self.user_id),
            SearchTool(),
            PlanTool(user_id=self.user_id)
        ]
            
        return tools
    
    @warning_suppressor_decorator
    def _setup_agent(self) -> Any:
        """Configura o executor do agente."""
        # Usa a função adaptadora para configurar o agente com a API atual
        agent = setup_agent_with_updated_api(
            tools=self.tools,
            llm=self.llm,
            verbose=self.verbose,
            system_message="""
            Você é um assistente nutricional inteligente especializado em saúde e bem-estar.
            
            Seu objetivo é ajudar o usuário a melhorar seus hábitos alimentares e atividade física,
            considerando seu ritmo circadiano e características pessoais.
            
            Sempre seja construtivo, positivo e empático. Evite julgamentos negativos sobre 
            comportamentos alimentares ou corporais. Promova uma relação saudável com a comida.
            """
        )
        
        return agent
    
    async def process_query(self, query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Processa uma consulta do usuário.
        
        Args:
            query: A pergunta ou solicitação do usuário
            context: Contexto adicional para a consulta (opcional)
            
        Returns:
            Resposta formatada com a resposta do agente
        """
        # Adiciona a mensagem do usuário ao contexto persistente
        await self.context_manager.add_message(
            conversation_id=self.conversation_id,
            role="user",
            content=query,
            metadata=context
        )
        
        # Adiciona contexto à consulta se fornecido
        if context:
            context_str = json.dumps(context)
            enhanced_query = f"Contexto: {context_str}\n\nConsulta do usuário: {query}"
        else:
            enhanced_query = query
        
        # Executa o agente
        response = ""
        # Usamos o gerenciador de contexto para suprimir avisos
        with suppress_langchain_warnings:
            response = await self.agent.arun(enhanced_query)
        
        # Armazena a resposta no contexto persistente
        await self.context_manager.add_message(
            conversation_id=self.conversation_id,
            role="assistant",
            content=response
        )
        
        # Extrai insights de aprendizado desta interação
        await self._extract_learning(query, response, context)
        
        # Formata a resposta
        return {
            "response": response,
            "conversation_id": self.conversation_id,
            "source": "hybrid_agent"
        }
    
    async def _extract_learning(self, query: str, response: str, context: Optional[Dict[str, Any]] = None):
        """
        Extrai e armazena dados de aprendizado da interação atual.
        (Implementação simplificada)
        """
        # Implementação simplificada
        if "preferência" in query.lower() or "gosto" in query.lower() or "prefiro" in query.lower():
            # Extrai preferências alimentares
            existing_data = await self.context_manager.get_learning_data(
                user_id=self.user_id, 
                category="food_preferences"
            )
            
            preferences = {}
            if existing_data and len(existing_data) > 0:
                preferences = existing_data[0].get("data", {})
                
            # Análise simples - em uma implementação real usaríamos NLP mais sofisticado
            if "não gosto" in query.lower():
                for food in ["carne", "peixe", "frango", "vegetais", "frutas", "laticínios"]:
                    if food in query.lower():
                        preferences[food] = "dislike"
            
            if "gosto" in query.lower() or "adoro" in query.lower():
                for food in ["carne", "peixe", "frango", "vegetais", "frutas", "laticínios"]:
                    if food in query.lower():
                        preferences[food] = "like"
            
            if preferences:
                await self.context_manager.store_learning_data(
                    user_id=self.user_id,
                    category="food_preferences",
                    data=preferences
                )
    
    async def get_conversation_history(self) -> List[Dict[str, Any]]:
        """Retorna o histórico de conversação do PostgreSQL Context."""
        return await self.context_manager.get_conversation_messages(self.conversation_id)
    
    async def clear_conversation_history(self) -> None:
        """Limpa o histórico de conversação atual e cria uma nova conversa."""
        old_conversation_id = self.conversation_id
        
        # Cria uma nova conversa
        self.conversation_id = await self.context_manager.create_conversation(
            user_id=self.user_id,
            title="Nova conversa nutricional",
            metadata={"agent_type": "hybrid_nutri_agent"}
        )
        
        # Limpa a memória do LangChain
        self.memory_adapter.clear()
    
    async def close(self):
        """Fecha conexões e recursos do agente."""
        await self.context_manager.close()
