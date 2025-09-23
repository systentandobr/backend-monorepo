#!/usr/bin/env python3
"""
Script de teste para validar a implementação do Agno
Testa todas as funcionalidades implementadas
"""

import asyncio
import logging
import json
from datetime import datetime
from pathlib import Path

# Configurar paths antes de qualquer import
import sys
sys.path.append(str(Path(__file__).parent))

# Importar o utilitário de configuração de paths
from utils.path_config import setup_project_paths
setup_project_paths(__file__)

from core.agent_onboarding import AgnoOnboardingAgent
from core.agent import OnboardingAgent
from models.schemas import OnboardingRequest

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgnoImplementationTester:
    """Classe para testar a implementação do Agno"""
    
    def __init__(self):
        self.agent_onboarding = AgnoOnboardingAgent()
        self.legacy_agent = OnboardingAgent()
        self.test_user_id = "test_user_agno_001"
        self.test_answers = {
            "concentration": "high-focus",
            "lifestyle": "very-satisfied",
            "energy": "high-energy",
            "wakeupTime": "06:00",
            "sleepTime": "22:00",
            "financial_goals": ["emergency_fund", "investment_start", "debt_free"],
            "learning_areas": ["programming", "business", "languages"],
            "business_interests": ["startup", "consulting", "ecommerce"],
            "health_goals": ["weight_loss", "muscle_gain", "endurance"],
            "productivity_goals": ["time_management", "focus", "organization"]
        }
    
    async def setup(self):
        """Configurar agentes para teste"""
        logger.info("Configurando agentes para teste...")
        
        try:
            await self.agent_onboarding.initialize()
            await self.legacy_agent.initialize()
            logger.info("✓ Agentes inicializados com sucesso")
        except Exception as e:
            logger.error(f"✗ Erro ao inicializar agentes: {str(e)}")
            raise
    
    async def test_agent_onboarding_initialization(self):
        """Testa inicialização do agente Agno"""
        logger.info("Testando inicialização do agente Agno...")
        
        try:
            assert self.agent_onboarding.initialized == True
            assert self.agent_onboarding.agent_onboarding is not None
            assert self.agent_onboarding.memory is not None
            logger.info("✓ Agente Agno inicializado corretamente")
            return True
        except Exception as e:
            logger.error(f"✗ Erro na inicialização do Agno: {str(e)}")
            return False
    
    async def test_legacy_agent_initialization(self):
        """Testa inicialização do agente legado"""
        logger.info("Testando inicialização do agente legado...")
        
        try:
            assert self.legacy_agent.initialized == True
            logger.info("✓ Agente legado inicializado corretamente")
            return True
        except Exception as e:
            logger.error(f"✗ Erro na inicialização do agente legado: {str(e)}")
            return False
    
    async def test_agno_onboarding_process(self):
        """Testa processo completo de onboarding com Agno"""
        logger.info("Testando processo de onboarding com Agno...")
        
        try:
            # Executar onboarding completo
            result = await self.agent_onboarding.process_onboarding(
                user_id=self.test_user_id,
                answers=self.test_answers
            )
            
            # Verificar resultado
            assert result.success == True
            assert result.user_id == self.test_user_id
            assert result.profile_analysis is not None
            assert result.generated_plan is not None
            assert result.processing_time > 0
            
            logger.info(f"✓ Onboarding com Agno completado em {result.processing_time:.2f}s")
            logger.info(f"  - Análise de perfil: {result.profile_analysis.profile.profile_type}")
            logger.info(f"  - Plano gerado: {result.generated_plan.plan_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"✗ Erro no onboarding com Agno: {str(e)}")
            return False
    
    async def test_legacy_onboarding_process(self):
        """Testa processo completo de onboarding com agente legado"""
        logger.info("Testando processo de onboarding com agente legado...")
        
        try:
            # Executar onboarding completo
            result = await self.legacy_agent.process_onboarding(
                user_id=f"{self.test_user_id}_legacy",
                answers=self.test_answers
            )
            
            # Verificar resultado
            assert result.success == True
            assert result.user_id == f"{self.test_user_id}_legacy"
            assert result.profile_analysis is not None
            assert result.generated_plan is not None
            assert result.processing_time > 0
            
            logger.info(f"✓ Onboarding legado completado em {result.processing_time:.2f}s")
            logger.info(f"  - Análise de perfil: {result.profile_analysis.profile.profile_type}")
            logger.info(f"  - Plano gerado: {result.generated_plan.plan_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"✗ Erro no onboarding legado: {str(e)}")
            return False
    
    async def test_agno_profile_analysis(self):
        """Testa análise de perfil com Agno"""
        logger.info("Testando análise de perfil com Agno...")
        
        try:
            # Analisar apenas perfil
            profile_analysis = await self.agent_onboarding.analyze_profile_only(
                user_id=f"{self.test_user_id}_profile",
                answers=self.test_answers
            )
            
            # Verificar análise
            assert profile_analysis.user_id == f"{self.test_user_id}_profile"
            assert profile_analysis.profile is not None
            assert profile_analysis.domain_priorities is not None
            assert profile_analysis.key_insights is not None
            assert profile_analysis.analysis_score > 0
            assert profile_analysis.confidence_level > 0
            
            logger.info(f"✓ Análise de perfil com Agno: {profile_analysis.profile.profile_type}")
            logger.info(f"  - Score: {profile_analysis.analysis_score:.1f}")
            logger.info(f"  - Confiança: {profile_analysis.confidence_level:.1f}%")
            
            return True
            
        except Exception as e:
            logger.error(f"✗ Erro na análise de perfil com Agno: {str(e)}")
            return False
    
    async def test_agno_plan_generation(self):
        """Testa geração de plano com Agno"""
        logger.info("Testando geração de plano com Agno...")
        
        try:
            # Primeiro analisar perfil
            profile_analysis = await self.agent_onboarding.analyze_profile_only(
                user_id=f"{self.test_user_id}_plan",
                answers=self.test_answers
            )
            
            # Gerar plano a partir da análise
            generated_plan = await self.agent_onboarding.generate_plan_from_analysis(
                user_id=f"{self.test_user_id}_plan",
                profile_analysis=profile_analysis
            )
            
            # Verificar plano
            assert generated_plan.plan_id is not None
            assert generated_plan.template_match is not None
            assert generated_plan.domains is not None
            assert generated_plan.daily_schedule is not None
            assert generated_plan.integrated_goals is not None
            
            logger.info(f"✓ Plano gerado com Agno: {generated_plan.plan_id}")
            logger.info(f"  - Template: {generated_plan.template_match.template_id}")
            logger.info(f"  - Domínios: {len(generated_plan.domains)}")
            logger.info(f"  - Rotina diária: {len(generated_plan.daily_schedule)} atividades")
            
            return True
            
        except Exception as e:
            logger.error(f"✗ Erro na geração de plano com Agno: {str(e)}")
            return False
    
    async def test_agno_memory_functionality(self):
        """Testa funcionalidades de memória do Agno"""
        logger.info("Testando funcionalidades de memória do Agno...")
        
        try:
            # Obter resumo da memória
            memory_summary = await self.agent_onboarding.get_memory_summary(self.test_user_id)
            
            # Verificar resumo
            assert memory_summary["user_id"] == self.test_user_id
            assert "memory_count" in memory_summary
            assert "recent_memories" in memory_summary
            assert "summary" in memory_summary
            
            logger.info(f"✓ Memória do Agno: {memory_summary['memory_count']} interações")
            logger.info(f"  - Resumo: {memory_summary['summary']}")
            
            return True
            
        except Exception as e:
            logger.error(f"✗ Erro na funcionalidade de memória: {str(e)}")
            return False
    
    async def test_agno_recommendations(self):
        """Testa geração de recomendações com Agno"""
        logger.info("Testando geração de recomendações com Agno...")
        
        try:
            # Gerar recomendações
            recommendations = await self.agent_onboarding.get_user_recommendations(
                user_id=self.test_user_id
            )
            
            # Verificar recomendações
            assert recommendations["user_id"] == self.test_user_id
            assert "recommendations" in recommendations
            assert "generated_at" in recommendations
            assert "domain" in recommendations
            
            logger.info(f"✓ Recomendações geradas com Agno")
            logger.info(f"  - Domínio: {recommendations['domain']}")
            logger.info(f"  - Gerado em: {recommendations['generated_at']}")
            
            return True
            
        except Exception as e:
            logger.error(f"✗ Erro na geração de recomendações: {str(e)}")
            return False
    
    async def test_tools_functionality(self):
        """Testa funcionalidade das ferramentas do Agno"""
        logger.info("Testando funcionalidade das ferramentas do Agno...")
        
        try:
            # Verificar se as ferramentas estão disponíveis
            tools = self.agent_onboarding.agent_onboarding.tools
            
            expected_tools = [
                "TavilyTools",
                "analyze_profile_tool",
                "generate_plan_tool",
                "match_template_tool",
                "save_results_tool",
                "get_user_history_tool"
            ]
            
            tool_names = [tool.__class__.__name__ for tool in tools]
            
            for expected_tool in expected_tools:
                assert any(expected_tool in name for name in tool_names), f"Ferramenta {expected_tool} não encontrada"
            
            logger.info(f"✓ Ferramentas do Agno: {len(tools)} ferramentas disponíveis")
            for tool in tools:
                logger.info(f"  - {tool.__class__.__name__}")
            
            return True
            
        except Exception as e:
            logger.error(f"✗ Erro na verificação das ferramentas: {str(e)}")
            return False
    
    async def run_all_tests(self):
        """Executa todos os testes"""
        logger.info("=== Iniciando Testes da Implementação do Agno ===")
        
        test_results = []
        
        try:
            # Setup
            await self.setup()
            
            # Testes de inicialização
            test_results.append(await self.test_agent_onboarding_initialization())
            test_results.append(await self.test_legacy_agent_initialization())
            
            # Testes de funcionalidade
            test_results.append(await self.test_agno_onboarding_process())
            test_results.append(await self.test_legacy_onboarding_process())
            test_results.append(await self.test_agno_profile_analysis())
            test_results.append(await self.test_agno_plan_generation())
            
            # Testes de memória e recomendações
            test_results.append(await self.test_agno_memory_functionality())
            test_results.append(await self.test_agno_recommendations())
            
            # Testes de ferramentas
            test_results.append(await self.test_tools_functionality())
            
            # Resumo dos resultados
            total_tests = len(test_results)
            passed_tests = sum(test_results)
            failed_tests = total_tests - passed_tests
            
            logger.info("=== Resumo dos Testes ===")
            logger.info(f"Total de testes: {total_tests}")
            logger.info(f"Testes aprovados: {passed_tests}")
            logger.info(f"Testes falharam: {failed_tests}")
            logger.info(f"Taxa de sucesso: {(passed_tests/total_tests)*100:.1f}%")
            
            if failed_tests == 0:
                logger.info("🎉 Todos os testes passaram! Implementação do Agno está funcionando corretamente.")
                return True
            else:
                logger.warning(f"⚠️ {failed_tests} testes falharam. Verificar implementação.")
                return False
                
        except Exception as e:
            logger.error(f"Erro crítico durante os testes: {str(e)}")
            return False

async def main():
    """Função principal"""
    
    logger.info("=== Validador da Implementação do Agno ===")
    
    try:
        # Criar instância do tester
        tester = AgnoImplementationTester()
        
        # Executar todos os testes
        success = await tester.run_all_tests()
        
        if success:
            logger.info("✅ Implementação do Agno validada com sucesso!")
            sys.exit(0)
        else:
            logger.error("❌ Implementação do Agno apresenta problemas!")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"Erro fatal: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
