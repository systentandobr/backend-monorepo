from fastapi import APIRouter

circadian_router = APIRouter()

@circadian_router.get("/")
async def get_circadian_services():
    """Listar serviços relacionados ao ritmo circadiano."""
    return {
        "services": [
            "nutrition_timing", 
            "metabolism_analysis", 
            "sleep_nutrition_correlation"
        ]
    }
