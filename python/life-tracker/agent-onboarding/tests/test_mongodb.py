"""
Testes para a implementação do MongoDB
"""

import pytest
import asyncio
from datetime import datetime
import uuid
from unittest.mock import Mock, AsyncMock, patch

from services.mongo_database import MongoDatabase
from models.schemas import (
    UserProfile, UserProfileType, LifeDomain,
    ProfileAnalysis, GeneratedPlan, OnboardingSession,
    TemplateMatch, LifeDomainData, Routine, Goal, Habit
)

@pytest.fixture
def mongo_db():
    """Fixture para criar instância do MongoDB"""
    return MongoDatabase()

@pytest.fixture
def sample_profile():
    """Fixture para perfil de exemplo"""
    return UserProfile(
        user_id="test_user_123",
        name="João Silva",
        age=30,
        occupation="Desenvolvedor",
        profile_type=UserProfileType.BALANCED,
        goals=["Melhorar saúde", "Aprender novas tecnologias"],
        preferences={"workout_type": "strength", "learning_style": "hands_on"}
    )

@pytest.fixture
def sample_analysis(sample_profile):
    """Fixture para análise de exemplo"""
    return ProfileAnalysis(
        user_id="test_user_123",
        profile=sample_profile,
        domain_priorities={
            LifeDomain.HEALTH: 0.8,
            LifeDomain.CAREER: 0.7,
            LifeDomain.RELATIONSHIPS: 0.6
        },
        key_insights=["Precisa de mais exercício", "Interessado em crescimento profissional"],
        recommended_focus=[LifeDomain.HEALTH, LifeDomain.CAREER],
        risk_factors=["Sedentarismo", "Estresse no trabalho"],
        opportunities=["Academia próxima", "Cursos online disponíveis"],
        analysis_score=75.5,
        confidence_level=0.85
    )

@pytest.fixture
def sample_plan():
    """Fixture para plano de exemplo"""
    template_match = TemplateMatch(
        template_name="balanced_template",
        match_score=0.85,
        customization_level="medium"
    )
    
    health_domain = LifeDomainData(
        goals=[Goal(id="g1", title="Exercitar 3x por semana", description="Treino de força")],
        habits=[Habit(id="h1", title="Beber água", description="2L por dia")],
        routines=[Routine(id="r1", title="Treino matinal", time="07:00", duration=60)],
        custom_data={"preferred_gym": "Academia Fitness"}
    )
    
    return GeneratedPlan(
        user_id="test_user_123",
        plan_id=str(uuid.uuid4()),
        template_match=template_match,
        domains={LifeDomain.HEALTH: health_domain},
        integrated_goals=["Melhorar saúde geral"],
        daily_schedule=[Routine(id="r1", title="Treino matinal", time="07:00", duration=60)],
        weekly_goals=["3 treinos", "Beber água regularmente"],
        customizations={"workout_intensity": "moderate"},
        metadata={"version": "1.0", "created_by": "agent"}
    )

@pytest.fixture
def sample_session(sample_analysis, sample_plan):
    """Fixture para sessão de exemplo"""
    return OnboardingSession(
        session_id=str(uuid.uuid4()),
        user_id="test_user_123",
        status="completed",
        current_step="plan_generated",
        answers={"question1": "Sim", "question2": "Não"},
        profile_analysis=sample_analysis,
        generated_plan=sample_plan,
        started_at=datetime.utcnow(),
        completed_at=datetime.utcnow(),
        session_data={"steps_completed": 5, "total_steps": 5}
    )

