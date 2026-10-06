from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint for ML service"""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "DataSentry-AI ML Service",
        "version": "1.0.0",
        "components": {
            "pandas": "ready",
            "scikit-learn": "ready",
            "lightgbm": "ready",
            "shap": "ready",
        },
    }
