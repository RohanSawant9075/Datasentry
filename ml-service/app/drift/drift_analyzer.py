"""
Drift Detection Engine
Detects distribution drift between reference and current datasets using:
- PSI (Population Stability Index) for numerical features
- Kolmogorov-Smirnov test
- Chi-square test for categorical features
- Jensen-Shannon distance
"""
import logging
import math
from datetime import date, datetime
from typing import Any, Dict, List, Optional, Sequence, Tuple

import numpy as np
import pandas as pd
from scipy import stats
from scipy.spatial.distance import jensenshannon

logger = logging.getLogger(__name__)

SEVERITIES = ("LOW", "MEDIUM", "HIGH", "CRITICAL")
EPSILON = 1e-6


def _json_safe(value: Any) -> Any:
    """Convert pandas/numpy values into JSON-safe Python primitives."""
    if value is None:
        return None

    if isinstance(value, dict):
        return {str(_json_safe(key)): _json_safe(val) for key, val in value.items()}

    if isinstance(value, (list, tuple, set)):
        return [_json_safe(item) for item in value]

    if isinstance(value, np.ndarray):
        return [_json_safe(item) for item in value.tolist()]

    if isinstance(value, (pd.Timestamp, datetime, date)):
        return value.isoformat()

    if isinstance(value, np.integer):
        return int(value)

    if isinstance(value, np.floating):
        float_value = float(value)
        return float_value if math.isfinite(float_value) else None

    if isinstance(value, np.bool_):
        return bool(value)

    if isinstance(value, float):
        return value if math.isfinite(value) else None

    if isinstance(value, (str, int, bool)):
        return value

    try:
        if pd.isna(value):
            return None
    except (TypeError, ValueError):
        pass

    return str(value)


class DriftResult:
    def __init__(
        self,
        column_name: str,
        drift_type: str,
        drift_metric: str,
        drift_score: float,
        severity: str,
        reference_stats: Dict[str, Any],
        current_stats: Dict[str, Any],
        explanation: str,
        test_stats: Optional[Dict[str, Any]] = None,
    ):
        self.column_name = column_name
        self.drift_type = drift_type
        self.drift_metric = drift_metric
        self.drift_score = drift_score
        self.severity = severity
        self.reference_stats = reference_stats
        self.current_stats = current_stats
        self.explanation = explanation
        self.test_stats = test_stats or {}

    def to_dict(self) -> Dict[str, Any]:
        return _json_safe(
            {
                "column_name": self.column_name,
                "drift_type": self.drift_type,
                "drift_metric": self.drift_metric,
                "drift_score": round(float(self.drift_score), 4),
                "severity": self.severity,
                "reference_stats": self.reference_stats,
                "current_stats": self.current_stats,
                "explanation": self.explanation,
                "test_stats": self.test_stats,
            }
        )


