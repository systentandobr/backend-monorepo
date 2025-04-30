"""
Implementação da skill Alexa para o sistema Meu Nutri.
Este módulo define os handlers para os diversos intents da skill Alexa.
"""

import logging
import json
import requests
import boto3
import os
from datetime import datetime
from typing import Dict, Any, Optional

from ask_sdk_core.skill_builder import SkillBuilder
from ask_sdk_core.dispatch_components import AbstractRequestHandler
from ask_sdk_core.dispatch_components import AbstractExceptionHandler
from ask_sdk_core.handler_input import HandlerInput
from ask_sdk_model import Response
from ask_sdk_model.ui import SimpleCard, StandardCard
from ask_sdk_model.interfaces.display import (
    RichText, TextContent, Image, 
    ImageInstance, Template, BodyTemplate2
)
from ask_sdk_core.utils import is_request_type, is_intent_name
from ask_sdk_model.dialog import ElicitSlotDirective
from ask_sdk_model.dialog.delegate_directive import DelegateDirective

# Configuração de logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Configurações da API Meu Nutri
API_ENDPOINT = os.getenv("MEUNUTRI_API_ENDPOINT", "https://api.systentando.com/meu-nutri")
API_KEY = os.getenv("MEUNUTRI_API_KEY", "dummy_key")

