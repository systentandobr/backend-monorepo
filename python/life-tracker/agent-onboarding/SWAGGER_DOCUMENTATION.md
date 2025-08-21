# 📖 Documentação Swagger/OpenAPI

Este documento explica como usar e configurar a documentação Swagger da API de Onboarding.

## 🚀 URLs da Documentação

### Swagger UI (Interface Interativa)
```
http://localhost:8000/docs
```

### ReDoc (Documentação Alternativa)
```
http://localhost:8000/redoc
```

### OpenAPI JSON (Especificação)
```
http://localhost:8000/openapi.json
```

## 🏗️ Configuração

### 1. Configuração no FastAPI

A documentação é configurada no arquivo `main.py`:

```python
app = FastAPI(
    title=APP_NAME,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    contact={
        "name": "Life Tracker Team",
        "email": "dev@lifetracker.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    servers=[
        {
            "url": "http://localhost:8000",
            "description": "Servidor de Desenvolvimento"
        },
        {
            "url": "https://api.lifetracker.com",
            "description": "Servidor de Produção"
        }
    ],
    tags_metadata=[
        {
            "name": "onboarding",
            "description": "Operações relacionadas ao processo de onboarding de usuários.",
        },
        {
            "name": "health",
            "description": "Endpoints de verificação de saúde da aplicação.",
        },
    ]
)
```

### 2. Documentação das Rotas

Cada rota deve ter uma docstring detalhada que será exibida no Swagger:

```python
@router.post("/complete", response_model=OnboardingResponse)
async def complete_onboarding_process(
    request: OnboardingRequest,
    background_tasks: BackgroundTasks,
    agno_agent: AgnoOnboardingAgent = Depends(get_agno_agent),
    api_client: APIClient = Depends(get_api_client)
):
    """
    Completa todo o processo de onboarding usando o agente Agno
    
    Este endpoint executa o processo completo de onboarding:
    1. Análise do perfil do usuário
    2. Geração de plano personalizado
    3. Envio para API principal (em background)
    
    **Parâmetros:**
    - **request**: Dados do usuário e respostas do questionário
    - **background_tasks**: Tarefas em background para envio de dados
    
    **Retorna:**
    - **OnboardingResponse**: Resultado completo do processo
    
    **Exemplo de uso:**
    ```json
    {
        "user_id": "user123",
        "answers": {
            "age": 30,
            "goals": ["health", "productivity"],
            "time_availability": 60
        }
    }
    ```
    """
```

## 📋 Endpoints Documentados

### 🏥 Health Check
- `GET /health` - Verificação de saúde da aplicação
- `GET /health/ready` - Verificação de prontidão
- `GET /health/live` - Verificação de vitalidade

### 👤 Onboarding
- `POST /onboarding/complete` - Processo completo de onboarding
- `POST /onboarding/complete-legacy` - Processo legado (deprecated)
- `POST /onboarding/analyze-profile` - Análise de perfil
- `POST /onboarding/generate-plan` - Geração de plano personalizado
- `GET /onboarding/templates` - Lista de templates disponíveis

### 👤 Usuários
- `GET /onboarding/user/{user_id}/plan` - Recuperar plano do usuário
- `GET /onboarding/user/{user_id}/profile` - Recuperar perfil do usuário
- `GET /onboarding/user/{user_id}/recommendations` - Obter recomendações
- `GET /onboarding/user/{user_id}/memory` - Resumo da memória do usuário
- `POST /onboarding/user/{user_id}/update-plan` - Atualizar plano do usuário

### ⚙️ Sistema
- `GET /onboarding/status` - Status do serviço

## 🧪 Testando a Documentação

### 1. Executar o Servidor

```bash
cd python/life-tracker/agent-onboarding
python main.py
```

### 2. Testar com Script Automatizado

```bash
python test_swagger.py
```

### 3. Acessar no Navegador

Abra o navegador e acesse:
- http://localhost:8000/docs

## 🔧 Personalização

### 1. Adicionar Novos Endpoints

Para adicionar novos endpoints, siga o padrão:

