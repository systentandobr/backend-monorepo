from fastapi import APIRouter, HTTPException

vision_router = APIRouter()

@vision_router.get("/")
async def get_vision_services():
    """Listar serviços de visão computacional disponíveis."""
    return {
        "services": [
            "nutrient_analysis", 
            "food_recognition", 
            "portion_estimation"
        ]
    }
