# Guia de Refatoração das Ferramentas do Agente

## Contexto

Este guia explica como refatorar as ferramentas existentes para usar a nova classe base `BaseSystentandoTool`, que foi criada para prevenir erros relacionados à declaração de campos no Pydantic/LangChain.

## Problema Resolvido

As ferramentas do LangChain que usamos no projeto utilizam o Pydantic para validação de campos. Isso exige que qualquer atributo que seja definido na classe (via `self.atributo = valor` no construtor) deve ser explicitamente declarado como um campo da classe.

O erro que encontramos na classe `CircadianTool` é um exemplo desse problema:

```
ValueError: "CircadianTool" object has no field "user_id"
ValueError: "CircadianTool" object has no field "engine"
```

## Solução Implementada

Criamos uma classe base chamada `BaseSystentandoTool` que:

1. Herda de `BaseTool` do LangChain
2. Declara campos comuns como `user_id` e outros atributos frequentemente usados
3. Implementa funcionalidades compartilhadas como logging, telemetria e formatação de resultados

## Como Refatorar suas Ferramentas

Siga estes passos para migrar suas ferramentas para a nova classe base:

### 1. Importe a Nova Classe Base

```python
from app.agent.tools.base_tool import BaseSystentandoTool
```

### 2. Altere a Herança

Mude a herança da ferramenta de:

```python
class MinhaFerramenta(BaseTool):
    # ...
```

Para:

```python
class MinhaFerramenta(BaseSystentandoTool):
    # ...
```

### 3. Remova Campos Já Presentes na Classe Base

A classe base já declara os seguintes campos:
- `user_id`
- `execution_count`
- `last_execution_time`
- `average_execution_time`
- `resources`

Você pode remover suas declarações duplicadas desses campos se existirem na sua ferramenta.

### 4. Declare Campos Específicos da sua Ferramenta

Qualquer atributo específico da sua ferramenta que não está na classe base ainda precisa ser declarado explicitamente:

```python
class MinhaFerramenta(BaseSystentandoTool):
    # Campos específicos da ferramenta
    engine: Optional[Any] = Field(default=None, description="Motor específico da ferramenta")
    config: Dict[str, Any] = Field(default_factory=dict, description="Configurações da ferramenta")
    
    # ...
```

### 5. Atualize o Construtor

Use o seguinte padrão para o construtor:

```python
def __init__(self, user_id: str, **kwargs):
    """
    Inicializa a ferramenta.
    
    Args:
        user_id: ID do usuário para personalização
        **kwargs: Argumentos adicionais
    """
    # Sempre chame super().__init__ passando user_id e kwargs
    super().__init__(user_id=user_id, **kwargs)
    
    # Inicialize atributos específicos da ferramenta
    self.engine = None
    self.config = {}
```

### 6. Implemente o Método _initialize_resources (Opcional)

Se sua ferramenta precisa inicializar recursos específicos, sobrescreva este método:

```python
def _initialize_resources(self):
    """Inicializa recursos específicos da ferramenta."""
    # Exemplo: carregar um modelo ou conectar a um banco de dados
    self.resources["database"] = self._connect_to_database()
```

### 7. Implemente o Método _parse_input

Para processar entrada de texto, implemente este método:

```python
def _parse_input(self, text_input: str) -> Dict[str, Any]:
    """
    Processa entrada em formato de texto.
    
    Args:
        text_input: Entrada em texto
        
    Returns:
        Dicionário com parâmetros extraídos
    """
    params = {}
    
    # Extraia parâmetros do texto
    if "manhã" in text_input.lower():
        params["time_of_day"] = "manhã"
    # ...
    
    return params
```

### 8. Implemente Método close (Opcional)

Se sua ferramenta usa recursos que precisam ser fechados (conexões, arquivos, etc.):

```python
async def close(self):
    """Fecha recursos utilizados pela ferramenta."""
    await super().close()  # Chame o método da classe pai
    
    # Feche recursos específicos
    if "database" in self.resources:
        await self.resources["database"].close()
```

## Exemplo de Refatoração Completa

### Antes:

```python
from langchain.tools import BaseTool
from pydantic import BaseModel, Field

class CircadianTool(BaseTool):
    name: str = "circadian_advisor"
    description: str = "..."
    
    def __init__(self, user_id: str):
        super().__init__()
        self.user_id = user_id
        self.engine = None
    
    async def _run(self, time_of_day: Optional[str] = None, **kwargs):
        # implementação...
    
    async def run(self, tool_input: str) -> str:
        # implementação...
```

### Depois:

```python
from app.agent.tools.base_tool import BaseSystentandoTool
from pydantic import Field

class CircadianTool(BaseSystentandoTool):
    name: str = "circadian_advisor"
    description: str = "..."
    
    # Campo específico (user_id já está na classe base)
    engine: Optional[Any] = Field(default=None, description="Motor de recomendação circadiana")
    
    def __init__(self, user_id: str, **kwargs):
        super().__init__(user_id=user_id, **kwargs)
        self.engine = None
    
    async def _run(self, time_of_day: Optional[str] = None, **kwargs):
        # implementação...
    
    def _parse_input(self, text_input: str) -> Dict[str, Any]:
        params = {}
        if "manhã" in text_input.lower():
            params["time_of_day"] = "manhã"
        # resto da implementação...
        return params
```

## Benefícios da Refatoração

1. **Previne erros**: Evita o erro `"object has no field"` do Pydantic
2. **Padronização**: Todas as ferramentas seguem o mesmo padrão
3. **Redução de código duplicado**: Funcionalidades comuns estão na classe base
4. **Telemetria automática**: Rastreamento de execução incorporado
5. **Tratamento de erros consistente**: Padroniza o tratamento de exceções

## Ferramentas a Serem Refatoradas

As seguintes ferramentas devem ser atualizadas para usar a nova classe base:

1. CircadianTool
2. NutritionTool
3. VisionTool
4. SearchTool
5. PlanTool

## Próximos Passos

1. Refatore uma ferramenta por vez, testando após cada refatoração
2. Atualize os testes unitários para usar a nova base
3. Documente qualquer comportamento específico em cada ferramenta
