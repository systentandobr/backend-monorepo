# Roteador de Usuários com Integração Supabase

import os
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
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

class UserCreate(UserBase):
    """Modelo para criação de usuário"""
    password: str = Field(..., min_length=8)

class UserUpdate(UserBase):
    """Modelo para atualização de usuário"""
    password: Optional[str] = None

class UserProfile(UserBase):
    """Modelo de perfil de usuário para resposta"""
    id: str
    created_at: Optional[str] = None

# Roteador
users_router = APIRouter(prefix="/users", tags=["Users"])

@users_router.post("/register", response_model=UserProfile)
async def register_user(user: UserCreate):
    """
    Registrar novo usuário no Supabase
    """
    try:
        # Registrar usuário no Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": user.email,
            "password": user.password
        })
        
        # Adicionar detalhes do usuário na tabela de perfis
        user_data = {
            "id": auth_response.user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name or "",
            "bio": user.bio or ""
        }
        
        # Inserir no banco de dados
        supabase.table("profiles").insert(user_data).execute()
        
        return UserProfile(**{**user_data, "created_at": str(auth_response.user.created_at)})
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Erro ao registrar usuário: {str(e)}"
        )

@users_router.post("/login")
async def login_user(email: str, password: str):
    """
    Login de usuário via Supabase
    """
    try:
        # Autenticar usuário
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        return {
            "access_token": response.session.access_token,
            "user_id": response.user.id,
            "email": response.user.email
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Credenciais inválidas"
        )
