"""
Implementações dos métodos _run e _arun para o CircadianTool.
"""

from typing import Dict, Any, Optional
from datetime import datetime
from app.agent.tools.circadian_functions import (
    process_time_descriptor,
    handle_meal_recommendations,
    handle_exercise_recommendations,
    handle_general_recommendations
)

async def run_circadian_tool(
    self,
    time_of_day: Optional[str] = None, 
    activity_type: Optional[str] = None,
    meal_type: Optional[str] = None, 
    **kwargs
) -> Dict[str, Any]:
    """
    Executa a ferramenta para obter recomendações circadianas.
    
    Args:
        time_of_day: Hora do dia para recomendações
        activity_type: Tipo de atividade 
        meal_type: Tipo de refeição
        
    Returns:
        Recomendações baseadas no ritmo circadiano
    """
    await self._initialize_engine()
    
    # Determina a hora atual se não for especificada
    if not time_of_day:
        current_time = datetime.now().strftime("%H:%M")
        time_of_day = current_time
    
    # Processa a descrição do horário
    time_of_day = process_time_descriptor(time_of_day)
        
    # Obtém recomendações específicas baseadas nos parâmetros
    if activity_type and activity_type.lower() == "alimentação" or meal_type:
        return handle_meal_recommendations(self.engine, time_of_day, meal_type)
        
    elif activity_type and activity_type.lower() in ["exercício", "atividade física", "treino"]:
        return handle_exercise_recommendations(self.engine, time_of_day, activity_type)
        
    else:
        # Recomendação genérica baseada no horário
        return handle_general_recommendations(self.engine, time_of_day)

async def arun_circadian_tool(
    self,
    time_of_day: Optional[str] = None, 
    activity_type: Optional[str] = None,
    meal_type: Optional[str] = None, 
    **kwargs
) -> Dict[str, Any]:
    """
    Versão assíncrona da execução da ferramenta circadiana.
    
    Args:
        time_of_day: Hora do dia para recomendações
        activity_type: Tipo de atividade 
        meal_type: Tipo de refeição
        
    Returns:
        Recomendações baseadas no ritmo circadiano
    """
    return await run_circadian_tool(
        self, time_of_day, activity_type, meal_type, **kwargs
    )
