"""
Gerador de planos personalizados
Cria planos específicos baseados em templates e perfil do usuário
"""

import logging
import json
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from copy import deepcopy

from models.schemas import (
    ProfileAnalysis,
    GeneratedPlan,
    TemplateMatch,
    LifeDomain,
    LifeDomainData,
    Goal,
    Habit,
    Routine,
    UserProfileType
)
from utils.config import Settings

logger = logging.getLogger(__name__)

class PlanGenerator:
    """
    Responsável por gerar planos personalizados baseados em templates
    e análise do perfil do usuário
    """
    
    def __init__(self):
        self.settings = Settings()
        self.initialized = False
        
        # Configurações de personalização
        self.customization_rules = {
            'difficulty_adjustments': {
                'reduce_intensity': {
                    'habit_duration': 0.7,  # Reduzir duração em 30%
                    'goal_priority': 0.8,   # Reduzir prioridade em 20%
                    'schedule_spacing': 1.3  # Aumentar espaçamento em 30%
                },
                'increase_intensity': {
                    'habit_duration': 1.3,  # Aumentar duração em 30%
                    'goal_priority': 1.2,   # Aumentar prioridade em 20%
                    'schedule_spacing': 0.8  # Reduzir espaçamento em 20%
                }
            },
            'schedule_adjustments': {
                'compact_routines': {
                    'max_activities_per_day': 8,
                    'min_break_duration': 15,
                    'focus_morning': True
                },
                'expand_routines': {
                    'max_activities_per_day': 15,
                    'min_break_duration': 30,
                    'distribute_throughout_day': True
                }
            }
        }
    
    async def initialize(self):
        """Inicializar o gerador de planos"""
        if self.initialized:
            return
            
        logger.info("Inicializando PlanGenerator...")
        self.initialized = True
        logger.info("PlanGenerator inicializado com sucesso")
    
    async def generate_plan(
        self,
        user_id: str,
        profile_analysis: ProfileAnalysis,
        base_template: Dict[str, Any],
        customizations: Dict[str, Any]
    ) -> GeneratedPlan:
        """
        Gera um plano personalizado baseado no template e perfil
        
        Args:
            user_id: ID do usuário
            profile_analysis: Análise do perfil do usuário
            base_template: Template base para o plano
            customizations: Customizações específicas
            
        Returns:
            GeneratedPlan personalizado
        """
        logger.info(f"Gerando plano personalizado para usuário {user_id}")
        
        try:
            # 1. Criar template match
            template_match = TemplateMatch(
                template_id="generated",
                template_name="Plano Personalizado",
                match_score=100.0,
                template=base_template,
                customizations=customizations,
                reasoning=["Plano gerado especificamente para o usuário"]
            )
            
            # 2. Personalizar domínios
            personalized_domains = await self._personalize_domains(
                base_template=base_template,
                profile_analysis=profile_analysis,
                customizations=customizations
            )
            
            # 3. Gerar rotina diária
            daily_schedule = await self._generate_daily_schedule(
                profile_analysis=profile_analysis,
                domains=personalized_domains,
                customizations=customizations
            )
            
            # 4. Gerar objetivos integrados
            integrated_goals = await self._generate_integrated_goals(
                profile_analysis=profile_analysis,
                domains=personalized_domains
            )
            
            # 5. Gerar metas semanais
            weekly_goals = await self._generate_weekly_goals(
                profile_analysis=profile_analysis,
                domains=personalized_domains
            )
            
            # 6. Aplicar customizações finais
            final_customizations = await self._apply_final_customizations(
                customizations=customizations,
                profile_analysis=profile_analysis
            )
            
            # 7. Gerar metadados
            metadata = await self._generate_plan_metadata(
                profile_analysis=profile_analysis,
                template_match=template_match
            )
            
            return GeneratedPlan(
                user_id=user_id,
                plan_id=str(uuid.uuid4()),
                template_match=template_match,
                domains=personalized_domains,
                integrated_goals=integrated_goals,
                daily_schedule=daily_schedule,
                weekly_goals=weekly_goals,
                customizations=final_customizations,
                metadata=metadata
            )
            
        except Exception as e:
            logger.error(f"Erro ao gerar plano: {str(e)}")
            raise
    
    async def _personalize_domains(
        self,
        base_template: Dict[str, Any],
        profile_analysis: ProfileAnalysis,
        customizations: Dict[str, Any]
    ) -> Dict[LifeDomain, LifeDomainData]:
        """Personaliza os domínios baseado no perfil do usuário"""
        
        personalized_domains = {}
        
        # Processar cada domínio do template
        for domain_key, domain_data in base_template.get('domains', {}).items():
            try:
                domain = LifeDomain(domain_key)
            except ValueError:
                logger.warning(f"Domínio desconhecido: {domain_key}")
                continue
            
            # Verificar se o domínio é prioritário para o usuário
            domain_priority = profile_analysis.domain_priorities.get(domain, 0)
            
            # Personalizar objetivos
            personalized_goals = await self._personalize_goals(
                goals=domain_data.get('goals', []),
                domain=domain,
                profile_analysis=profile_analysis,
                customizations=customizations
            )
            
            # Personalizar hábitos
            personalized_habits = await self._personalize_habits(
                habits=domain_data.get('habits', []),
                domain=domain,
                profile_analysis=profile_analysis,
                customizations=customizations
            )
            
            # Personalizar rotinas
            personalized_routines = await self._personalize_routines(
                routines=domain_data.get('routines', []),
                domain=domain,
                profile_analysis=profile_analysis,
                customizations=customizations
            )
            
            # Criar dados do domínio personalizado
            personalized_domains[domain] = LifeDomainData(
                goals=personalized_goals,
                habits=personalized_habits,
                routines=personalized_routines,
                custom_data={
                    'priority': domain_priority,
                    'focus_level': 'high' if domain_priority > 70 else 'medium' if domain_priority > 40 else 'low'
                }
            )
        
        return personalized_domains
    
    async def _personalize_goals(
        self,
        goals: List[Dict[str, Any]],
        domain: LifeDomain,
        profile_analysis: ProfileAnalysis,
        customizations: Dict[str, Any]
    ) -> List[Goal]:
        """Personaliza objetivos baseado no perfil"""
        
        personalized_goals = []
        
        for goal_data in goals:
            # Aplicar ajustes de dificuldade
            adjusted_priority = goal_data.get('priority', 5)
            
            difficulty_adjustments = customizations.get('difficulty_adjustments', {})
            if 'reduce_intensity' in difficulty_adjustments:
                adjusted_priority = int(adjusted_priority * 0.8)
            elif 'increase_intensity' in difficulty_adjustments:
                adjusted_priority = int(adjusted_priority * 1.2)
            
            # Ajustar baseado no domínio
            domain_priority = profile_analysis.domain_priorities.get(domain, 50)
            if domain_priority > 80:
                adjusted_priority = min(adjusted_priority + 1, 10)
            elif domain_priority < 30:
                adjusted_priority = max(adjusted_priority - 1, 1)
            
            # Criar objetivo personalizado
            personalized_goal = Goal(
                id=goal_data.get('id', f"{domain.value}_{len(personalized_goals)}"),
                label=goal_data.get('label', ''),
                priority=adjusted_priority,
                description=goal_data.get('description'),
                target_date=self._calculate_target_date(adjusted_priority),
                progress=0.0
            )
            
            personalized_goals.append(personalized_goal)
        
        return personalized_goals
    
    async def _personalize_habits(
        self,
        habits: List[Dict[str, Any]],
        domain: LifeDomain,
        profile_analysis: ProfileAnalysis,
        customizations: Dict[str, Any]
    ) -> List[Habit]:
        """Personaliza hábitos baseado no perfil"""
        
        personalized_habits = []
        
        for habit_data in habits:
            # Ajustar dificuldade baseado no nível de energia
            difficulty = habit_data.get('difficulty', 5)
            energy_level = profile_analysis.profile.energy_level or 5
            
            if energy_level < 4:
                difficulty = max(difficulty - 2, 1)
            elif energy_level > 7:
                difficulty = min(difficulty + 1, 10)
            
            # Ajustar baseado na disponibilidade de tempo
            time_availability = profile_analysis.profile.time_availability or 5
            if time_availability < 4:
                # Simplificar hábitos para usuários com pouco tempo
                if 'complex' in habit_data.get('description', '').lower():
                    continue  # Pular hábitos complexos
            
            # Criar hábito personalizado
            personalized_habit = Habit(
                id=habit_data.get('id', f"{domain.value}_habit_{len(personalized_habits)}"),
                name=habit_data.get('name', ''),
                icon=habit_data.get('icon', 'circle'),
                color=habit_data.get('color', '#3498DB'),
                description=habit_data.get('description', ''),
                target=habit_data.get('target', 'Diário'),
                timeOfDay=habit_data.get('timeOfDay', 'all'),
                difficulty=difficulty,
                category=domain.value
            )
            
            personalized_habits.append(personalized_habit)
        
        return personalized_habits
    
    async def _personalize_routines(
        self,
        routines: List[Dict[str, Any]],
        domain: LifeDomain,
        profile_analysis: ProfileAnalysis,
        customizations: Dict[str, Any]
    ) -> List[Routine]:
        """Personaliza rotinas baseado no perfil"""
        
        personalized_routines = []
        
        for routine_data in routines:
            # Ajustar duração baseado no nível de energia
            duration = routine_data.get('duration_minutes', 30)
            energy_level = profile_analysis.profile.energy_level or 5
            
            if energy_level < 4:
                duration = int(duration * 0.7)  # Reduzir duração
            elif energy_level > 7:
                duration = int(duration * 1.2)  # Aumentar duração
            
            # Criar rotina personalizada
            personalized_routine = Routine(
                time=routine_data.get('time', '09:00'),
                activity=routine_data.get('activity', ''),
                domain=domain,
                duration_minutes=duration
            )
            
            personalized_routines.append(personalized_routine)
        
        return personalized_routines
    
    async def _generate_daily_schedule(
        self,
        profile_analysis: ProfileAnalysis,
        domains: Dict[LifeDomain, LifeDomainData],
        customizations: Dict[str, Any]
    ) -> List[Routine]:
        """Gera rotina diária personalizada"""
        
        schedule = []
        
        # Obter horários de acordar e dormir
        wakeup_time = profile_analysis.profile.wakeup_time or "07:00"
        sleep_time = profile_analysis.profile.sleep_time or "23:00"
        
        # Configurações de horário
        schedule_config = customizations.get('schedule_adjustments', {})
        max_activities = schedule_config.get('max_activities_per_day', 12)
        focus_morning = schedule_config.get('focus_morning', False)
        
        # Gerar rotina base
        base_schedule = [
            {"time": "06:30", "activity": "Acordar e higiene pessoal", "domain": LifeDomain.HEALTHNESS},
            {"time": "07:00", "activity": "Café da manhã", "domain": LifeDomain.HEALTHNESS},
            {"time": "08:00", "activity": "Planejamento do dia", "domain": LifeDomain.PRODUCTIVITY},
            {"time": "12:00", "activity": "Almoço", "domain": LifeDomain.HEALTHNESS},
            {"time": "13:00", "activity": "Pausa para descanso", "domain": LifeDomain.HEALTHNESS},
            {"time": "18:00", "activity": "Jantar", "domain": LifeDomain.HEALTHNESS},
            {"time": "22:00", "activity": "Preparação para dormir", "domain": LifeDomain.HEALTHNESS},
            {"time": "22:30", "activity": "Dormir", "domain": LifeDomain.HEALTHNESS}
        ]
        
        # Adicionar atividades específicas por domínio
        for domain, domain_data in domains.items():
            domain_priority = profile_analysis.domain_priorities.get(domain, 0)
            
            if domain_priority > 50:  # Apenas domínios prioritários
                for habit in domain_data.habits[:2]:  # Máximo 2 hábitos por domínio
                    if habit.timeOfDay == 'morning':
                        schedule.append({
                            "time": "07:30",
                            "activity": habit.name,
                            "domain": domain
                        })
                    elif habit.timeOfDay == 'afternoon':
                        schedule.append({
                            "time": "14:00",
                            "activity": habit.name,
                            "domain": domain
                        })
                    elif habit.timeOfDay == 'evening':
                        schedule.append({
                            "time": "19:00",
                            "activity": habit.name,
                            "domain": domain
                        })
        
        # Ordenar por horário
        schedule.sort(key=lambda x: x['time'])
        
        # Limitar número de atividades
        if len(schedule) > max_activities:
            schedule = schedule[:max_activities]
        
        # Converter para objetos Routine
        routines = []
        for activity in schedule:
            routine = Routine(
                time=activity['time'],
                activity=activity['activity'],
                domain=activity.get('domain'),
                duration_minutes=30
            )
            routines.append(routine)
        
        return routines
    
    async def _generate_integrated_goals(
        self,
        profile_analysis: ProfileAnalysis,
        domains: Dict[LifeDomain, LifeDomainData]
    ) -> List[Dict[str, Any]]:
        """Gera objetivos integrados entre domínios"""
        
        integrated_goals = []
        
        # Objetivo de equilíbrio geral
        if len(domains) > 1:
            integrated_goals.append({
                "id": "life_balance",
                "name": "Equilíbrio de Vida",
                "domains": [domain.value for domain in domains.keys()],
                "description": "Manter equilíbrio entre diferentes áreas da vida",
                "progress": 0,
                "target_date": (datetime.now() + timedelta(weeks=12)).isoformat(),
                "key_metrics": ["Consistência em rotinas", "Progresso em objetivos"]
            })
        
        # Objetivos específicos por combinação de domínios
        domain_list = list(domains.keys())
        for i, domain1 in enumerate(domain_list):
            for domain2 in domain_list[i+1:]:
                priority1 = profile_analysis.domain_priorities.get(domain1, 0)
                priority2 = profile_analysis.domain_priorities.get(domain2, 0)
                
                if priority1 > 60 and priority2 > 60:
                    integrated_goals.append({
                        "id": f"{domain1.value}_{domain2.value}_synergy",
                        "name": f"Sinergia {domain1.value.title()}-{domain2.value.title()}",
                        "domains": [domain1.value, domain2.value],
                        "description": f"Desenvolver sinergia entre {domain1.value} e {domain2.value}",
                        "progress": 0,
                        "target_date": (datetime.now() + timedelta(weeks=8)).isoformat(),
                        "key_metrics": [f"Progresso em {domain1.value}", f"Progresso em {domain2.value}"]
                    })
        
        return integrated_goals
    
    async def _generate_weekly_goals(
        self,
        profile_analysis: ProfileAnalysis,
        domains: Dict[LifeDomain, LifeDomainData]
    ) -> List[Dict[str, Any]]:
        """Gera metas semanais específicas"""
        
        weekly_goals = []
        
        for domain, domain_data in domains.items():
            domain_priority = profile_analysis.domain_priorities.get(domain, 0)
            
            if domain_priority > 40:  # Apenas domínios relevantes
                # Meta baseada em hábitos
                if domain_data.habits:
                    weekly_goals.append({
                        "id": f"{domain.value}_habits_week",
                        "name": f"Implementar hábitos de {domain.value}",
                        "domain": domain.value,
                        "target": len(domain_data.habits),
                        "current": 0,
                        "deadline": (datetime.now() + timedelta(weeks=1)).isoformat()
                    })
                
                # Meta baseada em objetivos
                if domain_data.goals:
                    weekly_goals.append({
                        "id": f"{domain.value}_goals_week",
                        "name": f"Progresso em objetivos de {domain.value}",
                        "domain": domain.value,
                        "target": 25,  # 25% de progresso
                        "current": 0,
                        "deadline": (datetime.now() + timedelta(weeks=1)).isoformat()
                    })
        
        return weekly_goals
    
    async def _apply_final_customizations(
        self,
        customizations: Dict[str, Any],
        profile_analysis: ProfileAnalysis
    ) -> Dict[str, Any]:
        """Aplica customizações finais ao plano"""
        
        final_customizations = deepcopy(customizations)
        
        # Adicionar informações específicas do usuário
        final_customizations['user_profile'] = {
            'profile_type': profile_analysis.profile.profile_type.value,
            'energy_level': profile_analysis.profile.energy_level,
            'time_availability': profile_analysis.profile.time_availability,
            'stress_level': profile_analysis.profile.stress_level
        }
        
        # Adicionar configurações de acompanhamento
        final_customizations['monitoring'] = {
            'weekly_review': True,
            'daily_check_in': True,
            'progress_tracking': True,
            'adjustment_frequency': 'weekly'
        }
        
        # Adicionar configurações de notificações
        final_customizations['notifications'] = {
            'morning_reminder': True,
            'evening_review': True,
            'weekly_summary': True,
            'goal_reminders': True
        }
        
        return final_customizations
    
    async def _generate_plan_metadata(
        self,
        profile_analysis: ProfileAnalysis,
        template_match: TemplateMatch
    ) -> Dict[str, Any]:
        """Gera metadados do plano"""
        
        return {
            'generated_at': datetime.now().isoformat(),
            'profile_analysis_id': profile_analysis.user_id,
            'template_match_score': template_match.match_score,
            'total_domains': len(profile_analysis.domain_priorities),
            'priority_domains': [
                domain.value for domain, priority in 
                sorted(profile_analysis.domain_priorities.items(), key=lambda x: x[1], reverse=True)[:3]
            ],
            'estimated_duration_weeks': 12,
            'difficulty_level': self._calculate_overall_difficulty(profile_analysis),
            'success_probability': self._calculate_success_probability(profile_analysis)
        }
    
    def _calculate_target_date(self, priority: int) -> str:
        """Calcula data alvo baseada na prioridade"""
        if priority >= 9:
            weeks = 4
        elif priority >= 7:
            weeks = 8
        elif priority >= 5:
            weeks = 12
        else:
            weeks = 16
        
        return (datetime.now() + timedelta(weeks=weeks)).isoformat()
    
    def _calculate_overall_difficulty(self, profile_analysis: ProfileAnalysis) -> int:
        """Calcula dificuldade geral do plano"""
        energy_level = profile_analysis.profile.energy_level or 5
        stress_level = profile_analysis.profile.stress_level or 5
        time_availability = profile_analysis.profile.time_availability or 5
        
        # Fórmula de dificuldade
        difficulty = 5  # Base
        
        if energy_level < 4:
            difficulty += 2
        elif energy_level > 7:
            difficulty -= 1
        
        if stress_level > 7:
            difficulty += 1
        
        if time_availability < 4:
            difficulty += 2
        elif time_availability > 7:
            difficulty -= 1
        
        return max(1, min(10, difficulty))
    
    def _calculate_success_probability(self, profile_analysis: ProfileAnalysis) -> float:
        """Calcula probabilidade de sucesso do plano"""
        probability = 70.0  # Base
        
        # Fatores positivos
        if profile_analysis.profile.energy_level and profile_analysis.profile.energy_level > 6:
            probability += 10
        
        if profile_analysis.profile.time_availability and profile_analysis.profile.time_availability > 6:
            probability += 10
        
        if profile_analysis.profile.stress_level and profile_analysis.profile.stress_level < 5:
            probability += 10
        
        # Fatores negativos
        if profile_analysis.profile.energy_level and profile_analysis.profile.energy_level < 4:
            probability -= 15
        
        if profile_analysis.profile.time_availability and profile_analysis.profile.time_availability < 4:
            probability -= 15
        
        if profile_analysis.profile.stress_level and profile_analysis.profile.stress_level > 7:
            probability -= 10
        
        return max(10.0, min(95.0, probability))
    
    async def update_plan(
        self,
        current_plan: GeneratedPlan,
        updates: Dict[str, Any]
    ) -> GeneratedPlan:
        """Atualiza um plano existente"""
        
        logger.info(f"Atualizando plano {current_plan.plan_id}")
        
        # Aplicar atualizações
        updated_plan = deepcopy(current_plan)
        
        # Atualizar domínios
        if 'domains' in updates:
            for domain_key, domain_updates in updates['domains'].items():
                domain = LifeDomain(domain_key)
                if domain in updated_plan.domains:
                    # Atualizar objetivos
                    if 'goals' in domain_updates:
                        for goal_update in domain_updates['goals']:
                            for goal in updated_plan.domains[domain].goals:
                                if goal.id == goal_update['id']:
                                    goal.progress = goal_update.get('progress', goal.progress)
                                    break
                    
                    # Atualizar hábitos
                    if 'habits' in domain_updates:
                        for habit_update in domain_updates['habits']:
                            for habit in updated_plan.domains[domain].habits:
                                if habit.id == habit_update['id']:
                                    # Atualizar propriedades do hábito
                                    for key, value in habit_update.items():
                                        if hasattr(habit, key):
                                            setattr(habit, key, value)
                                    break
        
        # Atualizar metadados
        updated_plan.metadata['last_updated'] = datetime.now().isoformat()
        updated_plan.metadata['update_count'] = updated_plan.metadata.get('update_count', 0) + 1
        
        return updated_plan