# Auxiliar para chamadas à API
def call_agent_api(query: str, user_id: str, conversation_id: Optional[str] = None, 
                  context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Chama a API do agente Meu Nutri.
    
    Args:
        query: Consulta do usuário
        user_id: ID do usuário
        conversation_id: ID da conversa (opcional)
        context: Contexto adicional (opcional)
        
    Returns:
        Resposta da API
    """
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    data = {
        "query": query,
        "user_id": user_id
    }
    
    if conversation_id:
        data["conversation_id"] = conversation_id
        
    if context:
        data["context"] = context
    
    try:
        response = requests.post(
            f"{API_ENDPOINT}/api/agent/query",
            headers=headers,
            json=data,
            timeout=10
        )
        
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.error(f"Erro ao chamar API: {str(e)}")
        raise

# Obter ID do usuário Alexa
def get_user_id_from_alexa(handler_input):
    """Extrai o ID do usuário a partir do request Alexa."""
    return handler_input.request_envelope.context.system.user.user_id

# Manipuladores de intent
class LaunchRequestHandler(AbstractRequestHandler):
    """Manipulador para o início da skill (LaunchRequest)."""
    
    def can_handle(self, handler_input):
        return is_request_type("LaunchRequest")(handler_input)
    
    def handle(self, handler_input):
        user_id = get_user_id_from_alexa(handler_input)
        
        speech_text = (
            "Bem-vindo ao Meu Nutri. Estou aqui para ajudar com sua nutrição "
            "e bem-estar. Posso fornecer dicas nutricionais, analisar seu "
            "perfil alimentar e ajudar a estabelecer hábitos saudáveis. "
            "Como posso ajudar hoje?"
        )
        
        # Salva o ID do usuário na sessão para uso futuro
        attr = handler_input.attributes_manager.session_attributes
        attr["user_id"] = user_id
        
        # Cria resposta da Alexa
        handler_input.response_builder.speak(speech_text).ask(
            "Você pode me perguntar sobre nutrição, pedir dicas de alimentação "
            "ou consultar recomendações personalizadas. Como posso ajudar?"
        )
        
        # Adiciona card para dispositivos com tela
        handler_input.response_builder.set_card(
            SimpleCard(
                title="Meu Nutri - Assistente Nutricional",
                content=speech_text
            )
        )
        
        return handler_input.response_builder.response

class NutritionQueryIntentHandler(AbstractRequestHandler):
    """Manipulador para consultas nutricionais gerais."""
    
    def can_handle(self, handler_input):
        return is_intent_name("NutritionQueryIntent")(handler_input)
    
    def handle(self, handler_input):
        # Obtém atributos da sessão
        attr = handler_input.attributes_manager.session_attributes
        user_id = attr.get("user_id", get_user_id_from_alexa(handler_input))
        conversation_id = attr.get("conversation_id")
        
        # Obtém slots
        slots = handler_input.request_envelope.request.intent.slots
        query = slots["query"].value if "query" in slots else None
        
        if not query:
            speech_text = (
                "Desculpe, não entendi sua pergunta sobre nutrição. "
                "Pode reformular de forma mais clara?"
            )
            
            return handler_input.response_builder.speak(speech_text).ask(
                "Você pode perguntar, por exemplo: Quais alimentos são ricos em proteína?"
            ).response
        
        try:
            # Obtém hora atual para contexto circadiano
            current_hour = datetime.now().hour
            time_context = "manhã" if 5 <= current_hour < 12 else ("tarde" if 12 <= current_hour < 18 else "noite")
            
            # Adiciona contexto à consulta
            context = {
                "platform": "alexa",
                "time_of_day": time_context,
                "device_type": handler_input.request_envelope.context.system.device.device_type_id
            }
            
            # Chama a API do agente
            response = call_agent_api(
                query=query,
                user_id=user_id,
                conversation_id=conversation_id,
                context=context
            )
            
            # Extrai resposta e ID da conversa
            agent_response = response.get("response", "Desculpe, não consegui processar sua consulta.")
            conversation_id = response.get("conversation_id")
            
            # Salva conversation_id para futuras interações
            attr["conversation_id"] = conversation_id
            
            # Prepara resposta para Alexa
            return handler_input.response_builder.speak(agent_response).ask(
                "Posso ajudar com mais alguma dúvida sobre nutrição?"
            ).set_card(
                SimpleCard(
                    title="Dica Nutricional",
                    content=agent_response
                )
            ).response
            
        except Exception as e:
            logger.error(f"Erro ao processar consulta nutricional: {str(e)}")
            
            speech_text = (
                "Desculpe, tive um problema ao processar sua consulta. "
                "Poderia tentar novamente mais tarde?"
            )
            
            return handler_input.response_builder.speak(speech_text).response

class CircadianRecommendationIntentHandler(AbstractRequestHandler):
    """Manipulador para recomendações baseadas no ritmo circadiano."""
    
    def can_handle(self, handler_input):
        return is_intent_name("CircadianRecommendationIntent")(handler_input)
    
    def handle(self, handler_input):
        # Obtém atributos da sessão
        attr = handler_input.attributes_manager.session_attributes
        user_id = attr.get("user_id", get_user_id_from_alexa(handler_input))
        conversation_id = attr.get("conversation_id")
        
        # Obtém slots
        slots = handler_input.request_envelope.request.intent.slots
        activity_type = slots["activityType"].value if "activityType" in slots else None
        time_frame = slots["timeFrame"].value if "timeFrame" in slots else None
        
        # Constrói a consulta
        if activity_type and time_frame:
            query = f"Qual a melhor recomendação para {activity_type} durante a {time_frame}, considerando meu ritmo circadiano?"
        elif activity_type:
            query = f"Qual o melhor momento do dia para {activity_type}, considerando meu ritmo circadiano?"
        elif time_frame:
            query = f"Quais atividades são mais adequadas para a {time_frame}, considerando meu ritmo circadiano?"
        else:
            query = "Quais são as recomendações baseadas no meu ritmo circadiano para o momento atual?"
        
        try:
            # Obtém hora atual para contexto circadiano
            current_hour = datetime.now().hour
            time_context = "manhã" if 5 <= current_hour < 12 else ("tarde" if 12 <= current_hour < 18 else "noite")
            
            # Adiciona contexto à consulta
            context = {
                "platform": "alexa",
                "time_of_day": time_context,
                "activity_type": activity_type,
                "time_frame": time_frame or time_context
            }
            
            # Chama a API do agente
            response = call_agent_api(
                query=query,
                user_id=user_id,
                conversation_id=conversation_id,
                context=context
            )
            
            # Extrai resposta e ID da conversa
            agent_response = response.get("response", "Desculpe, não consegui processar sua consulta circadiana.")
            conversation_id = response.get("conversation_id")
            
            # Salva conversation_id para futuras interações
            attr["conversation_id"] = conversation_id
            
            # Prepara resposta para Alexa
            return handler_input.response_builder.speak(agent_response).ask(
                "Posso ajudar com mais alguma recomendação para seu ritmo biológico?"
            ).set_card(
                SimpleCard(
                    title="Recomendação Circadiana",
                    content=agent_response
                )
            ).response
            
        except Exception as e:
            logger.error(f"Erro ao processar recomendação circadiana: {str(e)}")
            
            speech_text = (
                "Desculpe, tive um problema ao processar sua consulta circadiana. "
                "Poderia tentar novamente mais tarde?"
            )
            
            return handler_input.response_builder.speak(speech_text).response

class MealLogIntentHandler(AbstractRequestHandler):
    """Manipulador para registro de refeições."""
    
    def can_handle(self, handler_input):
        return is_intent_name("MealLogIntent")(handler_input)
    
    def handle(self, handler_input):
        # Obtém atributos da sessão
        attr = handler_input.attributes_manager.session_attributes
        user_id = attr.get("user_id", get_user_id_from_alexa(handler_input))
        conversation_id = attr.get("conversation_id")
        
        # Obtém slots
        slots = handler_input.request_envelope.request.intent.slots
        meal_type = slots["mealType"].value if "mealType" in slots else None
        food_items = slots["foodItems"].value if "foodItems" in slots else None
        
        if not meal_type or not food_items:
            # Se faltam slots, solicita mais informações
            missing_slot = "mealType" if not meal_type else "foodItems"
            
            return handler_input.response_builder.add_directive(
                ElicitSlotDirective(
                    slot_to_elicit=missing_slot
                )
            ).ask(
                f"Por favor, informe o {'tipo de refeição' if missing_slot == 'mealType' else 'alimentos consumidos'}."
            ).response
        
        # Constrói a consulta
        query = f"Registre que acabei de consumir {food_items} como {meal_type}. O que acha dessa refeição?"
        
        try:
            # Obtém hora atual para contexto
            now = datetime.now()
            current_hour = now.hour
            time_context = "manhã" if 5 <= current_hour < 12 else ("tarde" if 12 <= current_hour < 18 else "noite")
            
            # Adiciona contexto à consulta
            context = {
                "platform": "alexa",
                "time_of_day": time_context,
                "meal_type": meal_type,
                "food_items": food_items,
                "meal_time": now.strftime("%H:%M")
            }
            
            # Chama a API do agente
            response = call_agent_api(
                query=query,
                user_id=user_id,
                conversation_id=conversation_id,
                context=context
            )
            
            # Extrai resposta e ID da conversa
            agent_response = response.get("response", "Refeição registrada com sucesso.")
            conversation_id = response.get("conversation_id")
            
            # Salva conversation_id para futuras interações
            attr["conversation_id"] = conversation_id
            
            # Prepara resposta para Alexa
            return handler_input.response_builder.speak(agent_response).ask(
                "Gostaria de registrar outra refeição ou fazer alguma pergunta sobre nutrição?"
            ).set_card(
                SimpleCard(
                    title=f"Registro de {meal_type.capitalize()}",
                    content=agent_response
                )
            ).response
            
        except Exception as e:
            logger.error(f"Erro ao registrar refeição: {str(e)}")
            
            speech_text = (
                "Desculpe, tive um problema ao registrar sua refeição. "
                "Poderia tentar novamente mais tarde?"
            )
            
            return handler_input.response_builder.speak(speech_text).response

class HelpIntentHandler(AbstractRequestHandler):
    """Manipulador para o intent de ajuda."""
    
    def can_handle(self, handler_input):
        return is_intent_name("AMAZON.HelpIntent")(handler_input)
    
    def handle(self, handler_input):
        speech_text = (
            "Você pode usar o Meu Nutri para obter recomendações nutricionais personalizadas. "
            "Por exemplo, você pode dizer: 'quais alimentos são bons pela manhã', 'registre que "
            "comi salada e frango no almoço', ou 'quando é melhor praticar exercícios segundo "
            "meu ritmo circadiano'. Como posso ajudar?"
        )
        
        return handler_input.response_builder.speak(speech_text).ask(
            "O que você gostaria de saber sobre nutrição?"
        ).set_card(
            SimpleCard(
                title="Ajuda - Meu Nutri",
                content=speech_text
            )
        ).response

class CancelAndStopIntentHandler(AbstractRequestHandler):
    """Manipulador para cancelar ou parar a skill."""
    
    def can_handle(self, handler_input):
        return (is_intent_name("AMAZON.CancelIntent")(handler_input) or
                is_intent_name("AMAZON.StopIntent")(handler_input))
    
    def handle(self, handler_input):
        speech_text = "Até logo! Tenha uma ótima refeição!"
        
        return handler_input.response_builder.speak(speech_text).set_card(
            SimpleCard(
                title="Meu Nutri - Até Logo",
                content=speech_text
            )
        ).set_should_end_session(True).response

class SessionEndedRequestHandler(AbstractRequestHandler):
    """Manipulador para o fim da sessão."""
    
    def can_handle(self, handler_input):
        return is_request_type("SessionEndedRequest")(handler_input)
    
    def handle(self, handler_input):
        # Limpa qualquer dado de sessão se necessário
        return handler_input.response_builder.response

class AllExceptionHandler(AbstractExceptionHandler):
    """Manipulador para exceções durante o processamento."""
    
    def can_handle(self, handler_input, exception):
        return True
    
    def handle(self, handler_input, exception):
        logger.error(f"Exceção capturada: {exception}", exc_info=True)
        
        speech_text = (
            "Desculpe, encontrei um problema ao processar sua solicitação. "
            "Por favor, tente novamente."
        )
        
        return handler_input.response_builder.speak(speech_text).ask(
            "Você pode tentar novamente ou pedir ajuda."
        ).set_card(
            SimpleCard(
                title="Erro - Meu Nutri",
                content=speech_text
            )
        ).response

# Montagem da skill
sb = SkillBuilder()

# Registro dos handlers
sb.add_request_handler(LaunchRequestHandler())
sb.add_request_handler(NutritionQueryIntentHandler())
sb.add_request_handler(CircadianRecommendationIntentHandler())
sb.add_request_handler(MealLogIntentHandler())
sb.add_request_handler(HelpIntentHandler())
sb.add_request_handler(CancelAndStopIntentHandler())
sb.add_request_handler(SessionEndedRequestHandler())

# Registro do handler de exceção
sb.add_exception_handler(AllExceptionHandler())

# Lambda handler para AWS
lambda_handler = sb.lambda_handler()
