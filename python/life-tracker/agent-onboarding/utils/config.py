"""
Configurações do agente de onboarding
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Configurações da aplicação"""
    
    # Configurações da aplicação
    app_name: str = "Life Tracker - Agente de Onboarding"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Configurações do servidor
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Configurações de banco de dados
    database_url: Optional[str] = None
    database_host: str = "localhost"
    database_port: int = 5432
    database_name: str = "life_tracker"
    database_user: str = "postgres"
    database_password: str = "password"
    
    # Configurações de Redis
    redis_url: Optional[str] = None
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    
    # Configurações de API externa
    api_base_url: str = "http://localhost:3000"
    api_timeout: int = 30
    
    # Configurações de IA/ML
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    
    # Configurações de logging
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Configurações de templates
    templates_dir: str = "templates"
    default_template: str = "balanced_template"
    
    # Configurações de personalização
    max_customization_score: float = 100.0
    min_confidence_threshold: float = 60.0
    
    # Configurações de cache
    cache_ttl: int = 3600  # 1 hora
    cache_max_size: int = 1000
    
    # Configurações de rate limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 3600  # 1 hora
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "allow"
    
    @property
    def database_url_computed(self) -> str:
        """URL completa do banco de dados"""
        if self.database_url:
            return self.database_url
        
        return f"postgresql://{self.database_user}:{self.database_password}@{self.database_host}:{self.database_port}/{self.database_name}"
    
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
