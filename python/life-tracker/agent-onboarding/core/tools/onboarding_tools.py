"""
Ferramentas do Agno para o agente de onboarding - Versão Robusta
Implementação com tratamento robusto de erros e garantia de persistência
"""

import logging
from typing import Dict, Any, Optional, List, Union
from datetime import datetime
from pydantic import BaseModel, Field, ValidationError

from agno.tools import tool

from models.schemas import (
    ProfileAnalysis,
    GeneratedPlan,
    LifeDomain,
    UserProfile,
    UserProfileType
)
from core.profile_analyzer import ProfileAnalyzer
from core.template_matcher import TemplateMatcher
from core.plan_generator import PlanGenerator
from services.database_factory import DatabaseFactory
from core.tools.data_mapper import ToolInputMapper, DataValidator

logger = logging.getLogger(__name__)

# Variáveis globais para os serviços
_profile_analyzer = None
_template_matcher = None
_plan_generator = None
_db_service = None

def initialize_tools(
    profile_analyzer: ProfileAnalyzer,
    template_matcher: TemplateMatcher,
    plan_generator: PlanGenerator,
    db_service: DatabaseFactory
):
    """Inicializar as ferramentas com os serviços"""
    global _profile_analyzer, _template_matcher, _plan_generator, _db_service
    _profile_analyzer = profile_analyzer
    _template_matcher = template_matcher
    _plan_generator = plan_generator
    _db_service = db_service
    logger.info("✅ Ferramentas inicializadas")

