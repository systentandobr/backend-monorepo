# Instruções para o Validador de Ferramentas

## Sobre o Validador

O validador de ferramentas é um script que verifica se todas as ferramentas do agente estão corretamente implementadas, prevenindo erros como:

```
ValueError: "ClasseTool" object has no field "atributo"
```

Este erro ocorre quando um atributo é definido no construtor da classe (`self.atributo = valor`), mas não foi declarado como um campo Pydantic na definição da classe.

## Como Executar o Validador

Execute o validador através do comando:

```bash
make validate-tools
```

Este comando:
1. Ativa o ambiente virtual
2. Torna o script executável
3. Executa o script de validação

## O Que o Validador Verifica

O validador realiza duas verificações principais:

1. **Verificação Estrutural**: Analisa o código fonte de cada ferramenta para detectar atributos definidos no `__init__` que não têm campos correspondentes declarados na classe.

2. **Teste de Instanciação**: Tenta criar uma instância de cada ferramenta para verificar se ela pode ser inicializada sem erros.

## Como Corrigir Erros Encontrados

Se o validador encontrar problemas em uma ferramenta, siga estas etapas para corrigir:

1. Abra o arquivo da ferramenta problemática
2. Para cada atributo marcado como faltante, adicione a declaração apropriada:

```python
# Antes:
class MinhaFerramenta(BaseTool):
    name: str = "minha_ferramenta"
    
    def __init__(self, parametro):
        super().__init__()
        self.parametro = parametro  # Erro: "parametro" não está declarado como campo

# Depois:
class MinhaFerramenta(BaseTool):
    name: str = "minha_ferramenta"
    parametro: str = Field(default="", description="Descrição do parâmetro")
    
    def __init__(self, parametro):
        super().__init__()
        self.parametro = parametro  # Agora funciona!
```

## Para Novas Ferramentas

Para evitar problemas ao criar novas ferramentas:

1. **Use a Classe Base**: Herde de `BaseSystentandoTool` em vez de `BaseTool` diretamente
2. **Declare Todos os Campos**: Qualquer atributo que você definir no `__init__` deve ser declarado na classe
3. **Execute o Validador**: Após criar ou modificar uma ferramenta, execute o validador para garantir que está tudo correto

## Integração no CI/CD

O validador de ferramentas pode ser incorporado ao seu pipeline de CI/CD para garantir que todas as ferramentas estejam corretamente implementadas antes de serem mescladas ao código principal.

Adicione o seguinte passo ao seu arquivo de configuração CI:

```yaml
validate_tools:
  stage: test
  script:
    - make validate-tools
```

Isso garantirá que novas contribuições não introduzam problemas relacionados à declaração de campos Pydantic.
