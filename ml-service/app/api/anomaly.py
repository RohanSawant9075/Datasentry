from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Any

router = APIRouter()


class AnomalyRequest(BaseModel):
    dataset_id: str
    s3_key: str
    methods: Optional[List[str]] = ["IsolationForest", "IQR"]


class Anomaly(BaseModel):
    id: str
    column_name: str
    anomaly_type: str
    severity: str
    affected_count: int
    affected_rows: List[int]
    method: str
    threshold: Optional[float] = None
    explanation: str


class AnomalyResponse(BaseModel):
    dataset_id: str
    total_anomalies: int
    by_severity: dict
    anomalies: List[Anomaly]


@router.post("/detect", response_model=AnomalyResponse)
async def detect_anomalies(request: AnomalyRequest):
    """
    Detect anomalies using multiple methods:
    - IsolationForest: ML-based anomaly detection
    - IQR: Statistical outlier detection
    - Z-score: Standard deviation-based detection
    - Spike Detection: Sudden changes
    """
    try:
        from ..utils.s3_client import s3_client
        from ..utils.file_parser import file_parser
        from ..anomaly.detector import AnomalyDetector

        # Load file from S3
        file_content = s3_client.get_file_content(request.s3_key)
        if file_content is None:
            raise HTTPException(status_code=404, detail="File not found in S3")

        # Parse file
        file_ext = request.s3_key.split('.')[-1]
        df = file_parser.parse_file(file_content, file_ext)

        # Detect anomalies
        detector = AnomalyDetector(df, methods=request.methods)
        anomaly_result = detector.detect()

        # Convert to response model
        anomalies = [
            Anomaly(**anomaly_dict)
            for anomaly_dict in anomaly_result['anomalies']
        ]

        return AnomalyResponse(
            dataset_id=request.dataset_id,
            total_anomalies=anomaly_result['total_anomalies'],
            by_severity=anomaly_result['by_severity'],
            anomalies=anomalies
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")
