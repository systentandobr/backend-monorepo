"""
Utilitários para o módulo de ritmo circadiano.
"""

from datetime import datetime, time
from typing import Dict, Any, Optional, Union

def parse_time_of_day(time_of_day: str) -> int:
    """
    Converte uma string de horário em uma hora inteira (0-23).
    
    Args:
        time_of_day: Hora no formato HH:MM ou descrição (manhã, tarde, etc.)
        
    Returns:
        Hora como inteiro (0-23)
    """
    # Mapeamento de descrições para horas aproximadas
    time_mapping = {
        "manhã": 8,
        "início da manhã": 6,
        "fim da manhã": 11,
        "meio-dia": 12,
        "tarde": 15, 
        "início da tarde": 13,
        "fim da tarde": 17,
        "noite": 20,
        "início da noite": 18,
        "fim da noite": 22,
        "madrugada": 3
    }
    
    if time_of_day in time_mapping:
        return time_mapping[time_of_day]
    
    try:
        if ":" in time_of_day:
            hour, _ = map(int, time_of_day.split(':'))
            return hour
        else:
            return int(time_of_day)
    except:
        # Se falhar, usa a hora atual
        return datetime.now().hour

def get_chronotype_shift(chronotype: str) -> int:
    """
    Retorna o deslocamento horário baseado no cronotipo.
    
    Args:
        chronotype: Tipo de cronotipo (morning, intermediate, evening, etc)
        
    Returns:
        Deslocamento horário (-2 a +2)
    """
    shifts = {
        "extreme_morning": -2,
        "morning": -1,
        "intermediate": 0,
        "evening": 1,
        "extreme_evening": 2
    }
    
    return shifts.get(chronotype, 0)

def get_current_time_context() -> Dict[str, Any]:
    """
    Obtém informações contextuais sobre o momento atual do dia.
    
    Returns:
        Dicionário com informações de contexto temporal
    """
    now = datetime.now()
    hour = now.hour
    
    # Determina o período do dia
    if 5 <= hour < 12:
        period = "manhã"
    elif 12 <= hour < 18:
        period = "tarde"
    else:
        period = "noite"
    
    # Avalia proximidade com refeições típicas
    meal_proximity = None
    if 6 <= hour < 9:
        meal_proximity = "café da manhã"
    elif 11 <= hour < 14:
        meal_proximity = "almoço"
    elif 18 <= hour < 21:
        meal_proximity = "jantar"
    
    return {
        "hour": hour,
        "minute": now.minute,
        "time_str": now.strftime("%H:%M"),
        "period": period,
        "near_meal": meal_proximity,
        "is_weekend": now.weekday() >= 5,
        "date": now.strftime("%Y-%m-%d")
    }

def is_optimal_time_for_activity(activity_type: str, hour: int, chronotype: str) -> Dict[str, Any]:
    """
    Avalia se é um momento ótimo para determinada atividade.
    
    Args:
        activity_type: Tipo de atividade (exercise, meal, sleep, work, etc.)
        hour: Hora do dia (0-23)
        chronotype: Cronotipo do usuário
        
    Returns:
        Avaliação de otimalidade com justificativa
    """
    # Ajusta hora com base no cronotipo
    shift = get_chronotype_shift(chronotype)
    adjusted_hour = (hour + shift) % 24
    
    activities = {
        "exercício intenso": {
            "optimal_ranges": [(8, 11), (16, 19)],
            "suboptimal_ranges": [(11, 16), (6, 8)],
            "avoid_ranges": [(0, 6), (20, 24)],
            "optimal_reason": "Temperatura corporal elevada, coordenação motora e força no pico",
            "suboptimal_reason": "Desempenho adequado, mas não ideal",
            "avoid_reason": "Risco elevado de lesões e recuperação prejudicada"
        },
        "exercício leve": {
            "optimal_ranges": [(6, 9), (17, 20)],
            "suboptimal_ranges": [(9, 17), (20, 22)],
            "avoid_ranges": [(22, 6)],
            "optimal_reason": "Ajuda a ativar ou relaxar o corpo nos momentos de transição do dia",
            "suboptimal_reason": "Benefícios presentes, mas pode competir com outras atividades ideais",
            "avoid_reason": "Pode interferir no sono e na recuperação" 
        },
        "refeição principal": {
            "optimal_ranges": [(7, 9), (12, 14), (18, 20)],
            "suboptimal_ranges": [(11, 12), (14, 15), (20, 21)],
            "avoid_ranges": [(0, 7), (21, 24)],
            "optimal_reason": "Alinhado com picos de eficiência digestiva e ritmos metabólicos",
            "suboptimal_reason": "Digestão adequada, mas não no momento ideal",
            "avoid_reason": "Digestão prejudicada e possível interferência no sono"
        },
        "trabalho intelectual": {
            "optimal_ranges": [(9, 12), (15, 18)],
            "suboptimal_ranges": [(6, 9), (12, 15), (18, 20)],
            "avoid_ranges": [(0, 6), (20, 24)],
            "optimal_reason": "Foco e capacidade cognitiva no auge",
            "suboptimal_reason": "Cognição adequada, mas pode requerer mais esforço",
            "avoid_reason": "Capacidade cognitiva naturalmente reduzida"
        },
        "sono": {
            "optimal_ranges": [(22, 24), (0, 7)],
            "suboptimal_ranges": [(21, 22), (7, 8)],
            "avoid_ranges": [(8, 21)],
            "optimal_reason": "Alinhado com produção natural de melatonina e ritmo circadiano",
            "suboptimal_reason": "Possível, mas não no pico do ciclo natural de sono",
            "avoid_reason": "Contrário ao ciclo natural, prejudica qualidade do sono"
        }
    }
    
    # Usa o tipo de atividade especificado ou busca por correspondência parcial
    activity = None
    for key in activities:
        if activity_type.lower() in key or key in activity_type.lower():
            activity = activities[key]
            activity_name = key
            break
    
    if not activity:
        return {
            "is_optimal": False,
            "evaluation": "indeterminado",
            "reason": "Tipo de atividade não reconhecido para avaliação circadiana"
        }
    
    # Verifica em qual faixa a hora se encaixa
    for start, end in activity["optimal_ranges"]:
        if start <= adjusted_hour < end:
            return {
                "is_optimal": True,
                "evaluation": "ótimo",
                "activity": activity_name,
                "reason": activity["optimal_reason"]
            }
    
    for start, end in activity["suboptimal_ranges"]:
        if start <= adjusted_hour < end:
            return {
                "is_optimal": False,
                "evaluation": "adequado",
                "activity": activity_name,
                "reason": activity["suboptimal_reason"]
            }
    
    return {
        "is_optimal": False,
        "evaluation": "evitar",
        "activity": activity_name,
        "reason": activity["avoid_reason"]
    }