class TestMongoDatabase:
    """Testes para a classe MongoDatabase"""
    
    @pytest.mark.asyncio
    async def test_connect_success(self, mongo_db):
        """Testa conexão bem-sucedida com MongoDB"""
        with patch('motor.motor_asyncio.AsyncIOMotorClient') as mock_client:
            # Mock da conexão
            mock_client.return_value.admin.command = AsyncMock()
            mock_client.return_value.get_database.return_value = Mock()
            
            # Mock dos índices
            mock_db = Mock()
            mock_collection = Mock()
            mock_collection.create_index = AsyncMock()
            mock_db.__getitem__.return_value = mock_collection
            mock_client.return_value.get_database.return_value = mock_db
            
            await mongo_db.connect()
            
            assert mongo_db.initialized is True
            assert mongo_db.client is not None
            assert mongo_db.db is not None
    
    @pytest.mark.asyncio
    async def test_connect_failure(self, mongo_db):
        """Testa falha na conexão com MongoDB"""
        with patch('motor.motor_asyncio.AsyncIOMotorClient') as mock_client:
            # Mock de falha na conexão
            mock_client.return_value.admin.command = AsyncMock(side_effect=Exception("Connection failed"))
            
            with pytest.raises(Exception):
                await mongo_db.connect()
            
            assert mongo_db.initialized is False
    
    @pytest.mark.asyncio
    async def test_disconnect(self, mongo_db):
        """Testa desconexão do MongoDB"""
        # Mock do cliente
        mongo_db.client = Mock()
        mongo_db.client.close = Mock()
        
        await mongo_db.disconnect()
        
        mongo_db.client.close.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_save_profile_analysis(self, mongo_db, sample_analysis):
        """Testa salvamento de análise de perfil"""
        # Mock do banco e coleção
        mock_collection = Mock()
        mock_collection.replace_one = AsyncMock()
        mongo_db.db = Mock()
        mongo_db.db.profile_analyses = mock_collection
        
        await mongo_db.save_profile_analysis("test_user_123", sample_analysis)
        
        # Verificar se replace_one foi chamado com upsert=True
        mock_collection.replace_one.assert_called_once()
        call_args = mock_collection.replace_one.call_args
        assert call_args[1]['upsert'] is True
    
    @pytest.mark.asyncio
    async def test_get_profile_analysis_success(self, mongo_db, sample_analysis):
        """Testa recuperação bem-sucedida de análise de perfil"""
        # Mock do documento retornado
        mock_document = {
            "_id": "test_user_123",
            "user_id": "test_user_123",
            "profile_data": sample_analysis.profile.dict(),
            "domain_priorities": {
                "HEALTH": 0.8,
                "CAREER": 0.7,
                "RELATIONSHIPS": 0.6
            },
            "key_insights": sample_analysis.key_insights,
            "recommended_focus": ["HEALTH", "CAREER"],
            "risk_factors": sample_analysis.risk_factors,
            "opportunities": sample_analysis.opportunities,
            "analysis_score": sample_analysis.analysis_score,
            "confidence_level": sample_analysis.confidence_level,
            "created_at": datetime.utcnow()
        }
        
        # Mock da coleção
        mock_collection = Mock()
        mock_collection.find_one = AsyncMock(return_value=mock_document)
        mongo_db.db = Mock()
        mongo_db.db.profile_analyses = mock_collection
        
        result = await mongo_db.get_profile_analysis("test_user_123")
        
        assert result is not None
        assert result.user_id == "test_user_123"
        assert result.analysis_score == 75.5
        assert result.confidence_level == 0.85
    
    @pytest.mark.asyncio
    async def test_get_profile_analysis_not_found(self, mongo_db):
        """Testa recuperação de análise de perfil inexistente"""
        # Mock da coleção retornando None
        mock_collection = Mock()
        mock_collection.find_one = AsyncMock(return_value=None)
        mongo_db.db = Mock()
        mongo_db.db.profile_analyses = mock_collection
        
        result = await mongo_db.get_profile_analysis("nonexistent_user")
        
        assert result is None
    
    @pytest.mark.asyncio
    async def test_save_user_plan(self, mongo_db, sample_plan):
        """Testa salvamento de plano do usuário"""
        # Mock do banco e coleção
        mock_collection = Mock()
        mock_collection.replace_one = AsyncMock()
        mongo_db.db = Mock()
        mongo_db.db.user_plans = mock_collection
        
        await mongo_db.save_user_plan("test_user_123", sample_plan)
        
        # Verificar se replace_one foi chamado com upsert=True
        mock_collection.replace_one.assert_called_once()
        call_args = mock_collection.replace_one.call_args
        assert call_args[1]['upsert'] is True
    
    @pytest.mark.asyncio
    async def test_get_user_plan_success(self, mongo_db, sample_plan):
        """Testa recuperação bem-sucedida de plano do usuário"""
        # Mock do documento retornado
        mock_document = {
            "_id": "test_user_123",
            "user_id": "test_user_123",
            "plan_id": sample_plan.plan_id,
            "template_match": sample_plan.template_match.dict(),
            "domains": {
                "HEALTH": {
                    "goals": [goal.dict() for goal in sample_plan.domains[LifeDomain.HEALTH].goals],
                    "habits": [habit.dict() for habit in sample_plan.domains[LifeDomain.HEALTH].habits],
                    "routines": [routine.dict() for routine in sample_plan.domains[LifeDomain.HEALTH].routines],
                    "custom_data": sample_plan.domains[LifeDomain.HEALTH].custom_data
                }
            },
            "integrated_goals": sample_plan.integrated_goals,
            "daily_schedule": [routine.dict() for routine in sample_plan.daily_schedule],
            "weekly_goals": sample_plan.weekly_goals,
            "customizations": sample_plan.customizations,
            "metadata": sample_plan.metadata,
            "created_at": datetime.utcnow(),
            "expires_at": sample_plan.expires_at
        }
        
        # Mock da coleção
        mock_collection = Mock()
        mock_collection.find_one = AsyncMock(return_value=mock_document)
        mongo_db.db = Mock()
        mongo_db.db.user_plans = mock_collection
        
        result = await mongo_db.get_user_plan("test_user_123")
        
        assert result is not None
        assert result.user_id == "test_user_123"
        assert result.plan_id == sample_plan.plan_id
    
    @pytest.mark.asyncio
    async def test_save_onboarding_session(self, mongo_db, sample_session):
        """Testa salvamento de sessão de onboarding"""
        # Mock do banco e coleção
        mock_collection = Mock()
        mock_collection.replace_one = AsyncMock()
        mongo_db.db = Mock()
        mongo_db.db.onboarding_sessions = mock_collection
        
        await mongo_db.save_onboarding_session(sample_session)
        
        # Verificar se replace_one foi chamado com upsert=True
        mock_collection.replace_one.assert_called_once()
        call_args = mock_collection.replace_one.call_args
        assert call_args[1]['upsert'] is True
    
    @pytest.mark.asyncio
    async def test_get_onboarding_session_success(self, mongo_db, sample_session):
        """Testa recuperação bem-sucedida de sessão de onboarding"""
        # Mock do documento retornado
        mock_document = {
            "_id": sample_session.session_id,
            "user_id": "test_user_123",
            "status": "completed",
            "current_step": "plan_generated",
            "answers": {"question1": "Sim", "question2": "Não"},
            "profile_analysis_id": "test_user_123",
            "generated_plan_id": sample_session.generated_plan.plan_id,
            "started_at": datetime.utcnow(),
            "completed_at": datetime.utcnow(),
            "session_data": {"steps_completed": 5, "total_steps": 5}
        }
        
        # Mock da coleção
        mock_collection = Mock()
        mock_collection.find_one = AsyncMock(return_value=mock_document)
        mongo_db.db = Mock()
        mongo_db.db.onboarding_sessions = mock_collection
        
        # Mock dos métodos de recuperação de análise e plano
        mongo_db.get_profile_analysis = AsyncMock(return_value=sample_session.profile_analysis)
        mongo_db.get_user_plan = AsyncMock(return_value=sample_session.generated_plan)
        
        result = await mongo_db.get_onboarding_session("test_user_123")
        
        assert result is not None
        assert result.session_id == sample_session.session_id
        assert result.status == "completed"
    
    @pytest.mark.asyncio
    async def test_delete_user_data(self, mongo_db):
        """Testa deleção de dados do usuário"""
        # Mock das coleções
        mock_profile_collection = Mock()
        mock_profile_collection.delete_one = AsyncMock()
        
        mock_plan_collection = Mock()
        mock_plan_collection.delete_one = AsyncMock()
        
        mock_session_collection = Mock()
        mock_session_collection.delete_one = AsyncMock()
        
        mongo_db.db = Mock()
        mongo_db.db.profile_analyses = mock_profile_collection
        mongo_db.db.user_plans = mock_plan_collection
        mongo_db.db.onboarding_sessions = mock_session_collection
        
        await mongo_db.delete_user_data("test_user_123")
        
        # Verificar se delete_one foi chamado em todas as coleções
        mock_profile_collection.delete_one.assert_called_once_with({"_id": "test_user_123"})
        mock_plan_collection.delete_one.assert_called_once_with({"_id": "test_user_123"})
        mock_session_collection.delete_one.assert_called_once_with({"user_id": "test_user_123"})
    
    @pytest.mark.asyncio
    async def test_execute_operation(self, mongo_db):
        """Testa operações genéricas"""
        # Mock da coleção
        mock_collection = Mock()
        mock_collection.find_one = AsyncMock(return_value={"test": "data"})
        mock_collection.find = AsyncMock()
        mock_collection.find.return_value.to_list = AsyncMock(return_value=[{"test": "data"}])
        mock_collection.insert_one = AsyncMock()
        mock_collection.update_one = AsyncMock()
        mock_collection.replace_one = AsyncMock()
        mock_collection.delete_one = AsyncMock()
        
        mongo_db.db = Mock()
        mongo_db.db.__getitem__ = Mock(return_value=mock_collection)
        
        # Testar find_one
        result = await mongo_db.execute("find_one", "test_collection", {"test": "query"})
        assert result == {"test": "data"}
        
        # Testar find
        result = await mongo_db.execute("find", "test_collection", {"test": "query"})
        assert result == [{"test": "data"}]
        
        # Testar insert_one
        await mongo_db.execute("insert_one", "test_collection", data={"test": "data"})
        mock_collection.insert_one.assert_called_once_with({"test": "data"})
        
        # Testar update_one
        await mongo_db.execute("update_one", "test_collection", {"test": "query"}, {"test": "update"})
        mock_collection.update_one.assert_called_once_with({"test": "query"}, {"$set": {"test": "update"}})
        
        # Testar replace_one
        await mongo_db.execute("replace_one", "test_collection", {"test": "query"}, {"test": "data"})
        mock_collection.replace_one.assert_called_once_with({"test": "query"}, {"test": "data"}, upsert=True)
        
        # Testar delete_one
        await mongo_db.execute("delete_one", "test_collection", {"test": "query"})
        mock_collection.delete_one.assert_called_once_with({"test": "query"})
        
        # Testar operação inválida
        with pytest.raises(ValueError):
            await mongo_db.execute("invalid_operation", "test_collection")

if __name__ == "__main__":
    pytest.main([__file__])