class DriftAnalyzer:
    def __init__(self, current_df: pd.DataFrame, reference_df: pd.DataFrame):
        self.current_df = current_df
        self.reference_df = reference_df
        self.drift_results: List[DriftResult] = []

    def analyze(self) -> Dict[str, Any]:
        """Analyze drift between reference and current datasets."""
        self.drift_results = []
        self._validate_inputs()

        self._detect_schema_drift()

        common_columns = [
            column for column in self.reference_df.columns if column in set(self.current_df.columns)
        ]

        for column in common_columns:
            if self._both_numeric_like(column):
                self._analyze_numerical_drift(column)
            else:
                self._detect_dtype_mismatch(column)
                self._analyze_categorical_drift(column)

        self._analyze_missing_drift(common_columns)

        by_severity = {
            severity: sum(1 for drift in self.drift_results if drift.severity == severity)
            for severity in SEVERITIES
        }

        return {
            "total_drifts": len(self.drift_results),
            "by_severity": by_severity,
            "drifts": [drift.to_dict() for drift in self.drift_results],
        }

    def _validate_inputs(self) -> None:
        for name, df in (("current", self.current_df), ("reference", self.reference_df)):
            if df is None or not isinstance(df, pd.DataFrame):
                raise ValueError(f"{name.capitalize()} dataset must be a DataFrame")
            if df.empty or len(df.columns) == 0:
                raise ValueError(f"{name.capitalize()} dataset is empty")

    def _detect_schema_drift(self) -> None:
        """Detect added and removed columns in deterministic order."""
        current_cols = list(self.current_df.columns)
        reference_cols = list(self.reference_df.columns)
        current_set = set(current_cols)
        reference_set = set(reference_cols)

        for column in [col for col in reference_cols if col not in current_set]:
            self.drift_results.append(
                DriftResult(
                    column_name=str(column),
                    drift_type="SCHEMA",
                    drift_metric="column_removal",
                    drift_score=1.0,
                    severity="CRITICAL",
                    reference_stats=self._schema_column_stats(self.reference_df, column),
                    current_stats={
                        "present": False,
                        "column_count": len(current_cols),
                        "columns": [str(col) for col in current_cols],
                    },
                    explanation=f"Column '{column}' was removed from the current dataset schema",
                )
            )

        for column in [col for col in current_cols if col not in reference_set]:
            self.drift_results.append(
                DriftResult(
                    column_name=str(column),
                    drift_type="SCHEMA",
                    drift_metric="column_addition",
                    drift_score=0.5,
                    severity="MEDIUM",
                    reference_stats={
                        "present": False,
                        "column_count": len(reference_cols),
                        "columns": [str(col) for col in reference_cols],
                    },
                    current_stats=self._schema_column_stats(self.current_df, column),
                    explanation=f"Column '{column}' was added to the current dataset schema",
                )
            )

    def _schema_column_stats(self, df: pd.DataFrame, column: str) -> Dict[str, Any]:
        return {
            "present": True,
            "dtype": str(df[column].dtype),
            "non_null_count": int(df[column].notna().sum()),
            "missing_count": int(df[column].isna().sum()),
            "column_count": len(df.columns),
            "columns": [str(col) for col in df.columns],
        }

    def _detect_dtype_mismatch(self, column: str) -> None:
        reference_kind = self._effective_kind(self.reference_df[column])
        current_kind = self._effective_kind(self.current_df[column])

        if reference_kind == current_kind or "empty" in {reference_kind, current_kind}:
            return

        severity = "HIGH" if "numeric" in {reference_kind, current_kind} else "MEDIUM"
        self.drift_results.append(
            DriftResult(
                column_name=str(column),
                drift_type="SCHEMA",
                drift_metric="dtype_mismatch",
                drift_score=1.0 if severity == "HIGH" else 0.5,
                severity=severity,
                reference_stats={
                    "dtype": str(self.reference_df[column].dtype),
                    "effective_kind": reference_kind,
                },
                current_stats={
                    "dtype": str(self.current_df[column].dtype),
                    "effective_kind": current_kind,
                },
                explanation=(
                    f"Column '{column}' changed type from {reference_kind} "
                    f"to {current_kind}"
                ),
            )
        )

    def _both_numeric_like(self, column: str) -> bool:
        return self._is_numeric_like(self.reference_df[column]) and self._is_numeric_like(
            self.current_df[column]
        )

    def _effective_kind(self, series: pd.Series) -> str:
        if series.dropna().empty:
            return "empty"
        if self._is_numeric_like(series):
            return "numeric"
        if pd.api.types.is_bool_dtype(series):
            return "boolean"
        if pd.api.types.is_datetime64_any_dtype(series):
            return "datetime"
        return "categorical"

    def _is_numeric_like(self, series: pd.Series) -> bool:
        if pd.api.types.is_bool_dtype(series):
            return False
        if pd.api.types.is_numeric_dtype(series):
            return True

        non_missing = series.dropna()
        if non_missing.empty:
            return False

        coerced = pd.to_numeric(non_missing, errors="coerce")
        coerced = coerced.replace([np.inf, -np.inf], np.nan)
        return float(coerced.notna().mean()) >= 0.95

    def _numeric_values(self, series: pd.Series) -> pd.Series:
        numeric = pd.to_numeric(series, errors="coerce")
        numeric = numeric.replace([np.inf, -np.inf], np.nan).dropna()
        return numeric.astype(float)

    def _analyze_numerical_drift(self, column: str) -> None:
        """Analyze drift in numerical columns."""
        current_series = self._numeric_values(self.current_df[column])
        reference_series = self._numeric_values(self.reference_df[column])

        if len(current_series) < 2 or len(reference_series) < 2:
            return

        psi_score, bin_edges = self._calculate_psi(reference_series, current_series)
        ks_statistic, ks_pvalue = stats.ks_2samp(reference_series, current_series)
        severity = self._numerical_severity(psi_score, float(ks_statistic), float(ks_pvalue))

        if severity is None:
            return

        ref_stats = self._numerical_stats(self.reference_df[column], reference_series, bin_edges)
        curr_stats = self._numerical_stats(self.current_df[column], current_series, bin_edges)

        self.drift_results.append(
            DriftResult(
                column_name=str(column),
                drift_type="NUMERICAL",
                drift_metric="PSI",
                drift_score=psi_score,
                severity=severity,
                reference_stats=ref_stats,
                current_stats=curr_stats,
                test_stats={
                    "psi": psi_score,
                    "ks_statistic": float(ks_statistic),
                    "ks_pvalue": float(ks_pvalue),
                    "bin_edges": [float(edge) for edge in bin_edges],
                },
                explanation=(
                    f"Numerical distribution drift detected (PSI={psi_score:.4f}, "
                    f"KS={ks_statistic:.4f}, p={ks_pvalue:.4g})"
                ),
            )
        )

    def _numerical_severity(
        self, psi_score: float, ks_statistic: float, ks_pvalue: float
    ) -> Optional[str]:
        if psi_score >= 0.25 or (ks_statistic >= 0.4 and ks_pvalue < 0.001):
            return "CRITICAL"
        if psi_score >= 0.10 or (ks_statistic >= 0.25 and ks_pvalue < 0.01):
            return "HIGH"
        if psi_score >= 0.05 or (ks_statistic >= 0.10 and ks_pvalue < 0.05):
            return "MEDIUM"
        if psi_score >= 0.02:
            return "LOW"
        return None

    def _numerical_stats(
        self, raw_series: pd.Series, clean_series: pd.Series, bin_edges: np.ndarray
    ) -> Dict[str, Any]:
        histogram = self._histogram(clean_series, bin_edges)
        missing_count = int(raw_series.isna().sum())
        missing_pct = missing_count / max(len(raw_series), 1)
        std_value = float(clean_series.std(ddof=1)) if len(clean_series) > 1 else 0.0

        return {
            "dtype": str(raw_series.dtype),
            "count": int(len(clean_series)),
            "missing_count": missing_count,
            "missing_pct": round(missing_pct, 6),
            "mean": float(clean_series.mean()),
            "median": float(clean_series.median()),
            "std": std_value,
            "min": float(clean_series.min()),
            "p25": float(clean_series.quantile(0.25)),
            "p75": float(clean_series.quantile(0.75)),
            "max": float(clean_series.max()),
            "histogram": histogram,
        }

    def _histogram(self, series: pd.Series, bin_edges: np.ndarray) -> List[Dict[str, Any]]:
        counts, _ = np.histogram(series, bins=bin_edges)
        total = max(int(counts.sum()), 1)
        return [
            {
                "bin_start": float(bin_edges[index]),
                "bin_end": float(bin_edges[index + 1]),
                "count": int(count),
                "frequency": round(float(count / total), 6),
            }
            for index, count in enumerate(counts)
        ]

    def _calculate_psi(
        self, reference: pd.Series, current: pd.Series, bins: int = 10
    ) -> Tuple[float, np.ndarray]:
        """Calculate Population Stability Index using robust deterministic bins."""
        try:
            bin_edges = self._build_numeric_bins(reference, current, bins)
            ref_counts = np.histogram(reference, bins=bin_edges)[0]
            curr_counts = np.histogram(current, bins=bin_edges)[0]

            ref_percents = ref_counts / max(len(reference), 1)
            curr_percents = curr_counts / max(len(current), 1)

            ref_percents = np.where(ref_percents == 0, EPSILON, ref_percents)
            curr_percents = np.where(curr_percents == 0, EPSILON, curr_percents)

            psi = np.sum((curr_percents - ref_percents) * np.log(curr_percents / ref_percents))
            return float(psi), bin_edges
        except (TypeError, ValueError, FloatingPointError) as exc:
            logger.error("PSI calculation failed: %s", exc)
            min_value = float(min(reference.min(), current.min()))
            max_value = float(max(reference.max(), current.max()))
            if min_value == max_value:
                max_value = min_value + 1.0
            return 0.0, np.array([min_value, max_value], dtype=float)

    def _build_numeric_bins(
        self, reference: pd.Series, current: pd.Series, bins: int = 10
    ) -> np.ndarray:
        all_values = pd.concat([reference, current], ignore_index=True)
        min_value = float(all_values.min())
        max_value = float(all_values.max())

        if min_value == max_value:
            width = max(abs(min_value) * 0.01, 1.0)
            return np.array([min_value - width, min_value + width], dtype=float)

        quantiles = np.linspace(0, 1, bins + 1)
        bin_edges = np.unique(np.quantile(reference, quantiles))

        if len(bin_edges) < 3:
            unique_count = max(int(all_values.nunique()), 2)
            fallback_bins = min(bins, unique_count)
            bin_edges = np.linspace(min_value, max_value, fallback_bins + 1)

        padding = max((max_value - min_value) * 0.001, EPSILON)
        bin_edges[0] = min_value - padding
        bin_edges[-1] = max_value + padding
        return bin_edges.astype(float)

    def _analyze_categorical_drift(self, column: str) -> None:
        """Analyze drift in categorical columns."""
        current_series = self._categorical_values(self.current_df[column])
        reference_series = self._categorical_values(self.reference_df[column])

        if current_series.empty or reference_series.empty:
            return

        ref_counts = reference_series.value_counts(sort=False)
        curr_counts = current_series.value_counts(sort=False)
        categories = self._categorical_categories(ref_counts, curr_counts)

        ref_aligned = self._aligned_counts(ref_counts, categories)
        curr_aligned = self._aligned_counts(curr_counts, categories)
        ref_probs = ref_aligned / max(float(ref_aligned.sum()), 1.0)
        curr_probs = curr_aligned / max(float(curr_aligned.sum()), 1.0)

        js_distance = float(jensenshannon(ref_probs, curr_probs))
        if not math.isfinite(js_distance):
            js_distance = 0.0

        chi2_statistic, chi2_pvalue = self._chi_square(ref_probs, curr_aligned)
        new_categories = sorted(set(curr_counts.index) - set(ref_counts.index))
        missing_categories = sorted(set(ref_counts.index) - set(curr_counts.index))
        severity = self._categorical_severity(js_distance, new_categories, missing_categories)

        if severity is None:
            return

        explanation_parts = [f"Categorical distribution drift detected (JS={js_distance:.4f})"]
        if new_categories:
            explanation_parts.append(f"{len(new_categories)} new categories")
        if missing_categories:
            explanation_parts.append(f"{len(missing_categories)} missing categories")

        self.drift_results.append(
            DriftResult(
                column_name=str(column),
                drift_type="CATEGORICAL",
                drift_metric="Jensen-Shannon",
                drift_score=js_distance,
                severity=severity,
                reference_stats=self._categorical_stats(self.reference_df[column], ref_counts),
                current_stats=self._categorical_stats(self.current_df[column], curr_counts),
                test_stats={
                    "jensen_shannon_distance": js_distance,
                    "jensen_shannon_divergence": js_distance**2,
                    "chi_square_statistic": chi2_statistic,
                    "chi_square_pvalue": chi2_pvalue,
                    "new_categories": new_categories[:20],
                    "new_category_count": len(new_categories),
                    "missing_categories": missing_categories[:20],
                    "missing_category_count": len(missing_categories),
                    "compared_categories": categories,
                },
                explanation=", ".join(explanation_parts),
            )
        )

    def _categorical_values(self, series: pd.Series) -> pd.Series:
        return series.dropna().map(self._category_value)

    def _category_value(self, value: Any) -> str:
        safe_value = _json_safe(value)
        if safe_value is None:
            return "__MISSING__"
        return str(safe_value)

    def _categorical_categories(
        self, ref_counts: pd.Series, curr_counts: pd.Series, max_categories: int = 100
    ) -> List[str]:
        categories = sorted(set(ref_counts.index) | set(curr_counts.index))
        if len(categories) <= max_categories:
            return categories

        top_reference = list(ref_counts.sort_values(ascending=False).head(max_categories // 2).index)
        top_current = list(curr_counts.sort_values(ascending=False).head(max_categories // 2).index)
        kept = sorted(set(top_reference) | set(top_current))
        return kept + ["__OTHER__"]

    def _aligned_counts(self, counts: pd.Series, categories: Sequence[str]) -> np.ndarray:
        if "__OTHER__" not in categories:
            return np.array([float(counts.get(category, 0)) for category in categories])

        kept = [category for category in categories if category != "__OTHER__"]
        other_count = float(counts.drop(labels=[cat for cat in kept if cat in counts], errors="ignore").sum())
        return np.array([float(counts.get(category, 0)) for category in kept] + [other_count])

    def _chi_square(self, ref_probs: np.ndarray, observed_counts: np.ndarray) -> Tuple[float, float]:
        try:
            observed_total = float(observed_counts.sum())
            if observed_total <= 0 or len(observed_counts) < 2:
                return 0.0, 1.0

            expected = np.maximum(ref_probs * observed_total, EPSILON)
            expected = expected / expected.sum() * observed_total
            chi2_statistic, pvalue = stats.chisquare(observed_counts, f_exp=expected)
            return float(chi2_statistic), float(pvalue)
        except (TypeError, ValueError, FloatingPointError) as exc:
            logger.warning("Chi-square drift test failed: %s", exc)
            return 0.0, 1.0

    def _categorical_severity(
        self, js_distance: float, new_categories: List[str], missing_categories: List[str]
    ) -> Optional[str]:
        category_change_count = len(new_categories) + len(missing_categories)
        if js_distance >= 0.50:
            return "CRITICAL"
        if js_distance >= 0.30:
            return "HIGH"
        if js_distance >= 0.15:
            return "MEDIUM"
        if js_distance >= 0.05 or category_change_count > 0:
            return "LOW"
        return None

    def _categorical_stats(self, raw_series: pd.Series, counts: pd.Series) -> Dict[str, Any]:
        total = max(int(counts.sum()), 1)
        missing_count = int(raw_series.isna().sum())
        missing_pct = missing_count / max(len(raw_series), 1)
        top_categories = [
            {
                "value": str(category),
                "count": int(count),
                "frequency": round(float(count / total), 6),
            }
            for category, count in counts.sort_values(ascending=False).head(10).items()
        ]

        return {
            "dtype": str(raw_series.dtype),
            "count": int(total),
            "missing_count": missing_count,
            "missing_pct": round(missing_pct, 6),
            "unique_count": int(len(counts)),
            "top_categories": top_categories,
        }

    def _analyze_missing_drift(self, common_columns: Sequence[str]) -> None:
        """Analyze drift in missing value patterns."""
        for column in common_columns:
            ref_missing_count = int(self.reference_df[column].isna().sum())
            curr_missing_count = int(self.current_df[column].isna().sum())
            ref_missing_rate = ref_missing_count / max(len(self.reference_df), 1)
            curr_missing_rate = curr_missing_count / max(len(self.current_df), 1)
            missing_diff = abs(curr_missing_rate - ref_missing_rate)
            severity = self._missing_severity(ref_missing_rate, curr_missing_rate, missing_diff)

            if severity is None:
                continue

            self.drift_results.append(
                DriftResult(
                    column_name=str(column),
                    drift_type="MISSING",
                    drift_metric="missing_rate_change",
                    drift_score=missing_diff,
                    severity=severity,
                    reference_stats={
                        "missing_count": ref_missing_count,
                        "missing_pct": round(ref_missing_rate, 6),
                    },
                    current_stats={
                        "missing_count": curr_missing_count,
                        "missing_pct": round(curr_missing_rate, 6),
                    },
                    test_stats={"missing_rate_delta": missing_diff},
                    explanation=(
                        f"Missing value rate changed from {ref_missing_rate:.1%} "
                        f"to {curr_missing_rate:.1%}"
                    ),
                )
            )

    def _missing_severity(
        self, reference_rate: float, current_rate: float, rate_delta: float
    ) -> Optional[str]:
        if rate_delta >= 0.40 or current_rate >= 1.0 or reference_rate >= 1.0:
            return "CRITICAL"
        if rate_delta >= 0.20:
            return "HIGH"
        if rate_delta >= 0.10:
            return "MEDIUM"
        if rate_delta >= 0.05:
            return "LOW"
        return None
