from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any

router = APIRouter()

SUPPORTED_EXTENSIONS = {"csv", "json", "xlsx", "xls"}


class DriftRequest(BaseModel):
    current_dataset_id: str
    reference_dataset_id: str
    current_s3_key: str
    reference_s3_key: str


class DriftResult(BaseModel):
    column_name: str
    drift_type: str
    drift_metric: str
    drift_score: float
    severity: str
    reference_stats: Dict[str, Any]
    current_stats: Dict[str, Any]
    explanation: str
    test_stats: Dict[str, Any] = Field(default_factory=dict)


class DriftResponse(BaseModel):
    current_dataset_id: str
    reference_dataset_id: str
    total_drifts: int
    by_severity: Dict[str, int]
    drifts: List[DriftResult]


def _validated_extension(s3_key: str, field_name: str) -> str:
    """Return a supported file extension or raise a client-facing error."""
    if "." not in s3_key:
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} must include a supported file extension",
        )

    extension = s3_key.rsplit(".", 1)[-1].lower()
    if extension not in SUPPORTED_EXTENSIONS:
        supported = ", ".join(sorted(SUPPORTED_EXTENSIONS))
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '{extension}' for {field_name}. Supported: {supported}",
        )

    return extension


@router.post("/analyze", response_model=DriftResponse)
async def analyze_drift(request: DriftRequest):
    """
    Detect data drift by comparing current dataset with reference:
    - Numerical: PSI, KS test
    - Categorical: Chi-Square test, Jensen-Shannon divergence
    - Missing patterns: Distribution comparison
    - Schema drift: Column changes
    """
    try:
        from ..utils.s3_client import s3_client
        from ..utils.file_parser import file_parser
        from ..drift.drift_analyzer import DriftAnalyzer

        current_ext = _validated_extension(request.current_s3_key, "current_s3_key")
        reference_ext = _validated_extension(request.reference_s3_key, "reference_s3_key")

        # Load current dataset
        current_content = s3_client.get_file_content(request.current_s3_key)
        if current_content is None:
            raise HTTPException(status_code=404, detail="Current dataset not found in S3")

        # Load reference dataset
        reference_content = s3_client.get_file_content(request.reference_s3_key)
        if reference_content is None:
            raise HTTPException(status_code=404, detail="Reference dataset not found in S3")

        try:
            current_df = file_parser.parse_file(current_content, current_ext)
            reference_df = file_parser.parse_file(reference_content, reference_ext)
            file_parser.validate_dataframe(current_df)
            file_parser.validate_dataframe(reference_df)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        # Analyze drift
        analyzer = DriftAnalyzer(current_df, reference_df)
        drift_result = analyzer.analyze()

        # Convert to response model
        drifts = [
            DriftResult(**drift_dict)
            for drift_dict in drift_result["drifts"]
        ]

        return DriftResponse(
            current_dataset_id=request.current_dataset_id,
            reference_dataset_id=request.reference_dataset_id,
            total_drifts=drift_result["total_drifts"],
            by_severity=drift_result["by_severity"],
            drifts=drifts,
        )

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Drift analysis failed: {str(e)}")
