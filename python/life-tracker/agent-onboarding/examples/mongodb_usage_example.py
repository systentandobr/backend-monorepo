"""
Exemplo de uso do MongoDB com o factory pattern
Demonstra como configurar e usar o MongoDB de forma transparente
"""

import asyncio
import logging
from datetime import datetime
import uuid

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def example_mongodb_usage():
    """Exemplo de uso do MongoDB"""
    
    try:
        # Importar o factory
        from services.database_factory import DatabaseFactory
        
        # Criar e conectar ao banco (automaticamente escolhe MongoDB baseado na configuração)
        db_service = await DatabaseFactory.create_and_connect_database()
        
        logger.info(f"Tipo de banco criado: {type(db_service).__name__}")
        
        # Exemplo de dados de teste
        user_id = "user_123"
        
        # Criar dados de exemplo
        from models.schemas import (
            UserProfile, UserProfileType, LifeDomain,
            ProfileAnalysis, GeneratedPlan, OnboardingSession
        )
        
        # Exemplo de perfil de usuário
        profile = UserProfile(
            user_id=user_id,
            name="João Silva",
            age=30,
            occupation="Desenvolvedor",
            profile_type=UserProfileType.BALANCED,
            goals=["Melhorar saúde", "Aprender novas tecnologias"],
            preferences={"workout_type": "strength", "learning_style": "hands_on"}
        )
        
        # Exemplo de análise de perfil
        analysis = ProfileAnalysis(
            user_id=user_id,
            profile=profile,
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
        
        # Salvar análise no MongoDB
        await db_service.save_profile_analysis(user_id, analysis)
        logger.info("Análise de perfil salva no MongoDB")
        
        # Recuperar análise do MongoDB
        retrieved_analysis = await db_service.get_profile_analysis(user_id)
        if retrieved_analysis:
            logger.info(f"Análise recuperada: Score {retrieved_analysis.analysis_score}")
        
        # Exemplo de plano gerado
        from models.schemas import (
            TemplateMatch, LifeDomainData, Routine, Goal, Habit
        )
        
        template_match = TemplateMatch(
            template_name="balanced_template",
            match_score=0.85,
            customization_level="medium"
        )
        
        # Criar dados de domínio
        health_domain = LifeDomainData(
            goals=[Goal(id="g1", title="Exercitar 3x por semana", description="Treino de força")],
            habits=[Habit(id="h1", title="Beber água", description="2L por dia")],
            routines=[Routine(id="r1", title="Treino matinal", time="07:00", duration=60)],
            custom_data={"preferred_gym": "Academia Fitness"}
        )
        
        plan = GeneratedPlan(
            user_id=user_id,
            plan_id=str(uuid.uuid4()),
            template_match=template_match,
            domains={LifeDomain.HEALTH: health_domain},
            integrated_goals=["Melhorar saúde geral"],
            daily_schedule=[Routine(id="r1", title="Treino matinal", time="07:00", duration=60)],
            weekly_goals=["3 treinos", "Beber água regularmente"],
            customizations={"workout_intensity": "moderate"},
            metadata={"version": "1.0", "created_by": "agent"}
        )
        
        # Salvar plano no MongoDB
        await db_service.save_user_plan(user_id, plan)
        logger.info("Plano salvo no MongoDB")
        
        # Recuperar plano do MongoDB
        retrieved_plan = await db_service.get_user_plan(user_id)
        if retrieved_plan:
            logger.info(f"Plano recuperado: {retrieved_plan.plan_id}")
        
        # Exemplo de sessão de onboarding
        session = OnboardingSession(
            session_id=str(uuid.uuid4()),
            user_id=user_id,
            status="completed",
            current_step="plan_generated",
            answers={"question1": "Sim", "question2": "Não"},
            profile_analysis=analysis,
            generated_plan=plan,
            started_at=datetime.utcnow(),
            completed_at=datetime.utcnow(),
            session_data={"steps_completed": 5, "total_steps": 5}
        )
        
        # Salvar sessão no MongoDB
        await db_service.save_onboarding_session(session)
        logger.info("Sessão de onboarding salva no MongoDB")
        
        # Recuperar sessão do MongoDB
        retrieved_session = await db_service.get_onboarding_session(user_id)
        if retrieved_session:
            logger.info(f"Sessão recuperada: Status {retrieved_session.status}")
        
        # Exemplo de operação genérica (apenas para MongoDB)
        if hasattr(db_service, 'execute'):
            # Buscar todos os usuários com score > 70
            high_score_users = await db_service.execute(
                "find",
                "profile_analyses",
                {"analysis_score": {"$gt": 70}}
            )
            logger.info(f"Usuários com score alto: {len(high_score_users)}")
        
        # Limpar dados de teste
        await db_service.delete_user_data(user_id)
        logger.info("Dados de teste removidos")
        
        # Desconectar do banco
        await db_service.disconnect()
        logger.info("Conexão com banco fechada")
        
    except Exception as e:
        logger.error(f"Erro no exemplo: {str(e)}")
        raise

async def main():
    """Função principal"""
    logger.info("Iniciando exemplo de uso do MongoDB")
    await example_mongodb_usage()
    logger.info("Exemplo concluído com sucesso!")

if __name__ == "__main__":
    asyncio.run(main())

