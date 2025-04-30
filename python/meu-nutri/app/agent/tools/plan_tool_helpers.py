"""
Métodos auxiliares para a ferramenta de planejamento nutricional.
"""

from typing import Dict, Any, List, Optional

def generate_meal_examples(
    plan_type: str, dietary_restrictions: List[str], meals_per_day: int
) -> Dict[str, Dict[str, Dict[str, str]]]:
    """Gera exemplos de refeições com base no tipo de plano e restrições."""
    
    # Biblioteca simplificada de opções de refeição para exemplo
    meal_options = {
        "weight_loss": {
            "breakfast": [
                "Omelete de claras com espinafre e tomate + 1 fatia de pão integral",
                "Iogurte grego com frutas vermelhas e sementes de chia",
                "Smoothie proteico com whey, banana e aveia"
            ],
            "lunch": [
                "Salada de folhas variadas com peito de frango grelhado",
                "Salmão grelhado com legumes no vapor e quinoa",
                "Bowl de frango desfiado, arroz integral, feijão e vegetais"
            ],
            "dinner": [
                "Peixe assado com purê de couve-flor e salada",
                "Tofu salteado com vegetais e arroz integral",
                "Sopa de legumes com peito de peru"
            ],
            "snack": [
                "Maçã com pasta de amendoim",
                "Porção de castanhas mistas",
                "Palitos de cenoura com homus"
            ]
        },
        "muscle_gain": {
            "breakfast": [
                "Mingau de aveia com whey protein, banana e canela",
                "Sanduíche proteico: pão integral, ovos mexidos e abacate",
                "Panquecas proteicas com frutas e mel"
            ],
            "lunch": [
                "Filé de frango grelhado, batata doce assada e brócolis",
                "Peixe assado, arroz integral e legumes grelhados",
                "Bowl de carne magra, arroz, feijão preto e vegetais"
            ],
            "dinner": [
                "Salmão grelhado com quinoa e aspargos",
                "Omelete com legumes, batata doce e salada verde",
                "Peito de frango recheado com espinafre e arroz"
            ],
            "snack": [
                "Iogurte grego com granola e mel",
                "Shake proteico com aveia e banana",
                "Sanduíche de pão integral com atum"
            ]
        },
        "health_maintenance": {
            "breakfast": [
                "Tigela de iogurte com frutas, granola e mel",
                "Torradas integrais com abacate e ovos pochê",
                "Smoothie verde com espinafre, abacate, banana e leite vegetal"
            ],
            "lunch": [
                "Salada mediterrânea com grão de bico, tomate, pepino e azeite",
                "Peixe grelhado com purê de batata doce e vegetais",
                "Wrap integral de frango com legumes e molho de iogurte"
            ],
            "dinner": [
                "Sopa de legumes com lentilhas e torradas integrais",
                "Bowl de proteína, vegetais, grãos integrais e molho caseiro",
                "Ratatouille com quinoa e ovos"
            ],
            "snack": [
                "Mix de frutas frescas",
                "Iogurte natural com mel",
                "Torrada integral com pasta de abacate"
            ]
        },
        "energy_boost": {
            "breakfast": [
                "Overnight oats com banana, mel e canela",
                "Smoothie energético com aveia, banana, espinafre e pasta de amendoim",
                "Wrap de ovo com vegetais e abacate"
            ],
            "lunch": [
                "Bowl de quinoa com legumes, sementes e azeite de oliva",
                "Arroz integral com feijão, vegetais grelhados e abacate",
                "Macarrão integral com molho de tomate caseiro e lentilhas"
            ],
            "dinner": [
                "Batata doce assada com feijão preto e vegetais",
                "Risoto de cogumelos com ervilhas e aspargos",
                "Bowl de arroz, feijão, vegetais e ovos"
            ],
            "snack": [
                "Banana com pasta de amendoim",
                "Barra de cereais caseira com tâmaras e nozes",
                "Smoothie de beterraba, maçã e gengibre"
            ]
        }
    }
    
    # Ajuste para restrições alimentares
    if "vegetarian" in dietary_restrictions or "vegan" in dietary_restrictions:
        # Substitui opções com carne/peixe por alternativas vegetarianas
        for meal_type, options in meal_options[plan_type].items():
            for i, option in enumerate(options):
                if any(food in option.lower() for food in ["frango", "peixe", "salmão", "carne", "atum", "peru"]):
                    if "vegan" in dietary_restrictions and any(food in option.lower() for food in ["iogurte", "whey", "ovos", "omelete"]):
                        options[i] = options[i].replace("Iogurte grego", "Iogurte vegetal")
                        options[i] = options[i].replace("whey", "proteína vegetal")
                        options[i] = options[i].replace("ovos", "tofu")
                        options[i] = options[i].replace("Omelete", "Omelete de grão-de-bico")
                    else:
                        veg_options = [
                            "Tofu grelhado com legumes e arroz",
                            "Lentilhas com vegetais e quinoa",
                            "Grão de bico com curry de vegetais e arroz",
                            "Hambúrguer vegetal com salada e batata doce",
                            "Berinjela grelhada com homus e salada"
                        ]
                        options[i] = veg_options[i % len(veg_options)]
    
    # Cria o plano semanal de refeições
    weekly_plan = {}
    weekdays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
    
    for day in weekdays:
        daily_meals = {}
        
        if meals_per_day >= 3:
            daily_meals["café da manhã"] = {
                "hora": "07:00",
                "opção": meal_options[plan_type]["breakfast"][weekdays.index(day) % len(meal_options[plan_type]["breakfast"])]
            }
            
            daily_meals["almoço"] = {
                "hora": "12:00",
                "opção": meal_options[plan_type]["lunch"][weekdays.index(day) % len(meal_options[plan_type]["lunch"])]
            }
            
            daily_meals["jantar"] = {
                "hora": "19:00",
                "opção": meal_options[plan_type]["dinner"][weekdays.index(day) % len(meal_options[plan_type]["dinner"])]
            }
        
        if meals_per_day >= 4:
            daily_meals["lanche"] = {
                "hora": "16:00",
                "opção": meal_options[plan_type]["snack"][weekdays.index(day) % len(meal_options[plan_type]["snack"])]
            }
        
        weekly_plan[day] = daily_meals
    
    return weekly_plan

