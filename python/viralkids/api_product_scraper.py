"""
API FastAPI para processamento de produtos afiliados
Endpoint para receber requisições de scraping e processar produtos
"""

import logging
import os
from typing import Dict, Any, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, HttpUrl
from dotenv import load_dotenv

from core.product_scraper import ProductScraperAgent

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
load_dotenv()

# Criar aplicação FastAPI
app = FastAPI(
    title="Viral Kids Product Scraper API",
    description="API para webscraping de produtos afiliados",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar origens
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instância global do scraper
scraper = ProductScraperAgent()

# Schemas
class ScrapeProductRequest(BaseModel):
    url: HttpUrl = Field(..., description="URL do produto afiliado")
    platform: Optional[str] = Field(None, description="Plataforma (opcional, será detectada)")
    category_id: Optional[str] = Field(None, description="ID da categoria")
    user_id: Optional[str] = Field(None, description="ID do usuário")
    unit_id: Optional[str] = Field(None, description="ID da unidade")

class ScrapeProductResponse(BaseModel):
    success: bool
    platform: str
    url: str
    scraped_at: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

# Eventos
@app.on_event("startup")
async def startup_event():
    """Inicializar scraper na inicialização da aplicação"""
    logger.info("Inicializando ProductScraperAgent...")
    await scraper.initialize()
    logger.info("ProductScraperAgent inicializado com sucesso")

@app.on_event("shutdown")
async def shutdown_event():
    """Fechar conexões na finalização"""
    await scraper.close()

# Rotas
@app.get("/health")
async def health_check():
    """Health check"""
    return {
        "status": "healthy",
        "scraper_initialized": scraper.initialized,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/scrape", response_model=ScrapeProductResponse)
async def scrape_product(
    request: ScrapeProductRequest,
    background_tasks: BackgroundTasks
):
    """
    Processa scraping de um produto afiliado
    
    Pode ser executado de forma síncrona ou assíncrona
    """
    try:
        result = await scraper.scrape_product(
            url=str(request.url),
            platform=request.platform
        )
        
        return ScrapeProductResponse(**result)
        
    except Exception as e:
        logger.error(f"Erro ao processar scraping: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/scrape/async")
async def scrape_product_async(
    request: ScrapeProductRequest,
    background_tasks: BackgroundTasks,
    callback_url: Optional[str] = None
):
    """
    Processa scraping de forma assíncrona
    Útil para processamento em lote ou fila
    """
    async def process_scraping():
        try:
            result = await scraper.scrape_product(
                url=str(request.url),
                platform=request.platform
            )
            
            # Se houver callback_url, notificar resultado
            if callback_url:
                import aiohttp
                async with aiohttp.ClientSession() as session:
                    await session.post(callback_url, json=result)
                    
        except Exception as e:
            logger.error(f"Erro no processamento assíncrono: {str(e)}")
    
    background_tasks.add_task(process_scraping)
    
    return {
        "status": "processing",
        "message": "Scraping iniciado em background",
        "url": str(request.url)
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SCRAPER_PORT", "8002"))
    uvicorn.run(app, host="0.0.0.0", port=port)

