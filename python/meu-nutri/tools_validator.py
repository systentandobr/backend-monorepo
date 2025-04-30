#!/usr/bin/env python3
"""
Script para validar se todas as ferramentas do agente estão
declarando corretamente seus campos Pydantic.

Este script ajuda a prevenir erros como:
ValueError: "ClassName" object has no field "field_name"
"""

import os
import sys
import inspect
import importlib
import pkgutil
import traceback
from typing import Dict, List, Any, Set, Tuple, Type, Optional
from langchain.tools import BaseTool

# Configuração
TOOLS_PACKAGE = "app.agent.tools"
IGNORE_CLASSES = ["BaseModel", "BaseTool", "BaseSystentandoTool"]
VERBOSE = True


def log(message: str) -> None:
    """Imprime mensagem de log se o modo verboso estiver ativado."""
    if VERBOSE:
        print(message)


def get_tool_classes_from_directory() -> List[Type[BaseTool]]:
    """
    Encontra manualmente classes de ferramentas a partir do diretório físico.
    
    Returns:
        Lista de classes de ferramentas
    """
    tool_classes = []
    
    # Determina o caminho do diretório do script atual
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Caminho físico para o diretório de ferramentas
    tools_dir = os.path.join(script_dir, "app", "agent", "tools")
    
    if not os.path.isdir(tools_dir):
        log(f"⚠️ Diretório não encontrado: {tools_dir}")
        return tool_classes
    
    log(f"Procurando ferramentas em: {tools_dir}")
    
    # Lista todos os arquivos .py no diretório de ferramentas
    for filename in os.listdir(tools_dir):
        if filename.endswith(".py") and not filename.startswith("__"):
            module_name = filename[:-3]  # Remove a extensão .py
            
            try:
                # Importa o módulo
                module = importlib.import_module(f"app.agent.tools.{module_name}")
                
                # Procura por classes que herdam de BaseTool
                for name, obj in inspect.getmembers(module):
                    if (inspect.isclass(obj) and 
                        issubclass(obj, BaseTool) and 
                        obj.__name__ not in IGNORE_CLASSES):
                        tool_classes.append(obj)
                        log(f"  ↳ Encontrada ferramenta: {obj.__name__}")
            except Exception as e:
                log(f"⚠️ Erro ao importar módulo {module_name}: {str(e)}")
    
    return tool_classes


def find_fields_in_class(cls: Type[Any]) -> Set[str]:
    """
    Encontra todos os campos declarados em uma classe.
    
    Args:
        cls: Classe a ser analisada
        
    Returns:
        Conjunto de nomes de campos
    """
    # Obtém campos declarados pela classe
    fields = set()
    
    # Campos diretos do Pydantic
    if hasattr(cls, '__annotations__'):
        fields.update(cls.__annotations__.keys())
    
    # Campos das classes pai
    for base_cls in cls.__bases__:
        fields.update(find_fields_in_class(base_cls))
    
    return fields


def find_attributes_set_in_init(cls: Type[Any]) -> Set[str]:
    """
    Encontra todos os atributos definidos no método __init__.
    
    Args:
        cls: Classe a ser analisada
        
    Returns:
        Conjunto de nomes de atributos
    """
    # Verifica se a classe tem um método __init__
    if not hasattr(cls, '__init__'):
        return set()
    
    # Obtém o código fonte do método __init__
    try:
        source_lines = inspect.getsourcelines(cls.__init__)[0]
    except (IOError, TypeError):
        return set()
    
    # Procura por linhas com padrão "self.attribute = ..."
    attrs = set()
    for line in source_lines:
        line = line.strip()
        if line.startswith('self.') and '=' in line:
            # Extrai o nome do atributo
            attr_name = line.split('=')[0].strip().replace('self.', '')
            attrs.add(attr_name)
    
    return attrs


