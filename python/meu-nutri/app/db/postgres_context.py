"""
Implementação do PostgreSQL Context para o Model Context Protocol.
Este módulo gerencia a persistência de contexto e conversas no PostgreSQL.
"""

import os
import json
import asyncio
import asyncpg
from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid

# Adaptado de https://github.com/modelcontextprotocol/servers/tree/main/src/postgres
class PostgresContextManager:
    """
    Gerencia a persistência de contextos de conversa usando PostgreSQL.
    Implementa uma versão adaptada do Model Context Protocol para armazenamento
    e recuperação eficiente de históricos de conversa e dados de aprendizado.
    """
    
    def __init__(self, connection_string: Optional[str] = None):
        """
        Inicializa o gerenciador de contexto PostgreSQL.
        
        Args:
            connection_string: String de conexão PostgreSQL. Se None, usa variável de ambiente.
        """
        self.connection_string = connection_string or os.getenv(
            "POSTGRES_CONNECTION_STRING", 
            "postgresql://postgres:postgres@localhost:5432/meu_nutri"
        )
        self.pool = None
    
    async def initialize(self):
        """Inicializa a conexão com o banco de dados e cria tabelas se necessário."""
        if self.pool is None:
            self.pool = await asyncpg.create_pool(self.connection_string)
            
            # Cria as tabelas necessárias se não existirem
            async with self.pool.acquire() as conn:
                await conn.execute('''
                    CREATE TABLE IF NOT EXISTS conversations (
                        id UUID PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        title TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        metadata JSONB
                    )
                ''')
                
                await conn.execute('''
                    CREATE TABLE IF NOT EXISTS messages (
                        id UUID PRIMARY KEY,
                        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
                        role TEXT NOT NULL,
                        content TEXT NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        tokens INTEGER,
                        metadata JSONB
                    )
                ''')
                
                await conn.execute('''
                    CREATE TABLE IF NOT EXISTS learning_data (
                        id UUID PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        category TEXT NOT NULL,
                        data JSONB NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    )
                ''')
                
                # Cria índices úteis
                await conn.execute('CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id)')
                await conn.execute('CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)')
                await conn.execute('CREATE INDEX IF NOT EXISTS idx_learning_data_user_id_category ON learning_data(user_id, category)')
                
                # Atualizar "updated_at" automaticamente
                await conn.execute('''
                    CREATE OR REPLACE FUNCTION update_updated_at_column()
                    RETURNS TRIGGER AS $$
                    BEGIN
                       NEW.updated_at = NOW();
                       RETURN NEW;
                    END;
                    $$ language 'plpgsql';
                ''')
                
                await conn.execute('''
                    DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
                    CREATE TRIGGER update_conversations_updated_at
                    BEFORE UPDATE ON conversations
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
                ''')
                
                await conn.execute('''
                    DROP TRIGGER IF EXISTS update_learning_data_updated_at ON learning_data;
                    CREATE TRIGGER update_learning_data_updated_at
                    BEFORE UPDATE ON learning_data
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
                ''')
    
    async def create_conversation(self, user_id: str, title: Optional[str] = None, 
                                 metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Cria uma nova conversa.
        
        Args:
            user_id: ID do usuário
            title: Título da conversa (opcional)
            metadata: Metadados adicionais (opcional)
            
        Returns:
            ID da conversa criada
        """
        if self.pool is None:
            await self.initialize()
            
        conversation_id = str(uuid.uuid4())
        
        async with self.pool.acquire() as conn:
            await conn.execute(
                '''
                INSERT INTO conversations (id, user_id, title, metadata)
                VALUES ($1, $2, $3, $4)
                ''',
                uuid.UUID(conversation_id), user_id, title, json.dumps(metadata or {})
            )
            
        return conversation_id
    
    async def add_message(self, conversation_id: str, role: str, content: str, 
                        tokens: Optional[int] = None, metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Adiciona uma mensagem a uma conversa existente.
        
        Args:
            conversation_id: ID da conversa
            role: Papel do emissor ('user', 'assistant', 'system', etc.)
            content: Conteúdo da mensagem
            tokens: Quantidade de tokens da mensagem (opcional)
            metadata: Metadados adicionais (opcional)
            
        Returns:
            ID da mensagem criada
        """
        if self.pool is None:
            await self.initialize()
            
        message_id = str(uuid.uuid4())
        
        async with self.pool.acquire() as conn:
            await conn.execute(
                '''
                INSERT INTO messages (id, conversation_id, role, content, tokens, metadata)
                VALUES ($1, $2, $3, $4, $5, $6)
                ''',
                uuid.UUID(message_id), uuid.UUID(conversation_id), role, content, 
                tokens, json.dumps(metadata or {})
            )
            
            # Atualiza o timestamp da conversa
            await conn.execute(
                '''
                UPDATE conversations
                SET updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                ''',
                uuid.UUID(conversation_id)
            )
            
        return message_id
    
    async def get_conversation_messages(self, conversation_id: str) -> List[Dict[str, Any]]:
        """
        Recupera todas as mensagens de uma conversa.
        
        Args:
            conversation_id: ID da conversa
            
        Returns:
            Lista de mensagens
        """
        if self.pool is None:
            await self.initialize()
            
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                '''
                SELECT id, role, content, created_at, tokens, metadata
                FROM messages
                WHERE conversation_id = $1
                ORDER BY created_at ASC
                ''',
                uuid.UUID(conversation_id)
            )
            
        messages = []
        for row in rows:
            message = {
                "id": str(row["id"]),
                "role": row["role"],
                "content": row["content"],
                "created_at": row["created_at"].isoformat(),
                "tokens": row["tokens"]
            }
            
            if row["metadata"]:
                message["metadata"] = json.loads(row["metadata"])
                
            messages.append(message)
            
        return messages
    
    async def get_user_conversations(self, user_id: str, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """
        Recupera conversas de um usuário.
        
        Args:
            user_id: ID do usuário
            limit: Número máximo de conversas para retornar
            offset: Deslocamento para paginação
            
        Returns:
            Lista de conversas
        """
        if self.pool is None:
            await self.initialize()
            
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(
                '''
                SELECT id, title, created_at, updated_at, metadata
                FROM conversations
                WHERE user_id = $1
                ORDER BY updated_at DESC
                LIMIT $2 OFFSET $3
                ''',
                user_id, limit, offset
            )
            
        conversations = []
        for row in rows:
            conversation = {
                "id": str(row["id"]),
                "title": row["title"],
                "created_at": row["created_at"].isoformat(),
                "updated_at": row["updated_at"].isoformat()
            }
            
            if row["metadata"]:
                conversation["metadata"] = json.loads(row["metadata"])
                
            # Recupera a última mensagem
            last_message = await conn.fetchrow(
                '''
                SELECT content
                FROM messages
                WHERE conversation_id = $1
                ORDER BY created_at DESC
                LIMIT 1
                ''',
                row["id"]
            )
            
            if last_message:
                conversation["last_message"] = last_message["content"]
                
            conversations.append(conversation)
            
        return conversations
    
    async def store_learning_data(self, user_id: str, category: str, data: Dict[str, Any]) -> str:
        """
        Armazena dados de aprendizado para um usuário.
        
        Args:
            user_id: ID do usuário
            category: Categoria dos dados (ex: 'nutrition_preferences', 'activity_patterns')
            data: Dados a serem armazenados
            
        Returns:
            ID do registro de aprendizado
        """
        if self.pool is None:
            await self.initialize()
            
        data_id = str(uuid.uuid4())
        
        async with self.pool.acquire() as conn:
            # Verifica se já existe um registro nesta categoria
            existing = await conn.fetchval(
                '''
                SELECT id FROM learning_data
                WHERE user_id = $1 AND category = $2
                LIMIT 1
                ''',
                user_id, category
            )
            
            if existing:
                # Atualiza o registro existente
                await conn.execute(
                    '''
                    UPDATE learning_data
                    SET data = $1, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $2
                    ''',
                    json.dumps(data), existing
                )
                data_id = str(existing)
            else:
                # Cria um novo registro
                await conn.execute(
                    '''
                    INSERT INTO learning_data (id, user_id, category, data)
                    VALUES ($1, $2, $3, $4)
                    ''',
                    uuid.UUID(data_id), user_id, category, json.dumps(data)
                )
        
        return data_id
    
    async def get_learning_data(self, user_id: str, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Recupera dados de aprendizado para um usuário.
        
        Args:
            user_id: ID do usuário
            category: Categoria específica para filtrar (opcional)
            
        Returns:
            Lista de dados de aprendizado
        """
        if self.pool is None:
            await self.initialize()
            
        async with self.pool.acquire() as conn:
            if category:
                rows = await conn.fetch(
                    '''
                    SELECT id, category, data, created_at, updated_at
                    FROM learning_data
                    WHERE user_id = $1 AND category = $2
                    ORDER BY updated_at DESC
                    ''',
                    user_id, category
                )
            else:
                rows = await conn.fetch(
                    '''
                    SELECT id, category, data, created_at, updated_at
                    FROM learning_data
                    WHERE user_id = $1
                    ORDER BY category, updated_at DESC
                    ''',
                    user_id
                )
        
        learning_data = []
        for row in rows:
            item = {
                "id": str(row["id"]),
                "category": row["category"],
                "data": json.loads(row["data"]),
                "created_at": row["created_at"].isoformat(),
                "updated_at": row["updated_at"].isoformat()
            }
            learning_data.append(item)
            
        return learning_data
    
    async def delete_conversation(self, conversation_id: str) -> bool:
        """
        Exclui uma conversa e todas as suas mensagens.
        
        Args:
            conversation_id: ID da conversa
            
        Returns:
            True se a conversa foi excluída com sucesso
        """
        if self.pool is None:
            await self.initialize()
            
        async with self.pool.acquire() as conn:
            result = await conn.execute(
                '''
                DELETE FROM conversations
                WHERE id = $1
                ''',
                uuid.UUID(conversation_id)
            )
            
        return "DELETE 1" in result
    
    async def close(self):
        """Fecha a conexão com o pool de banco de dados."""
        if self.pool:
            await self.pool.close()
            self.pool = None
