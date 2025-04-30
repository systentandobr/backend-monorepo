# Guia de Migração do LangChain

## Aviso de Depreciação Encontrado

Durante a execução dos testes foi identificado o seguinte aviso:

```
/home/marcelio/developing/systentando/backend-monorepo/python/meu-nutri/app/agent/hybrid_agent.py:61: LangChainDeprecationWarning: Please see the migration guide at: https://python.langchain.com/docs/versions/migrating_memory/
  self.memory = ConversationBufferMemory(
```

Este documento detalha as etapas necessárias para realizar a migração do componente de memória do LangChain para a nova API.

## 1. Migração do ConversationBufferMemory

### Código Atual

```python
from langchain.memory import ConversationBufferMemory

# Inicializa a memória de conversa
self.memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)
```

### Código Atualizado

```python
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory

# Cria uma instância de histórico de mensagens
message_history = ChatMessageHistory()

# Configura o runnable com histórico de mensagens
agent_with_chat_history = RunnableWithMessageHistory(
    agent,
    lambda session_id: message_history,
    input_messages_key="input",
    history_messages_key="chat_history"
)
```

## 2. Migração do Agent e Memória

### Código Atual

```python
def _setup_agent(self) -> AgentExecutor:
    """Configura o executor do agente."""
    agent = initialize_agent(
        tools=self.tools,
        llm=self.llm,
        agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
        verbose=self.verbose,
        memory=self.memory,
        handle_parsing_errors=True
    )
    
    # Adiciona instruções específicas para o agente
    system_message = """
    Você é um assistente nutricional inteligente...
    """
    
    # Atualiza o sistema prompt
    agent.agent.llm_chain.prompt.messages[0].content = system_message
    
    return agent
```

### Código Atualizado

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage
from langchain.agents.format_scratchpad.base import format_to_messages
from langchain.agents.output_parsers.base import ReActSingleInputOutputParser

def _setup_agent(self) -> AgentExecutor:
    """Configura o executor do agente."""
    # Define o prompt com o sistema de mensagens
    system_message = """
    Você é um assistente nutricional inteligente...
    """
    
    prompt = ChatPromptTemplate.from_messages([
        SystemMessage(content=system_message),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad")
    ])
    
    # Configura o agent
    agent = (
        {
            "input": lambda x: x["input"], 
            "chat_history": lambda x: x.get("chat_history", []),
            "agent_scratchpad": lambda x: format_to_messages(x.get("intermediate_steps", []))
        }
        | prompt
        | self.llm
        | ReActSingleInputOutputParser()
    )
    
    # Configura o executor com memória
    executor = AgentExecutor(
        agent=agent,
        tools=self.tools,
        verbose=self.verbose,
        handle_parsing_errors=True
    )
    
    # Configura o histórico de mensagens
    message_history = PostgreSQLChatMessageHistory(
        conversation_id=self.conversation_id,
        session=self.context_manager.session
    )
    
    # Adiciona o gerenciamento de histórico
    agent_with_history = RunnableWithMessageHistory(
        executor,
        lambda session_id: message_history,
        input_messages_key="input",
        history_messages_key="chat_history"
    )
    
    return agent_with_history
```

## 3. Implementação da Classe PostgreSQLChatMessageHistory

Precisamos criar uma classe personalizada para armazenar o histórico de mensagens no PostgreSQL:

```python
from typing import List
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, BaseMessage