class OnboardingOrchestrator:
    """Orquestrador robusto para o processo de onboarding"""
    
    def __init__(self):
        self.context = {}
    
    async def execute_full_onboarding(self, user_id: str, answers: Dict[str, Any]) -> Dict[str, Any]:
        """Executa o processo completo de onboarding com garantia de persistência"""
        try:
            logger.info(f"Iniciando onboarding completo para usuário {user_id}")
            
            # Passo 1: Análise de perfil
            profile_result = await self._analyze_profile(user_id, answers)
            if not profile_result["success"]:
                return profile_result
            
            # Passo 2: Match de template
            template_result = await self._match_template(user_id, profile_result["profile_analysis"])
            if not template_result["success"]:
                return template_result
            
            # Passo 3: Geração de plano
            plan_result = await self._generate_plan(
                user_id, 
                profile_result["profile_analysis"], 
                template_result["template_match"]
            )
            if not plan_result["success"]:
                return plan_result
            
            # Passo 4: Salvar resultados (CRÍTICO)
            save_result = await self._save_results(
                user_id, 
                profile_result["profile_analysis"], 
                plan_result["generated_plan"]
            )
            if not save_result["success"]:
                return save_result
            
            return {
                "success": True,
                "message": "Onboarding completado com sucesso",
                "user_id": user_id,
                "profile_analysis": profile_result["profile_analysis"],
                "template_match": template_result["template_match"],
                "generated_plan": plan_result["generated_plan"],
                "saved": True,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro no onboarding completo: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "user_id": user_id,
                "timestamp": datetime.now().isoformat()
            }
    
    async def _analyze_profile(self, user_id: str, answers: Dict[str, Any]) -> Dict[str, Any]:
        """Passo 1: Análise de perfil com persistência obrigatória"""
        try:
            # Garantir que os campos de horário estejam presentes
            if 'wakeup_time' not in answers:
                answers['wakeup_time'] = '07:00'
            if 'sleep_time' not in answers:
                answers['sleep_time'] = '23:00'
            
            # Mapear e validar dados
            mapped_data = ToolInputMapper.map_analyze_profile_input(**answers)
            validation = DataValidator.validate_onboarding_data(mapped_data)
            
            if not validation.is_valid:
                logger.warning(f"Validação com warnings: {validation.errors}")
            
            # Analisar perfil
            profile_analysis = await _profile_analyzer.analyze_responses(
                user_id=user_id,
                answers=mapped_data
            )
            
            # Salvar no banco - OBRIGATÓRIO
            try:
                await _db_service.save_profile_analysis(
                    user_id=user_id,
                    analysis=profile_analysis
                )
                logger.info(f"✅ Análise de perfil salva para usuário {user_id}")
            except Exception as db_error:
                logger.error(f"❌ Erro crítico ao salvar análise de perfil: {str(db_error)}")
                return {
                    "success": False,
                    "error": f"Falha ao persistir dados: {str(db_error)}"
                }
            
            return {
                "success": True,
                "profile_analysis": profile_analysis.dict(),
                "validation_warnings": validation.errors if validation.errors else None
            }
            
        except Exception as e:
            logger.error(f"Erro na análise de perfil: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _match_template(self, user_id: str, profile_analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Passo 2: Match de template com tratamento robusto"""
        try:
            # Converter para ProfileAnalysis
            analysis = ProfileAnalysis(**profile_analysis_data)
            
            # Encontrar template
            template_match = await _template_matcher.find_best_template(
                profile_analysis=analysis
            )
            
            # Tratar template_match corretamente
            template_id = None
            if hasattr(template_match, 'template') and hasattr(template_match.template, 'id'):
                template_id = template_match.template.id
            elif hasattr(template_match, 'template') and isinstance(template_match.template, dict):
                template_id = template_match.template.get('id')
            elif isinstance(template_match, dict):
                template_id = template_match.get('template_id') or template_match.get('id')
            else:
                # Fallback: usar o primeiro template disponível
                templates_list = await _template_matcher.list_all_templates()
                if templates_list:
                    template_id = templates_list[0].template_id if hasattr(templates_list[0], 'template_id') else "balanced_template"
                else:
                    template_id = "balanced_template"  # Template padrão
            
            logger.info(f"Template selecionado: {template_id}")
            
            return {
                "success": True,
                "template_match": {
                    "template_id": template_id,
                    "match_score": getattr(template_match, 'match_score', 0.0),
                    "reasoning": getattr(template_match, 'reasoning', []),
                    "customizations": getattr(template_match, 'customizations', {})
                }
            }
            
        except Exception as e:
            logger.error(f"Erro no match de template: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _generate_plan(self, user_id: str, profile_analysis_data: Dict[str, Any], template_match: Dict[str, Any]) -> Dict[str, Any]:
        """Passo 3: Geração de plano"""
        try:
            # Converter dados
            analysis = ProfileAnalysis(**profile_analysis_data)
            template_id = template_match["template_id"]
            customizations = template_match["customizations"]
            
            # Obter template - CORRIGIDO: usar get_template
            base_template = await _template_matcher.get_template(template_id)
            
            if not base_template:
                logger.error(f"Template não encontrado: {template_id}")
                return {
                    "success": False,
                    "error": f"Template não encontrado: {template_id}"
                }
            
            # Gerar plano
            generated_plan = await _plan_generator.generate_plan(
                user_id=user_id,
                profile_analysis=analysis,
                base_template=base_template,
                customizations=customizations
            )
            
            return {
                "success": True,
                "generated_plan": generated_plan.dict()
            }
            
        except Exception as e:
            logger.error(f"Erro na geração de plano: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _save_results(self, user_id: str, profile_analysis_data: Dict[str, Any], generated_plan_data: Dict[str, Any]) -> Dict[str, Any]:
        """Passo 4: Salvar resultados - CRÍTICO"""
        try:
            # Converter dados
            analysis = ProfileAnalysis(**profile_analysis_data)
            plan = GeneratedPlan(**generated_plan_data)
            
            # Salvar no banco - OBRIGATÓRIO
            try:
                await _db_service.save_profile_analysis(user_id=user_id, analysis=analysis)
                await _db_service.save_user_plan(user_id=user_id, plan=plan)
                logger.info(f"✅ Resultados salvos para usuário {user_id}")
            except Exception as db_error:
                logger.error(f"❌ Erro crítico ao salvar resultados: {str(db_error)}")
                return {
                    "success": False,
                    "error": f"Falha ao persistir dados finais: {str(db_error)}"
                }
            
            return {"success": True}
            
        except Exception as e:
            logger.error(f"Erro ao salvar resultados: {str(e)}")
            return {"success": False, "error": str(e)}

# Instância global do orquestrador
_onboarding_orchestrator = OnboardingOrchestrator()

@tool
async def execute_onboarding_workflow(
    user_id: str = Field(description="ID do usuário"),
    concentration: Optional[str] = Field(default=None, description="Nível de concentração"),
    lifestyle: Optional[str] = Field(default=None, description="Satisfação com estilo de vida"),
    energy: Optional[str] = Field(default=None, description="Nível de energia"),
    wakeup_time: Optional[str] = Field(default=None, description="Horário de acordar"),
    sleep_time: Optional[str] = Field(default=None, description="Horário de dormir"),
    personal_interests: Optional[Union[str, List[str]]] = Field(default=None, description="Interesses pessoais"),
    financial_goals: Optional[Union[str, List[str]]] = Field(default=None, description="Objetivos financeiros"),
    life_goals: Optional[Union[str, List[str]]] = Field(default=None, description="Objetivos de vida"),
    monthly_income: Optional[Union[float, int]] = Field(default=None, description="Renda mensal"),
    monthly_savings: Optional[Union[float, int]] = Field(default=None, description="Economia mensal"),
    time_availability: Optional[Union[int, float]] = Field(default=None, description="Tempo disponível em horas"),
    source: Optional[str] = Field(default=None, description="Fonte dos dados"),
    investment_horizon: Optional[str] = Field(default=None, description="Horizonte de investimento"),
    risk_tolerance: Optional[str] = Field(default=None, description="Tolerância ao risco"),
    investment_capacity: Optional[str] = Field(default=None, description="Capacidade de investimento"),
    business_interests: Optional[Union[str, List[str]]] = Field(default=None, description="Interesses de negócio"),
    entrepreneur_profile: Optional[str] = Field(default=None, description="Perfil empreendedor"),
    learning_areas: Optional[Union[str, List[str]]] = Field(default=None, description="Áreas de aprendizado"),
    created_at: Optional[str] = Field(default=None, description="Data de criação")
) -> Dict[str, Any]:
    """
    Executa o workflow completo de onboarding
    
    Esta ferramenta processa todas as respostas do onboarding e gera um plano personalizado
    seguindo o fluxo: análise de perfil -> match de template -> geração de plano -> salvamento
    
    IMPORTANTE: Todos os dados são persistidos no banco de dados para garantir consistência.
    """
    try:
        logger.info(f"Executando workflow completo para usuário {user_id}")
        
        # Validar user_id
        if not user_id or not isinstance(user_id, str):
            return {
                "success": False,
                "error": "user_id deve ser uma string válida",
                "user_id": str(user_id) if user_id else "invalid",
                "timestamp": datetime.now().isoformat()
            }
        
        # Preparar dados de resposta
        answers = {
            "user_id": user_id,
            "concentration": concentration,
            "lifestyle": lifestyle,
            "energy": energy,
            "wakeup_time": wakeup_time,
            "sleep_time": sleep_time,
            "personal_interests": personal_interests,
            "financial_goals": financial_goals,
            "life_goals": life_goals,
            "monthly_income": monthly_income,
            "monthly_savings": monthly_savings,
            "time_availability": time_availability,
            "source": source,
            "investment_horizon": investment_horizon,
            "risk_tolerance": risk_tolerance,
            "investment_capacity": investment_capacity,
            "business_interests": business_interests,
            "entrepreneur_profile": entrepreneur_profile,
            "learning_areas": learning_areas,
            "created_at": created_at
        }
        
        # Remover valores None
        answers = {k: v for k, v in answers.items() if v is not None}
        
        # Executar workflow completo
        result = await _onboarding_orchestrator.execute_full_onboarding(user_id, answers)
        
        return result
        
    except Exception as e:
        logger.error(f"Erro no workflow de onboarding: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "user_id": str(user_id) if user_id else "unknown",
            "timestamp": datetime.now().isoformat()
        }

@tool
async def get_user_history_tool(
    user_id: str = Field(description="ID do usuário"),
    domain: Optional[str] = Field(default=None, description="Domínio específico"),
    limit: int = Field(default=10, description="Limite de resultados")
) -> Dict[str, Any]:
    """
    Obtém o histórico de interações do usuário
    """
    try:
        logger.info(f"Ferramenta: Obtendo histórico para usuário {user_id}")
        
        if not _db_service:
            raise Exception("Database service não inicializado")
        
        # Obter análise de perfil
        profile_analysis = await _db_service.get_profile_analysis(user_id)
        
        # Obter plano atual
        current_plan = await _db_service.get_user_plan(user_id)
        
        # Obter histórico de sessões
        sessions = await _db_service.get_user_sessions(
            user_id=user_id,
            limit=limit
        )
        
        # Filtrar por domínio se especificado
        domain_score = None
        if domain and profile_analysis:
            domain_priorities = profile_analysis.domain_priorities
            if domain in domain_priorities:
                domain_score = domain_priorities[domain]
            else:
                domain_score = 0
        
        return {
            "success": True,
            "message": "Histórico obtido com sucesso",
            "user_id": user_id,
            "profile_analysis": profile_analysis.dict() if profile_analysis else None,
            "current_plan": current_plan.dict() if current_plan else None,
            "sessions": [session.dict() for session in sessions],
            "domain_info": {
                "requested_domain": domain,
                "domain_score": domain_score
            } if domain else None,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erro na ferramenta get_user_history_tool: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "user_id": user_id,
            "timestamp": datetime.now().isoformat()
        }