def validate_tool_class(cls: Type[BaseTool]) -> Tuple[bool, List[str]]:
    """
    Valida se uma classe de ferramenta tem todos os atributos definidos como campos.
    
    Args:
        cls: Classe a ser validada
        
    Returns:
        Tupla com (válido: bool, erros: List[str])
    """
    # Encontra campos definidos e atributos utilizados
    fields = find_fields_in_class(cls)
    attributes = find_attributes_set_in_init(cls)
    
    # Verifica se todos os atributos definidos têm campos correspondentes
    is_valid = True
    errors = []
    
    for attr in attributes:
        if attr not in fields:
            is_valid = False
            errors.append(f"Atributo '{attr}' definido no __init__ mas não declarado como campo")
    
    return is_valid, errors


def validate_all_tools() -> bool:
    """
    Valida todas as classes de ferramentas.
    
    Returns:
        True se todas as ferramentas forem válidas, False caso contrário
    """
    all_valid = True
    tool_classes = get_tool_classes_from_directory()
    
    if not tool_classes:
        log("⚠️ Nenhuma classe de ferramenta encontrada para validar.")
        return False
    
    log(f"Encontradas {len(tool_classes)} classes de ferramentas para validar.")
    
    for cls in tool_classes:
        log(f"\nValidando {cls.__name__}...")
        is_valid, errors = validate_tool_class(cls)
        
        if is_valid:
            log(f"✅ {cls.__name__} é válida")
        else:
            all_valid = False
            log(f"❌ {cls.__name__} tem problemas:")
            for error in errors:
                log(f"   - {error}")
    
    return all_valid


def test_tool_instantiation(cls: Type[BaseTool]) -> Tuple[bool, Optional[str]]:
    """
    Tenta instanciar uma ferramenta e captura erros.
    
    Args:
        cls: Classe de ferramenta a ser testada
        
    Returns:
        Tupla com (sucesso: bool, mensagem_erro: Optional[str])
    """
    try:
        # Obtém informações sobre o construtor
        signature = inspect.signature(cls.__init__)
        params = signature.parameters
        
        # Prepara argumentos simulados
        kwargs = {}
        for name, param in params.items():
            if name == 'self':
                continue
                
            # Valores simulados para parâmetros comuns
            if name == 'user_id':
                kwargs[name] = 'test_user_id'
            elif name == 'database_path':
                kwargs[name] = '/tmp/test_db.json'
            elif name == 'api_key':
                kwargs[name] = 'test_api_key'
            elif param.default is not inspect.Parameter.empty:
                # Se tiver um valor padrão, não precisa fornecer
                continue
            else:
                # Para outros parâmetros obrigatórios, use um valor genérico
                kwargs[name] = 'test_value'
        
        # Instancia a ferramenta
        instance = cls(**kwargs)
        return True, None
        
    except Exception as e:
        tb = traceback.format_exc()
        return False, f"{str(e)}\n{tb}"


def test_all_tool_instantiations() -> bool:
    """
    Testa a instanciação de todas as ferramentas.
    
    Returns:
        True se todas as ferramentas puderem ser instanciadas, False caso contrário
    """
    all_valid = True
    tool_classes = get_tool_classes_from_directory()
    
    if not tool_classes:
        log("⚠️ Nenhuma classe de ferramenta encontrada para testar instanciação.")
        return False
    
    log(f"\n\nTestando instanciação de {len(tool_classes)} ferramentas...")
    
    for cls in tool_classes:
        log(f"\nTentando instanciar {cls.__name__}...")
        success, error_msg = test_tool_instantiation(cls)
        
        if success:
            log(f"✅ {cls.__name__} instanciada com sucesso")
        else:
            all_valid = False
            log(f"❌ Erro ao instanciar {cls.__name__}:")
            log(f"   {error_msg}")
    
    return all_valid


def main():
    """Função principal do script."""
    print("==== Validador de Ferramentas do Agente ====")
    
    # Valida estrutura das classes
    structure_valid = validate_all_tools()
    
    # Testa instanciação das ferramentas
    instantiation_valid = test_all_tool_instantiations()
    
    # Resultado final
    if structure_valid and instantiation_valid:
        print("\n✅ Todas as ferramentas são válidas e podem ser instanciadas corretamente.")
        return 0
    else:
        print("\n❌ Algumas ferramentas têm problemas. Corrija os erros acima.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
