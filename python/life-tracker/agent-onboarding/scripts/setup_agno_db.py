#!/usr/bin/env python3
"""
Script para configurar o banco de dados PostgreSQL para o Agno
Cria as tabelas necessárias para a memória do agente
"""

import asyncio
import logging
import os
from pathlib import Path
from dotenv import load_dotenv

# Configurar paths antes de qualquer import
import sys
sys.path.append(str(Path(__file__).parent.parent))

# Importar o utilitário de configuração de paths
from utils.path_config import setup_project_paths
setup_project_paths(__file__)

from services.database import DatabaseService
from utils.config import Settings

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def setup_agno_database():
    """Configura o banco de dados para o Agno"""
    
    # Carregar configurações
    load_dotenv()
    settings = Settings()
    
    logger.info("Iniciando configuração do banco de dados para Agno...")
    
    try:
        # Conectar ao banco de dados
        db_service = DatabaseService()
        await db_service.connect()
        
        # Criar schema para memória do Agno
        await create_agno_schema(db_service)
        
        # Criar tabelas de memória
        await create_memory_tables(db_service)
        
        # Criar índices para performance
        await create_memory_indexes(db_service)
        
        logger.info("Banco de dados configurado com sucesso para o Agno!")
        
    except Exception as e:
        logger.error(f"Erro ao configurar banco de dados: {str(e)}")
        raise
    finally:
        await db_service.disconnect()

async def create_agno_schema(db_service: DatabaseService):
    """Cria o schema para o Agno"""
    
    # SQLite não suporta schemas, então vamos pular esta etapa
    logger.info("Schema agno_memory - pulando (SQLite não suporta schemas)")
    return

async def create_memory_tables(db_service: DatabaseService):
    """Cria as tabelas de memória do Agno"""
    
    # Tabela principal de memórias
    memories_table_sql = """
    CREATE TABLE IF NOT EXISTS agno_user_memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id VARCHAR(255) NOT NULL,
        session_id VARCHAR(255),
        content TEXT NOT NULL,
        metadata TEXT,
        embedding TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    # Tabela de sessões
    sessions_table_sql = """
    CREATE TABLE IF NOT EXISTS agno_user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id VARCHAR(255) NOT NULL,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        session_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    # Tabela de ferramentas utilizadas
    tools_table_sql = """
    CREATE TABLE IF NOT EXISTS agno_tool_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id VARCHAR(255) NOT NULL,
        session_id VARCHAR(255),
        tool_name VARCHAR(255) NOT NULL,
        tool_input TEXT,
        tool_output TEXT,
        execution_time_ms INTEGER,
        success BOOLEAN DEFAULT 1,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    try:
        # Executar criação das tabelas
        await db_service.execute(memories_table_sql)
        logger.info("Tabela user_memories criada/verificada")
        
        await db_service.execute(sessions_table_sql)
        logger.info("Tabela user_sessions criada/verificada")
        
        await db_service.execute(tools_table_sql)
        logger.info("Tabela tool_usage criada/verificada")
        
    except Exception as e:
        logger.error(f"Erro ao criar tabelas: {str(e)}")
        raise

async def create_memory_indexes(db_service: DatabaseService):
    """Cria índices para melhorar performance das consultas"""
    
    indexes_sql = [
        # Índice para busca por usuário
        "CREATE INDEX IF NOT EXISTS idx_user_memories_user_id ON agno_user_memories(user_id);",
        
        # Índice para busca por sessão
        "CREATE INDEX IF NOT EXISTS idx_user_memories_session_id ON agno_user_memories(session_id);",
        
        # Índice para busca por data
        "CREATE INDEX IF NOT EXISTS idx_user_memories_created_at ON agno_user_memories(created_at);",
        
        # Índice para busca por usuário e data
        "CREATE INDEX IF NOT EXISTS idx_user_memories_user_created ON agno_user_memories(user_id, created_at);",
        
        # Índice para sessões por usuário
        "CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON agno_user_sessions(user_id);",
        
        # Índice para ferramentas por usuário
        "CREATE INDEX IF NOT EXISTS idx_tool_usage_user_id ON agno_tool_usage(user_id);",
        
        # Índice para ferramentas por nome
        "CREATE INDEX IF NOT EXISTS idx_tool_usage_tool_name ON agno_tool_usage(tool_name);",
        
        # Índice para ferramentas por data
        "CREATE INDEX IF NOT EXISTS idx_tool_usage_created_at ON agno_tool_usage(created_at);"
    ]
    
    try:
        for index_sql in indexes_sql:
            await db_service.execute(index_sql)
        
        logger.info("Índices criados/verificados com sucesso")
        
    except Exception as e:
        logger.error(f"Erro ao criar índices: {str(e)}")
        raise

async def verify_installation():
    """Verifica se a instalação foi bem-sucedida"""
    
    logger.info("Verificando instalação...")
    
    try:
        db_service = DatabaseService()
        await db_service.connect()
        
        # Verificar se as tabelas existem
        tables_to_check = [
            "agno_user_memories",
            "agno_user_sessions", 
            "agno_tool_usage"
        ]
        
        for table in tables_to_check:
            result = await db_service.execute(
                f"SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name = '{table}'"
            )
            count = result.scalar()
            if count > 0:
                logger.info(f"✓ Tabela {table} existe")
            else:
                logger.error(f"✗ Tabela {table} não encontrada")
        
        # Verificar se os índices existem
        indexes_to_check = [
            "idx_user_memories_user_id",
            "idx_user_memories_session_id",
            "idx_tool_usage_user_id"
        ]
        
        for index in indexes_to_check:
            result = await db_service.execute(
                f"SELECT COUNT(*) FROM sqlite_master WHERE type='index' AND name = '{index}'"
            )
            count = result.scalar()
            if count > 0:
                logger.info(f"✓ Índice {index} existe")
            else:
                logger.warning(f"⚠ Índice {index} não encontrado")
        
        logger.info("Verificação concluída!")
        
    except Exception as e:
        logger.error(f"Erro na verificação: {str(e)}")
        raise
    finally:
        await db_service.disconnect()

async def main():
    """Função principal"""
    
    logger.info("=== Configuração do Banco de Dados para Agno ===")
    
    try:
        # Configurar banco de dados
        await setup_agno_database()
        
        # Verificar instalação
        await verify_installation()
        
        logger.info("=== Configuração concluída com sucesso! ===")
        
    except Exception as e:
        logger.error(f"Erro na configuração: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
