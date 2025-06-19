# Roteador de Perfil com Integração Supabase

import os
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from supabase import create_client, Client

# Carregar variáveis de ambiente
load_dotenv()

# Configuração do Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

# Inicializar cliente Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Modelos de Dados Pydantic
class UserBase(BaseModel):
    """Modelo base para usuários"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: Optional[str] = None
    bio: Optional[str] = None

class UserUpdate(UserBase):
    """Modelo para atualização de usuário"""
    password: Optional[str] = None

class UserProfile(UserBase):
    """Modelo de perfil de usuário para resposta"""
    id: str
    created_at: Optional[str] = None

# Roteador
profile_router = APIRouter(prefix="/profile", tags=["Profile"])

@profile_router.get("/me", response_model=UserProfile)
async def get_current_user(user_id: str):
    """
    Obter perfil do usuário atual
    """
    try:
        # Buscar perfil do usuário
        response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Usuário não encontrado"
            )
        
        return UserProfile(**response.data[0])
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Erro ao buscar perfil: {str(e)}"
        )

@profile_router.put("/update")
async def update_user_profile(user_id: str, profile: UserUpdate):
    """
    Atualizar perfil do usuário
    """
    try:
        # Preparar dados para atualização
        update_data = profile.dict(exclude_unset=True)
        
        # Atualizar no banco de dados
        supabase.table("profiles").update(update_data).eq("id", user_id).execute()
        
        # Se nova senha foi fornecida, atualizar no Auth
        if profile.password:
            supabase.auth.update_user({
                "password": profile.password
            })
        
        return {"message": "Perfil atualizado com sucesso"}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Erro ao atualizar perfil: {str(e)}"
        )
