"""
Ferramentas do Agno para o agente de onboarding
Implementação das ferramentas especializadas para análise e geração de planos
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime

from agno.tools import tool

from models.schemas import (
    ProfileAnalysis,
    GeneratedPlan,
    LifeDomain
)
from core.profile_analyzer import ProfileAnalyzer
from core.template_matcher import TemplateMatcher
from core.plan_generator import PlanGenerator
from services.database import DatabaseService

logger = logging.getLogger(__name__)

class OnboardingTools:
    """
    Ferramentas especializadas para o agente de onboarding
    """
    
    def __init__(
        self,
        profile_analyzer: ProfileAnalyzer,
        template_matcher: TemplateMatcher,
        plan_generator: PlanGenerator,
        db_service: DatabaseService
    ):
        self.profile_analyzer = profile_analyzer
        self.template_matcher = template_matcher
        self.plan_generator = plan_generator
        self.db_service = db_service
    
    @tool
    async def analyze_profile_tool(
        self,
        user_id: str,
        answers: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analisa as respostas do onboarding e identifica o perfil do usuário
        
        Args:
            user_id: ID do usuário
            answers: Respostas do questionário de onboarding
            
        Returns:
            Análise completa do perfil do usuário
        """
        try:
            logger.info(f"Ferramenta: Analisando perfil para usuário {user_id}")
            
            # Analisar respostas
            profile_analysis = await self.profile_analyzer.analyze_responses(
                user_id=user_id,
                answers=answers
            )
            
            # Salvar no banco de dados
            await self.db_service.save_profile_analysis(
                user_id=user_id,
                analysis=profile_analysis
            )
            
            return {
                "success": True,
                "message": "Perfil analisado com sucesso",
                "profile_analysis": profile_analysis.dict(),
                "user_id": user_id,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro na ferramenta analyze_profile_tool: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "user_id": user_id,
                "timestamp": datetime.now().isoformat()
            }
    
    @tool
    async def match_template_tool(
        self,
        user_id: str,
        profile_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Encontra o template mais adequado baseado na análise de perfil
        
        Args:
            user_id: ID do usuário
            profile_analysis: Análise de perfil do usuário
            
        Returns:
            Template match com customizações
        """
        try:
            logger.info(f"Ferramenta: Encontrando template para usuário {user_id}")
            
            # Converter dict para ProfileAnalysis
            analysis = ProfileAnalysis(**profile_analysis)
            
            # Encontrar template adequado
            template_match = await self.template_matcher.find_best_template(
                profile_analysis=analysis
            )
            
            return {
                "success": True,
                "message": "Template encontrado com sucesso",
                "template_match": {
                    "template_id": template_match.template.id,
                    "match_score": template_match.match_score,
                    "reasoning": template_match.reasoning,
                    "customizations": template_match.customizations
                },
                "user_id": user_id,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro na ferramenta match_template_tool: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "user_id": user_id,
                "timestamp": datetime.now().isoformat()
            }
    
    @tool
    async def generate_plan_tool(
        self,
        user_id: str,
        profile_analysis: Dict[str, Any],
        template_id: str,
        customizations: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Gera um plano personalizado baseado no perfil e template
        
        Args:
            user_id: ID do usuário
            profile_analysis: Análise de perfil do usuário
            template_id: ID do template selecionado
            customizations: Customizações a serem aplicadas
            
        Returns:
            Plano personalizado gerado
        """
        try:
            logger.info(f"Ferramenta: Gerando plano para usuário {user_id}")
            
            # Converter dict para ProfileAnalysis
            analysis = ProfileAnalysis(**profile_analysis)
            
            # Obter template base
            base_template = await self.template_matcher.get_template_by_id(template_id)
            
            # Gerar plano personalizado
            generated_plan = await self.plan_generator.generate_plan(
                user_id=user_id,
                profile_analysis=analysis,
                base_template=base_template,
                customizations=customizations
            )
            
            return {
                "success": True,
                "message": "Plano gerado com sucesso",
                "generated_plan": generated_plan.dict(),
                "user_id": user_id,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro na ferramenta generate_plan_tool: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "user_id": user_id,
                "timestamp": datetime.now().isoformat()
            }
    
    @tool
    async def save_results_tool(
        self,
        user_id: str,
        profile_analysis: Dict[str, Any],
        generated_plan: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Salva os resultados do onboarding no banco de dados
        
        Args:
            user_id: ID do usuário
            profile_analysis: Análise de perfil
            generated_plan: Plano gerado
            
        Returns:
            Confirmação de salvamento
        """
        try:
            logger.info(f"Ferramenta: Salvando resultados para usuário {user_id}")
            
            # Converter dicts para objetos
            analysis = ProfileAnalysis(**profile_analysis)
            plan = GeneratedPlan(**generated_plan)
            
            # Salvar no banco de dados
            await self.db_service.save_profile_analysis(
                user_id=user_id,
                analysis=analysis
            )
            
            await self.db_service.save_user_plan(
                user_id=user_id,
                plan=plan
            )
            
            return {
                "success": True,
                "message": "Resultados salvos com sucesso",
                "user_id": user_id,
                "saved_items": ["profile_analysis", "generated_plan"],
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro na ferramenta save_results_tool: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "user_id": user_id,
                "timestamp": datetime.now().isoformat()
            }
    
    @tool
    async def get_user_history_tool(
        self,
        user_id: str,
        domain: Optional[str] = None,
        limit: int = 10
    ) -> Dict[str, Any]:
        """
        Obtém o histórico de interações do usuário
        
        Args:
            user_id: ID do usuário
            domain: Domínio específico (opcional)
            limit: Limite de registros
            
        Returns:
            Histórico do usuário
        """
        try:
            logger.info(f"Ferramenta: Obtendo histórico para usuário {user_id}")
            
            # Obter análise de perfil
            profile_analysis = await self.db_service.get_profile_analysis(user_id)
            
            # Obter plano atual
            current_plan = await self.db_service.get_user_plan(user_id)
            
            # Obter histórico de sessões
            sessions = await self.db_service.get_user_sessions(
                user_id=user_id,
                limit=limit
            )
            
            # Filtrar por domínio se especificado
            if domain and profile_analysis:
                domain_priorities = profile_analysis.domain_priorities
                if domain in domain_priorities:
                    domain_score = domain_priorities[domain]
                else:
                    domain_score = 0
            else:
                domain_score = None
            
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
    
    @tool
    async def update_user_plan_tool(
        self,
        user_id: str,
        updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Atualiza um plano existente do usuário
        
        Args:
            user_id: ID do usuário
            updates: Atualizações a serem aplicadas
            
        Returns:
            Plano atualizado
        """
        try:
            logger.info(f"Ferramenta: Atualizando plano para usuário {user_id}")
            
            # Recuperar plano atual
            current_plan = await self.db_service.get_user_plan(user_id)
            if not current_plan:
                return {
                    "success": False,
                    "error": f"Plano não encontrado para usuário {user_id}",
                    "user_id": user_id,
                    "timestamp": datetime.now().isoformat()
                }
            
            # Aplicar atualizações
            updated_plan = await self.plan_generator.update_plan(
                current_plan=current_plan,
                updates=updates
            )
            
            # Salvar plano atualizado
            await self.db_service.save_user_plan(
                user_id=user_id,
                plan=updated_plan
            )
            
            return {
                "success": True,
                "message": "Plano atualizado com sucesso",
                "updated_plan": updated_plan.dict(),
                "user_id": user_id,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro na ferramenta update_user_plan_tool: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "user_id": user_id,
                "timestamp": datetime.now().isoformat()
            }
    
    @tool
    async def get_recommendations_tool(
        self,
        user_id: str,
        domain: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Gera recomendações personalizadas para o usuário
        
        Args:
            user_id: ID do usuário
            domain: Domínio específico (opcional)
            
        Returns:
            Recomendações personalizadas
        """
        try:
            logger.info(f"Ferramenta: Gerando recomendações para usuário {user_id}")
            
            # Recuperar análise de perfil
            profile_analysis = await self.db_service.get_profile_analysis(user_id)
            if not profile_analysis:
                return {
                    "success": False,
                    "error": f"Análise de perfil não encontrada para usuário {user_id}",
                    "user_id": user_id,
                    "timestamp": datetime.now().isoformat()
                }
            
            # Converter domínio se especificado
            life_domain = None
            if domain:
                try:
                    life_domain = LifeDomain(domain)
                except ValueError:
                    return {
                        "success": False,
                        "error": f"Domínio inválido: {domain}",
                        "user_id": user_id,
                        "timestamp": datetime.now().isoformat()
                    }
            
            # Gerar recomendações
            recommendations = await self.profile_analyzer.generate_recommendations(
                profile_analysis=profile_analysis,
                domain=life_domain
            )
            
            return {
                "success": True,
                "message": "Recomendações geradas com sucesso",
                "recommendations": recommendations,
                "user_id": user_id,
                "domain": domain,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro na ferramenta get_recommendations_tool: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "user_id": user_id,
                "timestamp": datetime.now().isoformat()
            }
