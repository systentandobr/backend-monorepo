"""
Matcher de templates
Encontra o template mais adequado baseado no perfil do usuário
"""

import logging
import json
import os
from typing import Dict, List, Any, Optional
from pathlib import Path

from models.schemas import (
    ProfileAnalysis,
    TemplateMatch,
    UserProfileType,
    LifeDomain,
    TemplateMetadata
)
from utils.config import Settings

logger = logging.getLogger(__name__)

class TemplateMatcher:
    """
    Responsável por encontrar o template mais adequado
    baseado na análise do perfil do usuário
    """
    
    def __init__(self):
        self.settings = Settings()
        self.initialized = False
        self.templates_dir = Path(__file__).parent.parent / "templates"
        self.templates_cache = {}
        self.template_metadata = {}
        
        # Pesos para diferentes critérios de matching
        self.matching_weights = {
            'profile_type': 0.4,
            'domain_priorities': 0.3,
            'life_stage': 0.2,
            'energy_level': 0.1
        }
    
    async def initialize(self):
        """Inicializar o matcher de templates"""
        if self.initialized:
            return
            
        logger.info("Inicializando TemplateMatcher...")
        
        # Carregar templates disponíveis
        await self._load_templates()
        
        self.initialized = True
        logger.info("TemplateMatcher inicializado com sucesso")
    
    async def _load_templates(self):
        """Carrega todos os templates disponíveis"""
        try:
            # Criar diretório de templates se não existir
            self.templates_dir.mkdir(exist_ok=True)
            
            # Carregar templates JSON
            for template_file in self.templates_dir.glob("*.json"):
                try:
                    with open(template_file, 'r', encoding='utf-8') as f:
                        template_data = json.load(f)
                    
                    template_id = template_file.stem
                    self.templates_cache[template_id] = template_data
                    
                    # Extrair metadados
                    metadata = self._extract_template_metadata(template_id, template_data)
                    self.template_metadata[template_id] = metadata
                    
                    logger.info(f"Template carregado: {template_id}")
                    
                except Exception as e:
                    logger.error(f"Erro ao carregar template {template_file}: {str(e)}")
            
            # Se não há templates, criar templates padrão
            if not self.templates_cache:
                await self._create_default_templates()
            
            logger.info(f"Total de templates carregados: {len(self.templates_cache)}")
            
        except Exception as e:
            logger.error(f"Erro ao carregar templates: {str(e)}")
            raise
    
    async def _create_default_templates(self):
        """Cria templates padrão baseados nos perfis identificados"""
        logger.info("Criando templates padrão...")
        
        default_templates = {
            'health_focused_template': {
                'name': 'Template Foco em Saúde',
                'description': 'Template para usuários com foco em saúde e bem-estar',
                'target_profiles': [UserProfileType.HEALTH_FOCUSED, UserProfileType.RECOVERY],
                'domains_covered': [LifeDomain.HEALTHNESS, LifeDomain.SPIRITUALITY],
                'difficulty_level': 5,
                'estimated_duration_weeks': 12,
                'template': self._get_health_template()
            },
            'financial_focused_template': {
                'name': 'Template Foco Financeiro',
                'description': 'Template para usuários com foco em finanças e investimentos',
                'target_profiles': [UserProfileType.FINANCIAL_FOCUSED],
                'domains_covered': [LifeDomain.FINANCES, LifeDomain.PRODUCTIVITY],
                'difficulty_level': 6,
                'estimated_duration_weeks': 16,
                'template': self._get_financial_template()
            },
            'business_focused_template': {
                'name': 'Template Foco em Negócios',
                'description': 'Template para usuários com foco em empreendedorismo',
                'target_profiles': [UserProfileType.BUSINESS_FOCUSED],
                'domains_covered': [LifeDomain.BUSINESS, LifeDomain.PRODUCTIVITY, LifeDomain.LEARNING],
                'difficulty_level': 7,
                'estimated_duration_weeks': 20,
                'template': self._get_business_template()
            },
            'learning_focused_template': {
                'name': 'Template Foco em Aprendizado',
                'description': 'Template para usuários com foco em desenvolvimento pessoal',
                'target_profiles': [UserProfileType.LEARNING_FOCUSED],
                'domains_covered': [LifeDomain.LEARNING, LifeDomain.PRODUCTIVITY],
                'difficulty_level': 4,
                'estimated_duration_weeks': 12,
                'template': self._get_learning_template()
            },
            'balanced_template': {
                'name': 'Template Equilibrado',
                'description': 'Template para usuários que buscam equilíbrio em múltiplas áreas',
                'target_profiles': [UserProfileType.BALANCED],
                'domains_covered': [LifeDomain.HEALTHNESS, LifeDomain.FINANCES, LifeDomain.PRODUCTIVITY],
                'difficulty_level': 5,
                'estimated_duration_weeks': 16,
                'template': self._get_balanced_template()
            },
            'performance_template': {
                'name': 'Template de Alta Performance',
                'description': 'Template para usuários com foco em performance e produtividade',
                'target_profiles': [UserProfileType.PERFORMANCE],
                'domains_covered': [LifeDomain.PRODUCTIVITY, LifeDomain.HEALTHNESS, LifeDomain.LEARNING],
                'difficulty_level': 8,
                'estimated_duration_weeks': 24,
                'template': self._get_performance_template()
            }
        }
        
        # Salvar templates padrão
        for template_id, template_data in default_templates.items():
            template_file = self.templates_dir / f"{template_id}.json"
            
            with open(template_file, 'w', encoding='utf-8') as f:
                json.dump(template_data, f, indent=2, ensure_ascii=False)
            
            self.templates_cache[template_id] = template_data['template']
            self.template_metadata[template_id] = TemplateMetadata(
                id=template_id,
                name=template_data['name'],
                description=template_data['description'],
                target_profiles=template_data['target_profiles'],
                difficulty_level=template_data['difficulty_level'],
                domains_covered=template_data['domains_covered'],
                estimated_duration_weeks=template_data['estimated_duration_weeks']
            )
    
    def _extract_template_metadata(self, template_id: str, template_data: Dict[str, Any]) -> TemplateMetadata:
        """Extrai metadados de um template"""
        return TemplateMetadata(
            id=template_id,
            name=template_data.get('name', template_id),
            description=template_data.get('description', ''),
            target_profiles=template_data.get('target_profiles', []),
            difficulty_level=template_data.get('difficulty_level', 5),
            domains_covered=template_data.get('domains_covered', []),
            estimated_duration_weeks=template_data.get('estimated_duration_weeks', 12),
            tags=template_data.get('tags', [])
        )
    
    async def find_best_template(self, profile_analysis: ProfileAnalysis) -> TemplateMatch:
        """
        Encontra o template mais adequado para o perfil do usuário
        
        Args:
            profile_analysis: Análise do perfil do usuário
            
        Returns:
            TemplateMatch com o melhor template e customizações
        """
        logger.info(f"Procurando melhor template para usuário {profile_analysis.user_id}")
        
        if not self.templates_cache:
            raise ValueError("Nenhum template disponível")
        
        best_match = None
        best_score = 0.0
        
        for template_id, template_data in self.templates_cache.items():
            # Calcular score de matching
            match_score = await self._calculate_template_score(
                template_id=template_id,
                template_data=template_data,
                profile_analysis=profile_analysis
            )
            
            logger.info(f"Template {template_id}: score {match_score}")
            
            if match_score > best_score:
                best_score = match_score
                best_match = template_id
        
        if not best_match:
            raise ValueError("Nenhum template adequado encontrado")
        
        # Gerar customizações
        customizations = await self._generate_customizations(
            template_id=best_match,
            profile_analysis=profile_analysis
        )
        
        # Gerar reasoning
        reasoning = await self._generate_matching_reasoning(
            template_id=best_match,
            profile_analysis=profile_analysis,
            match_score=best_score
        )
        
        return TemplateMatch(
            template_id=best_match,
            template_name=self.template_metadata[best_match].name,
            match_score=best_score,
            template=self.templates_cache[best_match],
            customizations=customizations,
            reasoning=reasoning
        )
    
    async def _calculate_template_score(
        self,
        template_id: str,
        template_data: Dict[str, Any],
        profile_analysis: ProfileAnalysis
    ) -> float:
        """Calcula score de matching entre template e perfil"""
        
        score = 0.0
        metadata = self.template_metadata.get(template_id)
        
        if not metadata:
            return 0.0
        
        # 1. Matching por tipo de perfil
        profile_type_score = 0.0
        if profile_analysis.profile.profile_type in metadata.target_profiles:
            profile_type_score = 1.0
        elif any(profile in metadata.target_profiles for profile in [UserProfileType.BALANCED]):
            profile_type_score = 0.7
        
        score += profile_type_score * self.matching_weights['profile_type']
        
        # 2. Matching por domínios prioritários
        domain_score = 0.0
        user_priorities = profile_analysis.domain_priorities
        template_domains = set(metadata.domains_covered)
        
        for domain, priority in user_priorities.items():
            if domain in template_domains:
                domain_score += priority / 100.0
        
        if template_domains:
            domain_score = domain_score / len(template_domains)
        
        score += domain_score * self.matching_weights['domain_priorities']
        
        # 3. Matching por estágio de vida
        life_stage_score = 0.5  # Score base
        if profile_analysis.profile.life_stage:
            # Lógica específica por estágio de vida pode ser implementada aqui
            life_stage_score = 0.8
        
        score += life_stage_score * self.matching_weights['life_stage']
        
        # 4. Matching por nível de energia
        energy_score = 0.5  # Score base
        if profile_analysis.profile.energy_level:
            energy_level = profile_analysis.profile.energy_level
            difficulty = metadata.difficulty_level
            
            # Ajustar score baseado na compatibilidade energia-dificuldade
            if energy_level >= 7 and difficulty <= 6:
                energy_score = 1.0
            elif energy_level >= 5 and difficulty <= 7:
                energy_score = 0.8
            elif energy_level >= 3 and difficulty <= 5:
                energy_score = 0.6
            else:
                energy_score = 0.3
        
        score += energy_score * self.matching_weights['energy_level']
        
        return min(score, 1.0) * 100  # Converter para porcentagem
    
    async def _generate_customizations(
        self,
        template_id: str,
        profile_analysis: ProfileAnalysis
    ) -> Dict[str, Any]:
        """Gera customizações específicas para o usuário"""
        
        customizations = {
            'user_specific': {},
            'domain_adjustments': {},
            'difficulty_adjustments': {},
            'schedule_adjustments': {}
        }
        
        # Ajustes baseados no perfil do usuário
        profile = profile_analysis.profile
        
        # Ajustes de dificuldade baseados no nível de energia
        if profile.energy_level:
            if profile.energy_level < 4:
                customizations['difficulty_adjustments']['reduce_intensity'] = True
                customizations['difficulty_adjustments']['extend_duration'] = True
            elif profile.energy_level > 7:
                customizations['difficulty_adjustments']['increase_intensity'] = True
                customizations['difficulty_adjustments']['accelerate_progress'] = True
        
        # Ajustes de horário baseados na disponibilidade
        if profile.time_availability:
            if profile.time_availability < 4:
                customizations['schedule_adjustments']['compact_routines'] = True
                customizations['schedule_adjustments']['focus_priorities'] = True
            elif profile.time_availability > 7:
                customizations['schedule_adjustments']['expand_routines'] = True
                customizations['schedule_adjustments']['add_optional_activities'] = True
        
        # Ajustes por domínio baseados nas prioridades
        for domain, priority in profile_analysis.domain_priorities.items():
            if priority > 80:
                customizations['domain_adjustments'][domain.value] = {
                    'increase_focus': True,
                    'add_specific_goals': True
                }
            elif priority < 30:
                customizations['domain_adjustments'][domain.value] = {
                    'reduce_focus': True,
                    'simplify_goals': True
                }
        
        # Ajustes específicos do usuário
        if profile.primary_concerns:
            customizations['user_specific']['primary_concerns'] = profile.primary_concerns
        
        if profile.interests:
            customizations['user_specific']['interests'] = profile.interests
        
        return customizations
    
    async def _generate_matching_reasoning(
        self,
        template_id: str,
        profile_analysis: ProfileAnalysis,
        match_score: float
    ) -> List[str]:
        """Gera explicação sobre por que o template foi escolhido"""
        
        reasoning = []
        metadata = self.template_metadata.get(template_id)
        
        if not metadata:
            return ["Template selecionado com base em critérios gerais"]
        
        # Explicação baseada no tipo de perfil
        if profile_analysis.profile.profile_type in metadata.target_profiles:
            reasoning.append(f"Template ideal para perfil {profile_analysis.profile.profile_type.value}")
        else:
            reasoning.append(f"Template compatível com perfil {profile_analysis.profile.profile_type.value}")
        
        # Explicação baseada nos domínios cobertos
        covered_domains = [domain.value for domain in metadata.domains_covered]
        reasoning.append(f"Cobre domínios: {', '.join(covered_domains)}")
        
        # Explicação baseada no score
        if match_score > 80:
            reasoning.append("Alta compatibilidade identificada")
        elif match_score > 60:
            reasoning.append("Compatibilidade moderada com ajustes necessários")
        else:
            reasoning.append("Compatibilidade básica, customizações recomendadas")
        
        # Explicação baseada nas prioridades do usuário
        top_priorities = sorted(
            profile_analysis.domain_priorities.items(),
            key=lambda x: x[1],
            reverse=True
        )[:3]
        
        priority_domains = [domain.value for domain, _ in top_priorities]
        reasoning.append(f"Alinhado com prioridades do usuário: {', '.join(priority_domains)}")
        
        return reasoning
    
    async def list_all_templates(self) -> List[TemplateMetadata]:
        """Lista todos os templates disponíveis"""
        return list(self.template_metadata.values())
    
    async def get_template(self, template_id: str) -> Optional[Dict[str, Any]]:
        """Obtém um template específico"""
        return self.templates_cache.get(template_id)
    
    # Métodos para criar templates padrão
    def _get_health_template(self) -> Dict[str, Any]:
        """Template focado em saúde"""
        return {
            "schema_version": "1.0.0",
            "template_type": "health_focused",
            "domains": {
                "healthness": {
                    "goals": [
                        {"id": "physical_health", "label": "Melhorar saúde física", "priority": 10},
                        {"id": "mental_health", "label": "Reduzir estresse", "priority": 9},
                        {"id": "nutrition", "label": "Melhorar alimentação", "priority": 8}
                    ],
                    "habits": [
                        {"id": "exercise", "name": "Exercício diário", "icon": "activity", "color": "#27AE60"},
                        {"id": "meditation", "name": "Meditação", "icon": "heart", "color": "#8E44AD"},
                        {"id": "hydration", "name": "Hidratação", "icon": "droplets", "color": "#3498DB"}
                    ]
                }
            }
        }
    
    def _get_financial_template(self) -> Dict[str, Any]:
        """Template focado em finanças"""
        return {
            "schema_version": "1.0.0",
            "template_type": "financial_focused",
            "domains": {
                "finances": {
                    "goals": [
                        {"id": "emergency_fund", "label": "Criar fundo de emergência", "priority": 10},
                        {"id": "debt_reduction", "label": "Reduzir dívidas", "priority": 9},
                        {"id": "investment_start", "label": "Iniciar investimentos", "priority": 8}
                    ],
                    "habits": [
                        {"id": "budget_tracking", "name": "Controle de orçamento", "icon": "calculator", "color": "#27AE60"},
                        {"id": "savings_goal", "name": "Poupança automática", "icon": "piggy-bank", "color": "#2E86AB"}
                    ]
                }
            }
        }
    
    def _get_business_template(self) -> Dict[str, Any]:
        """Template focado em negócios"""
        return {
            "schema_version": "1.0.0",
            "template_type": "business_focused",
            "domains": {
                "business": {
                    "goals": [
                        {"id": "business_plan", "label": "Desenvolver plano de negócios", "priority": 10},
                        {"id": "market_research", "label": "Pesquisa de mercado", "priority": 9},
                        {"id": "client_acquisition", "label": "Aquisição de clientes", "priority": 8}
                    ],
                    "habits": [
                        {"id": "business_planning", "name": "Planejamento de negócios", "icon": "briefcase", "color": "#E67E22"},
                        {"id": "networking", "name": "Networking", "icon": "users", "color": "#3498DB"}
                    ]
                }
            }
        }
    
    def _get_learning_template(self) -> Dict[str, Any]:
        """Template focado em aprendizado"""
        return {
            "schema_version": "1.0.0",
            "template_type": "learning_focused",
            "domains": {
                "learning": {
                    "goals": [
                        {"id": "skill_development", "label": "Desenvolver novas habilidades", "priority": 10},
                        {"id": "knowledge_expansion", "label": "Expandir conhecimento", "priority": 9},
                        {"id": "certification", "label": "Obter certificações", "priority": 8}
                    ],
                    "habits": [
                        {"id": "daily_learning", "name": "Aprendizado diário", "icon": "book", "color": "#8E44AD"},
                        {"id": "skill_practice", "name": "Prática de habilidades", "icon": "target", "color": "#E67E22"}
                    ]
                }
            }
        }
    
    def _get_balanced_template(self) -> Dict[str, Any]:
        """Template equilibrado"""
        return {
            "schema_version": "1.0.0",
            "template_type": "balanced",
            "domains": {
                "healthness": {
                    "goals": [{"id": "overall_health", "label": "Manter saúde geral", "priority": 8}],
                    "habits": [{"id": "basic_exercise", "name": "Exercício básico", "icon": "activity", "color": "#27AE60"}]
                },
                "finances": {
                    "goals": [{"id": "financial_stability", "label": "Estabilidade financeira", "priority": 7}],
                    "habits": [{"id": "basic_savings", "name": "Poupança básica", "icon": "piggy-bank", "color": "#2E86AB"}]
                },
                "productivity": {
                    "goals": [{"id": "time_management", "label": "Melhorar gestão do tempo", "priority": 8}],
                    "habits": [{"id": "planning", "name": "Planejamento diário", "icon": "calendar", "color": "#8E44AD"}]
                }
            }
        }
    
    def _get_performance_template(self) -> Dict[str, Any]:
        """Template de alta performance"""
        return {
            "schema_version": "1.0.0",
            "template_type": "performance",
            "domains": {
                "productivity": {
                    "goals": [
                        {"id": "peak_performance", "label": "Alcançar pico de performance", "priority": 10},
                        {"id": "goal_achievement", "label": "Alcançar metas ambiciosas", "priority": 9}
                    ],
                    "habits": [
                        {"id": "morning_routine", "name": "Rotina matinal", "icon": "sunrise", "color": "#F39C12"},
                        {"id": "evening_review", "name": "Revisão noturna", "icon": "moon", "color": "#34495E"}
                    ]
                },
                "healthness": {
                    "goals": [{"id": "optimal_health", "label": "Saúde otimizada", "priority": 9}],
                    "habits": [{"id": "intense_exercise", "name": "Exercício intenso", "icon": "activity", "color": "#E74C3C"}]
                }
            }
        }
