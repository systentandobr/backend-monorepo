"""
Adaptador para gerenciar a memória de conversação compatível com a API atual do LangChain.
"""

from typing import List, Dict, Any
from langchain.memory import ConversationBufferMemory

class MemoryAdapter:
    """
    Classe adaptadora para gerenciar a memória de conversação.
    
    Esta classe fornece uma camada de abstração sobre as diferentes
    implementações de memória do LangChain, permitindo uma fácil migração
    para versões mais recentes.
    """
    
    def __init__(self, memory_key: str = "chat_history", return_messages: bool = True):
        """
        Inicializa o adaptador de memória.
        
        Args:
            memory_key: Chave para armazenar a memória
            return_messages: Se True, retorna mensagens estruturadas
        """
        # Usando ConversationBufferMemory da API atual
        # Isso ainda mostrará um aviso de depreciação, mas funcionará
        # Uma migração completa será implementada em uma atualização futura
        self.memory = ConversationBufferMemory(
            memory_key=memory_key,
            return_messages=return_messages
        )
    
    def add_user_message(self, message: str) -> None:
        """
        Adiciona uma mensagem do usuário à memória.
        
        Args:
            message: Conteúdo da mensagem
        """
        self.memory.chat_memory.add_user_message(message)
    
    def add_ai_message(self, message: str) -> None:
        """
        Adiciona uma mensagem do assistente à memória.
        
        Args:
            message: Conteúdo da mensagem
        """
        self.memory.chat_memory.add_ai_message(message)
    
    def get_memory(self) -> Any:
        """
        Retorna o objeto de memória para uso pelo agente.
        
        Returns:
            Objeto de memória do LangChain
        """
        return self.memory
    
    def clear(self) -> None:
        """
        Limpa a memória de conversação.
        """
        self.memory.clear()
