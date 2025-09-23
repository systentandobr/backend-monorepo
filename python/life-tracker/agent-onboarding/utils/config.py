"""
Configurações do agente de onboarding
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import logging

# https://docs.agno.com/llms-full.txt
# load envfile .env
load_dotenv()
logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """Configurações da aplicação"""
    
    # Configurações da aplicação
    app_name: str = os.getenv("APP_NAME", "Life Tracker - Agente de Onboarding")
    app_version: str = os.getenv("APP_VERSION", "1.0.0")
    debug: bool = os.getenv("AGNO_DEBUG", "False")

    agno_model_id: str = os.getenv("AGNO_MODEL_ID", "openai/gpt-oss-120b")
    agno_model_summarizer_id: str = os.getenv("AGNO_MODEL_SUMMARIZER_ID", "openai/gpt-oss-120b")
    agno_model_embedder_id: str = os.getenv("AGNO_MODEL_EMBEDDER_ID", "openai/gpt-oss-120b")
    agno_memory_enable: bool = os.getenv("AGNO_MEMORY_ENABLE", "True")
    agno_memory_table_name: str = os.getenv("AGNO_MEMORY_TABLE_NAME", "agno_interactions")
    agno_memory_db_file: str = os.getenv("AGNO_MEMORY_DB_FILE", "data/agno_memory.db")
    agno_storage_db_file: str = os.getenv("AGNO_STORAGE_DB_FILE", "data/agno_storage.db")
    agno_memory_db_type: str = os.getenv("AGNO_MEMORY_DB_TYPE", "sqlite")
    agno_memory_schema: str = os.getenv("AGNO_MEMORY_SCHEMA", "agno_user_memories")
    # Configurações do servidor
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = os.getenv("PORT", "8000")
    
    # Configurações de banco de dados
    database_type: str = os.getenv("DATABASE_TYPE", "mongodb")
    database_url: Optional[str] = None
    database_host: str = os.getenv("DATABASE_HOST", "localhost")
    database_port: int = os.getenv("DATABASE_PORT", "27017")
    database_name: str = os.getenv("DATABASE_NAME", "backend-monorepo")
    database_user: str = os.getenv("DATABASE_USER", "admin")
    database_password: str = os.getenv("DATABASE_PASSWORD", "admin")
    
    # Configurações de Redis
    redis_url: Optional[str] = None
    redis_host: str = os.getenv("REDIS_HOST", "localhost")
    redis_port: int = os.getenv("REDIS_PORT", "6379")
    redis_db: int = os.getenv("REDIS_DB", "0")
    
    # Configurações de API externa
    api_base_url: str = os.getenv("API_BASE_URL", "http://localhost:3000")
    api_timeout: int = os.getenv("API_TIMEOUT", "30")
    
    # Configurações de IA/ML
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    
    # Configurações de logging
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    log_format: str = os.getenv("LOG_FORMAT", "%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    
    # Configurações de templates
    templates_dir: str = os.getenv("TEMPLATES_DIR", "templates")
    default_template: str = os.getenv("DEFAULT_TEMPLATE", "balanced_template")
    
    # Configurações de personalização
    max_customization_score: float = os.getenv("MAX_CUSTOMIZATION_SCORE", "100.0")
    min_confidence_threshold: float = os.getenv("MIN_CONFIDENCE_THRESHOLD", "60.0")
    
    # Configurações de cache
    cache_ttl: int = os.getenv("CACHE_TTL", "3600")  # 1 hora
    cache_max_size: int = os.getenv("CACHE_MAX_SIZE", "1000")
    
    # Configurações de rate limiting
    rate_limit_requests: int = os.getenv("RATE_LIMIT_REQUESTS", "100")
    rate_limit_window: int = os.getenv("RATE_LIMIT_WINDOW", "3600")  # 1 hora
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "allow"
    
    def __init__(self):
        super().__init__()
        self.validate_config()

    @property
    def database_url_computed(self) -> str:
        """URL completa do banco de dados"""
        logger.info(f"Tipo de banco de dados: {self.database_type}")
        if self.database_type == "mongodb":
            return self.database_url_mongodb
        elif self.database_type == "postgresql":
            return self.database_url_postgresql
        elif self.database_type == "redis":
            return self.redis_url_computed
        else:
            raise ValueError(f"Tipo de banco de dados não suportado: {self.database_type}")
    
    @property
    def database_url_mongodb(self) -> str:
        """URL completa do banco de dados MongoDB"""
        database_url = f"mongodb+srv://{self.database_user}:{self.database_password}@{self.database_host}/{self.database_name}?retryWrites=true&w=majority"
        # logger.info(f"URL do banco de dados MongoDB: {database_url}")
        return database_url

    @property
    def database_url_postgresql(self) -> str:
        """URL completa do banco de dados PostgreSQL"""
        return f"postgresql+asyncpg://{self.database_user}:{self.database_password}@{self.database_host}:{self.database_port}/{self.database_name}"
    
    @property
    def redis_url_computed(self) -> str:
        """URL completa do Redis"""
        if self.redis_url:
            return self.redis_url
        
        return f"redis://{self.redis_host}:{self.redis_port}/{self.redis_db}"
    
    def get_template_path(self, template_name: str) -> str:
        """Obtém o caminho completo para um template"""
        return os.path.join(self.templates_dir, f"{template_name}.json")
    
    def validate_config(self) -> bool:
        """Valida as configurações obrigatórias"""
        required_fields = [
            'database_host',
            'database_name',
            'database_user',
            'database_password'
        ]
        
        for field in required_fields:
            if not getattr(self, field):
                raise ValueError(f"Campo obrigatório não configurado: {field}")
        
        return True
