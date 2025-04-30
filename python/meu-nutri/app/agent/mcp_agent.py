"""
Implementação do agente MCP (Multi-Context Processor) para o Meu Nutri.
Este módulo implementa o agente principal que integra LLMs com ferramentas especializadas.
"""

import os
import json
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

from langchain.agents import AgentExecutor, AgentType, initialize_agent
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI
from langchain.tools import BaseTool, Tool
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

# Importações locais
from app.agent.tools.circadian_tool import CircadianTool
from app.agent.tools.nutrition_tool import NutritionTool
from app.agent.tools.vision_tool import VisionTool
from app.agent.tools.search_tool import SearchTool
from app.agent.tools.plan_tool import PlanTool

# Carrega variáveis de ambiente
load_dotenv()

class NutriAgent:
    """
    Agente MCP para o Meu Nutri que gerencia ferramentas especializadas
    e integra modelos de linguagem para respostas contextualizadas.
    """
    
    def __init__(self, user_id: str, verbose: bool = False):
        """
        Inicializa o agente Meu Nutri.
        
        Args:
            user_id: ID do usuário para personalização
            verbose: Se True, exibe logs detalhados da execução
        """
        self.user_id = user_id
        self.verbose = verbose
        
        # Configura o modelo de linguagem
        self.llm = ChatOpenAI(
            model_name=os.getenv("OPENAI_MODEL", "gpt-4"),
            temperature=0.7,
            max_tokens=1000
        )
        
        # Inicializa a memória de conversa
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        # Configura as ferramentas especializadas
        self.tools = self._setup_tools()
        
        # Inicializa o agente
        self.agent = self._setup_agent()
    
    def _setup_tools(self) -> List[BaseTool]:
        """Configura as ferramentas disponíveis para o agente."""
        tools = [
            CircadianTool(user_id=self.user_id),
            NutritionTool(),
            VisionTool(user_id=self.user_id),
            SearchTool(),
            PlanTool(user_id=self.user_id)
        ]
        
        # Converte para formato que o LangChain espera
        lc_tools = []
        for tool in tools:
            lc_tool = Tool(
                name=tool.name,
                description=tool.description,
                func=tool.run
            )
            lc_tools.append(lc_tool)
            
        return lc_tools
    
    def _setup_agent(self) -> AgentExecutor:
        """Configura o executor do agente."""
        agent = initialize_agent(
            tools=self.tools,
            llm=self.llm,
            agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
            verbose=self.verbose,
            memory=self.memory,
            handle_parsing_errors=True
        )
        
        # Adiciona instruções específicas para o agente
        system_message = """
        Você é um assistente nutricional inteligente especializado em saúde e bem-estar.
        
        Seu objetivo é ajudar o usuário a melhorar seus hábitos alimentares e atividade física,
        considerando seu ritmo circadiano e características pessoais.
        
        Sempre seja construtivo, positivo e empático. Evite julgamentos negativos sobre 
        comportamentos alimentares ou corporais. Promova uma relação saudável com a comida.
        
        Utilize suas ferramentas especializadas para oferecer recomendações personalizadas 
        e baseadas em evidências. Quando não tiver certeza, busque informações adicionais
        em vez de fazer suposições.
        
        Lembre-se de considerar o contexto completo do usuário, incluindo:
        - Objetivos de saúde
        - Restrições alimentares
        - Nível de atividade
        - Cronotipo e ritmo circadiano
        - Preferências culturais e pessoais
        
        Mantenha suas respostas concisas, práticas e educativas.
        """
        
        # Atualiza o sistema prompt (isso varia dependendo da versão do LangChain)
        agent.agent.llm_chain.prompt.messages[0].content = system_message
        
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
        # Adiciona contexto à consulta se fornecido
        if context:
            context_str = json.dumps(context)
            enhanced_query = f"Contexto: {context_str}\n\nConsulta do usuário: {query}"
        else:
            enhanced_query = query
        
        # Executa o agente
        response = await self.agent.arun(enhanced_query)
        
        # Formata a resposta
        return {
            "response": response,
            "source": "agent"
        }
    
    def get_conversation_history(self) -> List[Dict[str, Any]]:
        """Retorna o histórico de conversação."""
        return self.memory.chat_memory.messages
    
    def clear_conversation_history(self) -> None:
        """Limpa o histórico de conversação."""
        self.memory.clear()
