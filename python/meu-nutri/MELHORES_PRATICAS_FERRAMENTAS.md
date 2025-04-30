# Melhores Práticas para Desenvolvimento de Ferramentas para Agentes AI

Este documento apresenta as melhores práticas para o desenvolvimento de novas ferramentas para agentes de IA no projeto Systentando, com base nas lições aprendidas durante a correção do problema na `CircadianTool`.

## 1. Estrutura Básica de uma Ferramenta LangChain

Ao criar uma nova ferramenta que herda de `BaseTool` do LangChain, siga esta estrutura básica:

```python
from langchain.tools import BaseTool
from pydantic import Field
from typing import Dict, Any, Optional

class MinhaFerramenta(BaseTool):
    """
    Documentação da ferramenta explicando seu propósito e uso.
    """
    
    # Atributos obrigatórios para todas as ferramentas
    name: str = "nome_da_ferramenta"
    description: str = """
    Descrição detalhada da ferramenta, seus casos de uso e exemplos.
    Essa descrição será usada pelo modelo de linguagem para decidir quando usar a ferramenta.
    """
    
    # ⚠️ IMPORTANTE: Declare explicitamente todos os atributos que serão usados na classe
    # com seus tipos e valores padrão usando Field do Pydantic
    user_id: str = Field(default="", description="ID do usuário para personalização")
    # Outros campos específicos da ferramenta...
    
    def __init__(self, user_id: str, **kwargs):
        """
        Inicializa a ferramenta com os parâmetros necessários.
        
        Args:
            user_id: ID do usuário para personalização
            **kwargs: Argumentos adicionais que serão passados para a classe pai
        """
        # Sempre inicialize a classe pai primeiro
        super().__init__(**kwargs)
        
        # Atribua valores aos campos declarados
        self.user_id = user_id
        
        # Inicialize outros recursos da ferramenta
        self.recursos_adicionais = None
    
    async def _arun(self, query: str, **kwargs) -> Dict[str, Any]:
        """
        Implementação assíncrona da ferramenta.
        
        Args:
            query: Consulta ou comando para a ferramenta
            **kwargs: Parâmetros adicionais
            
        Returns:
            Resultado da execução da ferramenta
        """
        # Lógica assíncrona da ferramenta
        pass
        
    def _run(self, query: str, **kwargs) -> Dict[str, Any]:
        """
        Implementação síncrona da ferramenta.
        
        Args:
            query: Consulta ou comando para a ferramenta
            **kwargs: Parâmetros adicionais
            
        Returns:
            Resultado da execução da ferramenta
        """
        # Lógica síncrona da ferramenta
        pass
```

## 2. Principais Erros a Evitar

1. **Não declarar campos explicitamente**: 
   - Todos os atributos que serão definidos no `__init__` devem ser declarados como campos da classe
   - Usar `Field()` do Pydantic para definir valores padrão e documentação

2. **Esquecer de chamar `super().__init__()`**:
   - Sempre inicialize a classe pai para garantir que ela configure seus campos internos corretamente

3. **Mutabilidade sem controle**:
   - Evite usar estruturas mutáveis como listas ou dicionários como valores padrão
   - Use `Field(default_factory=list)` em vez de `Field(default=[])`

4. **Ignorar tipagem**:
   - Use anotações de tipo para todos os campos e métodos
   - Isso ajuda na validação e na documentação automática

## 3. Tratamento de Erros

Implemente tratamento de erros adequado em suas ferramentas:

```python
async def run(self, tool_input: str) -> str:
    """Interface para executar a ferramenta a partir de uma entrada em texto."""
    try:
        # Processamento da ferramenta
        result = await self._run(tool_input)
        return str(result)
    except Exception as e:
        # Captura e registra o erro
        logger.error(f"Erro ao executar {self.name}: {str(e)}", exc_info=True)
        
        # Retorna uma mensagem de erro amigável
        return f"Ocorreu um problema ao processar sua solicitação: {str(e)}"
```

## 4. Testes Unitários para Ferramentas

Crie testes unitários específicos para cada ferramenta:

```python
import pytest

@pytest.fixture
def ferramenta():
    return MinhaFerramenta(user_id="test_user_123")

def test_inicializacao(ferramenta):
    """Testa se a ferramenta inicializa corretamente."""
    assert ferramenta.user_id == "test_user_123"
    assert ferramenta.name == "nome_da_ferramenta"

@pytest.mark.asyncio
async def test_execucao(ferramenta):
    """Testa a execução básica da ferramenta."""
    resultado = await ferramenta.run("consulta de teste")
    assert isinstance(resultado, str)
    assert len(resultado) > 0
```

## 5. Documentação Padrão

Siga este formato para documentar suas ferramentas:

1. **Descrição da classe**: Explique o propósito da ferramenta no docstring da classe
2. **Parâmetros de inicialização**: Documente todos os parâmetros no `__init__`
3. **Métodos**: Documente a funcionalidade, argumentos e retornos
4. **Exceções**: Liste as exceções que podem ser lançadas
5. **Exemplos**: Forneça exemplos de uso no docstring da classe

## 6. Tratamento de Entradas

Para processar entradas em formato texto para ferramentas:

