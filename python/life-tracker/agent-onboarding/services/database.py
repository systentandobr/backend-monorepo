"""
Serviço de banco de dados
Responsável por persistir e recuperar dados do agente
"""

import logging
import json
from typing import Optional, Dict, Any, List
from datetime import datetime
import asyncio

from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Text, JSON, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.future import select

from models.schemas import (
    ProfileAnalysis,
    GeneratedPlan,
    UserProfile,
    OnboardingSession
)
from utils.config import Settings

logger = logging.getLogger(__name__)

Base = declarative_base()

class ProfileAnalysisModel(Base):
    """Modelo para análise de perfil"""
    __tablename__ = "profile_analyses"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    profile_data = Column(JSON, nullable=False)
    domain_priorities = Column(JSON, nullable=False)
    key_insights = Column(JSON, nullable=False)
    recommended_focus = Column(JSON, nullable=False)
    risk_factors = Column(JSON, nullable=False)
    opportunities = Column(JSON, nullable=False)
    analysis_score = Column(Float, nullable=False)
    confidence_level = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserPlanModel(Base):
    """Modelo para planos de usuário"""
    __tablename__ = "user_plans"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    plan_id = Column(String, nullable=False, unique=True)
    template_match = Column(JSON, nullable=False)
    domains = Column(JSON, nullable=False)
    integrated_goals = Column(JSON, nullable=False)
    daily_schedule = Column(JSON, nullable=False)
    weekly_goals = Column(JSON, nullable=False)
    customizations = Column(JSON, nullable=False)
    plan_metadata = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

