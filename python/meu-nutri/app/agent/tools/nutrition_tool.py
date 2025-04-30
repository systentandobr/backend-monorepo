"""
Ferramenta para o agente MCP que fornece análise e recomendações nutricionais.
"""

from typing import Dict, Any, Optional, List, Union
from langchain.tools import BaseTool
from pydantic import BaseModel, Field

class NutritionInput(BaseModel):
    """Modelo de entrada para a ferramenta de nutrição."""
    query: str = Field(
        ..., 
        description="Consulta nutricional ou alimento a ser analisado"
    )
    user_context: Optional[Dict[str, Any]] = Field(
        None,
        description="Contexto opcional do usuário, como objetivos, restrições, etc."
    )

class NutritionTool(BaseTool):
    """
    Ferramenta para analisar alimentos e fornecer recomendações nutricionais.
    """
    
    name: str = "nutrition_advisor"
    description: str = """
    Ferramenta para obter informações nutricionais sobre alimentos, refeições e dietas.
    Use quando precisar analisar a composição nutricional de alimentos específicos,
    avaliar o equilíbrio de uma refeição, ou fazer recomendações dietéticas.
    
    Exemplos de uso:
    - Qual a composição nutricional de uma maçã?
    - O que é melhor para consumir antes do treino?
    - Como equilibrar uma refeição pós-treino?
    - Quais nutrientes estão presentes em uma refeição com arroz, feijão e frango?
    """
    
    # Adicionar o campo database_path que estava faltando
    database_path: Optional[str] = Field(default=None, description="Caminho para o banco de dados nutricional")
    
    def __init__(self, database_path: Optional[str] = None):
        """
        Inicializa a ferramenta de nutrição.
        
        Args:
            database_path: Caminho opcional para banco de dados nutricional personalizado
        """
        super().__init__()
        self.database_path = database_path
        # Em uma implementação real, carregaria um banco de dados de alimentos
    
    def _run(self, query: str, user_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Executa a análise nutricional.
        
        Args:
            query: Consulta nutricional do usuário
            user_context: Contexto opcional do usuário
            
        Returns:
            Dicionário com análise nutricional
        """
        # Lógica simplificada para demonstração
        # Em uma implementação real, consultaria um banco de dados nutricional
        
        foods_db = {
            "maçã": {
                "calorias": 52,
                "proteínas": 0.3,
                "carboidratos": 14,
                "fibras": 2.4,
                "gorduras": 0.2,
                "vitaminas": ["C", "A"],
                "minerais": ["potássio"],
                "categoria": "fruta"
            },
            "banana": {
                "calorias": 89,
                "proteínas": 1.1,
                "carboidratos": 22.8,
                "fibras": 2.6,
                "gorduras": 0.3,
                "vitaminas": ["B6", "C"],
                "minerais": ["potássio", "magnésio"],
                "categoria": "fruta"
            },
            "arroz": {
                "calorias": 130,
                "proteínas": 2.7,
                "carboidratos": 28,
                "fibras": 0.4,
                "gorduras": 0.3,
                "vitaminas": ["B1", "B3"],
                "minerais": ["magnésio", "fósforo"],
                "categoria": "grão"
            },
            "frango": {
                "calorias": 165,
                "proteínas": 31,
                "carboidratos": 0,
                "fibras": 0,
                "gorduras": 3.6,
                "vitaminas": ["B3", "B6"],
                "minerais": ["fósforo", "selênio"],
                "categoria": "proteína animal"
            }
        }
        
        # Verifica se a consulta é sobre um alimento específico
        query_lower = query.lower()
        for food, nutrients in foods_db.items():
            if food in query_lower:
                return {
                    "alimento": food,
                    "nutrientes": nutrients,
                    "recomendação": self._get_recommendation(food, nutrients, user_context)
                }
        
        # Se não é uma consulta sobre alimento específico, fornece orientação geral
        if "pré-treino" in query_lower or "antes do treino" in query_lower:
            return {
                "tipo_consulta": "pré-treino",
                "recomendação": "Para refeições pré-treino, priorize carboidratos de digestão fácil com proteínas moderadas. Evite alimentos muito gordurosos que podem dificultar a digestão. Boas opções incluem banana com pasta de amendoim, aveia com whey protein, ou iogurte com frutas.",
                "exemplos": ["banana com pasta de amendoim", "aveia com whey protein", "iogurte com frutas"],
                "timing": "Idealmente 1-2 horas antes do exercício"
            }
        
        if "pós-treino" in query_lower or "depois do treino" in query_lower:
            return {
                "tipo_consulta": "pós-treino",
                "recomendação": "Após o treino, o foco deve ser na recuperação muscular e reposição de glicogênio. Combine proteínas de alta qualidade com carboidratos. Boas opções incluem batata doce com frango, smoothie de whey com frutas, ou ovos com torrada integral.",
                "exemplos": ["batata doce com frango", "smoothie de whey com frutas", "ovos com torrada integral"],
                "timing": "Idealmente dentro de 30-60 minutos após o exercício"
            }
        
        # Resposta genérica para outras consultas
        return {
            "tipo_consulta": "geral",
            "recomendação": "Para uma alimentação equilibrada, inclua proteínas magras, carboidratos complexos, gorduras saudáveis e muitos vegetais. Distribua os nutrientes ao longo do dia e considere seu nível de atividade física e objetivos pessoais.",
            "princípios": [
                "Variedade de alimentos",
                "Prioridade para alimentos não processados",
                "Adequação calórica baseada em objetivos",
                "Hidratação adequada",
                "Timing alimentar considerando ritmo circadiano"
            ]
        }
    
    def _get_recommendation(self, food: str, nutrients: Dict[str, Any], user_context: Optional[Dict[str, Any]]) -> str:
        """Gera recomendações personalizadas com base no alimento e no contexto do usuário."""
        
        if nutrients["categoria"] == "fruta":
            return f"{food.capitalize()} é uma excelente fonte de vitaminas e fibras. Ideal para consumo como lanche entre refeições ou adicionada a smoothies e saladas."
        
        if nutrients["categoria"] == "grão":
            return f"{food.capitalize()} é uma boa fonte de carboidratos complexos e energia sustentada. Combine com proteínas e vegetais para uma refeição mais equilibrada."
        
        if nutrients["categoria"] == "proteína animal":
            return f"{food.capitalize()} é uma excelente fonte de proteínas completas para recuperação muscular e saciedade. Prepare de formas que minimizem a adição de gorduras, como grelhado ou assado."
        
        return f"{food.capitalize()} contém {nutrients['calorias']} calorias por porção, com {nutrients['proteínas']}g de proteínas, {nutrients['carboidratos']}g de carboidratos e {nutrients['gorduras']}g de gorduras."
        
    async def _arun(self, query: str, user_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Versão assíncrona da execução da análise nutricional.
        
        Args:
            query: Consulta nutricional do usuário
            user_context: Contexto opcional do usuário
            
        Returns:
            Dicionário com análise nutricional
        """
        # Para simplificar, reutiliza a implementação síncrona
        return self._run(query, user_context)
