"""
Serviço de banco de dados MongoDB
Implementação específica para MongoDB seguindo os mesmos contratos do DatabaseService
"""

import logging
import json
from typing import Optional, Dict, Any, List
from datetime import datetime
import asyncio
from bson import ObjectId

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import DuplicateKeyError, ConnectionFailure

from models.schemas import (
    ProfileAnalysis,
    GeneratedPlan,
    UserProfile,
    OnboardingSession
)
from utils.config import Settings

logger = logging.getLogger(__name__)

class MongoDatabase:
    """Serviço de banco de dados MongoDB"""
    
    def __init__(self):
        self.settings = Settings()
        self.client = None
        self.db = None
        self.initialized = False
    
    async def connect(self):
        """Conectar ao MongoDB"""
        if self.initialized:
            return
        
        try:
            logger.info("Conectando ao MongoDB...")
            
            # Criar cliente assíncrono do MongoDB
            self.client = AsyncIOMotorClient(
                self.settings.database_url_computed,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000
            )
            
            # Testar conexão
            await self.client.admin.command('ping')
            
            # Obter database
            self.db = self.client.get_database()
            
            # Criar índices necessários
            await self._create_indexes()
            
            self.initialized = True
            logger.info("Conexão com MongoDB estabelecida")
            
        except Exception as e:
            logger.error(f"Erro ao conectar ao MongoDB: {str(e)}")
            raise
    
    async def disconnect(self):
        """Desconectar do MongoDB"""
        if self.client:
            self.client.close()
            logger.info("Conexão com MongoDB fechada")
    
    async def _create_indexes(self):
        """Criar índices para otimizar consultas"""
        try:
            # Índices para profile_analyses
            await self.db.profile_analyses.create_index("user_id", unique=True)
            await self.db.profile_analyses.create_index("created_at")
            
            # Índices para user_plans
            await self.db.user_plans.create_index("user_id", unique=True)
            await self.db.user_plans.create_index("plan_id", unique=True)
            await self.db.user_plans.create_index("created_at")
            
            # Índices para onboarding_sessions
            await self.db.onboarding_sessions.create_index("user_id", unique=True)
            await self.db.onboarding_sessions.create_index("status")
            await self.db.onboarding_sessions.create_index("started_at")
            
            logger.info("Índices do MongoDB criados com sucesso")
            
        except Exception as e:
            logger.error(f"Erro ao criar índices: {str(e)}")
            raise
    
    async def execute(self, operation: str, collection: str, query: Dict = None, data: Dict = None):
        """Executa operações genéricas no MongoDB"""
        try:
            coll = self.db[collection]
            
            if operation == "find_one":
                return await coll.find_one(query or {})
            elif operation == "find":
                cursor = coll.find(query or {})
                return await cursor.to_list(length=None)
            elif operation == "insert_one":
                return await coll.insert_one(data)
            elif operation == "update_one":
                return await coll.update_one(query, {"$set": data})
            elif operation == "replace_one":
                return await coll.replace_one(query, data, upsert=True)
            elif operation == "delete_one":
                return await coll.delete_one(query)
            else:
                raise ValueError(f"Operação não suportada: {operation}")
                
        except Exception as e:
            logger.error(f"Erro ao executar operação {operation}: {str(e)}")
            raise
    
    async def save_profile_analysis(
        self,
        user_id: str,
        analysis: ProfileAnalysis
    ):
        """Salva análise de perfil no MongoDB"""
        
        try:
            # Preparar documento para MongoDB
            document = {
                "_id": user_id,  # Usar user_id como _id para garantir unicidade
                "user_id": user_id,
                "profile_data": analysis.profile.dict(),
                "domain_priorities": {
                    k.value: v for k, v in analysis.domain_priorities.items()
                },
                "key_insights": analysis.key_insights,
                "recommended_focus": [d.value for d in analysis.recommended_focus],
                "risk_factors": analysis.risk_factors,
                "opportunities": analysis.opportunities,
                "analysis_score": analysis.analysis_score,
                "confidence_level": analysis.confidence_level,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Usar upsert para atualizar ou criar
            result = await self.db.profile_analyses.replace_one(
                {"_id": user_id},
                document,
                upsert=True
            )
            
            logger.info(f"Análise de perfil salva para usuário {user_id}")
            
        except Exception as e:
            logger.error(f"Erro ao salvar análise de perfil: {str(e)}")
            raise
    
    async def save_user_plan(
        self,
        user_id: str,
        plan: GeneratedPlan
    ):
        """Salva plano do usuário no MongoDB"""
        
        try:
            # Preparar documento para MongoDB
            document = {
                "_id": user_id,
                "user_id": user_id,
                "plan_id": plan.plan_id,
                "template_match": plan.template_match.dict(),
                "domains": {
                    k.value: v.dict() for k, v in plan.domains.items()
                },
                "integrated_goals": plan.integrated_goals,
                "daily_schedule": [r.dict() for r in plan.daily_schedule],
                "weekly_goals": plan.weekly_goals,
                "customizations": plan.customizations,
                "metadata": plan.metadata,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "expires_at": plan.expires_at
            }
            
            # Usar upsert para atualizar ou criar
            result = await self.db.user_plans.replace_one(
                {"_id": user_id},
                document,
                upsert=True
            )
            
            logger.info(f"Plano salvo para usuário {user_id}")
            
        except Exception as e:
            logger.error(f"Erro ao salvar plano: {str(e)}")
            raise
    
    async def get_profile_analysis(self, user_id: str) -> Optional[ProfileAnalysis]:
        """Recupera análise de perfil do MongoDB"""
        
        try:
            document = await self.db.profile_analyses.find_one({"_id": user_id})
            
            if not document:
                return None
            
            # Converter de volta para ProfileAnalysis
            from models.schemas import LifeDomain, UserProfileType
            
            # Reconstruir profile
            profile_data = document["profile_data"]
            profile = UserProfile(**profile_data)
            
            # Reconstruir domain_priorities
            domain_priorities = {}
            for domain_str, priority in document["domain_priorities"].items():
                try:
                    domain = LifeDomain(domain_str)
                    domain_priorities[domain] = priority
                except ValueError:
                    logger.warning(f"Domínio desconhecido: {domain_str}")
            
            # Reconstruir recommended_focus
            recommended_focus = []
            for domain_str in document["recommended_focus"]:
                try:
                    domain = LifeDomain(domain_str)
                    recommended_focus.append(domain)
                except ValueError:
                    logger.warning(f"Domínio desconhecido: {domain_str}")
            
            return ProfileAnalysis(
                user_id=document["user_id"],
                profile=profile,
                domain_priorities=domain_priorities,
                key_insights=document["key_insights"],
                recommended_focus=recommended_focus,
                risk_factors=document["risk_factors"],
                opportunities=document["opportunities"],
                analysis_score=document["analysis_score"],
                confidence_level=document["confidence_level"],
                created_at=document["created_at"]
            )
            
        except Exception as e:
            logger.error(f"Erro ao recuperar análise de perfil: {str(e)}")
            raise
    
    async def get_user_plan(self, user_id: str) -> Optional[GeneratedPlan]:
        """Recupera plano do usuário do MongoDB"""
        
        try:
            document = await self.db.user_plans.find_one({"_id": user_id})
            
            if not document:
                return None
            
            # Converter de volta para GeneratedPlan
            from models.schemas import (
                TemplateMatch, LifeDomain, LifeDomainData,
                Routine, Goal, Habit
            )
            
            # Reconstruir template_match
            template_match_data = document["template_match"]
            template_match = TemplateMatch(**template_match_data)
            
            # Reconstruir domains
            domains = {}
            for domain_str, domain_data in document["domains"].items():
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
            for routine_data in document["daily_schedule"]:
                routine = Routine(**routine_data)
                daily_schedule.append(routine)
            
            return GeneratedPlan(
                user_id=document["user_id"],
                plan_id=document["plan_id"],
                template_match=template_match,
                domains=domains,
                integrated_goals=document["integrated_goals"],
                daily_schedule=daily_schedule,
                weekly_goals=document["weekly_goals"],
                customizations=document["customizations"],
                metadata=document["metadata"],
                created_at=document["created_at"],
                expires_at=document.get("expires_at")
            )
            
        except Exception as e:
            logger.error(f"Erro ao recuperar plano: {str(e)}")
            raise
    
    async def save_onboarding_session(
        self,
        session_data: OnboardingSession
    ):
        """Salva sessão de onboarding no MongoDB"""
        
        try:
            document = {
                "_id": session_data.session_id,
                "user_id": session_data.user_id,
                "status": session_data.status,
                "current_step": session_data.current_step,
                "answers": session_data.answers,
                "profile_analysis_id": session_data.profile_analysis.user_id if session_data.profile_analysis else None,
                "generated_plan_id": session_data.generated_plan.plan_id if session_data.generated_plan else None,
                "started_at": session_data.started_at,
                "completed_at": session_data.completed_at,
                "session_data": session_data.session_data
            }
            
            # Usar upsert para atualizar ou criar
            result = await self.db.onboarding_sessions.replace_one(
                {"_id": session_data.session_id},
                document,
                upsert=True
            )
            
            logger.info(f"Sessão de onboarding salva para usuário {session_data.user_id}")
            
        except Exception as e:
            logger.error(f"Erro ao salvar sessão de onboarding: {str(e)}")
            raise
    
    async def get_onboarding_session(self, user_id: str) -> Optional[OnboardingSession]:
        """Recupera sessão de onboarding do MongoDB"""
        
        try:
            document = await self.db.onboarding_sessions.find_one({"user_id": user_id})
            
            if not document:
                return None
            
            # Recuperar análise de perfil e plano se existirem
            profile_analysis = None
            if document.get("profile_analysis_id"):
                profile_analysis = await self.get_profile_analysis(document["profile_analysis_id"])
            
            generated_plan = None
            if document.get("generated_plan_id"):
                generated_plan = await self.get_user_plan(document["user_id"])
            
            return OnboardingSession(
                session_id=document["_id"],
                user_id=document["user_id"],
                status=document["status"],
                current_step=document.get("current_step"),
                answers=document["answers"],
                profile_analysis=profile_analysis,
                generated_plan=generated_plan,
                started_at=document["started_at"],
                completed_at=document.get("completed_at"),
                session_data=document["session_data"]
            )
            
        except Exception as e:
            logger.error(f"Erro ao recuperar sessão de onboarding: {str(e)}")
            raise
    
    async def delete_user_data(self, user_id: str):
        """Deleta todos os dados de um usuário"""
        
        try:
            # Deletar análise de perfil
            await self.db.profile_analyses.delete_one({"_id": user_id})
            
            # Deletar plano
            await self.db.user_plans.delete_one({"_id": user_id})
            
            # Deletar sessão
            await self.db.onboarding_sessions.delete_one({"user_id": user_id})
            
            logger.info(f"Dados deletados para usuário {user_id}")
            
        except Exception as e:
            logger.error(f"Erro ao deletar dados do usuário: {str(e)}")
            raise









