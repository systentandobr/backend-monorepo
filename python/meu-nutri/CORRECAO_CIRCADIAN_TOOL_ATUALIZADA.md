# Correção do erro na CircadianTool (Atualizada)

## Problemas identificados

O sistema apresentava os seguintes erros ao executar o teste do agente híbrido:

1. Primeiro erro:
```
ValueError: "CircadianTool" object has no field "user_id"
```

2. Segundo erro (após a primeira correção):
```
ValueError: "CircadianTool" object has no field "engine"
```

Ambos os erros ocorriam na classe `CircadianTool` no arquivo `app/agent/tools/circadian_tool.py`, quando tentava definir os atributos no construtor.

## Causa dos problemas

Os erros aconteciam porque a classe `CircadianTool` herda de `BaseTool` do LangChain, que utiliza o Pydantic para validação de campos. Quando tentávamos definir `self.user_id = user_id` e `self.engine = None` no construtor, o Pydantic verificava se existiam campos definidos com esses nomes na classe.

Como não havia definição explícita desses campos na classe `CircadianTool`, o Pydantic gerava os erros informando que o objeto não possui esses campos.

## Solução aplicada

Para corrigir os problemas, adicionamos a definição explícita de ambos os campos na classe usando o decorator `Field` do Pydantic:

```python
from pydantic import BaseModel, Field
from typing import Any, Optional

class CircadianTool(BaseTool):
    # Outros campos...
    
    user_id: str = Field(default="", description="ID do usuário para personalização")
    engine: Optional[Any] = Field(default=None, description="Motor de recomendação circadiana")
    
    def __init__(self, user_id: str):
        super().__init__()
        self.user_id = user_id
        self.engine = None
```

Com essa alteração, o Pydantic reconhece que `user_id` e `engine` são campos válidos da classe, permitindo que os valores sejam atribuídos no construtor.

## Padrão geral de solução

A lição aprendida é que, ao trabalhar com classes que utilizam Pydantic (como as ferramentas do LangChain), é necessário:

1. **Declarar explicitamente todos os atributos** que serão utilizados na classe
2. **Especificar o tipo** de cada atributo
3. **Fornecer um valor padrão** ou utilizar `Field()` para configurações adicionais
4. **Documentar o propósito** do campo (opcional, mas recomendado)

## Recomendações adicionais

Para evitar problemas semelhantes no futuro:

1. **Use uma classe base personalizada** que já inclua campos comuns como `user_id`
2. **Implemente verificações estáticas de código** que detectem atribuições a atributos não declarados
3. **Crie testes específicos** para inicialização das classes
4. **Documente claramente** este requisito do Pydantic nas convenções de código do projeto

## Prevenção de problemas futuros

Para evitar a necessidade de declarar cada atributo individualmente em todas as ferramentas, considere criar uma classe base personalizada:

```python
class BaseSystentandoTool(BaseTool):
    """Classe base para todas as ferramentas do Systentando."""
    
    user_id: str = Field(default="", description="ID do usuário para personalização")
    
    def __init__(self, user_id: str, **kwargs):
        super().__init__(**kwargs)
        self.user_id = user_id
```

Assim, novas ferramentas podem herdar desta classe base e automaticamente terão o campo `user_id` disponível.
