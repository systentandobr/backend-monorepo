"""
Schemas Pydantic para o agente de onboarding
"""

from typing import Dict, List, Optional, Any, Union
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, validator

class LifeDomain(str, Enum):
    """Domínios da vida que podem ser trabalhados"""
    HEALTHNESS = "healthness"
    FINANCES = "finances"
    BUSINESS = "business"
    PRODUCTIVITY = "productivity"
    RELATIONSHIPS = "relationships"
    SPIRITUALITY = "spirituality"
    LEARNING = "learning"

class UserProfileType(str, Enum):
    """Tipos de perfil de usuário"""
    HEALTH_FOCUSED = "health_focused"
    FINANCIAL_FOCUSED = "financial_focused"
    BUSINESS_FOCUSED = "business_focused"
    LEARNING_FOCUSED = "learning_focused"
    BALANCED = "balanced"
    RECOVERY = "recovery"
    PERFORMANCE = "performance"

class Goal(BaseModel):
    """Objetivo específico em um domínio"""
    id: str
    label: str
    priority: int = Field(ge=1, le=10)
    description: Optional[str] = None
    target_date: Optional[str] = None
    progress: Optional[float] = Field(default=0.0, ge=0.0, le=100.0)

class Habit(BaseModel):
    """Hábito específico para desenvolvimento"""
    id: str
    name: str
    icon: str
    color: str
    description: str
    target: str  # "Diário", "Semanal", "Mensal"
    timeOfDay: str  # "morning", "afternoon", "evening", "all"
    difficulty: Optional[int] = Field(default=5, ge=1, le=10)
    category: Optional[str] = None

class Routine(BaseModel):
    """Rotina diária estruturada"""
    time: str
    activity: str
    domain: Optional[LifeDomain] = None
    duration_minutes: Optional[int] = None

class LifeDomainData(BaseModel):
    """Dados específicos de um domínio da vida"""
    goals: List[Goal]
    habits: List[Habit]
    routines: Optional[List[Routine]] = None
    custom_data: Optional[Dict[str, Any]] = None

# ... existing code ...

class UserProfile(BaseModel):
    """Perfil completo do usuário"""
    user_id: str
    profile_type: UserProfileType
    age: Optional[int] = None
    gender: Optional[str] = None
    life_stage: Optional[str] = None
    primary_concerns: List[str] = []
    interests: List[str] = []
    time_availability: Optional[int] = None
    energy_level: Optional[int] = None
    stress_level: Optional[int] = None
    # Adicionar campos de horário
    wakeup_time: Optional[str] = None
    sleep_time: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class ProfileAnalysis(BaseModel):
    """Análise do perfil do usuário"""
    user_id: str
    profile: UserProfile
    domain_priorities: Dict[LifeDomain, float] = Field(default_factory=dict)
    key_insights: List[str] = []
    recommended_focus: List[LifeDomain] = []
    risk_factors: List[str] = []
    opportunities: List[str] = []
    analysis_score: float = Field(ge=0.0, le=100.0)
    confidence_level: float = Field(ge=0.0, le=100.0)
    created_at: datetime = Field(default_factory=datetime.now)

class TemplateMatch(BaseModel):
    """Match entre perfil e template"""
    template_id: str
    template_name: str
    match_score: float = Field(ge=0.0, le=100.0)
    template: Dict[str, Any]
    customizations: Dict[str, Any] = Field(default_factory=dict)
    reasoning: List[str] = []

class GeneratedPlan(BaseModel):
    """Plano personalizado gerado para o usuário"""
    user_id: str
    plan_id: str
    template_match: TemplateMatch
    domains: Dict[LifeDomain, LifeDomainData]
    integrated_goals: List[Dict[str, Any]] = []
    daily_schedule: List[Routine] = []
    weekly_goals: List[Dict[str, Any]] = []
    customizations: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.now)
    expires_at: Optional[datetime] = None

class OnboardingRequest(BaseModel):
    """Requisição de onboarding"""
    user_id: str
    answers: Dict[str, Any] = Field(description="Respostas do questionário de onboarding")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @validator('answers')
    def validate_answers(cls, v):
        """Validar que as respostas contêm dados mínimos"""
        required_keys = ['concentration', 'lifestyle', 'energy']
        missing_keys = [key for key in required_keys if key not in v]
        if missing_keys:
            raise ValueError(f"Respostas obrigatórias ausentes: {missing_keys}")
        return v

class OnboardingResponse(BaseModel):
    """Resposta do processo de onboarding"""
    user_id: str
    success: bool
    message: str
    profile_analysis: Optional[ProfileAnalysis] = None
    generated_plan: Optional[GeneratedPlan] = None
    errors: List[str] = Field(default_factory=list)
    processing_time: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.now)

class TemplateMetadata(BaseModel):
    """Metadados de um template"""
    id: str
    name: str
    description: str
    target_profiles: List[UserProfileType]
    difficulty_level: int = Field(ge=1, le=10)
    domains_covered: List[LifeDomain]
    estimated_duration_weeks: int
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class AnalysisResult(BaseModel):
    """Resultado de uma análise específica"""
    analysis_type: str
    score: float
    insights: List[str]
    recommendations: List[str]
    confidence: float
    metadata: Dict[str, Any] = Field(default_factory=dict)

class OnboardingSession(BaseModel):
    """Sessão de onboarding"""
    session_id: str
    user_id: str
    status: str  # "in_progress", "completed", "failed"
    current_step: Optional[str] = None
    answers: Dict[str, Any] = Field(default_factory=dict)
    profile_analysis: Optional[ProfileAnalysis] = None
    generated_plan: Optional[GeneratedPlan] = None
    started_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    session_data: Dict[str, Any] = Field(default_factory=dict)
