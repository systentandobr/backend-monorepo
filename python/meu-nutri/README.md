# Projeto Meu Nutri - API Backend

## Estrutura do Projeto

```
meu-nutri/
│
├── app/                # Código-fonte principal
│   ├── __init__.py     # Inicialização do pacote
│   ├── main.py         # Ponto de entrada da aplicação
│   ├── api/            # Roteadores e endpoints
│   ├── routers/
│   │   ├── agent_router.py
│   │   ├── vision_router.py
│   │   ├── circadian_router.py
│   │   └── users_router.py
│   ├── db/             # Configurações de banco de dados
│   ├── models/         # Modelos de dados
│   └── utils/          # Utilitários e helpers
│
├── venv/               # Ambiente virtual Python
├── requirements.txt    # Dependências do projeto
├── start_api.sh        # Script de inicialização da API
└── diagnose_setup.py   # Script de diagnóstico do ambiente
```

## Configuração e Inicialização

### Pré-requisitos

- Python 3.10+
- pip
- venv

### Passos de Instalação

1. Clone o repositório
2. Crie um ambiente virtual:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

4. Configurar variáveis de ambiente:
   - Copie `.env.example` para `.env`
   - Preencha as configurações necessárias

### Executando a Aplicação

```bash
# Método 1: Usando o script de inicialização
./start_api.sh

# Método 2: Usando Uvicorn diretamente
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Diagnóstico

Use o script de diagnóstico para verificar problemas no ambiente:

```bash
python diagnose_setup.py
```

## Boas Práticas

- Siga os princípios SOLID e Clean Code
- Utilize Domain-Driven Design (DDD)
- Mantenha cobertura de testes consistente
- Documente mudanças e decisões arquiteturais

## Documentação da API

Acesse `/docs` para documentação interativa do Swagger.
