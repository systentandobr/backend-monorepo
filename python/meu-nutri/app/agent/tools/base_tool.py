"""
Implementação da classe base para todas as ferramentas do agente Meu Nutri.
Fornece funcionalidades comuns e padroniza o uso do Pydantic com o LangChain.
"""

from typing import Dict, Any, Optional, List, Union
from langchain.tools import BaseTool as LangChainBaseTool
from pydantic import BaseModel, Field
import logging

# Configura logger para ferramentas
logger = logging.getLogger("meunutri.tools")

class BaseSystentandoTool(LangChainBaseTool):
    """
    Classe base para todas as ferramentas do Systentando.
    Padroniza atributos comuns e adiciona funcionalidades compartilhadas.
    
    Todas as ferramentas personalizadas devem herdar desta classe base
    em vez de herdar diretamente de BaseTool do LangChain.
    """
    
    # Campos comuns a todas as ferramentas
    user_id: str = Field(default="", description="ID do usuário para personalização")
    
    # Campos para rastreamento e telemetria
    execution_count: int = Field(default=0, description="Contador de execuções da ferramenta")
    last_execution_time: Optional[float] = Field(default=None, description="Timestamp da última execução")
    average_execution_time: Optional[float] = Field(default=None, description="Tempo médio de execução em segundos")
    
    # Campos para recursos dinâmicos
    resources: Dict[str, Any] = Field(default_factory=dict, description="Recursos dinâmicos utilizados pela ferramenta")
    
    def __init__(self, user_id: str, **kwargs):
        """
        Inicializa a ferramenta base.
        
        Args:
            user_id: ID do usuário para personalização
            **kwargs: Argumentos adicionais a serem passados para a classe pai
        """
        # Inicializa a classe pai do LangChain
        super().__init__(**kwargs)
        
        # Configura os atributos comuns
        self.user_id = user_id
        self.execution_count = 0
        self.last_execution_time = None
        self.average_execution_time = None
        self.resources = {}
        
        # Inicializa recursos específicos da implementação
        self._initialize_resources()
    
    def _initialize_resources(self):
        """
        Inicializa recursos específicos da ferramenta.
        Deve ser sobrescrito pelas classes filhas se necessário.
        """
        pass
    
    def _track_execution(self, execution_time: float):
        """
        Registra métricas de execução para telemetria.
        
        Args:
            execution_time: Tempo de execução em segundos
        """
        self.execution_count += 1
        self.last_execution_time = execution_time
        
        # Atualiza o tempo médio de execução
        if self.average_execution_time is None:
            self.average_execution_time = execution_time
        else:
            # Média móvel ponderada
            self.average_execution_time = (
                0.9 * self.average_execution_time + 0.1 * execution_time
            )
    
    def _format_result(self, result: Any) -> str:
        """
        Formata o resultado para retorno ao agente.
        
        Args:
            result: Resultado a ser formatado
            
        Returns:
            Resultado formatado como string
        """
        if isinstance(result, dict):
            try:
                import json
                return json.dumps(result, ensure_ascii=False, indent=2)
            except Exception as e:
                logger.warning(f"Erro ao formatar resultado como JSON: {str(e)}")
                return str(result)
        elif isinstance(result, (list, tuple)):
            return "\n".join(str(item) for item in result)
        else:
            return str(result)
    
    async def run(self, tool_input: str) -> str:
        """
        Interface padrão para executar a ferramenta a partir de uma entrada em texto.
        
        Args:
            tool_input: Entrada da ferramenta em formato de texto
            
        Returns:
            Resultado da execução como string
        """
        try:
            import time
            start_time = time.time()
            
            # Processa a entrada e executa a ferramenta
            parsed_input = self._parse_input(tool_input)
            result = await self._arun(**parsed_input)
            
            # Registra métricas
            execution_time = time.time() - start_time
            self._track_execution(execution_time)
            
            # Registra uso bem-sucedido
            logger.info(
                f"Ferramenta {self.name} executada com sucesso em {execution_time:.2f}s "
                f"para o usuário {self.user_id}"
            )
            
            # Formata e retorna o resultado
            return self._format_result(result)
            
        except Exception as e:
            # Registra o erro
            logger.error(
                f"Erro ao executar ferramenta {self.name} para o usuário {self.user_id}: {str(e)}",
                exc_info=True
            )
            
            # Retorna mensagem de erro amigável
            return f"Erro ao processar sua solicitação: {str(e)}"
    
    def _parse_input(self, text_input: str) -> Dict[str, Any]:
        """
        Processa entrada em formato de texto para extrair parâmetros.
        Deve ser implementado pelas classes filhas.
        
        Args:
            text_input: Texto de entrada para a ferramenta
            
        Returns:
            Dicionário com os parâmetros extraídos
        """
        # Implementação básica, deve ser sobrescrita por classes filhas
        return {"query": text_input}
    
    async def close(self):
        """
        Fecha recursos utilizados pela ferramenta.
        Deve ser chamado quando a ferramenta não for mais necessária.
        """
        # Implementação básica, deve ser sobrescrita por classes filhas
        pass
