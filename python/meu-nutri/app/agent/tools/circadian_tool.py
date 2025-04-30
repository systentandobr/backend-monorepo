"""
Ferramenta para o agente MCP que fornece recomendações baseadas no ritmo circadiano do usuário.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
from pydantic import Field
from app.agent.tools.base_tool import BaseSystentandoTool

from app.circadian.engine import CircadianEngine
from app.db.database import get_user_profile

# Importa as funções do arquivo externo
from app.agent.tools.circadian_tool_run import run_circadian_tool, arun_circadian_tool

class CircadianTool(BaseSystentandoTool):
    """
    Ferramenta para fornecer recomendações baseadas no ritmo circadiano do usuário.
    """
    
    name: str = "circadian_advisor"
    description: str = """
    Ferramenta para obter recomendações baseadas no ritmo circadiano do usuário.
    Use quando precisar determinar o horário ideal para atividades específicas, 
    recomendações nutricionais baseadas no momento do dia, ou orientação sobre 
    o ciclo biológico.
    """
    
    # Propriedades específicas desta ferramenta
    engine: Optional[Any] = Field(default=None, description="Motor de recomendação circadiana")
    
    def __init__(self, user_id: str):
        """Inicializa a ferramenta circadiana."""
        # Inicializa a classe pai com o user_id
        super().__init__(user_id=user_id)
        self.engine = None
    
    async def _initialize_engine(self):
        """Inicializa o motor circadiano com o perfil do usuário."""
        if self.engine is None:
            user_profile = await get_user_profile(self.user_id)
            if user_profile:
                self.engine = CircadianEngine(user_profile)
            else:
                # Cria um motor com valores padrão se o perfil não existir
                self.engine = CircadianEngine({
                    "chronotype": "intermediate",
                    "typical_wake_time": "07:00",
                    "typical_sleep_time": "23:00"
                })
    
    # Vincula as implementações externas
    _run = run_circadian_tool
    _arun = arun_circadian_tool
    
    def _parse_input(self, text_input: str) -> Dict[str, Any]:
        """Processa entrada em formato de texto para extrair parâmetros."""
        # Processa entrada em formato de texto livre
        input_dict = {}
        
        if "manhã" in text_input.lower():
            input_dict["time_of_day"] = "manhã"
        elif "tarde" in text_input.lower():
            input_dict["time_of_day"] = "tarde"
        elif "noite" in text_input.lower():
            input_dict["time_of_day"] = "noite"
                
        if "alimentação" in text_input.lower() or "comer" in text_input.lower() or "refeição" in text_input.lower():
            input_dict["activity_type"] = "alimentação"
                
        if "exercício" in text_input.lower() or "treino" in text_input.lower() or "atividade física" in text_input.lower():
            input_dict["activity_type"] = "exercício"
                
        for meal in ["café da manhã", "almoço", "jantar", "lanche"]:
            if meal in text_input.lower():
                input_dict["meal_type"] = meal
        
        return input_dict
