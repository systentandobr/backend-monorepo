"""
Ferramenta para o agente MCP que cria e gerencia planos nutricionais personalizados.
"""

from typing import Dict, Any, Optional, List
import os
from datetime import datetime, timedelta
from pydantic import Field
from app.agent.tools.base_tool import BaseSystentandoTool

class PlanTool(BaseSystentandoTool):
    """
    Ferramenta para criar e gerenciar planos nutricionais personalizados.
    """
    
    name: str = "nutrition_planner"
    description: str = """
    Ferramenta para criar planos nutricionais personalizados com base nos objetivos,
    preferências e necessidades específicas do usuário. Pode criar planos semanais,
    distribuições de macronutrientes, sugestões de refeições, e adaptações para
    diferentes restrições alimentares.
    
    Exemplos de uso:
    - Criar um plano nutricional para perda de peso com restrição de carboidratos
    - Desenvolver um plano alimentar para ganho muscular para um vegetariano
    - Adaptar o plano alimentar para incluir mais proteínas vegetais
    - Criar um cardápio semanal baseado no ritmo circadiano do usuário
    """
    
    # Propriedade user_id já definida na classe base BaseSystentandoTool
    
    # Propriedades específicas desta ferramenta
    storage_dir: str = Field(
        default="/tmp/meu-nutri/plans",
        description="Diretório para armazenar planos nutricionais"
    )
    
    def __init__(self, user_id: str, storage_dir: Optional[str] = None):
        """
        Inicializa a ferramenta de planejamento nutricional.
        
        Args:
            user_id: ID do usuário para personalização e armazenamento
            storage_dir: Diretório para armazenar planos (opcional)
        """
        # Inicializa a classe pai com o user_id
        super().__init__(user_id=user_id)
        
        # Configura o diretório de armazenamento
        if storage_dir:
            self.storage_dir = storage_dir
        elif os.environ.get("PLANS_STORAGE_DIR"):
            self.storage_dir = os.environ.get("PLANS_STORAGE_DIR")
        
        # Certifica-se de que o diretório existe
        os.makedirs(self.storage_dir, exist_ok=True)

    def _run(
        self,
        goal: str,
        duration_weeks: int = 4,
        dietary_restrictions: Optional[List[str]] = None,
        user_preferences: Optional[Dict[str, Any]] = None,
        user_metrics: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Cria um plano nutricional personalizado.
        
        Args:
            goal: Objetivo principal do plano
            duration_weeks: Duração do plano em semanas
            dietary_restrictions: Lista de restrições alimentares
            user_preferences: Preferências do usuário
            user_metrics: Métricas do usuário
            
        Returns:
            Plano nutricional personalizado
        """
        # Valores padrão
        if dietary_restrictions is None:
            dietary_restrictions = []
        if user_preferences is None:
            user_preferences = {}
        if user_metrics is None:
            user_metrics = {
                "weight_kg": 70,
                "height_cm": 170,
                "age": 35,
                "gender": "not_specified",
                "activity_level": "moderate"
            }
        
        # Normaliza o objetivo para categorias conhecidas
        goal_lower = goal.lower()
        
        if any(term in goal_lower for term in ["perda", "emagrecer", "weight loss"]):
            plan_type = "weight_loss"
            calorie_adjustment = -300  # Déficit calórico moderado
        elif any(term in goal_lower for term in ["ganho", "massa", "muscle", "weight gain"]):
            plan_type = "muscle_gain"
            calorie_adjustment = 300  # Superávit calórico moderado
        elif any(term in goal_lower for term in ["saúde", "health", "equilíbrio", "balance"]):
            plan_type = "health_maintenance"
            calorie_adjustment = 0  # Manutenção
        elif any(term in goal_lower for term in ["energia", "energy", "disposição"]):
            plan_type = "energy_boost"
            calorie_adjustment = 0  # Manutenção com foco em alimentos energéticos
        else:
            # Padrão para saúde geral se nenhum outro objetivo for identificado
            plan_type = "health_maintenance"
            calorie_adjustment = 0
        
        # Métodos auxiliares importados do módulo plan_tool_helpers
        from app.agent.tools.plan_tool_helpers import (
            generate_meal_examples,
            get_supplement_recommendations,
            get_success_metrics,
            get_adjustment_guidelines
        )
        
        # Extrai métricas do usuário
        weight = user_metrics.get("weight_kg", 70)
        height = user_metrics.get("height_cm", 170)
        age = user_metrics.get("age", 35)
        gender = user_metrics.get("gender", "not_specified")
        activity = user_metrics.get("activity_level", "moderate")
        
        # Fator de atividade
        activity_factors = {
            "sedentary": 1.2,
            "light": 1.375,
            "moderate": 1.55,
            "active": 1.725,
            "very_active": 1.9
        }
        activity_factor = activity_factors.get(activity, 1.55)
        
        # BMR base - simplificado
        if gender == "female":
            bmr = 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age)
        elif gender == "male":
            bmr = 66 + (13.7 * weight) + (5 * height) - (6.8 * age)
        else:
            # Valor médio para gênero não especificado
            bmr = 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age)
            bmr += 66 + (13.7 * weight) + (5 * height) - (6.8 * age)
            bmr /= 2
        
        # TDEE (Total Daily Energy Expenditure)
        tdee = bmr * activity_factor
        
        # Calorias alvo com ajuste baseado no objetivo
        target_calories = int(tdee + calorie_adjustment)
        
        # Distribuição de macronutrientes baseada no tipo de plano
        if plan_type == "weight_loss":
            protein_pct = 0.30
            carbs_pct = 0.40
            fat_pct = 0.30
        elif plan_type == "muscle_gain":
            protein_pct = 0.30
            carbs_pct = 0.45
            fat_pct = 0.25
        elif plan_type == "energy_boost":
            protein_pct = 0.20
            carbs_pct = 0.55
            fat_pct = 0.25
        else:  # health_maintenance
            protein_pct = 0.25
            carbs_pct = 0.45
            fat_pct = 0.30
        
        # Ajustes baseados em restrições alimentares
        if "low_carb" in dietary_restrictions or "keto" in dietary_restrictions:
            protein_pct = 0.35
            carbs_pct = 0.15
            fat_pct = 0.50
        
        if "vegetarian" in dietary_restrictions or "vegan" in dietary_restrictions:
            protein_pct += 0.05  # Ligeiro aumento de proteína para compensar
            carbs_pct += 0.05
            fat_pct -= 0.10
        
        # Calcula gramas de macronutrientes
        protein_cals = target_calories * protein_pct
        carbs_cals = target_calories * carbs_pct
        fat_cals = target_calories * fat_pct
        
        protein_g = round(protein_cals / 4)  # 4 calorias por grama
        carbs_g = round(carbs_cals / 4)      # 4 calorias por grama
        fat_g = round(fat_cals / 9)          # 9 calorias por grama
        
        # Cria refeições baseadas no tipo de plano e restrições
        meals_per_day = 4  # Padrão
        if "intermittent_fasting" in dietary_restrictions:
            meals_per_day = 3
        
        # Gera planos usando funções auxiliares
        meal_plan = generate_meal_examples(plan_type, dietary_restrictions, meals_per_day)
        supplements = get_supplement_recommendations(plan_type, dietary_restrictions, user_metrics)
        success_metrics = get_success_metrics(plan_type)
        adjustment_guidelines = get_adjustment_guidelines(plan_type)
        
        # Cria o plano completo
        plan = {
            "plan_id": f"{self.user_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "user_id": self.user_id,
            "created_at": datetime.now().isoformat(),
            "goal": plan_type.replace('_', ' ').title(),
            "plan_type": plan_type,
            "duration_weeks": duration_weeks,
            "dietary_restrictions": dietary_restrictions,
            "start_date": datetime.now().strftime("%Y-%m-%d"),
            "end_date": (datetime.now() + timedelta(weeks=duration_weeks)).strftime("%Y-%m-%d"),
            "nutritional_targets": {
                "calories": target_calories,
                "macronutrients": {
                    "protein": {
                        "grams": protein_g,
                        "percentage": round(protein_pct * 100)
                    },
                    "carbohydrates": {
                        "grams": carbs_g,
                        "percentage": round(carbs_pct * 100)
                    },
                    "fat": {
                        "grams": fat_g,
                        "percentage": round(fat_pct * 100)
                    }
                },
                "meals_per_day": meals_per_day,
                "water_intake_liters": round(weight * 0.033, 1)  # ~33ml por kg de peso
            },
            "meal_plan": meal_plan,
            "supplement_recommendations": supplements,
            "success_metrics": success_metrics,
            "adjustment_guidelines": adjustment_guidelines,
            "compatibility_score": 85  # Simulado - num sistema real, seria calculado
        }
        
        return plan
    
    async def _arun(self, goal: str, duration_weeks: int = 4, dietary_restrictions: Optional[List[str]] = None,
                    user_preferences: Optional[Dict[str, Any]] = None, user_metrics: Optional[Dict[str, Any]] = None, **kwargs) -> Dict[str, Any]:
        """Versão assíncrona do método _run."""
        return self._run(goal, duration_weeks, dietary_restrictions, user_preferences, user_metrics, **kwargs)
    
    def _parse_input(self, text_input: str) -> Dict[str, Any]:
        """
        Processa entrada em formato de texto para extrair parâmetros.
        
        Args:
            text_input: Texto de entrada para a ferramenta
            
        Returns:
            Dicionário com os parâmetros extraídos
        """
        # Implementação básica para exemplo
        # Em um caso real, faria parsing mais sofisticado do texto
        
        # Valores padrão
        goal = "saúde geral"
        duration_weeks = 4
        dietary_restrictions = []
        user_preferences = {}
        user_metrics = {}
        
        # Identifica o objetivo principal
        if "perda de peso" in text_input.lower() or "emagrecer" in text_input.lower():
            goal = "perda de peso"
        elif "ganho de massa" in text_input.lower() or "hipertrofia" in text_input.lower():
            goal = "ganho muscular"
        elif "energia" in text_input.lower() or "disposição" in text_input.lower():
            goal = "energia"
        
        # Extrai duração se mencionada
        import re
        duration_match = re.search(r'(\d+)\s*semanas', text_input.lower())
        if duration_match:
            duration_weeks = int(duration_match.group(1))
        
        # Identifica restrições alimentares
        restrictions = []
        if "vegetariano" in text_input.lower():
            restrictions.append("vegetarian")
        if "vegano" in text_input.lower():
            restrictions.append("vegan")
        if "sem glúten" in text_input.lower() or "gluten free" in text_input.lower():
            restrictions.append("gluten_free")
        if "sem lactose" in text_input.lower() or "intolerância à lactose" in text_input.lower():
            restrictions.append("lactose_free")
        if "keto" in text_input.lower() or "cetogênica" in text_input.lower():
            restrictions.append("keto")
        if "low carb" in text_input.lower() or "baixo carboidrato" in text_input.lower():
            restrictions.append("low_carb")
        if "jejum" in text_input.lower() or "intermitente" in text_input.lower():
            restrictions.append("intermittent_fasting")
        
        if restrictions:
            dietary_restrictions = restrictions
        
        return {
            "goal": goal,
            "duration_weeks": duration_weeks,
            "dietary_restrictions": dietary_restrictions,
            "user_preferences": user_preferences,
            "user_metrics": user_metrics
        }
