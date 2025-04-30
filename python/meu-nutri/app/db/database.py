"""
Módulo para inicialização e gerenciamento da conexão com banco de dados.
"""

import os
import asyncio
import asyncpg
import logging
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

# Pool de conexão compartilhado
pg_pool = None

async def init_db():
    """
    Inicializa a conexão com o banco de dados PostgreSQL.
    Cria tabelas necessárias se não existirem.
    """
    global pg_pool
    
    if pg_pool is not None:
        logger.info("Conexão com DB já inicializada")
        return
    
    # Obtém string de conexão do ambiente
    conn_string = os.getenv(
        "POSTGRES_CONNECTION_STRING",
        "postgresql://postgres:postgres@localhost:5432/meu_nutri"
    )
    
    logger.info("Inicializando conexão com o banco de dados")
    
    try:
        # Cria pool de conexões
        pg_pool = await asyncpg.create_pool(conn_string)
        
        # Cria tabelas se não existirem
        await _create_tables()
        
        logger.info("Conexão com banco de dados inicializada com sucesso")
    except Exception as e:
        logger.error(f"Erro ao inicializar banco de dados: {str(e)}", exc_info=True)
        raise

async def _create_tables():
    """Cria as tabelas necessárias para a aplicação."""
    if pg_pool is None:
        raise RuntimeError("Pool de conexão não inicializado")
    
    async with pg_pool.acquire() as conn:
        # Cria tabelas do sistema
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS user_profiles (
                user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                height_cm NUMERIC,
                weight_kg NUMERIC,
                birthdate DATE,
                gender TEXT,
                activity_level TEXT,
                chronotype TEXT,
                typical_wake_time TEXT,
                typical_sleep_time TEXT,
                dietary_preferences JSONB,
                restrictions JSONB,
                goals JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS body_analyses (
                id UUID PRIMARY KEY,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                analysis_data JSONB NOT NULL,
                visualization_path TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS meals (
                id UUID PRIMARY KEY,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                meal_type TEXT,
                food_items JSONB,
                nutritional_analysis JSONB,
                feedback JSONB,
                image_path TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS user_metrics (
                id UUID PRIMARY KEY,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                metric_type TEXT NOT NULL,
                value NUMERIC NOT NULL,
                context JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Cria índices úteis
        await conn.execute('''
            CREATE INDEX IF NOT EXISTS idx_body_analyses_user_id ON body_analyses(user_id)
        ''')
        
        await conn.execute('''
            CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id)
        ''')
        
        await conn.execute('''
            CREATE INDEX IF NOT EXISTS idx_user_metrics_user_id ON user_metrics(user_id)
        ''')
        
        # Função para atualizar timestamp
        await conn.execute('''
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
               NEW.updated_at = NOW();
               RETURN NEW;
            END;
            $$ language 'plpgsql';
        ''')
        
        # Triggers para atualizar timestamp
        await conn.execute('''
            DROP TRIGGER IF EXISTS update_users_updated_at ON users;
            CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ''')
        
        await conn.execute('''
            DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
            CREATE TRIGGER update_user_profiles_updated_at
            BEFORE UPDATE ON user_profiles
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ''')

async def close_db():
    """Fecha a conexão com o banco de dados."""
    global pg_pool
    
    if pg_pool is not None:
        await pg_pool.close()
        pg_pool = None
        logger.info("Conexão com banco de dados fechada")

async def get_user_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Obtém o perfil de um usuário pelo ID.
    
    Args:
        user_id: ID do usuário
        
    Returns:
        Dicionário com perfil do usuário ou None se não encontrado
    """
    if pg_pool is None:
        await init_db()
    
    async with pg_pool.acquire() as conn:
        # Busca perfil do usuário
        profile = await conn.fetchrow('''
            SELECT * FROM user_profiles
            WHERE user_id = $1
        ''', user_id)
        
        if profile is None:
            return None
        
        # Converte para dicionário
        result = dict(profile)
        
        # Processa campos JSON
        for field in ['dietary_preferences', 'restrictions', 'goals']:
            if result[field]:
                result[field] = dict(result[field])
        
        return result

async def save_body_analysis(user_id: str, analysis_data: Dict[str, Any], 
                            visualization_path: Optional[str] = None) -> str:
    """
    Salva dados de análise corporal.
    
    Args:
        user_id: ID do usuário
        analysis_data: Dados da análise
        visualization_path: Caminho para visualização (opcional)
        
    Returns:
        ID da análise
    """
    if pg_pool is None:
        await init_db()
    
    async with pg_pool.acquire() as conn:
        # Obtém o ID da análise ou gera um novo
        analysis_id = analysis_data.get('analysis_id')
        if not analysis_id:
            import uuid
            analysis_id = str(uuid.uuid4())
            analysis_data['analysis_id'] = analysis_id
        
        # Insere na tabela
        await conn.execute('''
            INSERT INTO body_analyses (id, user_id, analysis_data, visualization_path)
            VALUES ($1, $2, $3, $4)
        ''', analysis_id, user_id, analysis_data, visualization_path)
        
        return analysis_id

async def get_latest_analyses(user_id: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Obtém as análises corporais mais recentes de um usuário.
    
    Args:
        user_id: ID do usuário
        limit: Número máximo de análises
        
    Returns:
        Lista de análises
    """
    if pg_pool is None:
        await init_db()
    
    async with pg_pool.acquire() as conn:
        rows = await conn.fetch('''
            SELECT id, analysis_data, visualization_path, created_at
            FROM body_analyses
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2
        ''', user_id, limit)
        
        return [
            {
                'id': row['id'],
                'data': dict(row['analysis_data']),
                'visualization_path': row['visualization_path'],
                'created_at': row['created_at'].isoformat()
            } 
            for row in rows
        ]
