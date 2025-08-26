#!/usr/bin/env python3
"""
Script de teste para o agente Meu Nutri.
Permite testar a interação com o agente via linha de comando.
"""

import asyncio
import argparse
import logging
import json
import os
from dotenv import load_dotenv

# Configura logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Carrega variáveis de ambiente
load_dotenv()

async def test_hybrid_agent():
    """Testa o agente híbrido (LangChain + Model Context Protocol)."""
    from app.agent.hybrid_agent import HybridNutriAgent
    
    print("\n=== Testando Agente Híbrido Meu Nutri ===\n")
    
    # Cria instância do agente
    user_id = "test_user_123"
    agent = HybridNutriAgent(user_id=user_id)
    
    try:
        # Inicializa o agente
        print("Inicializando agente...")
        await agent.initialize()
        print("Agente inicializado!")
        
        # Loop de interação
        print("\nDigite suas perguntas para o agente (digite 'sair' para terminar):")
        
        while True:
            query = input("\nVocê: ")
            
            if query.lower() in ['sair', 'exit', 'quit', 'q']:
                break
            
            # Adiciona contexto de teste
            context = {
                "session_type": "test",
                "time_of_day": "tarde"
            }
            
            # Processa a consulta
            print("\nProcessando...")
            response = await agent.process_query(query, context)
            
            # Exibe a resposta
            print(f"\nAgente: {response['response']}")
            print(f"\nID da conversa: {response['conversation_id']}")
            
    except Exception as e:
        logger.error(f"Erro ao testar agente: {str(e)}", exc_info=True)
    finally:
        # Fecha recursos
        await agent.close()
        print("\nTeste concluído!")

async def test_vision_module():
    """Testa o módulo de visão computacional."""
    from app.vision.body_analyzer import BodyAnalyzer
    
    print("\n=== Testando Módulo de Visão Computacional ===\n")
    
    # Solicita caminho da imagem
    image_path = input("Digite o caminho para uma imagem de teste (ou pressione Enter para pular): ")
    
    if not image_path:
        print("Teste de visão pulado.")
        return
    
    if not os.path.exists(image_path):
        print(f"Arquivo não encontrado: {image_path}")
        return
    
    try:
        # Cria instância do analisador
        analyzer = BodyAnalyzer()
        
        # Dados de usuário para teste
        user_data = {
            "height_cm": 175,
            "weight_kg": 70,
            "gender": "male",
            "age": 35
        }
        
        # Processa a imagem
        print("Analisando imagem...")
        result = analyzer.analyze_image(image_path, user_data)
        
        # Exibe resultados
        print("\nResultado da análise:")
        print(json.dumps(result, indent=2))
        
        if "visualization_path" in result:
            print(f"\nVisualização salva em: {result['visualization_path']}")
        
    except Exception as e:
        logger.error(f"Erro ao testar módulo de visão: {str(e)}", exc_info=True)

async def test_circadian_engine():
    """Testa o motor de recomendação circadiana."""
    from app.circadian.engine import CircadianEngine
    
    print("\n=== Testando Engine Circadiano ===\n")
    
    # Cria perfil de teste
    user_profile = {
        "typical_wake_time": "07:00",
        "typical_sleep_time": "23:00",
        "age": 35,
        "gender": "female",
        "exercise_frequency": "moderate"
    }
    
    try:
        # Cria instância do engine
        engine = CircadianEngine(user_profile)
        
        # Exibe informações do cronotipo
        print(f"Cronotipo detectado: {engine.chronotype}")
        
        # Obtém horários ótimos de refeição
        meal_timing = engine.get_optimal_meal_timing()
        print("\nHorários ideais para refeições:")
        for meal, time_range in meal_timing.items():
            print(f"  {meal}: {time_range}")
        
        # Testa recomendações nutricionais
        times_to_test = ["manhã", "tarde", "noite"]
        
        for time_of_day in times_to_test:
            print(f"\nRecomendações nutricionais para {time_of_day}:")
            nutrients = engine.recommend_nutrients_by_time(time_of_day)
            
            print(f"  Proteínas: {nutrients['protein']}")
            print(f"  Carboidratos: {nutrients['carbs']}")
            print(f"  Gorduras: {nutrients['fat']}")
            print(f"  Foco em: {', '.join(nutrients['focus_nutrients'])}")
            print(f"  Alimentos ideais: {', '.join(nutrients['optimal_foods'][:5])}...")
        
        # Testa recomendações de exercício
        for time_of_day in times_to_test:
            print(f"\nRecomendações de exercício para {time_of_day}:")
            exercise = engine.recommend_exercise_by_time(time_of_day)
            
            print(f"  Recomendação: {exercise['recommendation']}")
            print(f"  Intensidade: {exercise['intensity']}")
            print(f"  Foco em: {', '.join(exercise['focus_areas'])}")
            print(f"  Atividades ideais: {', '.join(exercise['optimal_activities'][:3])}...")
        
    except Exception as e:
        logger.error(f"Erro ao testar engine circadiano: {str(e)}", exc_info=True)

