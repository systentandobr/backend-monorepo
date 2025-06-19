# Roteador de Nutrição com Integração Supabase

import os
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from supabase import create_client, Client
from datetime import datetime

# Carregar variáveis de ambiente
load_dotenv()

# Configuração do Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

# Inicializar cliente Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Modelos de Dados Pydantic
class NutritionalGoal(BaseModel):
    """Modelo para metas nutricionais"""
    user_id: str
    weight_goal: Optional[float] = None
    calorie_target: Optional[int] = None
    diet_type: Optional[str] = Field(
        None, 
        description="Tipo de dieta (ex: vegetariana, low-carb, etc)"
    )
    health_conditions: Optional[List[str]] = None

class NutritionAnalysis(BaseModel):
    """Modelo para análise nutricional"""
    user_id: str
    analysis_date: Optional[str] = None
    key_insights: Dict[str, Any]
    recommendations: List[str]

class MealLog(BaseModel):
    """Modelo para registro de refeições"""
    user_id: str
    meal_type: str = Field(..., description="Tipo de refeição (café da manhã, almoço, jantar, etc)")
    food_items: List[Dict[str, Any]]
    total_calories: Optional[float] = None
    timestamp: Optional[str] = None

# Roteador
nutrition_router = APIRouter(prefix="/nutrition", tags=["Nutrition"])

@nutrition_router.post("/goals")
async def set_nutritional_goals(goal: NutritionalGoal):
    """
    Definir metas nutricionais para o usuário
    """
    try:
        # Inserir ou atualizar metas nutricionais
        response = supabase.table("nutritional_goals").upsert({
            "user_id": goal.user_id,
            "weight_goal": goal.weight_goal,
            "calorie_target": goal.calorie_target,
            "diet_type": goal.diet_type,
            "health_conditions": goal.health_conditions
        }).execute()
        
        return {"message": "Metas nutricionais atualizadas", "data": response.data}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Erro ao definir metas: {str(e)}"
        )

@nutrition_router.get("/goals/{user_id}")
async def get_nutritional_goals(user_id: str):
    """
    Obter metas nutricionais do usuário
    """
    try:
        response = supabase.table("nutritional_goals").select("*").eq("user_id", user_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Metas nutricionais não encontradas"
            )
        
        return response.data[0]
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Erro ao buscar metas: {str(e)}"
        )

@nutrition_router.post("/analysis")
async def create_nutrition_analysis(analysis: NutritionAnalysis):
    """
    Criar uma nova análise nutricional
    """
    try:
        # Se nenhuma data for fornecida, usar a data atual
        analysis_date = analysis.analysis_date or datetime.now().isoformat()
        
        response = supabase.table("nutrition_analysis").insert({
            "user_id": analysis.user_id,
            "analysis_date": analysis_date,
            "key_insights": analysis.key_insights,
            "recommendations": analysis.recommendations
        }).execute()
        
        return {"message": "Análise nutricional registrada", "data": response.data}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Erro ao registrar análise: {str(e)}"
        )

@nutrition_router.get("/analysis/{user_id}")
async def get_nutrition_analyses(user_id: str):
    """
    Obter histórico de análises nutricionais
    """
    try:
        response = supabase.table("nutrition_analysis").select("*").eq("user_id", user_id).execute()
        
        return response.data
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Erro ao buscar análises: {str(e)}"
        )

@nutrition_router.post("/meal-log")
async def log_meal(meal: MealLog):
    """
    Registrar uma refeição consumida
    """
    try:
        # Se nenhum timestamp for fornecido, usar o momento atual
        timestamp = meal.timestamp or datetime.now().isoformat()
        
        # Calcular total de calorias se não fornecido
        total_calories = meal.total_calories or sum(
            item.get('calories', 0) for item in meal.food_items
        )
        
        response = supabase.table("meal_logs").insert({
            "user_id": meal.user_id,
            "meal_type": meal.meal_type,
            "food_items": meal.food_items,
            "total_calories": total_calories,
            "timestamp": timestamp
        }).execute()
        
        return {"message": "Refeição registrada com sucesso", "data": response.data}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Erro ao registrar refeição: {str(e)}"
        )

@nutrition_router.get("/meal-logs/{user_id}")
async def get_meal_logs(user_id: str, start_date: Optional[str] = None, end_date: Optional[str] = None):
    """
    Obter registros de refeições do usuário, com opção de filtrar por data
    """
    try:
        # Consulta base
        query = supabase.table("meal_logs").select("*").eq("user_id", user_id)
        
        # Adicionar filtros de data se fornecidos
        if start_date:
            query = query.gte("timestamp", start_date)
        if end_date:
            query = query.lte("timestamp", end_date)
        
        response = query.execute()
        
        return response.data
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Erro ao buscar registros de refeições: {str(e)}"
        )
