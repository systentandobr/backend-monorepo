"""
Funções para configurar o agente híbrido usando a nova API do LangChain.
"""

import os
from typing import List, Dict, Any, Optional
from langchain.tools import BaseTool, Tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage
from langchain.agents import AgentExecutor, initialize_agent, AgentType
from langchain_openai import ChatOpenAI

def setup_agent_with_updated_api(
    tools: List[BaseTool], 
    llm: Any, 
    verbose: bool = False, 
    system_message: str = None
) -> AgentExecutor:
    """
    Configura o agente usando a API atualizada do LangChain.
    
    Args:
        tools: Lista de ferramentas disponíveis para o agente
        llm: Modelo de linguagem a ser usado
        verbose: Se True, exibe logs detalhados da execução
        system_message: Mensagem de sistema para o agente
        
    Returns:
        Agente configurado
    """
    if system_message is None:
        system_message = """
        Você é um assistente nutricional inteligente especializado em saúde e bem-estar.
        
        Seu objetivo é ajudar o usuário a melhorar seus hábitos alimentares e atividade física,
        considerando seu ritmo circadiano e características pessoais.
        
        Sempre seja construtivo, positivo e empático. Evite julgamentos negativos sobre 
        comportamentos alimentares ou corporais. Promova uma relação saudável com a comida.
        
        Utilize suas ferramentas especializadas para oferecer recomendações personalizadas 
        e baseadas em evidências. Quando não tiver certeza, busque informações adicionais
        em vez de fazer suposições.
        
        Lembre-se de considerar o contexto completo do usuário, incluindo:
        - Objetivos de saúde
        - Restrições alimentares
        - Nível de atividade
        - Cronotipo e ritmo circadiano
        - Preferências culturais e pessoais
        
        Mantenha suas respostas concisas, práticas e educativas.
        """
    
    # Prepara as ferramentas no formato esperado pelo LangChain 
    lc_tools = []
    for tool in tools:
        lc_tool = Tool(
            name=tool.name,
            description=tool.description,
            func=tool.run
        )
        lc_tools.append(lc_tool)

    # Usando a abordagem de inicialização que é compatível com a versão atual do LangChain
    # mas que ainda pode receber um aviso de depreciação (será tratado em uma atualização futura)
    agent = initialize_agent(
        tools=lc_tools,
        llm=llm,
        agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
        verbose=verbose,
        handle_parsing_errors=True,
        max_iterations=5
    )
    
    # Configuramos o sistema de prompt de uma maneira que funciona com a nova API
    # Esta abordagem funciona tanto com a versão antiga quanto com a nova
    try:
        # Tenta configurar o sistema de mensagem usando a API mais recente
        if hasattr(agent, 'agent') and hasattr(agent.agent, 'llm_chain') and hasattr(agent.agent.llm_chain, 'prompt'):
            # Versão mais nova do LangChain (com diferentes estruturas de prompt)
            if hasattr(agent.agent.llm_chain.prompt, 'messages'):
                # Para estruturas de prompt baseadas em mensagens
                for i, message in enumerate(agent.agent.llm_chain.prompt.messages):
                    if hasattr(message, 'prompt') and hasattr(message.prompt, 'template'):
                        if 'system_message' in message.prompt.template:
                            agent.agent.llm_chain.prompt.messages[i].prompt.template = system_message
                            break
            elif hasattr(agent.agent.llm_chain.prompt, 'template'):
                # Para estruturas de prompt baseadas em templates
                current_template = agent.agent.llm_chain.prompt.template
                modified_template = current_template.replace(
                    "I'm a conversational AI assistant.", system_message
                )
                agent.agent.llm_chain.prompt.template = modified_template
    except Exception as e:
        # Loga o erro, mas continua - o agente ainda funcionará, apenas sem a mensagem personalizada
        print(f"Aviso: Não foi possível configurar o sistema de prompt personalizado. Erro: {str(e)}")
        print("O agente continuará funcionando com o prompt padrão.")
    
    return agent
