"""
Modelos de dados para a aplicação Meu Nutri.
"""

from typing import Dict, Any, List, Optional
from datetime import date
from pydantic import BaseModel, Field, validator

class UserProfile(BaseModel):
    """Modelo de perfil do usuário."""
    
    user_id: str = Field(..., description="ID único do usuário")
    height_cm: Optional[float] = Field(None, description="Altura em centímetros")
    weight_kg: Optional[float] = Field(None, description="Peso em quilogramas")
    birthdate: Optional[date] = Field(None, description="Data de nascimento")
    gender: Optional[str] = Field(None, description="Gênero")
    activity_level: Optional[str] = Field(None, description="Nível de atividade física")
    chronotype: Optional[str] = Field("intermediate", description="Cronotipo circadiano")
    typical_wake_time: Optional[str] = Field("07:00", description="Horário típico de despertar")
    typical_sleep_time: Optional[str] = Field("23:00", description="Horário típico de adormecer")
    dietary_preferences: Optional[Dict[str, Any]] = Field(None, description="Preferências alimentares")
    restrictions: Optional[Dict[str, Any]] = Field(None, description="Restrições alimentares")
    goals: Optional[Dict[str, Any]] = Field(None, description="Objetivos de saúde e nutrição")
    
    class Config:
        """Configuração do modelo."""
        
        title = "Perfil de Usuário"
        json_schema_extra = {
            "example": {
                "user_id": "9f8d7c6e-5b4a-3c2d-1e0f-9a8b7c6d5e4f",
                "height_cm": 170.5,
                "weight_kg": 68.2,
                "birthdate": "1985-05-15",
                "gender": "female",
                "activity_level": "moderate",
                "chronotype": "morning",
                "typical_wake_time": "06:30",
                "typical_sleep_time": "22:30",
                "dietary_preferences": {
                    "preferred_cuisines": ["mediterranean", "japanese"],
                    "preferred_foods": ["fish", "vegetables", "fruits"]
                },
                "restrictions": {
                    "allergies": ["peanuts", "shellfish"],
                    "intolerances": ["lactose"]
                },
                "goals": {
                    "target_weight_kg": 65.0,
                    "activity_goals": ["increase_stamina", "muscle_tone"],
                    "health_focus": ["gut_health", "energy_levels"]
                }
            }
        }
    
    @validator('chronotype')
    def validate_chronotype(cls, v):
        """Valida o cronotipo."""
        allowed_values = [
            "extreme_morning", "morning", "intermediate", 
            "evening", "extreme_evening"
        ]
        if v and v not in allowed_values:
            return "intermediate"
        return v
    
    @validator('activity_level')
    def validate_activity_level(cls, v):
        """Valida o nível de atividade."""
        allowed_values = [
            "sedentary", "light", "moderate", "active", "very_active"
        ]
        if v and v not in allowed_values:
            return "moderate"
        return v

class BodyAnalysis(BaseModel):
    """Modelo de análise corporal."""
    
    id: Optional[str] = Field(None, description="ID único da análise")
    user_id: str = Field(..., description="ID do usuário")
    height_cm: float = Field(..., description="Altura em centímetros")
    weight_kg: float = Field(..., description="Peso em quilogramas")
    body_fat_percentage: Optional[float] = Field(None, description="Porcentagem de gordura corporal")
    muscle_mass_kg: Optional[float] = Field(None, description="Massa muscular em quilogramas")
    bmi: Optional[float] = Field(None, description="Índice de Massa Corporal")
    posture_analysis: Optional[Dict[str, Any]] = Field(None, description="Análise de postura")
    body_proportions: Optional[Dict[str, Any]] = Field(None, description="Proporções corporais")
    visualization_path: Optional[str] = Field(None, description="Caminho para a visualização")
    created_at: Optional[str] = Field(None, description="Data de criação da análise")

class Meal(BaseModel):
    """Modelo de refeição."""
    
    id: Optional[str] = Field(None, description="ID único da refeição")
    user_id: str = Field(..., description="ID do usuário")
    meal_type: str = Field(..., description="Tipo de refeição")
    food_items: List[Dict[str, Any]] = Field(..., description="Itens alimentares")
    nutritional_analysis: Optional[Dict[str, Any]] = Field(None, description="Análise nutricional")
    feedback: Optional[Dict[str, Any]] = Field(None, description="Feedback sobre a refeição")
    image_path: Optional[str] = Field(None, description="Caminho para a imagem da refeição")
    created_at: Optional[str] = Field(None, description="Data de criação do registro")
    
    @validator('meal_type')
    def validate_meal_type(cls, v):
        """Valida o tipo de refeição."""
        allowed_values = [
            "café da manhã", "lanche da manhã", "almoço",
            "lanche da tarde", "jantar", "ceia", "outro"
        ]
        if v and v.lower() not in allowed_values:
            return "outro"
        return v.lower()

class UserMetric(BaseModel):
    """Modelo de métrica do usuário."""
    
    id: Optional[str] = Field(None, description="ID único da métrica")
    user_id: str = Field(..., description="ID do usuário")
    metric_type: str = Field(..., description="Tipo de métrica")
    value: float = Field(..., description="Valor da métrica")
    context: Optional[Dict[str, Any]] = Field(None, description="Contexto da métrica")
    created_at: Optional[str] = Field(None, description="Data de criação do registro")
