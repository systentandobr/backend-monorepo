"""
Analisador de perfil do usuário
Processa respostas do onboarding e identifica padrões e necessidades
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import json

from models.schemas import (
    ProfileAnalysis,
    UserProfile,
    UserProfileType,
    LifeDomain,
    AnalysisResult
)
from utils.config import Settings

logger = logging.getLogger(__name__)

class ProfileAnalyzer:
    """
    Analisador responsável por processar respostas do onboarding
    e identificar o perfil e necessidades do usuário
    """
    
    def __init__(self):
        self.settings = Settings()
        self.initialized = False
        
        # Mapeamento de respostas para perfis
        self.profile_mapping = {
            'health_focused': {
                'indicators': ['health_concerns', 'physical_activity', 'nutrition_focus'],
                'keywords': ['saúde', 'exercício', 'alimentação', 'bem-estar', 'fitness']
            },
            'financial_focused': {
                'indicators': ['financial_goals', 'investment_interest', 'savings_focus'],
                'keywords': ['investimento', 'economia', 'finanças', 'poupança', 'renda']
            },
            'business_focused': {
                'indicators': ['business_interests', 'entrepreneur_profile', 'business_planning'],
                'keywords': ['negócio', 'empreendedorismo', 'empresa', 'startup', 'carreira']
            },
            'learning_focused': {
                'indicators': ['learning_areas', 'skill_development', 'education_goals'],
                'keywords': ['estudo', 'aprendizado', 'habilidades', 'conhecimento', 'curso']
            },
            'balanced': {
                'indicators': ['balanced_interests', 'multiple_domains'],
                'keywords': ['equilíbrio', 'harmonia', 'diversidade']
            },
            'recovery': {
                'indicators': ['health_issues', 'stress_level', 'recovery_needs'],
                'keywords': ['recuperação', 'saúde', 'estresse', 'cuidado', 'tratamento']
            },
            'performance': {
                'indicators': ['high_energy', 'goal_achievement', 'productivity_focus'],
                'keywords': ['performance', 'alta energia', 'metas', 'produtividade']
            }
        }
        
        # Mapeamento de domínios da vida
        self.domain_mapping = {
            LifeDomain.HEALTHNESS: {
                'indicators': ['lifestyle', 'energy', 'health_concerns', 'physical_activity'],
                'weight': 1.0
            },
            LifeDomain.FINANCES: {
                'indicators': ['financial_goals', 'monthly_income', 'monthly_savings', 'investment_interest'],
                'weight': 1.0
            },
            LifeDomain.BUSINESS: {
                'indicators': ['business_interests', 'entrepreneur_profile', 'business_planning'],
                'weight': 1.0
            },
            LifeDomain.PRODUCTIVITY: {
                'indicators': ['concentration', 'time_management', 'goal_achievement'],
                'weight': 1.0
            },
            LifeDomain.LEARNING: {
                'indicators': ['learning_areas', 'skill_development', 'education_goals'],
                'weight': 1.0
            },
            LifeDomain.SPIRITUALITY: {
                'indicators': ['spiritual_practices', 'mindfulness', 'values'],
                'weight': 0.8
            },
            LifeDomain.RELATIONSHIPS: {
                'indicators': ['social_interests', 'relationship_goals', 'family_focus'],
                'weight': 0.9
            }
        }
    
    async def initialize(self):
        """Inicializar o analisador"""
        if self.initialized:
            return
            
        logger.info("Inicializando ProfileAnalyzer...")
        self.initialized = True
        logger.info("ProfileAnalyzer inicializado com sucesso")
    
    async def analyze_responses(
        self, 
        user_id: str, 
        answers: Dict[str, Any]
    ) -> ProfileAnalysis:
        """
        Analisa as respostas do onboarding e gera análise de perfil
        
        Args:
            user_id: ID do usuário
            answers: Respostas do questionário de onboarding
            
        Returns:
            ProfileAnalysis com análise completa do perfil
        """
        logger.info(f"Analisando respostas para usuário {user_id}")
        
        try:
            # 1. Identificar tipo de perfil
            profile_type = await self._identify_profile_type(answers)
            
            # 2. Criar perfil do usuário
            user_profile = await self._create_user_profile(user_id, answers, profile_type)
            
            # 3. Analisar prioridades por domínio
            domain_priorities = await self._analyze_domain_priorities(answers)
            
            # 4. Identificar insights chave
            key_insights = await self._generate_key_insights(answers, profile_type)
            
            # 5. Identificar fatores de risco
            risk_factors = await self._identify_risk_factors(answers)
            
            # 6. Identificar oportunidades
            opportunities = await self._identify_opportunities(answers, profile_type)
            
            # 7. Calcular scores
            analysis_score = await self._calculate_analysis_score(answers)
            confidence_level = await self._calculate_confidence_level(answers)
            
            # 8. Determinar foco recomendado
            recommended_focus = await self._determine_recommended_focus(domain_priorities)
            
            return ProfileAnalysis(
                user_id=user_id,
                profile=user_profile,
                domain_priorities=domain_priorities,
                key_insights=key_insights,
                recommended_focus=recommended_focus,
                risk_factors=risk_factors,
                opportunities=opportunities,
                analysis_score=analysis_score,
                confidence_level=confidence_level
            )
            
        except Exception as e:
            logger.error(f"Erro na análise de respostas: {str(e)}")
            raise
    
    async def _identify_profile_type(self, answers: Dict[str, Any]) -> UserProfileType:
        """Identifica o tipo de perfil baseado nas respostas"""
        
        profile_scores = {profile: 0.0 for profile in UserProfileType}
        
        # Analisar respostas específicas
        for profile, config in self.profile_mapping.items():
            score = 0.0
            
            # Verificar indicadores específicos
            for indicator in config['indicators']:
                if indicator in answers:
                    value = answers[indicator]
                    if isinstance(value, (list, tuple)):
                        score += len(value) * 2  # Listas têm peso maior
                    elif isinstance(value, str):
                        # Verificar se contém palavras-chave
                        for keyword in config['keywords']:
                            if keyword.lower() in value.lower():
                                score += 1
                    elif isinstance(value, (int, float)):
                        score += value / 10  # Normalizar valores numéricos
            
            profile_scores[UserProfileType(profile)] = score
        
        # Determinar perfil com maior score
        best_profile = max(profile_scores.items(), key=lambda x: x[1])
        
        logger.info(f"Perfil identificado: {best_profile[0]} (score: {best_profile[1]})")
        
        return best_profile[0]
    
    async def _create_user_profile(
        self, 
        user_id: str, 
        answers: Dict[str, Any], 
        profile_type: UserProfileType
    ) -> UserProfile:
        """Cria o perfil do usuário baseado nas respostas"""
        
        # Extrair informações básicas
        age = answers.get('age')
        gender = answers.get('gender')
        life_stage = answers.get('life_stage')
        
        # Identificar preocupações primárias
        primary_concerns = []
        if answers.get('health_concerns'):
            primary_concerns.append('saúde')
        if answers.get('financial_concerns'):
            primary_concerns.append('finanças')
        if answers.get('stress_level', 0) > 7:
            primary_concerns.append('estresse')
        
        # Identificar interesses
        interests = []
        if answers.get('personal_interests'):
            interests.extend(answers['personal_interests'])
        if answers.get('learning_areas'):
            interests.extend(answers['learning_areas'])
        if answers.get('business_interests'):
            interests.extend(answers['business_interests'])
        
        # Extrair níveis
        time_availability = answers.get('time_availability', 5)
        energy_level = answers.get('energy_level', 5)
        stress_level = answers.get('stress_level', 5)
        
        # Extrair horários
        wakeup_time = answers.get('wakeup_time', '07:00')
        sleep_time = answers.get('sleep_time', '23:00')
        
        return UserProfile(
            user_id=user_id,
            profile_type=profile_type,
            age=age,
            gender=gender,
            life_stage=life_stage,
            primary_concerns=primary_concerns,
            interests=interests,
            time_availability=time_availability,
            energy_level=energy_level,
            stress_level=stress_level,
            wakeup_time=wakeup_time,
            sleep_time=sleep_time
        )
    
    async def _analyze_domain_priorities(self, answers: Dict[str, Any]) -> Dict[LifeDomain, float]:
        """Analisa as prioridades por domínio da vida"""
        
        domain_scores = {}
        
        for domain, config in self.domain_mapping.items():
            score = 0.0
            
            # Analisar indicadores do domínio
            for indicator in config['indicators']:
                if indicator in answers:
                    value = answers[indicator]
                    
                    if isinstance(value, (list, tuple)):
                        score += len(value) * 2
                    elif isinstance(value, str):
                        # Verificar relevância da resposta
                        if any(keyword in value.lower() for keyword in ['alto', 'muito', 'importante', 'prioridade']):
                            score += 3
                        elif any(keyword in value.lower() for keyword in ['médio', 'moderado', 'interesse']):
                            score += 2
                        else:
                            score += 1
                    elif isinstance(value, (int, float)):
                        # Normalizar valores numéricos (assumindo escala 1-10)
                        score += (value / 10) * 5
            
            # Aplicar peso do domínio
            domain_scores[domain] = score * config['weight']
        
        # Normalizar scores para 0-100
        max_score = max(domain_scores.values()) if domain_scores else 1
        normalized_scores = {
            domain: (score / max_score) * 100 
            for domain, score in domain_scores.items()
        }
        
        return normalized_scores
    
    async def _generate_key_insights(self, answers: Dict[str, Any], profile_type: UserProfileType) -> List[str]:
        """Gera insights chave baseados nas respostas"""
        
        insights = []
        
        # Análise de energia e foco
        if answers.get('energy') == 'low-energy':
            insights.append("Usuário apresenta baixa energia ao longo do dia, sugerindo necessidade de otimização de rotina")
        
        if answers.get('concentration') == 'low-focus':
            insights.append("Dificuldade de concentração identificada, indicando necessidade de estratégias de foco")
        
        # Análise de estilo de vida
        if answers.get('lifestyle') == 'not-satisfied':
            insights.append("Insatisfação com estilo de vida atual, indicando alto potencial de mudança")
        
        # Análise de objetivos financeiros
        if answers.get('financial_goals'):
            insights.append(f"Foco em {len(answers['financial_goals'])} objetivos financeiros específicos")
        
        # Análise de interesses de negócio
        if answers.get('business_interests'):
            insights.append(f"Interesse em {len(answers['business_interests'])} áreas de negócio")
        
        # Análise de aprendizado
        if answers.get('learning_areas'):
            insights.append(f"Busca por desenvolvimento em {len(answers['learning_areas'])} áreas de conhecimento")
        
        # Análise de mindset
        mindset_scores = {}
        for key, value in answers.items():
            if 'mindset' in key and isinstance(value, (int, float)):
                mindset_scores[key] = value
        
        if mindset_scores:
            avg_mindset = sum(mindset_scores.values()) / len(mindset_scores)
            if avg_mindset > 7:
                insights.append("Mindset positivo identificado, indicando alta propensão para mudanças")
            elif avg_mindset < 4:
                insights.append("Mindset pode precisar de desenvolvimento, sugerindo abordagem mais gradual")
        
        return insights
    
    async def _identify_risk_factors(self, answers: Dict[str, Any]) -> List[str]:
        """Identifica fatores de risco baseados nas respostas"""
        
        risks = []
        
        # Risco de estresse
        if answers.get('stress_level', 0) > 7:
            risks.append("Alto nível de estresse pode comprometer aderência ao plano")
        
        # Risco de falta de tempo
        if answers.get('time_availability', 5) < 3:
            risks.append("Baixa disponibilidade de tempo pode dificultar implementação de rotinas")
        
        # Risco de baixa energia
        if answers.get('energy') == 'low-energy':
            risks.append("Baixa energia pode limitar capacidade de implementar mudanças")
        
        # Risco de falta de foco
        if answers.get('concentration') == 'low-focus':
            risks.append("Dificuldade de concentração pode afetar consistência")
        
        # Risco de insatisfação
        if answers.get('lifestyle') == 'not-satisfied':
            risks.append("Alta insatisfação pode gerar expectativas irreais")
        
        return risks
    
    async def _identify_opportunities(self, answers: Dict[str, Any], profile_type: UserProfileType) -> List[str]:
        """Identifica oportunidades baseadas no perfil"""
        
        opportunities = []
        
        # Oportunidades baseadas no tipo de perfil
        if profile_type == UserProfileType.HEALTH_FOCUSED:
            opportunities.append("Alto potencial para desenvolvimento de rotinas de saúde e bem-estar")
        
        elif profile_type == UserProfileType.FINANCIAL_FOCUSED:
            opportunities.append("Excelente oportunidade para implementar estratégias financeiras")
        
        elif profile_type == UserProfileType.BUSINESS_FOCUSED:
            opportunities.append("Potencial para desenvolvimento de habilidades empreendedoras")
        
        elif profile_type == UserProfileType.LEARNING_FOCUSED:
            opportunities.append("Ótima oportunidade para desenvolvimento de habilidades e conhecimento")
        
        # Oportunidades baseadas em respostas específicas
        if answers.get('personal_interests'):
            opportunities.append(f"Interesses pessoais diversificados ({len(answers['personal_interests'])} áreas)")
        
        if answers.get('learning_areas'):
            opportunities.append(f"Áreas de aprendizado bem definidas ({len(answers['learning_areas'])} focos)")
        
        if answers.get('financial_goals'):
            opportunities.append(f"Objetivos financeiros claros ({len(answers['financial_goals'])} metas)")
        
        return opportunities
    
    async def _calculate_analysis_score(self, answers: Dict[str, Any]) -> float:
        """Calcula score de qualidade da análise"""
        
        score = 50.0  # Score base
        
        # Bônus por completude das respostas
        required_fields = ['concentration', 'lifestyle', 'energy', 'wakeupTime', 'sleepTime']
        completed_fields = sum(1 for field in required_fields if field in answers)
        score += (completed_fields / len(required_fields)) * 30
        
        # Bônus por detalhamento
        detailed_responses = 0
        for value in answers.values():
            if isinstance(value, str) and len(value) > 20:
                detailed_responses += 1
            elif isinstance(value, list) and len(value) > 1:
                detailed_responses += 1
        
        score += min(detailed_responses * 5, 20)
        
        return min(score, 100.0)
    
    async def _calculate_confidence_level(self, answers: Dict[str, Any]) -> float:
        """Calcula nível de confiança da análise"""
        
        confidence = 60.0  # Confiança base
        
        # Aumentar confiança com respostas consistentes
        if 'mindset' in str(answers):
            confidence += 10
        
        if 'financial_goals' in answers:
            confidence += 10
        
        if 'learning_areas' in answers:
            confidence += 10
        
        if 'business_interests' in answers:
            confidence += 10
        
        return min(confidence, 100.0)
    
    async def _determine_recommended_focus(self, domain_priorities: Dict[LifeDomain, float]) -> List[LifeDomain]:
        """Determina foco recomendado baseado nas prioridades dos domínios"""
        
        # Ordenar domínios por prioridade
        sorted_domains = sorted(
            domain_priorities.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        
        # Retornar top 3 domínios
        return [domain for domain, _ in sorted_domains[:3]]
    
    async def generate_recommendations(
        self, 
        profile_analysis: ProfileAnalysis,
        domain: Optional[LifeDomain] = None
    ) -> Dict[str, Any]:
        """Gera recomendações personalizadas baseadas na análise"""
        
        recommendations = {
            'general_recommendations': [],
            'domain_specific': {},
            'next_steps': [],
            'resources': []
        }
        
        # Recomendações gerais baseadas no tipo de perfil
        profile_type = profile_analysis.profile.profile_type
        
        if profile_type == UserProfileType.HEALTH_FOCUSED:
            recommendations['general_recommendations'].extend([
                "Foque em estabelecer rotinas de exercício gradualmente",
                "Priorize qualidade do sono e alimentação",
                "Considere práticas de mindfulness para redução de estresse"
            ])
        
        elif profile_type == UserProfileType.FINANCIAL_FOCUSED:
            recommendations['general_recommendations'].extend([
                "Estabeleça um sistema de controle financeiro",
                "Crie metas financeiras específicas e mensuráveis",
                "Desenvolva hábitos de poupança e investimento"
            ])
        
        # Recomendações por domínio
        for life_domain, priority in profile_analysis.domain_priorities.items():
            if domain and life_domain != domain:
                continue
                
            domain_recs = []
            
            if life_domain == LifeDomain.HEALTHNESS:
                domain_recs.extend([
                    "Estabeleça rotina matinal com exercícios leves",
                    "Planeje refeições com antecedência",
                    "Mantenha hidratação adequada"
                ])
            
            elif life_domain == LifeDomain.FINANCES:
                domain_recs.extend([
                    "Registre todas as despesas diariamente",
                    "Separe 10% da renda para poupança",
                    "Pesquise opções de investimento"
                ])
            
            elif life_domain == LifeDomain.BUSINESS:
                domain_recs.extend([
                    "Dedique tempo diário ao planejamento de negócios",
                    "Desenvolva networking ativo",
                    "Invista em desenvolvimento de habilidades"
                ])
            
            recommendations['domain_specific'][life_domain.value] = domain_recs
        
        # Próximos passos
        recommendations['next_steps'] = [
            "Revisar e personalizar o plano gerado",
            "Estabelecer metas semanais específicas",
            "Configurar lembretes e tracking de progresso",
            "Agendar revisão semanal do progresso"
        ]
        
        return recommendations
