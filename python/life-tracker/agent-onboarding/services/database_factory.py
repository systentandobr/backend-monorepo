"""
Factory para criação de serviços de banco de dados
Permite trocar entre SQLAlchemy e MongoDB de forma transparente
"""

import logging
from typing import Union
from utils.config import Settings
from .database import DatabaseService
from .mongo_database import MongoDatabase

logger = logging.getLogger(__name__)

class DatabaseFactory:
    """Factory para criar instâncias de banco de dados"""
    
    @staticmethod
    def create_database() -> Union[DatabaseService, MongoDatabase]:
        """Cria instância do banco de dados baseado na configuração"""
        settings = Settings()
        
        if settings.database_type == "mongodb":
            logger.info("Criando instância do MongoDB")
            return MongoDatabase()
        else:
            logger.info("Criando instância do SQLAlchemy")
            return DatabaseService()
    
    @staticmethod
    async def create_and_connect_database() -> Union[DatabaseService, MongoDatabase]:
        """Cria e conecta ao banco de dados"""
        db_service = DatabaseFactory.create_database()
        # await db_service.connect()
        return db_service