async def test_alexa_integration():
    """Testa a integração com Alexa (simulada)."""
    print("\n=== Testando Integração Alexa (Simulada) ===\n")
    
    try:
        # Simula uma skill Alexa
        from app.alexa.skill import call_agent_api
        
        # Configura ambiente para teste
        if not os.getenv("MEUNUTRI_API_ENDPOINT"):
            os.environ["MEUNUTRI_API_ENDPOINT"] = "http://0.0.0.0:8000"
            os.environ["MEUNUTRI_API_KEY"] = "test_key_123"
        
        print("Esta é uma simulação de interação via Alexa.")
        print("A API não é chamada realmente em modo de teste.")
        
        # Loop de interação
        print("\nDigite frases que você falaria para Alexa (digite 'sair' para terminar):")
        
        while True:
            query = input("\nVocê para Alexa: ")
            
            if query.lower() in ['sair', 'exit', 'quit', 'q']:
                break
            
            # Simula processamento de intent
            print("\nProcessando intent...")
            print("Extraindo slots da frase...")
            
            # Identifica possíveis intents baseadas na entrada
            if "recomendação" in query.lower() or "circadiano" in query.lower():
                intent = "CircadianRecommendationIntent"
                print(f"Intent detectada: {intent}")
                
                # Extrai slots
                slots = {}
                if "exercício" in query.lower() or "treino" in query.lower():
                    slots["activityType"] = "exercício"
                elif "comer" in query.lower() or "refeição" in query.lower() or "alimentação" in query.lower():
                    slots["activityType"] = "alimentação"
                
                if "manhã" in query.lower():
                    slots["timeFrame"] = "manhã"
                elif "tarde" in query.lower():
                    slots["timeFrame"] = "tarde"
                elif "noite" in query.lower():
                    slots["timeFrame"] = "noite"
                
                print(f"Slots extraídos: {slots}")
                
            elif "comi" in query.lower() or "registre" in query.lower() or "refeição" in query.lower():
                intent = "MealLogIntent"
                print(f"Intent detectada: {intent}")
                
                # Extrai slots
                slots = {"mealType": None, "foodItems": None}
                
                if "café" in query.lower() or "manhã" in query.lower():
                    slots["mealType"] = "café da manhã"
                elif "almoço" in query.lower() or "almocei" in query.lower():
                    slots["mealType"] = "almoço"
                elif "jantar" in query.lower() or "jantei" in query.lower():
                    slots["mealType"] = "jantar"
                elif "lanche" in query.lower():
                    slots["mealType"] = "lanche"
                
                # Extrai alimentos (simplificado)
                food_words = ["pão", "arroz", "feijão", "carne", "frango", "peixe", 
                             "salada", "verduras", "frutas", "legumes", "ovo", "leite"]
                
                found_foods = []
                for food in food_words:
                    if food in query.lower():
                        found_foods.append(food)
                
                if found_foods:
                    slots["foodItems"] = ", ".join(found_foods)
                
                print(f"Slots extraídos: {slots}")
                
            else:
                intent = "NutritionQueryIntent"
                print(f"Intent detectada: {intent}")
                slots = {"query": query}
            
            # Simula chamada à API
            print("\nSimulando chamada à API do agente...")
            
            # Em teste, não faz a chamada real
            print(f"\nAlexa: Processando sua solicitação sobre {intent}...")
            
            # Resposta simulada de acordo com o intent
            if intent == "CircadianRecommendationIntent":
                activity = slots.get("activityType", "atividades gerais")
                time_frame = slots.get("timeFrame", "momento atual")
                
                if activity == "exercício":
                    print(f"\nAlexa: Para {activity} durante a {time_frame}, recomendo atividades de intensidade moderada, como caminhada ou yoga. Este é um bom momento para exercícios que ajudem a regular seu ritmo circadiano.")
                else:
                    print(f"\nAlexa: Para {activity} durante a {time_frame}, recomendo foco em proteínas e vegetais. Este é um bom momento para alimentos que ajudem a manter a energia estável pelo resto do dia.")
            
            elif intent == "MealLogIntent":
                meal_type = slots.get("mealType", "refeição")
                food_items = slots.get("foodItems", "alimentos")
                
                if food_items:
                    print(f"\nAlexa: Registrei que você consumiu {food_items} como {meal_type}. Esta refeição parece equilibrada e adequada para o momento do dia.")
                else:
                    print(f"\nAlexa: Registrei seu {meal_type}. Para uma análise mais detalhada, por favor especifique quais alimentos você consumiu.")
            
            else:
                print(f"\nAlexa: Sua pergunta sobre nutrição foi recebida. Para responder adequadamente, consultaria o agente Meu Nutri com sua dúvida específica: '{query}'")
        
    except Exception as e:
        logger.error(f"Erro ao testar integração Alexa: {str(e)}", exc_info=True)

async def main():
    """Função principal com menu de testes."""
    parser = argparse.ArgumentParser(description='Testes do sistema Meu Nutri')
    parser.add_argument('--all', action='store_true', help='Executa todos os testes')
    parser.add_argument('--agent', action='store_true', help='Testa o agente híbrido')
    parser.add_argument('--vision', action='store_true', help='Testa o módulo de visão')
    parser.add_argument('--circadian', action='store_true', help='Testa o engine circadiano')
    parser.add_argument('--alexa', action='store_true', help='Testa integração Alexa (simulada)')
    
    args = parser.parse_args()
    
    if args.all or args.agent:
        await test_hybrid_agent()
    
    if args.all or args.vision:
        await test_vision_module()
    
    if args.all or args.circadian:
        await test_circadian_engine()
    
    if args.all or args.alexa:
        await test_alexa_integration()
    
    if not (args.all or args.agent or args.vision or args.circadian or args.alexa):
        # Menu interativo se nenhum argumento for fornecido
        while True:
            print("\n=== Menu de Testes Meu Nutri ===")
            print("1. Testar Agente Híbrido")
            print("2. Testar Módulo de Visão")
            print("3. Testar Engine Circadiano")
            print("4. Testar Integração Alexa (simulada)")
            print("0. Sair")
            
            choice = input("\nEscolha uma opção: ")
            
            if choice == "1":
                await test_hybrid_agent()
            elif choice == "2":
                await test_vision_module()
            elif choice == "3":
                await test_circadian_engine()
            elif choice == "4":
                await test_alexa_integration()
            elif choice == "0":
                break
            else:
                print("Opção inválida!")

if __name__ == "__main__":
    asyncio.run(main())
