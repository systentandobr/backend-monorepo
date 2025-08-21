"""
Agente Agno para Onboarding - Life Tracker
Implementação usando o framework Agno com memória SQLite (temporário)
"""

import asyncio
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid
import os

from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.memory.v2.memory import Memory
from agno.memory.v2.db.postgres import PostgresMemoryDb
from agno.memory.v2.db.sqlite import SqliteMemoryDb
from agno.tools.tavily import TavilyTools
from agno.tools.reasoning import ReasoningTools
# from agno.embedder.openai import OpenAIEmbedder
# from agno.vectordb.lancedb import LanceDb, SearchType
# from agno.knowledge.url import UrlKnowledge

from models.schemas import (
    OnboardingRequest,
    OnboardingResponse,
    ProfileAnalysis,
    GeneratedPlan,
    UserProfile,
    UserProfileType,
    LifeDomain
)
from core.profile_analyzer import ProfileAnalyzer
from core.template_matcher import TemplateMatcher
from core.plan_generator import PlanGenerator
from services.database import DatabaseService
from utils.config import Settings
from core.tools.onboarding_tools import OnboardingTools

logger = logging.getLogger(__name__)



class AgnoOnboardingAgent:
    """
    Agente Agno responsável por orquestrar o processo de onboarding
    com memória persistente e ferramentas especializadas
    """
    
    def __init__(self):
        self.settings = Settings()
        self.agno_agent = None
        self.memory = None
        self.profile_analyzer = ProfileAnalyzer()
        self.template_matcher = TemplateMatcher()
        self.plan_generator = PlanGenerator()
        self.db_service = DatabaseService()
        self.initialized = False
        
    async def initialize(self):
        """Inicializar o agente Agno com memória SQLite"""
        if self.initialized:
            return
            
        logger.info("Inicializando AgnoOnboardingAgent...")
        
        # Criar diretório para dados se não existir
        os.makedirs("data", exist_ok=True)

        # Load Agno documentation in a knowledge base
        # You can also use `https://docs.agno.com/llms-full.txt` for the full documentation
        # self.knowledge = UrlKnowledge(
        #     urls=["https://docs.agno.com/introduction.md"],
        #     vector_db=LanceDb(
        #         uri="tmp/lancedb",
        #         table_name="agno_docs",
        #         search_type=SearchType.hybrid,
        #         # Use OpenAI for embeddings
        #         embedder=OpenAIEmbedder(id="text-embedding-3-small", dimensions=1536),
        #     ),
        # )
        
        # Configurar memória SQLite (temporário até resolver PostgreSQL)
        self.memory = Memory(
            model=OpenAIChat(id="gpt-4"),
            db=SqliteMemoryDb(
                table_name="user_memories",
                db_file="data/agno_memory.db"
            ),
        )


        
        # Configurar ferramentas
        onboarding_tools = OnboardingTools(
            profile_analyzer=self.profile_analyzer,
            template_matcher=self.template_matcher,
            plan_generator=self.plan_generator,
            db_service=self.db_service
        )
        
        # Criar agente Agno
        self.agno_agent = Agent(
            model=OpenAIChat(id="gpt-4"),
            tools=[
                TavilyTools(),  # Ferramenta de pesquisa web
                ReasoningTools(),

                onboarding_tools.analyze_profile_tool,
                onboarding_tools.generate_plan_tool,
                onboarding_tools.match_template_tool,
                onboarding_tools.save_results_tool,
                onboarding_tools.get_user_history_tool
            ],
            # knowledge=self.knowledge,
            instructions=self._get_agent_instructions(),
            memory=self.memory,
            enable_agentic_memory=True,
            debug_mode=self.settings.debug
        )
        
        # Inicializar componentes
        await self.profile_analyzer.initialize()
        await self.template_matcher.initialize()
        await self.plan_generator.initialize()
        
        self.initialized = True
        logger.info("AgnoOnboardingAgent inicializado com sucesso")
    
    def _get_agent_instructions(self) -> str:
        """Retorna as instruções para o agente Agno"""
        return """
        Você é um agente especializado em onboarding para o Life Tracker.
        
        Suas responsabilidades principais:
        
        1. ANALISAR PERFIL: Analisar respostas do onboarding para identificar o perfil do usuário
        2. MATCH DE TEMPLATE: Encontrar o template mais adequado baseado no perfil
        3. GERAR PLANO: Criar planos personalizados que se adequem às necessidades do usuário
        4. SALVAR RESULTADOS: Persistir análises e planos no banco de dados
        5. CONSULTAR HISTÓRICO: Recuperar histórico de interações do usuário
        
        Processo de Onboarding:
        
        1. Use analyze_profile_tool para analisar as respostas do usuário
        2. Use match_template_tool para encontrar o template adequado
        3. Use generate_plan_tool para criar o plano personalizado
        4. Use save_results_tool para persistir os resultados
        5. Use get_user_history_tool quando precisar consultar histórico
        
        Sempre seja:
        - Preciso e detalhado nas análises
        - Personalizado nas recomendações
        - Consistente com o histórico do usuário
        - Responsivo às necessidades específicas
        
        Use a memória para:
        - Lembrar de interações anteriores
        - Manter consistência nas recomendações
        - Adaptar baseado no progresso do usuário
        - Personalizar experiências futuras
        
        Responda sempre em português brasileiro e seja empático com o usuário.
        """
    
    async def process_onboarding(
        self, 
        user_id: str, 
        answers: Dict[str, Any]
    ) -> OnboardingResponse:
        """
        Processa o onboarding completo usando o agente Agno
        
        Args:
            user_id: ID do usuário
            answers: Respostas do questionário de onboarding
            
        Returns:
            OnboardingResponse com análise e plano gerado
        """
        start_time = datetime.now()
        
        try:
            logger.info(f"Iniciando processamento de onboarding com Agno para usuário {user_id}")
            
            # Preparar contexto para o agente
            context = {
                "user_id": user_id,
                "answers": answers,
                "timestamp": datetime.now().isoformat(),
                "session_id": str(uuid.uuid4())
            }
            
            # Executar processo com agente Agno
            response = await self.agno_agent.run(
                f"""
                Processe o onboarding completo para o usuário {user_id}.
                
                Respostas do usuário:
                {answers}
                
                Execute o seguinte processo:
                1. Analise o perfil do usuário
                2. Encontre o template mais adequado
                3. Gere um plano personalizado
                4. Salve todos os resultados
                
                Retorne um resumo completo do processo realizado.
                """,
                context=context
            )
            
            # Extrair resultados da resposta do agente
            profile_analysis = await self._extract_profile_analysis(response, user_id)
            generated_plan = await self._extract_generated_plan(response, user_id)
            
            # Calcular tempo de processamento
            processing_time = (datetime.now() - start_time).total_seconds()
            
            logger.info(f"Onboarding com Agno completado com sucesso para usuário {user_id}")
            
            return OnboardingResponse(
                user_id=user_id,
                success=True,
                message="Onboarding processado com sucesso usando Agno",
                profile_analysis=profile_analysis,
                generated_plan=generated_plan,
                processing_time=processing_time,
                agent_response=response.content
            )
            
        except Exception as e:
            logger.error(f"Erro no processamento de onboarding com Agno: {str(e)}")
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return OnboardingResponse(
                user_id=user_id,
                success=False,
                message=f"Erro no processamento: {str(e)}",
                errors=[str(e)],
                processing_time=processing_time
            )
    
    async def analyze_profile_only(
        self, 
        user_id: str, 
        answers: Dict[str, Any]
    ) -> ProfileAnalysis:
        """
        Apenas analisa o perfil usando o agente Agno
        
        Args:
            user_id: ID do usuário
            answers: Respostas do questionário
            
        Returns:
            ProfileAnalysis com análise do perfil
        """
        logger.info(f"Analisando apenas perfil com Agno para usuário {user_id}")
        
        context = {
            "user_id": user_id,
            "answers": answers,
            "timestamp": datetime.now().isoformat(),
            "session_id": str(uuid.uuid4())
        }
        
        response = await self.agno_agent.run(
            f"""
            Analise apenas o perfil do usuário {user_id} com base nas respostas:
            {answers}
            
            Use a ferramenta analyze_profile_tool e retorne a análise completa.
            """,
            context=context
        )
        
        return await self._extract_profile_analysis(response, user_id)
    
    async def generate_plan_from_analysis(
        self,
        user_id: str,
        profile_analysis: ProfileAnalysis
    ) -> GeneratedPlan:
        """
        Gera plano a partir de uma análise existente usando Agno
        
        Args:
            user_id: ID do usuário
            profile_analysis: Análise de perfil existente
            
        Returns:
            GeneratedPlan personalizado
        """
        logger.info(f"Gerando plano a partir de análise com Agno para usuário {user_id}")
        
        context = {
            "user_id": user_id,
            "profile_analysis": profile_analysis.dict(),
            "timestamp": datetime.now().isoformat(),
            "session_id": str(uuid.uuid4())
        }
        
        response = await self.agno_agent.run(
            f"""
            Gere um plano personalizado para o usuário {user_id} baseado na análise existente:
            {profile_analysis.dict()}
            
            Use as ferramentas match_template_tool e generate_plan_tool.
            """,
            context=context
        )
        
        return await self._extract_generated_plan(response, user_id)
    
    async def get_user_recommendations(
        self,
        user_id: str,
        domain: Optional[LifeDomain] = None
    ) -> Dict[str, Any]:
        """
        Obtém recomendações personalizadas usando o histórico do Agno
        
        Args:
            user_id: ID do usuário
            domain: Domínio específico (opcional)
            
        Returns:
            Dicionário com recomendações
        """
        logger.info(f"Gerando recomendações com Agno para usuário {user_id}")
        
        context = {
            "user_id": user_id,
            "domain": domain.value if domain else None,
            "timestamp": datetime.now().isoformat(),
            "session_id": str(uuid.uuid4())
        }
        
        response = await self.agno_agent.run(
            f"""
            Analise o histórico do usuário {user_id} e gere recomendações personalizadas.
            {f'Foque no domínio: {domain.value}' if domain else 'Considere todos os domínios'}
            
            Use get_user_history_tool para consultar o histórico e gere recomendações baseadas no progresso.
            """,
            context=context
        )
        
        return {
            "user_id": user_id,
            "recommendations": response.content,
            "generated_at": datetime.now().isoformat(),
            "domain": domain.value if domain else "all"
        }
    
    async def _extract_profile_analysis(self, response, user_id: str) -> ProfileAnalysis:
        """Extrai análise de perfil da resposta do agente"""
        try:
            # Tentar extrair da resposta do agente
            if hasattr(response, 'tool_results') and response.tool_results:
                for result in response.tool_results:
                    if 'profile_analysis' in str(result):
                        # Extrair dados da análise
                        return await self.db_service.get_profile_analysis(user_id)
            
            # Fallback: buscar do banco de dados
            return await self.db_service.get_profile_analysis(user_id)
            
        except Exception as e:
            logger.error(f"Erro ao extrair análise de perfil: {str(e)}")
            raise
    
    async def _extract_generated_plan(self, response, user_id: str) -> GeneratedPlan:
        """Extrai plano gerado da resposta do agente"""
        try:
            # Tentar extrair da resposta do agente
            if hasattr(response, 'tool_results') and response.tool_results:
                for result in response.tool_results:
                    if 'generated_plan' in str(result):
                        # Extrair dados do plano
                        return await self.db_service.get_user_plan(user_id)
            
            # Fallback: buscar do banco de dados
            return await self.db_service.get_user_plan(user_id)
            
        except Exception as e:
            logger.error(f"Erro ao extrair plano gerado: {str(e)}")
            raise
    
    async def get_memory_summary(self, user_id: str) -> Dict[str, Any]:
        """
        Obtém um resumo da memória do usuário
        
        Args:
            user_id: ID do usuário
            
        Returns:
            Resumo da memória
        """
        try:
            # Consultar memória do Agno
            memories = await self.memory.search(
                query=f"user_id:{user_id}",
                limit=10
            )
            
            return {
                "user_id": user_id,
                "memory_count": len(memories),
                "recent_memories": memories[:5],
                "summary": f"Usuário tem {len(memories)} interações registradas na memória"
            }
            
        except Exception as e:
            logger.error(f"Erro ao obter resumo da memória: {str(e)}")
            raise
