from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional

router = APIRouter()


class ReliabilityRequest(BaseModel):
    dataset_id: str
    quality_score: float
    anomaly_count: int
    drift_count: int
    timeliness_score: float
    total_rows: Optional[int] = 1000
    weights: Optional[Dict[str, float]] = None


class ReliabilityResponse(BaseModel):
    dataset_id: str
    score: float
    reliability_level: str
    risk_level: str
    quality_score: float
    anomaly_score: float
    drift_score: float
    timeliness_score: float
    components: Dict[str, Any]


@router.post("/calculate", response_model=ReliabilityResponse)
async def calculate_reliability(request: ReliabilityRequest):
    """
    Calculate composite data reliability score based on:
    - Quality score
    - Anomaly count
    - Drift count
    - Timeliness score
    """
    try:
        from ..reliability.scorer import ReliabilityScorer

        # Create scorer with custom weights if provided
        scorer = ReliabilityScorer(weights=request.weights)

        # Calculate reliability score
        reliability_result = scorer.calculate(
            quality_score=request.quality_score,
            anomaly_count=request.anomaly_count,
            drift_count=request.drift_count,
            timeliness_score=request.timeliness_score,
            total_rows=request.total_rows or 1000
        )

        return ReliabilityResponse(
            dataset_id=request.dataset_id,
            score=reliability_result['score'],
            reliability_level=reliability_result['reliability_level'],
            risk_level=reliability_result['risk_level'],
            quality_score=reliability_result['quality_score'],
            anomaly_score=reliability_result['anomaly_score'],
            drift_score=reliability_result['drift_score'],
            timeliness_score=reliability_result['timeliness_score'],
            components=reliability_result['components']
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reliability calculation failed: {str(e)}")