class OnboardingSessionModel(Base):
    """Modelo para sessões de onboarding"""
    __tablename__ = "onboarding_sessions"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    status = Column(String, nullable=False)
    current_step = Column(String, nullable=True)
    answers = Column(JSON, nullable=False)
    profile_analysis_id = Column(String, nullable=True)
    generated_plan_id = Column(String, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    session_data = Column(JSON, nullable=False)

class DatabaseService:
    """Serviço de banco de dados"""
    
    def __init__(self):
        self.settings = Settings()
        self.engine = None
        self.session_factory = None
        self.initialized = False
    
    async def connect(self):
        """Conectar ao banco de dados"""
        if self.initialized:
            return
        
        try:
            logger.info("Conectando ao banco de dados...")
            
            # Criar engine assíncrono
            database_url = self.settings.database_url_computed
            
            # Detectar tipo de banco e usar driver apropriado
            if database_url.startswith('sqlite'):
                # Para SQLite, usar aiosqlite
                database_url = database_url.replace('sqlite:///', 'sqlite+aiosqlite:///')
            elif database_url.startswith('mongodb://'):
                # Para MongoDB, usar motor aiohttp
                database_url = database_url.replace('mongodb://', 'mongodb+srv://')
            elif database_url.startswith('postgresql://'):
                # Para PostgreSQL, usar asyncpg
                database_url = database_url.replace('postgresql://', 'postgresql+asyncpg://')
            
            logger.info(f"URL do banco de dados: {database_url}")


            self.engine = create_async_engine(
                database_url,
                echo=self.settings.debug,
                pool_pre_ping=True,
                pool_recycle=300
            )
            
            # Criar sessão factory
            self.session_factory = sessionmaker(
                self.engine,
                class_=AsyncSession,
                expire_on_commit=False
            )
            
            # Criar tabelas
            async with self.engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            
            self.initialized = True
            logger.info("Conexão com banco de dados estabelecida")
            
        except Exception as e:
            logger.error(f"Erro ao conectar ao banco de dados: {str(e)}")
            raise
    
    async def disconnect(self):
        """Desconectar do banco de dados"""
        if self.engine:
            await self.engine.dispose()
            logger.info("Conexão com banco de dados fechada")
    
    async def execute(self, sql: str, params: tuple = None):
        """Executa uma query SQL raw"""
        try:
            async with self.engine.begin() as conn:
                if params:
                    result = await conn.execute(text(sql), params)
                else:
                    result = await conn.execute(text(sql))
                return result
        except Exception as e:
            logger.error(f"Erro ao executar query: {str(e)}")
            raise
    
    async def save_profile_analysis(
        self,
        user_id: str,
        analysis: ProfileAnalysis
    ):
        """Salva análise de perfil no banco de dados"""
        
        try:
            async with self.session_factory() as session:
                # Verificar se já existe uma análise para o usuário
                stmt = select(ProfileAnalysisModel).where(
                    ProfileAnalysisModel.user_id == user_id
                )
                result = await session.execute(stmt)
                existing = result.scalar_one_or_none()
                
                if existing:
                    # Atualizar análise existente
                    existing.profile_data = analysis.profile.dict()
                    existing.domain_priorities = {
                        k.value: v for k, v in analysis.domain_priorities.items()
                    }
                    existing.key_insights = analysis.key_insights
                    existing.recommended_focus = [d.value for d in analysis.recommended_focus]
                    existing.risk_factors = analysis.risk_factors
                    existing.opportunities = analysis.opportunities
                    existing.analysis_score = analysis.analysis_score
                    existing.confidence_level = analysis.confidence_level
                    existing.updated_at = datetime.utcnow()
                else:
                    # Criar nova análise
                    new_analysis = ProfileAnalysisModel(
                        id=analysis.user_id,
                        user_id=user_id,
                        profile_data=analysis.profile.dict(),
                        domain_priorities={
                            k.value: v for k, v in analysis.domain_priorities.items()
                        },
                        key_insights=analysis.key_insights,
                        recommended_focus=[d.value for d in analysis.recommended_focus],
                        risk_factors=analysis.risk_factors,
                        opportunities=analysis.opportunities,
                        analysis_score=analysis.analysis_score,
                        confidence_level=analysis.confidence_level
                    )
                    session.add(new_analysis)
                
                await session.commit()
                logger.info(f"Análise de perfil salva para usuário {user_id}")
                
        except Exception as e:
            logger.error(f"Erro ao salvar análise de perfil: {str(e)}")
            raise
    
    async def save_user_plan(
        self,
        user_id: str,
        plan: GeneratedPlan
    ):
        """Salva plano do usuário no banco de dados"""
        
        try:
            async with self.session_factory() as session:
                # Verificar se já existe um plano para o usuário
                stmt = select(UserPlanModel).where(
                    UserPlanModel.user_id == user_id
                )
                result = await session.execute(stmt)
                existing = result.scalar_one_or_none()
                
                if existing:
                    # Atualizar plano existente
                    existing.plan_id = plan.plan_id
                    existing.template_match = plan.template_match.dict()
                    existing.domains = {
                        k.value: v.dict() for k, v in plan.domains.items()
                    }
                    existing.integrated_goals = plan.integrated_goals
                    existing.daily_schedule = [r.dict() for r in plan.daily_schedule]
                    existing.weekly_goals = plan.weekly_goals
                    existing.customizations = plan.customizations
                    existing.metadata = plan.metadata
                    existing.updated_at = datetime.utcnow()
                    if plan.expires_at:
                        existing.expires_at = plan.expires_at
                else:
                    # Criar novo plano
                    new_plan = UserPlanModel(
                        id=plan.user_id,
                        user_id=user_id,
                        plan_id=plan.plan_id,
                        template_match=plan.template_match.dict(),
                        domains={
                            k.value: v.dict() for k, v in plan.domains.items()
                        },
                        integrated_goals=plan.integrated_goals,
                        daily_schedule=[r.dict() for r in plan.daily_schedule],
                        weekly_goals=plan.weekly_goals,
                        customizations=plan.customizations,
                        metadata=plan.metadata,
                        expires_at=plan.expires_at
                    )
                    session.add(new_plan)
                
                await session.commit()
                logger.info(f"Plano salvo para usuário {user_id}")
                
        except Exception as e:
            logger.error(f"Erro ao salvar plano: {str(e)}")
            raise
    
    async def get_profile_analysis(self, user_id: str) -> Optional[ProfileAnalysis]:
        """Recupera análise de perfil do banco de dados"""
        
        try:
            async with self.session_factory() as session:
                stmt = select(ProfileAnalysisModel).where(
                    ProfileAnalysisModel.user_id == user_id
                )
                result = await session.execute(stmt)
                model = result.scalar_one_or_none()
                
                if not model:
                    return None
                
                # Converter de volta para ProfileAnalysis
                from models.schemas import LifeDomain, UserProfileType
                
                # Reconstruir profile
                profile_data = model.profile_data
                profile = UserProfile(**profile_data)
                
                # Reconstruir domain_priorities
                domain_priorities = {}
                for domain_str, priority in model.domain_priorities.items():
                    try:
                        domain = LifeDomain(domain_str)
                        domain_priorities[domain] = priority
                    except ValueError:
                        logger.warning(f"Domínio desconhecido: {domain_str}")
                
                # Reconstruir recommended_focus
                recommended_focus = []
                for domain_str in model.recommended_focus:
                    try:
                        domain = LifeDomain(domain_str)
                        recommended_focus.append(domain)
                    except ValueError:
                        logger.warning(f"Domínio desconhecido: {domain_str}")
                
                return ProfileAnalysis(
                    user_id=model.user_id,
                    profile=profile,
                    domain_priorities=domain_priorities,
                    key_insights=model.key_insights,
                    recommended_focus=recommended_focus,
                    risk_factors=model.risk_factors,
                    opportunities=model.opportunities,
                    analysis_score=model.analysis_score,
                    confidence_level=model.confidence_level,
                    created_at=model.created_at
                )
                
        except Exception as e:
            logger.error(f"Erro ao recuperar análise de perfil: {str(e)}")
            raise
    
    async def get_user_plan(self, user_id: str) -> Optional[GeneratedPlan]:
        """Recupera plano do usuário do banco de dados"""
        
        try:
            async with self.session_factory() as session:
                stmt = select(UserPlanModel).where(
                    UserPlanModel.user_id == user_id
                )
                result = await session.execute(stmt)
                model = result.scalar_one_or_none()
                
                if not model:
                    return None
                
                # Converter de volta para GeneratedPlan
                from models.schemas import (
                    TemplateMatch, LifeDomain, LifeDomainData,
                    Routine, Goal, Habit
                )
                
                # Reconstruir template_match
                template_match_data = model.template_match
                template_match = TemplateMatch(**template_match_data)
                
                # Reconstruir domains
                domains = {}
                for domain_str, domain_data in model.domains.items():
                    try:
                        domain = LifeDomain(domain_str)
                        
                        # Reconstruir goals
                        goals = [Goal(**goal_data) for goal_data in domain_data.get('goals', [])]
                        
                        # Reconstruir habits
                        habits = [Habit(**habit_data) for habit_data in domain_data.get('habits', [])]
                        
                        # Reconstruir routines
                        routines = []
                        for routine_data in domain_data.get('routines', []):
                            routine = Routine(**routine_data)
                            routines.append(routine)
                        
                        domains[domain] = LifeDomainData(
                            goals=goals,
                            habits=habits,
                            routines=routines,
                            custom_data=domain_data.get('custom_data', {})
                        )
                    except ValueError:
                        logger.warning(f"Domínio desconhecido: {domain_str}")
                
                # Reconstruir daily_schedule
                daily_schedule = []
                for routine_data in model.daily_schedule:
                    routine = Routine(**routine_data)
                    daily_schedule.append(routine)
                
                return GeneratedPlan(
                    user_id=model.user_id,
                    plan_id=model.plan_id,
                    template_match=template_match,
                    domains=domains,
                    integrated_goals=model.integrated_goals,
                    daily_schedule=daily_schedule,
                    weekly_goals=model.weekly_goals,
                    customizations=model.customizations,
                    metadata=model.metadata,
                    created_at=model.created_at,
                    expires_at=model.expires_at
                )
                
        except Exception as e:
            logger.error(f"Erro ao recuperar plano: {str(e)}")
            raise
    
    async def save_onboarding_session(
        self,
        session_data: OnboardingSession
    ):
        """Salva sessão de onboarding no banco de dados"""
        
        try:
            async with self.session_factory() as session:
                # Verificar se já existe uma sessão para o usuário
                stmt = select(OnboardingSessionModel).where(
                    OnboardingSessionModel.user_id == session_data.user_id
                )
                result = await session.execute(stmt)
                existing = result.scalar_one_or_none()
                
                if existing:
                    # Atualizar sessão existente
                    existing.status = session_data.status
                    existing.current_step = session_data.current_step
                    existing.answers = session_data.answers
                    existing.profile_analysis_id = session_data.profile_analysis.user_id if session_data.profile_analysis else None
                    existing.generated_plan_id = session_data.generated_plan.plan_id if session_data.generated_plan else None
                    if session_data.completed_at:
                        existing.completed_at = session_data.completed_at
                    existing.session_data = session_data.session_data
                else:
                    # Criar nova sessão
                    new_session = OnboardingSessionModel(
                        id=session_data.session_id,
                        user_id=session_data.user_id,
                        status=session_data.status,
                        current_step=session_data.current_step,
                        answers=session_data.answers,
                        profile_analysis_id=session_data.profile_analysis.user_id if session_data.profile_analysis else None,
                        generated_plan_id=session_data.generated_plan.plan_id if session_data.generated_plan else None,
                        started_at=session_data.started_at,
                        completed_at=session_data.completed_at,
                        session_data=session_data.session_data
                    )
                    session.add(new_session)
                
                await session.commit()
                logger.info(f"Sessão de onboarding salva para usuário {session_data.user_id}")
                
        except Exception as e:
            logger.error(f"Erro ao salvar sessão de onboarding: {str(e)}")
            raise
    
    async def get_onboarding_session(self, user_id: str) -> Optional[OnboardingSession]:
        """Recupera sessão de onboarding do banco de dados"""
        
        try:
            async with self.session_factory() as session:
                stmt = select(OnboardingSessionModel).where(
                    OnboardingSessionModel.user_id == user_id
                )
                result = await session.execute(stmt)
                model = result.scalar_one_or_none()
                
                if not model:
                    return None
                
                # Recuperar análise de perfil e plano se existirem
                profile_analysis = None
                if model.profile_analysis_id:
                    profile_analysis = await self.get_profile_analysis(model.profile_analysis_id)
                
                generated_plan = None
                if model.generated_plan_id:
                    generated_plan = await self.get_user_plan(model.user_id)
                
                return OnboardingSession(
                    session_id=model.id,
                    user_id=model.user_id,
                    status=model.status,
                    current_step=model.current_step,
                    answers=model.answers,
                    profile_analysis=profile_analysis,
                    generated_plan=generated_plan,
                    started_at=model.started_at,
                    completed_at=model.completed_at,
                    session_data=model.session_data
                )
                
        except Exception as e:
            logger.error(f"Erro ao recuperar sessão de onboarding: {str(e)}")
            raise
    
    async def delete_user_data(self, user_id: str):
        """Deleta todos os dados de um usuário"""
        
        try:
            async with self.session_factory() as session:
                # Deletar análise de perfil
                stmt = select(ProfileAnalysisModel).where(
                    ProfileAnalysisModel.user_id == user_id
                )
                result = await session.execute(stmt)
                profile_analysis = result.scalar_one_or_none()
                if profile_analysis:
                    await session.delete(profile_analysis)
                
                # Deletar plano
                stmt = select(UserPlanModel).where(
                    UserPlanModel.user_id == user_id
                )
                result = await session.execute(stmt)
                user_plan = result.scalar_one_or_none()
                if user_plan:
                    await session.delete(user_plan)
                
                # Deletar sessão
                stmt = select(OnboardingSessionModel).where(
                    OnboardingSessionModel.user_id == user_id
                )
                result = await session.execute(stmt)
                onboarding_session = result.scalar_one_or_none()
                if onboarding_session:
                    await session.delete(onboarding_session)
                
                await session.commit()
                logger.info(f"Dados deletados para usuário {user_id}")
                
        except Exception as e:
            logger.error(f"Erro ao deletar dados do usuário: {str(e)}")
            raise
