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
from agno.models.groq import Groq
from agno.memory.v2.memory import Memory
from agno.memory.v2.summarizer import SessionSummarizer
from agno.playground import Playground, serve_playground_app

# from agno.memory.v2.db.mongodb import MongoDBMemoryDb
from agno.memory.v2.db.sqlite import SqliteMemoryDb
from agno.storage.sqlite import SqliteStorage

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
from core.tools.onboarding_tools import (
    initialize_tools,
    execute_onboarding_workflow,
    get_user_history_tool
)
from services.database_factory import DatabaseFactory


logger = logging.getLogger(__name__)

app = None

class AgnoOnboardingAgent:
    """
    Agente Agno responsável por orquestrar o processo de onboarding
    com memória persistente e ferramentas especializadas
    """
    
    def __init__(self):
        self.settings = Settings()
        self.agent_onboarding = None
        self.memory = None
        self.profile_analyzer = ProfileAnalyzer()
        self.template_matcher = TemplateMatcher()
        self.plan_generator = PlanGenerator()
        self.db_service = DatabaseFactory()
        self.execute_onboarding_workflow = execute_onboarding_workflow
        self.initialized = False
        
    async def initialize(self):
        """Inicializar o agente Agno com memória SQLite"""
        if self.initialized:
            return

        agno_model_id = self.settings.agno_model_id
        summarizer_id = self.settings.agno_model_summarizer_id
        embedder_id = self.settings.agno_model_embedder_id
        memory_enable = self.settings.agno_memory_enable
        memory_table_name = self.settings.agno_memory_table_name
        memory_db_file = self.settings.agno_memory_db_file
        storage_db_file = self.settings.agno_storage_db_file
        memory_schema = self.settings.agno_memory_schema
            
        logger.info("Inicializando AgnoOnboardingAgent...")
        
        # Criar diretório para dados se não existir
        os.makedirs("data", exist_ok=True)

        # Inicializar o summarizer
        summarizer = SessionSummarizer(model=Groq(id=summarizer_id))

        # Inicializar o embedder
        # embedder = OpenAIEmbedder(id=embedder_id)

        # Inicializar DatabaseService primeiro
        logger.info("Inicializando DatabaseService...")
        self.db_service = await DatabaseFactory.create_and_connect_database()
        await self.db_service.connect()
        logger.info("✓ DatabaseService inicializado")

        if memory_enable:
            # if memory_db_type == "mongodb":
            #     # Configurar memória MongoDB
            #     self.memory = Memory(
            #         model=Groq(id=agno_model_id),
            #         db=MongoDBMemoryDb(
            #             table_name=memory_table_name,
            #             db_url=self.settings.database_url_mongodb
            #         ),
            #         summarizer=summarizer,
            #         # embedder=embedder,
            #     )
            # elif memory_db_type == "sqlite":
            # Configurar memória SQLite
            memory_db = SqliteMemoryDb(table_name=memory_table_name, db_file=memory_db_file)

            self.memory = Memory(
                model=Groq(id=agno_model_id),
                db=memory_db,
                summarizer=summarizer,
                # embedder=embedder,
            )

        self.storage = SqliteStorage(table_name="user_sessions", db_file=storage_db_file)

        # Inicializar componentes
        logger.info("Inicializando componentes...")
        await self.profile_analyzer.initialize()
        await self.template_matcher.initialize()
        await self.plan_generator.initialize()
        
        # Inicializar ferramentas
        initialize_tools(
            profile_analyzer=self.profile_analyzer,
            template_matcher=self.template_matcher,
            plan_generator=self.plan_generator,
            db_service=self.db_service
        )
        
        # Criar agente Agno
        self.agent_onboarding = Agent(
            model=Groq(id=agno_model_id),
            tools=[
                ReasoningTools(),
                execute_onboarding_workflow, # ✅ Workflow completo
                get_user_history_tool,     # ✅ Consulta histórico
            ],
            instructions=self._get_agent_instructions(),
            memory=self.memory,
            storage=self.storage,
            add_history_to_messages=True,
            num_history_runs=3,
            enable_user_memories=True,
            enable_session_summaries=True,
            enable_agentic_memory=True,
            debug_mode=self.settings.debug
        )
        
        self.initialized = True
        logger.info("✅ AgnoOnboardingAgent inicializado com sucesso")

        return self.agent_onboarding
    def _get_agent_instructions(self) -> str:
        """Retorna as instruções para o agente Agno"""
        return """
        Você é um agente especializado em onboarding para o Life Tracker.
        
        Sua função é processar o onboarding de usuários seguindo este fluxo:
        
        FLUXO OBRIGATÓRIO:
        Use execute_onboarding_workflow com todos os parâmetros necessários:
        
        PARÂMETROS OBRIGATÓRIOS:
        - user_id: ID do usuário (string)
        - concentration: Nível de concentração (high-focus, medium-focus, low-focus)
        - lifestyle: Satisfação com estilo de vida (very-satisfied, somewhat-satisfied, not-satisfied)
        - energy: Nível de energia (high-energy, medium-energy, low-energy)
        - wakeup_time: Horário de acordar (formato HH:MM)
        - sleep_time: Horário de dormir (formato HH:MM)
        - personal_interests: Interesses pessoais (string ou lista)
        - financial_goals: Objetivos financeiros (string ou lista)
        - life_goals: Objetivos de vida (string ou lista)
        - monthly_income: Renda mensal (número)
        - monthly_savings: Economia mensal (número)
        - time_availability: Tempo disponível em horas (número)
        
        PARÂMETROS OPCIONAIS:
        - source: Fonte dos dados
        - investment_horizon: Horizonte de investimento
        - risk_tolerance: Tolerância ao risco
        - investment_capacity: Capacidade de investimento
        - business_interests: Interesses de negócio
        - entrepreneur_profile: Perfil empreendedor
        - learning_areas: Áreas de aprendizado
        - created_at: Data de criação
        
        IMPORTANTE:
        - Use APENAS execute_onboarding_workflow
        - NÃO use ferramentas individuais (analyze_profile_tool, match_template_tool, etc.)
        - O workflow já orquestra todo o processo internamente
        - Aguarde a conclusão completa antes de responder
        - Todos os dados são persistidos automaticamente
        
        EXEMPLO DE USO:
        execute_onboarding_workflow(
            user_id="user123",
            concentration="high-focus",
            lifestyle="very-satisfied",
            energy="high-energy",
            wakeup_time="06:00",
            sleep_time="22:00",
            personal_interests=["career", "technology"],
            financial_goals=["passive-income", "wealth-building"],
            life_goals=["financial-freedom", "travel"],
            monthly_income=5000,
            monthly_savings=1000,
            time_availability=10
        )
        
        Sempre responda em português brasileiro.
        """
    
    async def process_onboarding(
        self, 
        user_id: str, 
        answers: Dict[str, Any]
    ) -> OnboardingResponse:
        """Processa o onboarding completo usando workflow estruturado"""
        start_time = datetime.now()
        
        try:
            logger.info(f"Iniciando processamento de onboarding para usuário {user_id}")
            
            # Instrução mais clara e estruturada
            prompt = f"""
            Processe o onboarding para o usuário {user_id} seguindo este fluxo estruturado:
            
            Dados do usuário:
            {answers}
            
            FLUXO OBRIGATÓRIO:
            1. Use execute_onboarding_workflow com user_id="{user_id}" e answers={answers}
            
            IMPORTANTE:
            - Use apenas a ferramenta execute_onboarding_workflow
            - Não execute ferramentas individuais
            - O workflow já orquestra todo o processo internamente
            - Aguarde a conclusão completa antes de responder
            
            Retorne um resumo do resultado do workflow.
            """
            
            response = await self.agent_onboarding.arun(prompt)
            
            # Extrair resultados da resposta
            workflow_result = await _extract_workflow_result(self, response, user_id)
            
            # Calcular tempo de processamento
            processing_time = (datetime.now() - start_time).total_seconds()
            
            logger.info(f"Onboarding completado com sucesso para usuário {user_id}")
            
            return OnboardingResponse(
                user_id=user_id,
                success=True,
                message="Onboarding processado com sucesso usando workflow estruturado",
                profile_analysis=workflow_result.get("profile_analysis"),
                generated_plan=workflow_result.get("generated_plan"),
                processing_time=processing_time,
                agent_response=response.content
            )
            
        except Exception as e:
            logger.error(f"Erro no processamento de onboarding: {str(e)}")
            
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
        
        response = await self.agent_onboarding.arun(
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
        
        response = await self.agent_onboarding.arun(
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
        
        response = await self.agent_onboarding.run(
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
            # Consultar memória do Agno usando o método correto
            memories = await self.memory.search(
                query=f"user_id:{user_id}",
                limit=10
            )
            
            return {
                "user_id": user_id,
                "memory_count": len(memories),
                "recent_memories": memories[:10],
                "summary": f"Usuário tem {len(memories)} interações registradas na memória"
            }
            
        except Exception as e:
            logger.error(f"Erro ao obter resumo da memória: {str(e)}")
            raise

async def _extract_workflow_result(self, response, user_id: str) -> Dict[str, Any]:
    """Extrai resultados do workflow da resposta do agente"""
    try:
        # Buscar dados salvos no banco
        profile_analysis = await self.db_service.get_profile_analysis(user_id)
        generated_plan = await self.db_service.get_user_plan(user_id)
        
        return {
            "profile_analysis": profile_analysis.dict() if profile_analysis else None,
            "generated_plan": generated_plan.dict() if generated_plan else None
        }
    except Exception as e:
        logger.error(f"Erro ao extrair resultados: {str(e)}")
        return {}
