from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.api import health, profile, quality, anomaly, drift, reliability, models


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    print("""
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           DataSentry-AI ML Service (FastAPI)              ║
║                                                           ║
║  Trust Your Data. Confident Decisions.                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    """)
    yield
    print("Shutting down ML Service...")


app = FastAPI(
    title="DataSentry-AI ML Service",
    description="Machine Learning and Data Science Service for DataSentry-AI",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(profile.router, prefix="/api", tags=["Profiling"])
app.include_router(quality.router, prefix="/api/quality", tags=["Quality"])
app.include_router(anomaly.router, prefix="/api/anomaly", tags=["Anomaly"])
app.include_router(drift.router, prefix="/api/drift", tags=["Drift"])
app.include_router(reliability.router, prefix="/api/reliability", tags=["Reliability"])
app.include_router(models.router, prefix="/api/model", tags=["Models"])


@app.get("/")
async def root():
    return {
        "service": "DataSentry-AI ML Service",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