```python
@router.post("/novo-endpoint", response_model=ResponseModel)
async def novo_endpoint(
    request: RequestModel,
    dependency: Dependency = Depends(get_dependency)
):
    """
    Descrição detalhada do endpoint
    
    **Parâmetros:**
    - **request**: Descrição do parâmetro
    
    **Retorna:**
    - **ResponseModel**: Descrição da resposta
    
    **Exemplo:**
    ```json
    {
        "exemplo": "dados"
    }
    ```
    """
```

### 2. Configurar Tags

Organize endpoints em tags no `main.py`:

```python
tags_metadata=[
    {
        "name": "onboarding",
        "description": "Operações de onboarding",
    },
    {
        "name": "users",
        "description": "Gerenciamento de usuários",
    },
]
```

E use nas rotas:

```python
@router.get("/user/{user_id}", tags=["users"])
async def get_user(user_id: str):
    """Endpoint de usuários"""
```

### 3. Configurar Servidores

Adicione diferentes ambientes:

```python
servers=[
    {
        "url": "http://localhost:8000",
        "description": "Desenvolvimento"
    },
    {
        "url": "https://staging.api.com",
        "description": "Staging"
    },
    {
        "url": "https://api.lifetracker.com",
        "description": "Produção"
    }
]
```

## 🎨 Melhorias Visuais

### 1. Adicionar Exemplos

Use o parâmetro `example` nos modelos Pydantic:

```python
class OnboardingRequest(BaseModel):
    user_id: str = Field(..., example="user123")
    answers: Dict[str, Any] = Field(..., example={
        "age": 30,
        "goals": ["health", "productivity"]
    })
```

### 2. Configurar Respostas de Erro

```python
from fastapi import HTTPException
from fastapi.responses import JSONResponse

@router.post("/endpoint")
async def endpoint():
    """
    Endpoint com tratamento de erro documentado
    
    **Códigos de resposta:**
    - **200**: Sucesso
    - **400**: Dados inválidos
    - **404**: Não encontrado
    - **500**: Erro interno
    """
    try:
        # lógica do endpoint
        pass
    except ValueError:
        raise HTTPException(status_code=400, detail="Dados inválidos")
    except Exception:
        raise HTTPException(status_code=500, detail="Erro interno")
```

## 🔒 Segurança

### 1. Autenticação (Futuro)

Para adicionar autenticação:

```python
from fastapi.security import HTTPBearer

security = HTTPBearer()

@router.post("/protected")
async def protected_endpoint(
    token: str = Depends(security)
):
    """Endpoint protegido por autenticação"""
```

### 2. Rate Limiting

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/endpoint")
@limiter.limit("5/minute")
async def rate_limited_endpoint(request: Request):
    """Endpoint com limite de requisições"""
```

## 📊 Monitoramento

### 1. Logs de Acesso

Configure logs para monitorar uso da documentação:

```python
import logging

logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code}")
    return response
```

### 2. Métricas

Use Prometheus para métricas:

```python
from prometheus_fastapi_instrumentator import Instrumentator

Instrumentator().instrument(app).expose(app)
```

## 🚀 Deploy

### 1. Produção

Para produção, considere:

- Desabilitar docs em produção (opcional)
- Configurar CORS adequadamente
- Usar HTTPS
- Configurar rate limiting

```python
# Em produção
app = FastAPI(
    docs_url=None if ENVIRONMENT == "production" else "/docs",
    redoc_url=None if ENVIRONMENT == "production" else "/redoc"
)
```

### 2. Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📚 Recursos Adicionais

- [Documentação FastAPI](https://fastapi.tiangolo.com/)
- [Especificação OpenAPI](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [ReDoc](https://github.com/Redocly/redoc)

## 🤝 Contribuição

Para contribuir com a documentação:

1. Mantenha docstrings atualizadas
2. Adicione exemplos práticos
3. Teste novos endpoints
4. Atualize este README quando necessário

---

**Última atualização**: Janeiro 2024
**Versão**: 2.0.0
