from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any

router = APIRouter()


class QualityRequest(BaseModel):
    dataset_id: str
    s3_key: str
    schema: Optional[Dict[str, str]] = None


class QualityIssue(BaseModel):
    column: str
    issue_type: str
    severity: str
    count: int
    description: str


class QualityDimension(BaseModel):
    score: float
    issues: List[QualityIssue]


class QualityResponse(BaseModel):
    dataset_id: str
    overall_score: float
    completeness: QualityDimension
    validity: QualityDimension
    consistency: QualityDimension
    uniqueness: QualityDimension
    timeliness: QualityDimension
    distribution: QualityDimension


@router.post("/analyze", response_model=QualityResponse)
async def analyze_quality(request: QualityRequest):
    """
    Analyze data quality across 6 dimensions:
    1. Completeness - Missing values
    2. Validity - Type and range validation
    3. Consistency - Cross-field validation
    4. Uniqueness - Duplicate detection
    5. Timeliness - Freshness checks
    6. Distribution Stability - Statistical consistency
    """
    try:
        from ..utils.s3_client import s3_client
        from ..utils.file_parser import file_parser
        from ..quality.quality_analyzer import QualityAnalyzer

        # Load file from S3
        file_content = s3_client.get_file_content(request.s3_key)
        if file_content is None:
            raise HTTPException(status_code=404, detail="File not found in S3")

        # Parse file
        file_ext = request.s3_key.split('.')[-1]
        df = file_parser.parse_file(file_content, file_ext)

        # Analyze quality
        analyzer = QualityAnalyzer(df, schema=request.schema)
        quality_result = analyzer.analyze()

        # Convert to response model
        return QualityResponse(
            dataset_id=request.dataset_id,
            overall_score=quality_result['overall_score'],
            completeness=QualityDimension(
                score=quality_result['completeness']['score'],
                issues=[QualityIssue(**issue) for issue in quality_result['completeness']['issues']]
            ),
            validity=QualityDimension(
                score=quality_result['validity']['score'],
                issues=[QualityIssue(**issue) for issue in quality_result['validity']['issues']]
            ),
            consistency=QualityDimension(
                score=quality_result['consistency']['score'],
                issues=[QualityIssue(**issue) for issue in quality_result['consistency']['issues']]
            ),
            uniqueness=QualityDimension(
                score=quality_result['uniqueness']['score'],
                issues=[QualityIssue(**issue) for issue in quality_result['uniqueness']['issues']]
            ),
            timeliness=QualityDimension(
                score=quality_result['timeliness']['score'],
                issues=[QualityIssue(**issue) for issue in quality_result['timeliness']['issues']]
            ),
            distribution=QualityDimension(
                score=quality_result['distribution']['score'],
                issues=[QualityIssue(**issue) for issue in quality_result['distribution']['issues']]
            )
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quality analysis failed: {str(e)}")
