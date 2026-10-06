from fastapi.testclient import TestClient

from app.main import app
from app.utils import s3_client as s3_module

client = TestClient(app)


def test_analyze_drift_with_csv_content(monkeypatch):
    files = {
        "current.csv": b"amount,segment\n100,a\n110,a\n120,b\n130,b\n140,c\n150,c\n160,c\n170,c\n180,c\n190,c\n",
        "reference.csv": b"amount,segment\n1,a\n2,a\n3,a\n4,a\n5,a\n6,b\n7,b\n8,b\n9,b\n10,b\n",
    }

    monkeypatch.setattr(s3_module.s3_client, "get_file_content", lambda key: files.get(key))

    response = client.post(
        "/api/drift/analyze",
        json={
            "current_dataset_id": "current-dataset",
            "reference_dataset_id": "reference-dataset",
            "current_s3_key": "current.csv",
            "reference_s3_key": "reference.csv",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["current_dataset_id"] == "current-dataset"
    assert data["reference_dataset_id"] == "reference-dataset"
    assert data["total_drifts"] >= 1
    assert data["drifts"][0]["test_stats"] is not None


def test_missing_current_dataset_returns_404(monkeypatch):
    monkeypatch.setattr(s3_module.s3_client, "get_file_content", lambda key: None)

    response = client.post(
        "/api/drift/analyze",
        json={
            "current_dataset_id": "current-dataset",
            "reference_dataset_id": "reference-dataset",
            "current_s3_key": "missing.csv",
            "reference_s3_key": "reference.csv",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Current dataset not found in S3"


def test_unsupported_extension_returns_400(monkeypatch):
    monkeypatch.setattr(s3_module.s3_client, "get_file_content", lambda key: b"amount\n1\n")

    response = client.post(
        "/api/drift/analyze",
        json={
            "current_dataset_id": "current-dataset",
            "reference_dataset_id": "reference-dataset",
            "current_s3_key": "current.txt",
            "reference_s3_key": "reference.csv",
        },
    )

    assert response.status_code == 400
    assert "Unsupported file extension" in response.json()["detail"]


def test_invalid_parse_returns_400(monkeypatch):
    files = {
        "current.json": b"not-json",
        "reference.json": b'[{"amount": 1}]',
    }
    monkeypatch.setattr(s3_module.s3_client, "get_file_content", lambda key: files.get(key))

    response = client.post(
        "/api/drift/analyze",
        json={
            "current_dataset_id": "current-dataset",
            "reference_dataset_id": "reference-dataset",
            "current_s3_key": "current.json",
            "reference_s3_key": "reference.json",
        },
    )

    assert response.status_code == 400
    assert "Invalid JSON file" in response.json()["detail"]
