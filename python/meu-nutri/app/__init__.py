"""
Inicialização do módulo app para o projeto Meu Nutri.
"""

import os
import logging
from dotenv import load_dotenv

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Carrega variáveis de ambiente do arquivo .env se existir
load_dotenv()

# Versão do aplicativo
__version__ = "0.1.0"
