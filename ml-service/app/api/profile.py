from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import pandas as pd
import numpy as np
from datetime import datetime

router = APIRouter()


class ProfileRequest(BaseModel):
    dataset_id: str
    s3_key: str


class ColumnProfile(BaseModel):
    column_name: str
    data_type: str
    missing_count: int
    missing_pct: float
    unique_count: int
    duplicate_count: int
    min_value: Optional[str] = None
    max_value: Optional[str] = None
    mean: Optional[float] = None
    median: Optional[float] = None
    std_dev: Optional[float] = None
    statistics: Optional[Dict[str, Any]] = None


class ProfileResponse(BaseModel):
    dataset_id: str
    row_count: int
    column_count: int
    profiles: List[ColumnProfile]
    created_at: str


@router.post("/profile", response_model=ProfileResponse)
async def profile_dataset(request: ProfileRequest):
    """
    Profile a dataset and generate statistical summaries

    This endpoint:
    1. Loads dataset from S3
    2. Infers data types
    3. Calculates statistics for each column
    4. Returns comprehensive profiling results
    """
    try:
        from ..utils.s3_client import s3_client
        from ..utils.file_parser import file_parser
        from ..profiling.profiler import DataProfiler

        # Load file from S3
        file_content = s3_client.get_file_content(request.s3_key)
        if file_content is None:
            raise HTTPException(status_code=404, detail="File not found in S3")

        # Parse file based on extension
        file_ext = request.s3_key.split('.')[-1]
        df = file_parser.parse_file(file_content, file_ext)

        # Profile the dataset
        profiler = DataProfiler(df)
        profile_result = profiler.profile_dataset()

        # Convert to response model
        profiles = [
            ColumnProfile(**profile)
            for profile in profile_result['profiles']
        ]

        return ProfileResponse(
            dataset_id=request.dataset_id,
            row_count=profile_result['row_count'],
            column_count=profile_result['column_count'],
            profiles=profiles,
            created_at=profile_result['created_at']
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profiling failed: {str(e)}")


def infer_data_type(series: pd.Series) -> str:
    """Infer the semantic data type of a pandas Series"""
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"
    elif pd.api.types.is_datetime64_any_dtype(series):
        return "datetime"
    elif pd.api.types.is_bool_dtype(series):
        return "boolean"
    else:
        # Check cardinality for categorical
        unique_ratio = series.nunique() / len(series)
        if unique_ratio < 0.05:
            return "categorical"
        else:
            return "text"


def calculate_numerical_stats(series: pd.Series) -> Dict[str, Any]:
    """Calculate statistics for numerical columns"""
    return {
        "q1": float(series.quantile(0.25)),
        "q3": float(series.quantile(0.75)),
        "iqr": float(series.quantile(0.75) - series.quantile(0.25)),
        "skewness": float(series.skew()),
        "kurtosis": float(series.kurtosis()),
    }


def calculate_categorical_stats(series: pd.Series) -> Dict[str, Any]:
    """Calculate statistics for categorical columns"""
    value_counts = series.value_counts().head(10)

    unique_count = series.nunique()
    total_count = len(series)
    cardinality = "low" if unique_count < 20 else "medium" if unique_count < 100 else "high"

    return {
        "cardinality": cardinality,
        "top_values": [
            {"value": str(val), "count": int(count)}
            for val, count in value_counts.items()
        ]
    }