```python
def parse_input(self, text_input: str) -> Dict[str, Any]:
    """
    Processa entrada em formato de texto para extrair parâmetros.
    
    Args:
        text_input: Texto de entrada para a ferramenta
        
    Returns:
        Dicionário com os parâmetros extraídos
    """
    params = {}
    
    # Extrair parâmetros por análise de texto
    # Exemplo: Extração de horários, tipos de atividade, etc.
    
    return params
```

## 7. Integração com o Agente

Ao integrar suas ferramentas com o agente:

```python
def _setup_tools(self) -> List[BaseTool]:
    """Configura as ferramentas disponíveis para o agente."""
    tools = [
        # Inicialize suas ferramentas com os parâmetros necessários
        MinhaFerramenta(user_id=self.user_id),
        OutraFerramenta(parametro1="valor1", parametro2="valor2"),
    ]
    
    # Converte para formato que o LangChain espera
    lc_tools = []
    for tool in tools:
        lc_tool = Tool(
            name=tool.name,
            description=tool.description,
            func=tool.run
        )
        lc_tools.append(lc_tool)
        
    return lc_tools
```

## 8. Classe Base Personalizada

Para facilitar o desenvolvimento de novas ferramentas, crie uma classe base personalizada:

```python
class BaseToolSystentando(BaseTool):
    """
    Classe base personalizada para todas as ferramentas do Systentando.
    Define campos e métodos comuns a todas as ferramentas.
    """
    
    # Campos comuns a todas as ferramentas
    user_id: str = Field(default="", description="ID do usuário para personalização")
    
    def __init__(self, user_id: str, **kwargs):
        """
        Inicializa a ferramenta base.
        
        Args:
            user_id: ID do usuário para personalização
            **kwargs: Argumentos adicionais
        """
        super().__init__(**kwargs)
        self.user_id = user_id
        
    async def _initialize_resources(self):
        """
        Método para inicialização assíncrona de recursos.
        Deve ser implementado pelas classes filhas se necessário.
        """
        pass
        
    def _format_result(self, result: Any) -> str:
        """
        Formata o resultado da ferramenta como string.
        
        Args:
            result: Resultado a ser formatado
            
        Returns:
            Resultado formatado como string
        """
        if isinstance(result, dict):
            return json.dumps(result, indent=2, ensure_ascii=False)
        return str(result)
```

## 9. Logs e Telemetria

Implemente logs adequados em suas ferramentas:

```python
import logging
logger = logging.getLogger(__name__)

async def _run(self, query: str, **kwargs) -> Dict[str, Any]:
    """Executa a ferramenta."""
    start_time = time.time()
    logger.info(f"Iniciando execução da ferramenta {self.name} com entrada: {query[:50]}...")
    
    try:
        # Lógica da ferramenta
        result = ...
        
        execution_time = time.time() - start_time
        logger.info(f"Ferramenta {self.name} executada com sucesso em {execution_time:.2f}s")
        
        # Telemetria
        await self._register_metrics(query, execution_time, success=True)
        
        return result
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"Erro na ferramenta {self.name}: {str(e)}", exc_info=True)
        
        # Telemetria
        await self._register_metrics(query, execution_time, success=False, error=str(e))
        
        raise
```

## 10. Gerenciamento de Recursos

Implemente o gerenciamento adequado de recursos:

```python
class MinhaFerramenta(BaseToolSystentando):
    """Exemplo de ferramenta com gerenciamento de recursos."""
    
    def __init__(self, user_id: str, **kwargs):
        super().__init__(user_id, **kwargs)
        self._connection = None
        
    async def _get_connection(self):
        """Obtém uma conexão ao recurso, inicializando se necessário."""
        if self._connection is None:
            # Inicializa o recurso
            self._connection = await create_resource_connection()
        return self._connection
        
    async def _run(self, query: str, **kwargs):
        connection = await self._get_connection()
        # Use o recurso
        result = await connection.execute(query)
        return result
        
    async def close(self):
        """Fecha recursos da ferramenta."""
        if self._connection is not None:
            await self._connection.close()
            self._connection = None
```

## 11. Versionamento de Ferramentas

Para garantir compatibilidade entre versões:

```python
class MinhaFerramentaV2(MinhaFerramenta):
    """Versão 2 da ferramenta com funcionalidades adicionais."""
    
    version: str = Field(default="2.0", description="Versão da ferramenta")
    
    async def _run(self, query: str, **kwargs):
        # Verifica se deve usar a implementação antiga para compatibilidade
        if kwargs.get("use_legacy", False):
            return await super()._run(query, **kwargs)
            
        # Nova implementação
        # ...
```

## 12. Checklist de Revisão

Antes de adicionar uma nova ferramenta ao projeto, verifique:

- [ ] Todos os campos estão declarados explicitamente
- [ ] Os métodos têm documentação adequada
- [ ] O tratamento de erros está implementado
- [ ] Existem testes unitários para a ferramenta
- [ ] Os recursos são gerenciados adequadamente (inicialização/fechamento)
- [ ] O código segue os princípios SOLID
- [ ] A ferramenta tem logs adequados para depuração
- [ ] Exemplos de uso estão documentados
