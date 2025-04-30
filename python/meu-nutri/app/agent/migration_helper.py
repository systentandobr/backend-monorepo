"""
Auxiliares para migração do LangChain.

Este arquivo contém funções e classes para lidar com a migração de APIs depreciadas
do LangChain para as novas versões recomendadas, facilitando a transição gradual.
"""

import warnings
import functools
from typing import Any, Dict, List, Optional, Callable

class WarningSupressor:
    """
    Classe para suprimir avisos de depreciação do LangChain como gerenciador de contexto.
    """
    
    def __enter__(self):
        """Método necessário para o gerenciador de contexto - começa a suprimir avisos."""
        warnings.filterwarnings("ignore", category=DeprecationWarning, module="langchain")
        warnings.filterwarnings("ignore", message=".*LangChain agents.*")
        warnings.filterwarnings("ignore", message=".*Please see the migration guide.*")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Método necessário para o gerenciador de contexto - restaura comportamento padrão."""
        warnings.resetwarnings()

# Instância global para uso como gerenciador de contexto
suppress_langchain_warnings = WarningSupressor()

def warning_suppressor_decorator(func: Callable) -> Callable:
    """
    Decorador para suprimir avisos de depreciação do LangChain.
    
    Args:
        func: Função a ser decorada
        
    Returns:
        Função decorada que suprime os avisos
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        with suppress_langchain_warnings:
            return func(*args, **kwargs)
    
    return wrapper

def update_agent_prompt(agent: Any, system_message: str) -> Any:
    """
    Atualiza o prompt do sistema do agente de maneira segura.
    
    Este método tenta atualizar o prompt do sistema do agente,
    verificando a estrutura do objeto e realizando as mudanças
    apropriadas dependendo da versão do LangChain.
    
    Args:
        agent: O agente a ser atualizado
        system_message: A nova mensagem do sistema
        
    Returns:
        O agente atualizado
    """
    try:
        # Tenta configurar o sistema de mensagem usando a API mais recente
        if hasattr(agent, 'agent') and hasattr(agent.agent, 'llm_chain'):
            if hasattr(agent.agent.llm_chain, 'prompt'):
                # Para estruturas de prompt baseadas em templates
                if hasattr(agent.agent.llm_chain.prompt, 'template'):
                    current_template = agent.agent.llm_chain.prompt.template
                    # Substitui a linha do sistema padrão pelo sistema personalizado
                    agent.agent.llm_chain.prompt.template = current_template.replace(
                        "I'm a conversational AI assistant.", system_message
                    )
                
                # Para estruturas de prompt baseadas em mensagens
                elif hasattr(agent.agent.llm_chain.prompt, 'messages'):
                    for i, message in enumerate(agent.agent.llm_chain.prompt.messages):
                        if hasattr(message, 'prompt') and hasattr(message.prompt, 'template'):
                            if 'system_message' in message.prompt.template:
                                agent.agent.llm_chain.prompt.messages[i].prompt.template = system_message
                                break
    except Exception as e:
        # Log do erro, mas continua - o agente ainda funcionará, apenas sem a mensagem personalizada
        print(f"Aviso: Não foi possível atualizar o prompt do sistema: {str(e)}")
    
    return agent

class SafeMemoryAdapter:
    """
    Adaptador seguro para memória do LangChain.
    
    Esta classe fornece uma camada de abstração sobre diferentes 
    implementações de memória do LangChain, permitindo uma fácil migração
    para as versões mais recentes quando disponíveis.
    """
    
    def __init__(self, memory_key: str = "chat_history", return_messages: bool = True):
        """
        Inicializa o adaptador de memória.
        
        Args:
            memory_key: Chave para armazenar a memória
            return_messages: Se True, retorna mensagens estruturadas
        """
        # Suprime avisos de depreciação ao inicializar a memória
        with suppress_langchain_warnings:
            # Tenta importar a implementação mais recente
            try:
                from langchain_core.memory import ConversationBufferMemory
                self.memory = ConversationBufferMemory(
                    memory_key=memory_key, 
                    return_messages=return_messages
                )
                self._using_legacy = False
            except ImportError:
                # Fallback para a implementação legada
                from langchain.memory import ConversationBufferMemory
                self.memory = ConversationBufferMemory(
                    memory_key=memory_key, 
                    return_messages=return_messages
                )
                self._using_legacy = True
    
    def add_user_message(self, message: str) -> None:
        """Adiciona uma mensagem do usuário à memória."""
        self.memory.chat_memory.add_user_message(message)
    
    def add_ai_message(self, message: str) -> None:
        """Adiciona uma mensagem do assistente à memória."""
        self.memory.chat_memory.add_ai_message(message)
    
    def get_memory(self) -> Any:
        """Retorna o objeto de memória para uso pelo agente."""
        return self.memory
    
    def clear(self) -> None:
        """Limpa a memória de conversação."""
        self.memory.clear()
    
    def get_buffer_string(self) -> str:
        """Retorna a representação em string do buffer de memória."""
        return self.memory.buffer_string
    
    def load_memory_variables(self, inputs: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Carrega as variáveis da memória para uso no prompt."""
        return self.memory.load_memory_variables(inputs)