def get_supplement_recommendations(
    plan_type: str, dietary_restrictions: List[str], user_metrics: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """Gera recomendações de suplementos com base no tipo de plano e restrições."""
    
    # Lista básica de suplementos
    supplements = []
    
    # Proteína para todos os planos
    if plan_type == "muscle_gain":
        protein_type = "Whey protein isolado"
        dosage = "25-30g pós-treino e café da manhã"
        importance = "alta"
    else:
        protein_type = "Whey protein concentrado"
        dosage = "20-25g após atividade física"
        importance = "média"
    
    # Ajuste para veganos/vegetarianos
    if "vegan" in dietary_restrictions:
        protein_type = "Proteína de ervilha ou blend vegetal (arroz+ervilha)"
    
    if plan_type in ["muscle_gain", "weight_loss"]:
        supplements.append({
            "name": protein_type,
            "purpose": "Recuperação muscular e saciedade",
            "dosage": dosage,
            "timing": "Após exercícios ou entre refeições",
            "importance": importance
        })
    
    # Creatina para ganho muscular
    if plan_type == "muscle_gain":
        supplements.append({
            "name": "Creatina monohidratada",
            "purpose": "Aumento de força e desempenho em treinos intensos",
            "dosage": "5g por dia",
            "timing": "Diariamente, independente do horário",
            "importance": "alta"
        })
    
    # Multivitamínico para todos os planos
    supplements.append({
        "name": "Multivitamínico/mineral",
        "purpose": "Prevenção de deficiências nutricionais",
        "dosage": "1 cápsula/comprimido por dia",
        "timing": "Com uma refeição principal",
        "importance": "média"
    })
    
    # Ômega-3 para todos os planos
    supplements.append({
        "name": "Ômega-3 (EPA/DHA)",
        "purpose": "Saúde cardiovascular e anti-inflamatório",
        "dosage": "1-2g por dia",
        "timing": "Com refeições contendo gordura",
        "importance": "média"
    })
    
    # Vitamina D para todos
    supplements.append({
        "name": "Vitamina D3",
        "purpose": "Saúde óssea, imunidade e funções hormonais",
        "dosage": "2000-4000 UI por dia",
        "timing": "Com uma refeição contendo gordura",
        "importance": "alta"
    })
    
    return supplements

def get_success_metrics(plan_type: str) -> List[Dict[str, Any]]:
    """Define métricas de sucesso com base no tipo de plano."""
    metrics = []
    
    if plan_type == "weight_loss":
        metrics = [
            {
                "name": "Perda de peso",
                "target": "0.5-1kg por semana",
                "measurement_frequency": "semanal"
            },
            {
                "name": "Medidas corporais",
                "target": "Redução na circunferência de cintura e quadril",
                "measurement_frequency": "quinzenal"
            }
        ]
    elif plan_type == "muscle_gain":
        metrics = [
            {
                "name": "Ganho de peso",
                "target": "0.25-0.5kg por semana",
                "measurement_frequency": "semanal"
            },
            {
                "name": "Progressão de força",
                "target": "Aumento gradual nas cargas de treino",
                "measurement_frequency": "semanal"
            }
        ]
    else:  # health_maintenance ou energy_boost
        metrics = [
            {
                "name": "Manutenção de peso",
                "target": "Variação inferior a 2kg",
                "measurement_frequency": "semanal"
            },
            {
                "name": "Bem-estar geral",
                "target": "Auto-avaliação de satisfação com saúde",
                "measurement_frequency": "semanal"
            }
        ]
    
    # Métrica comum a todos os planos
    metrics.append({
        "name": "Adesão ao plano",
        "target": "80% ou mais de adesão",
        "measurement_frequency": "semanal"
    })
    
    return metrics

def get_adjustment_guidelines(plan_type: str) -> List[Dict[str, str]]:
    """Define diretrizes de ajuste com base no tipo de plano."""
    guidelines = []
    
    if plan_type == "weight_loss":
        guidelines = [
            {
                "condition": "Perda de peso muito lenta",
                "adjustment": "Reduzir 100-200 calorias diárias ou aumentar atividade aeróbica"
            },
            {
                "condition": "Perda de peso muito rápida (>1.5kg/semana)",
                "adjustment": "Aumentar 100-200 calorias diárias para evitar perda muscular"
            }
        ]
    elif plan_type == "muscle_gain":
        guidelines = [
            {
                "condition": "Ganho de peso insuficiente",
                "adjustment": "Aumentar 200-300 calorias diárias"
            },
            {
                "condition": "Ganho de gordura excessivo",
                "adjustment": "Reduzir carboidratos em 15-20% e aumentar proteína"
            }
        ]
    else:  # health_maintenance ou energy_boost
        guidelines = [
            {
                "condition": "Oscilações de energia durante o dia",
                "adjustment": "Ajustar distribuição de carboidratos em refeições menores e mais frequentes"
            },
            {
                "condition": "Problemas digestivos",
                "adjustment": "Avaliar sensibilidades alimentares e considerar probióticos"
            }
        ]
    
    return guidelines
