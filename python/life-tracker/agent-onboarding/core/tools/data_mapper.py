"""
Sistema de mapeamento de dados para ferramentas do Agno
Resolve problemas de tipos e validação de forma robusta
"""

import logging
from typing import Dict, Any, List, Union, Optional
from datetime import datetime
from pydantic import BaseModel, Field, validator

logger = logging.getLogger(__name__)

class OnboardingDataMapper:
    """
    Mapper para dados de onboarding
    Normaliza e valida dados vindos de diferentes fontes
    """
    
    @staticmethod
    def normalize_list_field(field: Union[str, List[str], None]) -> List[str]:
        """
        Normaliza campos de lista que podem vir como string ou array
        
        Args:
            field: Campo que pode ser string, lista ou None
            
        Returns:
            Lista normalizada
        """
        if field is None:
            return []
        
        if isinstance(field, list):
            return [str(item).strip() for item in field if str(item).strip()]
        
        if isinstance(field, str):
            if not field.strip():
                return []
            return [item.strip() for item in field.split(",") if item.strip()]
        
        # Fallback: converter para string e processar
        return [str(field).strip()]
    
    @staticmethod
    def normalize_string_field(field: Any) -> str:
        """
        Normaliza campos de string
        
        Args:
            field: Campo que pode ser qualquer tipo
            
        Returns:
            String normalizada
        """
        if field is None:
            return ""
        
        if isinstance(field, str):
            return field.strip()
        
        return str(field).strip()
    
    @staticmethod
    def normalize_numeric_field(field: Any, field_type: str = "float") -> Union[float, int]:
        """
        Normaliza campos numéricos
        
        Args:
            field: Campo numérico
            field_type: Tipo esperado ("float" ou "int")
            
        Returns:
            Valor numérico normalizado
        """
        if field is None:
            return 0.0 if field_type == "float" else 0
        
        try:
            if field_type == "int":
                return int(float(field))
            else:
                return float(field)
        except (ValueError, TypeError):
            logger.warning(f"Campo numérico inválido: {field}, usando 0")
            return 0.0 if field_type == "float" else 0
    
    @staticmethod
    def map_onboarding_answers(raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Mapeia dados brutos de onboarding para formato padronizado
        
        Args:
            raw_data: Dados brutos vindos do agente
            
        Returns:
            Dados mapeados e normalizados
        """
        try:
            logger.info(f"Mapeando dados de onboarding: {list(raw_data.keys())}")
            
            mapped_data = {
                # Campos obrigatórios
                "user_id": OnboardingDataMapper.normalize_string_field(raw_data.get("user_id")),
                
                # Campos de perfil
                "concentration": OnboardingDataMapper.normalize_string_field(raw_data.get("concentration")),
                "lifestyle": OnboardingDataMapper.normalize_string_field(raw_data.get("lifestyle")),
                "energy": OnboardingDataMapper.normalize_string_field(raw_data.get("energy")),
                "wakeup_time": OnboardingDataMapper.normalize_string_field(raw_data.get("wakeup_time")),
                "sleep_time": OnboardingDataMapper.normalize_string_field(raw_data.get("sleep_time")),
                
                # Campos de lista
                "personal_interests": OnboardingDataMapper.normalize_list_field(raw_data.get("personal_interests")),
                "financial_goals": OnboardingDataMapper.normalize_list_field(raw_data.get("financial_goals")),
                "life_goals": OnboardingDataMapper.normalize_list_field(raw_data.get("life_goals")),
                "business_interests": OnboardingDataMapper.normalize_list_field(raw_data.get("business_interests")),
                "learning_areas": OnboardingDataMapper.normalize_list_field(raw_data.get("learning_areas")),
                
                # Campos opcionais
                "entrepreneur_profile": OnboardingDataMapper.normalize_string_field(raw_data.get("entrepreneur_profile")),
                "risk_tolerance": OnboardingDataMapper.normalize_string_field(raw_data.get("risk_tolerance")),
                "investment_horizon": OnboardingDataMapper.normalize_string_field(raw_data.get("investment_horizon")),
                "investment_capacity": OnboardingDataMapper.normalize_string_field(raw_data.get("investment_capacity")),
                
                # Campos numéricos
                "monthly_income": OnboardingDataMapper.normalize_numeric_field(raw_data.get("monthly_income"), "float"),
                "monthly_savings": OnboardingDataMapper.normalize_numeric_field(raw_data.get("monthly_savings"), "float"),
                "time_availability": OnboardingDataMapper.normalize_numeric_field(raw_data.get("time_availability"), "int"),
                
                # Metadados
                "created_at": raw_data.get("created_at") or datetime.now().isoformat(),
                "source": raw_data.get("source") or "agno-agent"
            }
            
            logger.info(f"✅ Dados mapeados com sucesso para usuário: {mapped_data['user_id']}")
            return mapped_data
            
        except Exception as e:
            logger.error(f"❌ Erro ao mapear dados: {str(e)}")
            # Retornar dados mínimos em caso de erro
            return {
                "user_id": OnboardingDataMapper.normalize_string_field(raw_data.get("user_id")),
                "concentration": "medium-focus",
                "lifestyle": "somewhat-satisfied",
                "energy": "medium-energy",
                "wakeup_time": "06:00",
                "sleep_time": "22:00",
                "personal_interests": ["general"],
                "financial_goals": ["general"],
                "life_goals": ["general"],
                "business_interests": [],
                "learning_areas": ["general"],
                "entrepreneur_profile": "",
                "risk_tolerance": "",
                "investment_horizon": "",
                "investment_capacity": "",
                "monthly_income": 0.0,
                "monthly_savings": 0.0,
                "time_availability": 0,
                "created_at": datetime.now().isoformat(),
                "source": "agno-agent-fallback"
            }

class ToolInputMapper:
    """
    Mapper específico para inputs de ferramentas
    """
    
    @staticmethod
    def map_analyze_profile_input(**kwargs) -> Dict[str, Any]:
        """
        Mapeia input da ferramenta analyze_profile_tool
        """
        return OnboardingDataMapper.map_onboarding_answers(kwargs)
    
    @staticmethod
    def map_template_match_input(**kwargs) -> Dict[str, Any]:
        """
        Mapeia input da ferramenta match_template_tool
        """
        return {
            "user_id": OnboardingDataMapper.normalize_string_field(kwargs.get("user_id")),
            "profile_analysis": kwargs.get("profile_analysis", {})
        }
    
    @staticmethod
    def map_generate_plan_input(**kwargs) -> Dict[str, Any]:
        """
        Mapeia input da ferramenta generate_plan_tool
        """
        return {
            "user_id": OnboardingDataMapper.normalize_string_field(kwargs.get("user_id")),
            "profile_analysis": kwargs.get("profile_analysis", {}),
            "template_id": OnboardingDataMapper.normalize_string_field(kwargs.get("template_id")),
            "customizations": kwargs.get("customizations", {})
        }

class ValidationResult:
    """Resultado de validação de dados"""
    
    def __init__(self, is_valid: bool, data: Dict[str, Any] = None, errors: List[str] = None):
        self.is_valid = is_valid
        self.data = data or {}
        self.errors = errors or []
    
    def __bool__(self):
        return self.is_valid

class DataValidator:
    """
    Validador de dados mapeados
    """
    
    @staticmethod
    def validate_onboarding_data(data: Dict[str, Any]) -> ValidationResult:
        """
        Valida dados de onboarding mapeados
        """
        errors = []
        
        # Validar campos obrigatórios
        required_fields = ["user_id", "concentration", "lifestyle", "energy"]
        for field in required_fields:
            if not data.get(field):
                errors.append(f"Campo obrigatório ausente: {field}")
        
        # Validar campos numéricos
        numeric_fields = ["monthly_income", "monthly_savings", "time_availability"]
        for field in numeric_fields:
            value = data.get(field, 0)
            if not isinstance(value, (int, float)) or value < 0:
                errors.append(f"Campo numérico inválido: {field}")
        
        # Validar horários
        time_fields = ["wakeup_time", "sleep_time"]
        for field in time_fields:
            value = data.get(field, "")
            if value and not DataValidator._is_valid_time_format(value):
                errors.append(f"Formato de horário inválido: {field}")
        
        is_valid = len(errors) == 0
        
        return ValidationResult(is_valid, data, errors)
    
    @staticmethod
    def _is_valid_time_format(time_str: str) -> bool:
        """Valida formato de horário HH:MM"""
        try:
            if not time_str or ":" not in time_str:
                return False
            hour, minute = time_str.split(":")
            return 0 <= int(hour) <= 23 and 0 <= int(minute) <= 59
        except:
            return False
