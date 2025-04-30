"""
Ponto de entrada principal para o aplicativo Meu Nutri.
Inicializa o servidor FastAPI e configura as rotas.
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

# Carrega variáveis de ambiente
load_dotenv()

# Importa módulos do aplicativo
from app.api.routers import agent_router, vision_router, circadian_router, user_router
from app.db.database import init_db

# Cria o aplicativo FastAPI
app = FastAPI(
    title="Meu Nutri API",
    description="API para o assistente nutricional com IA e visão computacional",
    version="0.1.0",
)

# Configura CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, restrinja para domínios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Adiciona routers
app.include_router(agent_router, prefix="/api/agent", tags=["Agent"])
app.include_router(vision_router, prefix="/api/vision", tags=["Vision"])
app.include_router(circadian_router, prefix="/api/circadian", tags=["Circadian"])
app.include_router(user_router, prefix="/api/users", tags=["Users"])

@app.on_event("startup")
async def startup_event():
    """Inicializa o banco de dados na inicialização do aplicativo."""
    await init_db()

@app.get("/", tags=["Root"])
async def root():
    """Endpoint raiz para verificar se o serviço está rodando."""
    return {
        "message": "Bem-vindo à API do Meu Nutri",
        "status": "online",
        "docs": "/docs",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
