"""
Motor de recomendações baseadas no ritmo circadiano.
Este módulo implementa a classe CircadianEngine que centraliza as operações relacionadas 
à análise e recomendações baseadas no ritmo circadiano do usuário.
"""

from typing import Dict, Any, List, Optional, Union
from datetime import datetime, time
from app.circadian.utils import (
    parse_time_of_day, 
    get_chronotype_shift, 
    get_current_time_context,
    is_optimal_time_for_activity
)

class CircadianEngine:
    """
    Motor que gerencia recomendações baseadas no ritmo circadiano do usuário.
    
    Fornece funcionalidades para avaliar horários ideais de atividades,
    recomendar nutrientes e exercícios com base no momento do dia e
    considerando o cronotipo do usuário.
    """
    
    def __init__(self, user_profile: Dict[str, Any]):
        """
        Inicializa o motor circadiano com o perfil do usuário.
        
        Args:
            user_profile: Dicionário contendo informações do perfil do usuário
                          incluindo cronotipo e preferências de horários
        """
        self.user_profile = user_profile
        self.chronotype = user_profile.get("chronotype", "intermediate")
        
        # Parse dos horários típicos de sono e vigília
        self.typical_wake_time = user_profile.get("typical_wake_time", "07:00")
        self.typical_sleep_time = user_profile.get("typical_sleep_time", "23:00")
        
        # Ajuste circadiano baseado no cronotipo
        self.circadian_shift = get_chronotype_shift(self.chronotype)
    
    def get_energy_level(self, time_of_day: str) -> str:
        """
        Retorna o nível de energia esperado para o horário especificado.
        
        Args:
            time_of_day: Hora do dia no formato HH:MM ou descrição textual
            
        Returns:
            Classificação do nível de energia (alto, médio, baixo)
        """
        hour = parse_time_of_day(time_of_day)
        
        # Aplicamos o deslocamento do cronotipo
        adjusted_hour = (hour + self.circadian_shift) % 24
        
        # Mapeamento básico de níveis de energia ao longo do dia
        energy_levels = {
            "alto": [(8, 11), (16, 19)],
            "médio": [(7, 8), (11, 13), (15, 16), (19, 21)],
            "baixo": [(0, 7), (13, 15), (21, 24)]
        }
        
        for level, ranges in energy_levels.items():
            for start, end in ranges:
                if start <= adjusted_hour < end:
                    return level
        
        return "médio"  # Fallback
    
    def get_focus_capacity(self, time_of_day: str) -> str:
        """
        Retorna a capacidade de foco esperada para o horário especificado.
        
        Args:
            time_of_day: Hora do dia no formato HH:MM ou descrição textual
            
        Returns:
            Classificação da capacidade de foco (ótima, boa, limitada)
        """
        hour = parse_time_of_day(time_of_day)
        
        # Aplicamos o deslocamento do cronotipo
        adjusted_hour = (hour + self.circadian_shift) % 24
        
        # Mapeamento de capacidade de foco ao longo do dia
        focus_levels = {
            "ótima": [(9, 12), (15, 17)],
            "boa": [(8, 9), (12, 15), (17, 20)],
            "limitada": [(0, 8), (20, 24)]
        }
        
        for level, ranges in focus_levels.items():
            for start, end in ranges:
                if start <= adjusted_hour < end:
                    return level
        
        return "boa"  # Fallback
    
    def get_metabolic_state(self, time_of_day: str) -> str:
        """
        Retorna o estado metabólico esperado para o horário especificado.
        
        Args:
            time_of_day: Hora do dia no formato HH:MM ou descrição textual
            
        Returns:
            Descrição do estado metabólico
        """
        hour = parse_time_of_day(time_of_day)
        
        # Aplicamos o deslocamento do cronotipo
        adjusted_hour = (hour + self.circadian_shift) % 24
        
        # Mapeamento simplificado de estados metabólicos
        if 6 <= adjusted_hour < 10:
            return "metabolismo ativo - fase de despertar"
        elif 10 <= adjusted_hour < 14:
            return "metabolismo alto - pico digestivo"
        elif 14 <= adjusted_hour < 16:
            return "metabolismo moderado - leve declínio após almoço"
        elif 16 <= adjusted_hour < 19:
            return "metabolismo aumentado - segundo pico do dia"
        elif 19 <= adjusted_hour < 22:
            return "metabolismo em redução - preparando para descanso"
        else:
            return "metabolismo reduzido - fase de recuperação"
    
    def get_optimal_activities_by_time(self, time_of_day: str) -> List[Dict[str, Any]]:
        """
        Retorna atividades ideais para o horário especificado.
        
        Args:
            time_of_day: Hora do dia no formato HH:MM ou descrição textual
            
        Returns:
            Lista de atividades recomendadas com avaliações
        """
        hour = parse_time_of_day(time_of_day)
        
        activities_to_check = [
            "exercício intenso",
            "exercício leve",
            "refeição principal",
            "trabalho intelectual",
            "sono"
        ]
        
        results = []
        for activity in activities_to_check:
            evaluation = is_optimal_time_for_activity(activity, hour, self.chronotype)
            
            # Só incluímos atividades que sejam ao menos adequadas
            if evaluation["evaluation"] != "evitar":
                results.append({
                    "activity": activity,
                    "suitability": evaluation["evaluation"],
                    "reason": evaluation["reason"]
                })
        
        # Ordenamos por adequação (ótimo > adequado)
        return sorted(results, key=lambda x: 0 if x["suitability"] == "ótimo" else 1)
        
    def recommend_nutrients_by_time(self, time_of_day: str) -> Dict[str, Any]:
        """
        Recomenda foco nutricional baseado no horário do dia.
        
        Args:
            time_of_day: Hora do dia no formato HH:MM ou descrição textual
            
        Returns:
            Dicionário com recomendações nutricionais
        """
        hour = parse_time_of_day(time_of_day)
        
        # Aplicamos o deslocamento do cronotipo
        adjusted_hour = (hour + self.circadian_shift) % 24
        
        # Função auxiliar para obter alimentos ótimos
        def get_optimal_foods(nutrients_focus, protein_level, carbs_level):
            foods = []
            if "proteínas completas" in nutrients_focus:
                foods.extend(["ovos", "iogurte grego", "frango", "peixe", "tofu"])
            if "fibras" in nutrients_focus:
                foods.extend(["aveia", "chia", "linhaça", "frutas", "vegetais folhosos"])
            if "antioxidantes" in nutrients_focus:
                foods.extend(["frutas vermelhas", "chá verde", "nozes", "sementes"])
            if "vegetais" in nutrients_focus:
                foods.extend(["brócolis", "couve", "espinafre", "abobrinha", "pepino"])
            if "carboidratos complexos" in nutrients_focus:
                foods.extend(["arroz integral", "batata doce", "quinoa", "aveia"])
            if "magnésio" in nutrients_focus:
                foods.extend(["amêndoas", "sementes de abóbora", "espinafre", "chocolate amargo"])
            if "triptofano" in nutrients_focus:
                foods.extend(["peru", "leite", "bananas", "nozes"])
            return list(set(foods))  # Remover duplicatas
        
        # Recomendações nutricionais baseadas no período do dia
        if 5 <= adjusted_hour < 10:
            # Café da manhã
            focus = ["proteínas completas", "fibras", "antioxidantes"]
            result = {
                "focus_nutrients": focus,
                "protein": "médio",
                "carbs": "médio",
                "fat": "baixo",
                "optimal_foods": get_optimal_foods(focus, "médio", "médio")
            }
        elif 10 <= adjusted_hour < 14:
            # Almoço
            focus = ["proteínas completas", "vegetais", "carboidratos complexos"]
            result = {
                "focus_nutrients": focus,
                "protein": "alto",
                "carbs": "médio",
                "fat": "médio",
                "optimal_foods": get_optimal_foods(focus, "alto", "médio")
            }
        elif 14 <= adjusted_hour < 17:
            # Lanche da tarde
            focus = ["fibras", "proteínas", "magnésio"]
            result = {
                "focus_nutrients": focus,
                "protein": "médio",
                "carbs": "baixo",
                "fat": "médio",
                "optimal_foods": get_optimal_foods(focus, "médio", "baixo")
            }
        elif 17 <= adjusted_hour < 21:
            # Jantar
            focus = ["proteínas", "vegetais", "magnésio", "triptofano"]
            result = {
                "focus_nutrients": focus,
                "protein": "médio",
                "carbs": "baixo",
                "fat": "médio",
                "optimal_foods": get_optimal_foods(focus, "médio", "baixo")
            }
        else:
            # Noite/Madrugada
            focus = ["proteínas leves", "magnésio", "triptofano"]
            result = {
                "focus_nutrients": focus,
                "protein": "baixo",
                "carbs": "muito baixo",
                "fat": "baixo",
                "optimal_foods": get_optimal_foods(focus, "baixo", "muito baixo")
            }
            
        return result
    
    def recommend_exercise_by_time(self, time_of_day: str) -> Dict[str, Any]:
        """
        Recomenda tipo e intensidade de exercício baseado no horário.
        
        Args:
            time_of_day: Hora do dia no formato HH:MM ou descrição textual
            
        Returns:
            Dicionário com recomendações de exercícios
        """
        hour = parse_time_of_day(time_of_day)
        
        # Aplicamos o deslocamento do cronotipo
        adjusted_hour = (hour + self.circadian_shift) % 24
        
        # Avaliação de adequação para exercício
        exercise_intense = is_optimal_time_for_activity("exercício intenso", hour, self.chronotype)
        exercise_light = is_optimal_time_for_activity("exercício leve", hour, self.chronotype)
        
        # Determina recomendação com base nas avaliações
        if exercise_intense["evaluation"] == "ótimo":
            result = {
                "recommendation": "Momento ideal para exercícios de alta intensidade",
                "intensity": "alta",
                "focus_areas": ["resistência", "força", "cardio"],
                "duration": "30-60 minutos",
                "optimal_activities": ["corrida", "HIIT", "treino de força", "cross-training", "spinning"]
            }
        elif exercise_light["evaluation"] == "ótimo":
            result = {
                "recommendation": "Momento ideal para exercícios leves a moderados",
                "intensity": "moderada",
                "focus_areas": ["flexibilidade", "equilíbrio", "mobilidade"],
                "duration": "20-40 minutos",
                "optimal_activities": ["yoga", "pilates", "caminhada", "alongamento", "tai chi"]
            }
        elif exercise_intense["evaluation"] == "adequado":
            result = {
                "recommendation": "Adequado para exercícios de intensidade média",
                "intensity": "média",
                "focus_areas": ["resistência", "tonificação"],
                "duration": "20-45 minutos",
                "optimal_activities": ["ciclismo moderado", "natação", "treino funcional", "dança", "elíptico"]
            }
        elif exercise_light["evaluation"] == "adequado":
            result = {
                "recommendation": "Adequado para exercícios leves",
                "intensity": "leve",
                "focus_areas": ["alongamento", "caminhada", "movimentos suaves"],
                "duration": "15-30 minutos",
                "optimal_activities": ["caminhada leve", "alongamento dinâmico", "yoga restaurativa", "exercícios de mobilidade", "tai chi"]
            }
        else:
            result = {
                "recommendation": "Momento não ideal para exercícios. Se necessário, limite a atividades muito leves",
                "intensity": "muito leve",
                "focus_areas": ["alongamento suave", "respiração", "mobilidade articular"],
                "duration": "10-15 minutos",
                "optimal_activities": ["alongamento estático", "caminhada curta", "respiração profunda", "meditação ativa", "movimentos suaves"]
            }
            
        return result
    
    def get_optimal_meal_timing(self) -> Dict[str, str]:
        """
        Retorna horários ótimos para refeições com base no cronotipo.
        
        Returns:
            Dicionário com horários ideais para cada refeição
        """
        # Parse dos horários típicos do usuário
        wake_hour = int(self.typical_wake_time.split(":")[0])
        sleep_hour = int(self.typical_sleep_time.split(":")[0])
        
        # Ajuste baseado no cronotipo
        wake_hour = (wake_hour + self.circadian_shift) % 24
        sleep_hour = (sleep_hour + self.circadian_shift) % 24
        
        # Cálculo de horários ideais (valores aproximados baseados em pesquisas circadianas)
        breakfast_hour = (wake_hour + 1) % 24
        lunch_hour = (wake_hour + 5) % 24
        snack_hour = (wake_hour + 8) % 24
        dinner_hour = (wake_hour + 11) % 24
        
        # Formato de saída
        return {
            "café da manhã": f"{breakfast_hour:02d}:00 - {breakfast_hour:02d}:30",
            "almoço": f"{lunch_hour:02d}:00 - {lunch_hour:02d}:30",
            "lanche": f"{snack_hour:02d}:00 - {snack_hour:02d}:30",
            "jantar": f"{dinner_hour:02d}:00 - {dinner_hour:02d}:30"
        }
