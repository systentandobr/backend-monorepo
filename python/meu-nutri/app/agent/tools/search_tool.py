"""
Ferramenta para o agente MCP que realiza buscas por informações nutricionais e de saúde.
"""

from typing import Dict, Any, Optional, List, Union
import json
import os
import random
from datetime import datetime
from langchain.tools import BaseTool
from pydantic import BaseModel, Field

class SearchInput(BaseModel):
    """Modelo de entrada para a ferramenta de busca."""
    query: str = Field(
        ..., 
        description="Consulta para busca por informações nutricionais ou de saúde"
    )
    max_results: Optional[int] = Field(
        5,
        description="Número máximo de resultados a retornar"
    )

class SearchTool(BaseTool):
    """
    Ferramenta para buscar informações nutricionais e de saúde em fontes confiáveis.
    """
    
    name: str = "nutrition_search"
    description: str = """
    Ferramenta para buscar informações nutricionais e de saúde em fontes confiáveis.
    Use quando precisar encontrar dados científicos, estudos, ou recomendações
    de organizações reconhecidas na área de nutrição e saúde.
    
    Exemplos de uso:
    - Quais são as recomendações atuais de consumo de proteína para atletas?
    - Existem estudos recentes sobre jejum intermitente?
    - Qual a quantidade diária recomendada de vitamina D?
    - Quais são as principais fontes vegetais de ferro?
    """
    
    # Adicionar o campo api_key que estava faltando
    api_key: Optional[str] = Field(default=None, description="Chave da API para serviço de busca")
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Inicializa a ferramenta de busca.
        
        Args:
            api_key: Chave da API para serviço de busca (opcional)
        """
        super().__init__()
        self.api_key = api_key or os.environ.get("SEARCH_API_KEY")
    
    def _run(self, query: str, max_results: int = 5) -> Dict[str, Any]:
        """
        Executa a busca por informações.
        
        Args:
            query: Consulta para busca
            max_results: Número máximo de resultados
            
        Returns:
            Resultados da busca
        """
        # Em uma implementação real, consultaria uma API como Google Scholar, PubMed, etc.
        # Aqui simulamos resultados para demonstração
        
        # Usa palavras-chave na consulta para selecionar categoria de resultados
        query_lower = query.lower()
        
        if any(word in query_lower for word in ["proteína", "protein"]):
            results = self._get_protein_results()
        elif any(word in query_lower for word in ["jejum", "fasting"]):
            results = self._get_fasting_results()
        elif any(word in query_lower for word in ["vitamina", "vitamin"]):
            results = self._get_vitamin_results()
        else:
            results = self._get_general_nutrition_results()
        
        # Limita ao número solicitado de resultados
        results = results[:max_results]
        
        # Simula tempos de resposta variáveis para resultados mais realistas
        search_time = round(random.uniform(0.1, 0.5), 2)
        
        return {
            "query": query,
            "results": results,
            "total_results": len(results),
            "search_time_seconds": search_time,
            "timestamp": datetime.now().isoformat()
        }
    
    def _get_protein_results(self) -> List[Dict[str, Any]]:
        """Retorna resultados simulados sobre proteína."""
        return [
            {
                "title": "Recomendações de ingestão proteica para atletas: uma revisão das diretrizes internacionais",
                "url": "https://example.org/journal/sports-nutrition/protein-recommendations",
                "authors": ["Silva, M.J.", "Oliveira, P.R.", "Santos, A.C."],
                "publication": "Revista Brasileira de Nutrição Esportiva",
                "year": 2023,
                "abstract": "As recomendações atuais sugerem uma ingestão de proteína entre 1,2-2,0g/kg/dia para atletas de resistência e 1,6-2,2g/kg/dia para atletas de força, com valores maiores durante períodos de restrição calórica.",
                "relevance_score": 0.95
            },
            {
                "title": "Distribuição proteica ao longo do dia: impacto na síntese muscular",
                "url": "https://example.org/journal/nutrition/protein-distribution",
                "authors": ["Martins, R.B.", "Fernandes, C.D."],
                "publication": "Journal of Nutrition and Metabolism",
                "year": 2022,
                "abstract": "Este estudo demonstra que a distribuição equitativa de proteínas ao longo das refeições (20-30g por refeição) maximiza a síntese proteica muscular em comparação com o consumo concentrado em uma única refeição.",
                "relevance_score": 0.89
            },
            {
                "title": "Fontes de proteína vegetal: composição e eficácia para ganho muscular",
                "url": "https://example.org/journal/plant-based/protein-sources",
                "authors": ["Costa, A.L.", "Mendes, F.T.", "Rocha, P.S."],
                "publication": "International Journal of Plant-Based Nutrition",
                "year": 2023,
                "abstract": "Combinações específicas de proteínas vegetais podem alcançar perfis de aminoácidos comparáveis a proteínas animais. Estratégias para vegetarianos e veganos são discutidas.",
                "relevance_score": 0.82
            }
        ]
    
    def _get_fasting_results(self) -> List[Dict[str, Any]]:
        """Retorna resultados simulados sobre jejum intermitente."""
        return [
            {
                "title": "Jejum intermitente e sensibilidade à insulina: uma meta-análise",
                "url": "https://example.org/journal/metabolism/fasting-insulin",
                "authors": ["Rodrigues, T.F.", "Almeida, L.C.", "Bueno, M.V."],
                "publication": "Metabolism Journal",
                "year": 2023,
                "abstract": "Esta meta-análise de 24 estudos clínicos demonstra melhoria significativa na sensibilidade à insulina após protocolos de jejum intermitente, especialmente em modelos 16:8 e 5:2.",
                "relevance_score": 0.97
            },
            {
                "title": "Efeitos do jejum intermitente no metabolismo e composição corporal",
                "url": "https://example.org/journal/nutrition/fasting-metabolism",
                "authors": ["Santos, R.M.", "Pereira, A.C."],
                "publication": "European Journal of Clinical Nutrition",
                "year": 2022,
                "abstract": "Revisão sistemática de 18 estudos demonstrando reduções de peso e gordura corporal similares entre jejum intermitente e restrição calórica contínua, com potenciais benefícios adicionais para marcadores metabólicos no jejum.",
                "relevance_score": 0.91
            },
            {
                "title": "Jejum intermitente e desempenho cognitivo em adultos saudáveis",
                "url": "https://example.org/journal/neuroscience/fasting-cognition",
                "authors": ["Lima, P.R.", "Souza, M.F.", "Monteiro, J.B."],
                "publication": "Frontiers in Neuroscience",
                "year": 2022,
                "abstract": "Estudo randomizado controlado com 78 participantes demonstrando melhorias nos testes de atenção sustentada e memória de trabalho após 12 semanas de jejum intermitente no modelo 16:8.",
                "relevance_score": 0.85
            },
            {
                "title": "Jejum time-restricted e ritmo circadiano: impactos metabólicos",
                "url": "https://example.org/journal/endocrinology/fasting-circadian",
                "authors": ["Ferreira, D.S.", "Castro, L.R."],
                "publication": "Journal of Clinical Endocrinology & Metabolism",
                "year": 2023,
                "abstract": "O alinhamento do jejum com o ritmo circadiano (comer durante o dia e jejuar à noite) demonstrou efeitos metabólicos superiores comparados a janelas alimentares desalinhadas com o ciclo luz-escuridão.",
                "relevance_score": 0.82
            }
        ]
    
    def _get_vitamin_results(self) -> List[Dict[str, Any]]:
        """Retorna resultados simulados sobre vitaminas."""
        return [
            {
                "title": "Atualização das recomendações de vitamina D: uma revisão de sociedades internacionais",
                "url": "https://example.org/journal/endocrinology/vitamin-d-recommendations",
                "authors": ["Carvalho, E.T.", "Vieira, M.C.", "Pinto, R.S."],
                "publication": "Journal of Endocrinology",
                "year": 2023,
                "abstract": "Novas diretrizes recomendam entre 1500-2000 UI/dia para adultos com níveis séricos abaixo de 30ng/ml, com ajustes baseados em fatores de risco individuais como exposição solar, idade e pigmentação da pele.",
                "relevance_score": 0.94
            },
            {
                "title": "Vitaminas do complexo B e função cognitiva em idosos",
                "url": "https://example.org/journal/geriatrics/b-vitamins-cognition",
                "authors": ["Alves, P.S.", "Ribeiro, C.M."],
                "publication": "Journals of Gerontology",
                "year": 2022,
                "abstract": "Suplementação combinada de B6, B9 e B12 demonstrou redução no declínio cognitivo em idosos com níveis elevados de homocisteína, especialmente em tarefas de memória e funções executivas.",
                "relevance_score": 0.88
            },
            {
                "title": "Biodisponibilidade de vitamina K em alimentos fermentados",
                "url": "https://example.org/journal/food-science/vitamin-k-bioavailability",
                "authors": ["Nunes, T.A.", "Campos, F.L."],
                "publication": "Journal of Food Science",
                "year": 2023,
                "abstract": "Processos fermentativos aumentam significativamente a biodisponibilidade da vitamina K2 (MK-7) em alimentos tradicionais como natto, chucrute e kimchi, comparado às formas sintéticas de suplementação.",
                "relevance_score": 0.81
            }
        ]
    
    def _get_general_nutrition_results(self) -> List[Dict[str, Any]]:
        """Retorna resultados simulados sobre nutrição geral."""
        return [
            {
                "title": "Padrões alimentares baseados em plantas e marcadores inflamatórios: uma revisão sistemática",
                "url": "https://example.org/journal/nutrition/plant-based-inflammation",
                "authors": ["Oliveira, M.S.", "Ferreira, A.C.", "Dias, P.L."],
                "publication": "American Journal of Clinical Nutrition",
                "year": 2023,
                "abstract": "Dietas com predomínio de alimentos vegetais minimamente processados foram associadas a reduções significativas em marcadores inflamatórios sistêmicos, incluindo PCR, IL-6 e TNF-α, em estudos observacionais e de intervenção.",
                "relevance_score": 0.90
            },
            {
                "title": "Nutrição personalizada: influência do microbioma na resposta glicêmica individual",
                "url": "https://example.org/journal/gastroenterology/microbiome-glycemic",
                "authors": ["Souza, V.R.", "Campos, R.N."],
                "publication": "Gastroenterology",
                "year": 2022,
                "abstract": "A composição do microbioma intestinal explica até 45% da variação nas respostas glicêmicas individuais aos mesmos alimentos, superando fatores como índice glicêmico e carga glicêmica padronizados.",
                "relevance_score": 0.87
            },
            {
                "title": "Impactos metabólicos de adoçantes não-calóricos: novas evidências",
                "url": "https://example.org/journal/metabolism/artificial-sweeteners",
                "authors": ["Costa, L.F.", "Martins, S.P.", "Freitas, E.J."],
                "publication": "JAMA Internal Medicine",
                "year": 2023,
                "abstract": "Consumo regular de adoçantes não-calóricos foi associado a alterações na microbiota intestinal e metabolismo da glicose em ensaios clínicos recentes, questionando seu benefício em estratégias de controle metabólico a longo prazo.",
                "relevance_score": 0.84
            },
            {
                "title": "Cronobiologia da alimentação: impacto dos horários das refeições no metabolismo",
                "url": "https://example.org/journal/chronobiology/meal-timing",
                "authors": ["Lima, A.M.", "Santos, F.C."],
                "publication": "Obesity Reviews",
                "year": 2022,
                "abstract": "O consumo da maior parte das calorias diárias no início do dia (até 15:00h) demonstrou benefícios metabólicos significativos em comparação com padrões de alimentação noturna, independentemente da composição macronutriente.",
                "relevance_score": 0.82
            },
            {
                "title": "Alimentos ultraprocessados e saúde mental: uma análise prospectiva",
                "url": "https://example.org/journal/psychiatry/ultraprocessed-mental-health",
                "authors": ["Ribeiro, M.C.", "Almeida, D.S.", "Vasconcelos, F.R."],
                "publication": "British Journal of Psychiatry",
                "year": 2023,
                "abstract": "Estudo de coorte com 10.359 participantes encontrou associação dose-resposta entre consumo de alimentos ultraprocessados e incidência de depressão e ansiedade ao longo de 6 anos de seguimento.",
                "relevance_score": 0.79
            }
        ]
        
    async def _arun(self, query: str, max_results: int = 5) -> Dict[str, Any]:
        """
        Versão assíncrona da execução da busca.
        
        Args:
            query: Consulta para busca
            max_results: Número máximo de resultados
            
        Returns:
            Resultados da busca
        """
        # Para simplificar, reutiliza a implementação síncrona
        return self._run(query, max_results)
