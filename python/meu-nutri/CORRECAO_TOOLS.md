# Correção dos Erros nas Ferramentas de Agente

## Problemas Corrigidos

Resolvemos dois erros relacionados ao uso do Pydantic nas ferramentas do LangChain:

1. **Erro em CircadianTool**: 
   ```
   ValueError: "CircadianTool" object has no field "user_id"
   ValueError: "CircadianTool" object has no field "engine"
   ```

2. **Erro em NutritionTool**:
   ```
   ValueError: "NutritionTool" object has no field "database_path"
   ```

## Causa dos Problemas

Estes erros ocorreram porque as classes que herdam de `BaseTool` do LangChain utilizam o Pydantic para validação de campos. Quando tentamos atribuir valores a atributos no construtor com `self.atributo = valor`, o Pydantic verifica se existem campos definidos com esses nomes na classe.

Como não havia definição explícita desses campos nas respectivas classes, o Pydantic gerava os erros informando que o objeto não possui os campos em questão.

## Soluções Aplicadas

### 1. Solução para o CircadianTool

Adicionamos a definição explícita dos campos que faltavam:

```python
class CircadianTool(BaseTool):
    # Outros campos...
    
    user_id: str = Field(default="", description="ID do usuário para personalização")
    engine: Optional[Any] = Field(default=None, description="Motor de recomendação circadiana")
    
    def __init__(self, user_id: str):
        super().__init__()
        self.user_id = user_id
        self.engine = None
```

### 2. Solução para o NutritionTool

Adicionamos o campo `database_path` que estava faltando:

```python
class NutritionTool(BaseTool):
    # Outros campos...
    
    database_path: Optional[str] = Field(default=None, description="Caminho para o banco de dados nutricional")
    
    def __init__(self, database_path: Optional[str] = None):
        super().__init__()
        self.database_path = database_path
```

### 3. Modificação no HybridNutriAgent

Para garantir que todas as ferramentas recebam os parâmetros adequados, modificamos o método `_setup_tools()` no `HybridNutriAgent`:

```python
def _setup_tools(self) -> List[BaseTool]:
    """Configura as ferramentas disponíveis para o agente."""
    # Configuração de caminho para o banco de dados nutricional
    nutrition_db_path = os.getenv("NUTRITION_DB_PATH", None)
    
    tools = [
        CircadianTool(user_id=self.user_id),
        # Passando o parâmetro database_path para NutritionTool
        NutritionTool(database_path=nutrition_db_path),
        VisionTool(user_id=self.user_id),
        SearchTool(),
        PlanTool(user_id=self.user_id)
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

## Solução de Longo Prazo: Classe Base Personalizada

Para evitar problemas semelhantes no futuro, criamos uma classe base personalizada `BaseSystentandoTool` que:

1. Declara campos comuns como `user_id` e outros que utilizamos frequentemente
2. Implementa funcionalidades compartilhadas como logging e tratamento de erros

Esta classe está disponível em `app/agent/tools/base_tool.py` e deve ser usada como base para todas as novas ferramentas.

## Como Verificar se uma Ferramenta Está Corretamente Implementada

1. **Verifique se todos os atributos definidos no `__init__` têm campos correspondentes na classe**:
   - Para cada linha `self.atributo = valor` no `__init__`
   - Deve existir uma declaração `atributo: tipo = Field(...)` na classe

2. **Inicialize sempre a classe pai no construtor**:
   - Certifique-se de que a primeira linha do `__init__` seja `super().__init__()`

3. **Use a classe base personalizada `BaseSystentandoTool` para novas ferramentas**:
   - Isso garante que campos comuns já estejam declarados

## Próximos Passos Recomendados

1. **Refatorar todas as ferramentas existentes** para usar a classe base personalizada
2. **Implementar testes unitários** para verificar a inicialização das ferramentas
3. **Adicionar verificações de estilo de código** que detectem atribuições a atributos não declarados
4. **Atualizar o LangChain** para a versão mais recente, seguindo o guia de migração para o `ConversationBufferMemory` (aviso de depreciação)

O guia de refatoração detalhado está disponível em `GUIA_REFATORACAO_FERRAMENTAS.md`.
