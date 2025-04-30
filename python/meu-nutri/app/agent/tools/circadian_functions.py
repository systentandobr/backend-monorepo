"""
Funções de implementação para o motor circadiano.
Separa a lógica de implementação da classe da ferramenta principal.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime

def process_time_descriptor(time_of_day: str) -> str:
    """Converte descrições textuais de horários em formato de hora."""
    # Processa horário descritivo para formato numérico
    time_mapping = {
        "manhã": "08:00",
        "início da manhã": "06:00",
        "fim da manhã": "11:00",
        "meio-dia": "12:00",
        "tarde": "15:00", 
        "início da tarde": "13:00",
        "fim da tarde": "17:00",
        "noite": "20:00",
        "início da noite": "18:00",
        "fim da noite": "22:00",
        "madrugada": "03:00"
    }
    
    if time_of_day in time_mapping:
        return time_mapping[time_of_day]
    
    # Caso não seja uma descrição conhecida, retorna o próprio valor
    return time_of_day

def handle_meal_recommendations(engine: Any, time_of_day: str, meal_type: Optional[str] = None) -> Dict[str, Any]:
    """Gera recomendações para refeições."""
    meal_time = meal_type or "refeição genérica"
    nutrients = engine.recommend_nutrients_by_time(time_of_day)
    
    return {
        "time_of_day": time_of_day,
        "activity": meal_time,
        "recommendation": f"Recomendações para {meal_time} às {time_of_day}",
        "nutrient_focus": nutrients["focus_nutrients"],
        "macronutrient_distribution": {
            "protein": nutrients["protein"],
            "carbs": nutrients["carbs"],
            "fat": nutrients["fat"]
        },
        "optimal_foods": get_optimal_foods(nutrients),
        "chronotype_adjusted": True
    }

def handle_exercise_recommendations(engine: Any, time_of_day: str, activity_type: str) -> Dict[str, Any]:
    """Gera recomendações para exercícios."""
    exercise_recommendation = engine.recommend_exercise_by_time(time_of_day)
    
    return {
        "time_of_day": time_of_day,
        "activity": activity_type,
        "recommendation": exercise_recommendation["recommendation"],
        "intensity": exercise_recommendation["intensity"],
        "focus_areas": exercise_recommendation["focus_areas"],
        "duration": exercise_recommendation["duration"],
        "chronotype_adjusted": True
    }

def handle_general_recommendations(engine: Any, time_of_day: str) -> Dict[str, Any]:
    """Gera recomendações gerais baseadas no horário."""
    optimal_activities = engine.get_optimal_activities_by_time(time_of_day)
    
    return {
        "time_of_day": time_of_day,
        "optimal_activities": optimal_activities,
        "energy_level": engine.get_energy_level(time_of_day),
        "focus_capacity": engine.get_focus_capacity(time_of_day),
        "metabolic_state": engine.get_metabolic_state(time_of_day),
        "chronotype": engine.chronotype,
        "chronotype_adjusted": True
    }

def get_optimal_foods(nutrients: Dict[str, Any]) -> List[str]:
    """Retorna alimentos otimizados baseados nas recomendações de nutrientes."""
    focus_nutrients = nutrients["focus_nutrients"]
    protein_level = nutrients["protein"]
    carbs_level = nutrients["carbs"]
    
    optimal_foods = []
    
    if "fibras" in focus_nutrients:
        optimal_foods.extend(["aveia", "chia", "maçã", "brócolis"])
        
    if "antioxidantes" in focus_nutrients:
        optimal_foods.extend(["frutas vermelhas", "nozes", "chá verde"])
        
    if "proteínas completas" in focus_nutrients:
        optimal_foods.extend(["ovos", "peixe", "frango", "tofu"])
        
    if "magnésio" in focus_nutrients:
        optimal_foods.extend(["espinafre", "amêndoas", "semente de abóbora"])
        
    if protein_level == "alto":
        optimal_foods.extend(["peito de frango", "atum", "iogurte grego"])
        
    if carbs_level == "baixo":
        optimal_foods.extend(["vegetais de folhas verdes", "abobrinha", "pepino"])
    
    return list(set(optimal_foods))  # Remove duplicatas
