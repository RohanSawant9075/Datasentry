import json

import pandas as pd
import pytest

from app.drift.drift_analyzer import DriftAnalyzer


def drift_types(result):
    return {(drift["column_name"], drift["drift_type"], drift["drift_metric"]) for drift in result["drifts"]}


def test_numerical_shift_detects_drift_and_is_json_serializable():
    reference = pd.DataFrame({"amount": list(range(100))})
    current = pd.DataFrame({"amount": list(range(50, 150))})

    result = DriftAnalyzer(current, reference).analyze()
    numeric_drifts = [d for d in result["drifts"] if d["drift_type"] == "NUMERICAL"]

    assert numeric_drifts
    assert numeric_drifts[0]["column_name"] == "amount"
    assert numeric_drifts[0]["drift_metric"] == "PSI"
    assert numeric_drifts[0]["test_stats"]["ks_statistic"] > 0
    json.dumps(result)


def test_categorical_shift_reports_js_chi_square_and_safe_categories():
    reference = pd.DataFrame({"segment": ["small"] * 70 + ["large"] * 30})
    current = pd.DataFrame({"segment": ["small"] * 20 + ["large"] * 30 + ["enterprise"] * 50})

    result = DriftAnalyzer(current, reference).analyze()
    categorical_drifts = [d for d in result["drifts"] if d["drift_type"] == "CATEGORICAL"]

    assert categorical_drifts
    drift = categorical_drifts[0]
    assert drift["drift_metric"] == "Jensen-Shannon"
    assert drift["test_stats"]["jensen_shannon_distance"] > 0
    assert drift["test_stats"]["chi_square_pvalue"] <= 1
    assert "enterprise" in drift["test_stats"]["new_categories"]
    assert isinstance(drift["current_stats"]["top_categories"], list)
    json.dumps(result)


def test_schema_and_type_changes_are_deterministic():
    reference = pd.DataFrame(
        {
            "id": [1, 2, 3],
            "old_col": ["a", "b", "c"],
            "typed": [1, 2, 3],
        }
    )
    current = pd.DataFrame(
        {
            "id": [1, 2, 3],
            "typed": ["one", "two", "three"],
            "new_col": [10, 20, 30],
        }
    )

    result = DriftAnalyzer(current, reference).analyze()
    schema_drifts = [d for d in result["drifts"] if d["drift_type"] == "SCHEMA"]

    assert [d["drift_metric"] for d in schema_drifts[:2]] == ["column_removal", "column_addition"]
    assert ("typed", "SCHEMA", "dtype_mismatch") in drift_types(result)


def test_constant_numeric_columns_do_not_crash_or_duplicate_on_repeated_analyze():
    reference = pd.DataFrame({"constant": [5] * 25})
    current = pd.DataFrame({"constant": [5] * 25})
    analyzer = DriftAnalyzer(current, reference)

    first = analyzer.analyze()
    second = analyzer.analyze()

    assert first == second
    assert first["total_drifts"] == 0


def test_missing_rate_drift_is_reported():
    reference = pd.DataFrame({"score": list(range(20))})
    current = pd.DataFrame({"score": [None] * 10 + list(range(10))})

    result = DriftAnalyzer(current, reference).analyze()

    assert ("score", "MISSING", "missing_rate_change") in drift_types(result)
    missing = next(d for d in result["drifts"] if d["drift_type"] == "MISSING")
    assert missing["severity"] in {"HIGH", "CRITICAL"}


def test_empty_dataframes_raise_validation_error():
    with pytest.raises(ValueError):
        DriftAnalyzer(pd.DataFrame(), pd.DataFrame({"a": [1]})).analyze()