class PostgreSQLChatMessageHistory(BaseChatMessageHistory):
    """
    Classe para armazenar o histórico de mensagens no PostgreSQL.
    Compatível com a nova API do LangChain.
    """
    
    def __init__(self, conversation_id: str, session):
        """
        Inicializa o histórico de mensagens.
        
        Args:
            conversation_id: ID da conversa
            session: Sessão do PostgreSQL
        """
        self.conversation_id = conversation_id
        self.session = session
    
    def add_message(self, message: BaseMessage) -> None:
        """
        Adiciona uma mensagem ao histórico.
        
        Args:
            message: Mensagem a ser adicionada
        """
        # Mapeia o tipo de mensagem para o formato do banco
        role_mapping = {
            HumanMessage: "user",
            AIMessage: "assistant",
            SystemMessage: "system"
        }
        
        role = role_mapping.get(type(message), "unknown")
        content = message.content
        
        # Adiciona a mensagem usando o context_manager existente
        asyncio.run(self.session.add_message(
            conversation_id=self.conversation_id,
            role=role,
            content=content
        ))
    
    def get_messages(self) -> List[BaseMessage]:
        """
        Obtém todas as mensagens do histórico.
        
        Returns:
            Lista de mensagens
        """
        # Obtém mensagens do banco
        db_messages = asyncio.run(self.session.get_conversation_messages(
            self.conversation_id
        ))
        
        # Mapeia para os tipos do LangChain
        messages = []
        for msg in db_messages:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))
            elif msg["role"] == "system":
                messages.append(SystemMessage(content=msg["content"]))
        
        return messages
    
    def clear(self) -> None:
        """
        Limpa o histórico de mensagens.
        """
        # Implementar a lógica para limpar as mensagens da conversa
        # ou criar uma nova conversa
        pass
```

## 4. Atualização do Método process_query

O método `process_query` também precisa ser atualizado:

```python
async def process_query(self, query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Processa uma consulta do usuário.
    
    Args:
        query: A pergunta ou solicitação do usuário
        context: Contexto adicional para a consulta (opcional)
            
    Returns:
        Resposta formatada com a resposta do agente
    """
    # Adiciona a mensagem do usuário ao contexto persistente
    await self.context_manager.add_message(
        conversation_id=self.conversation_id,
        role="user",
        content=query,
        metadata=context
    )
    
    # Adiciona contexto à consulta se fornecido
    if context:
        context_str = json.dumps(context)
        enhanced_query = f"Contexto: {context_str}\n\nConsulta do usuário: {query}"
    else:
        enhanced_query = query
    
    # Executa o agente com o gerenciamento de histórico
    response = await self.agent.ainvoke(
        {"input": enhanced_query, "conversation_id": self.conversation_id}
    )
    
    # Extrai a resposta do formato retornado
    response_text = response["output"]
    
    # Armazena a resposta no contexto persistente
    await self.context_manager.add_message(
        conversation_id=self.conversation_id,
        role="assistant",
        content=response_text
    )
    
    # Extrai insights de aprendizado desta interação
    await self._extract_learning(query, response_text, context)
    
    # Formata a resposta
    return {
        "response": response_text,
        "conversation_id": self.conversation_id,
        "source": "hybrid_agent"
    }
```

## 5. Atualizações nas Dependências

Para utilizar a nova API, você precisa atualizar as dependências no `requirements.txt`:

```
langchain>=0.0.310
langchain-core>=0.0.27
langchain-community>=0.0.9
```

## 6. Considerações sobre a Migração

1. **Compatibilidade**: A migração para a nova API pode causar incompatibilidades com outras partes do código que esperam o comportamento anterior.

2. **Testes**: Após a migração, teste exaustivamente todas as funcionalidades para garantir que o comportamento permanece o mesmo.

3. **Conversão Assíncrona**: A nova API utiliza mais funções assíncronas, então pode ser necessário adaptar o código para trabalhar corretamente com `async/await`.

4. **Desempenho**: Monitore o desempenho após a migração para garantir que não haja degradação.

## 7. Plano de Implementação

1. Criar um branch de desenvolvimento para a migração
2. Implementar as alterações em etapas:
   - Criar a classe `PostgreSQLChatMessageHistory`
   - Atualizar o método `_setup_agent`
   - Atualizar o método `process_query`
3. Executar testes para verificar a funcionalidade
4. Fazer merge para o branch principal após validação

Este guia de migração é baseado na documentação oficial do LangChain disponível em [https://python.langchain.com/docs/versions/migrating_memory/](https://python.langchain.com/docs/versions/migrating_memory/).
