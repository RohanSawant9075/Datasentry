# API Documentation

## Base URLs

### Development
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:3001/api`
- **ML Service:** `http://localhost:8000/api`

### Production
- **Frontend:** `https://datasentry.example.com`
- **Backend API:** `https://api.datasentry.example.com/api`
- **ML Service:** `https://ml.datasentry.example.com/api` (internal)

---

## Authentication

All API requests (except auth endpoints) require JWT authentication.

### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### JWT Token Structure
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "ANALYST",
  "iat": 1726334400,
  "exp": 1726420800
}
```

---

## API Endpoints

### 1. Authentication

#### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "email": "analyst@company.com",
  "password": "SecurePass123!",
  "name": "John Analyst"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "analyst@company.com",
    "name": "John Analyst",
    "role": "ANALYST"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

#### POST /auth/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "analyst@company.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "analyst@company.com",
    "name": "John Analyst",
    "role": "ANALYST"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing fields

---

#### GET /auth/profile
Get current user profile.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "analyst@company.com",
  "name": "John Analyst",
  "role": "ANALYST",
  "created_at": "2026-09-01T10:00:00Z"
}
```

---

### 2. Datasets

#### POST /datasets/upload
Upload a new dataset.

**Request:** `multipart/form-data`
```
file: <binary>
source_type: "CSV" | "JSON" | "EXCEL"
```

**Response:** `201 Created`
```json
{
  "id": "dataset-uuid",
  "name": "retail_sales.csv",
  "source_type": "CSV",
  "status": "PROCESSING",
  "file_size": 1048576,
  "s3_key": "raw/retail/dataset-uuid/retail_sales.csv",
  "created_at": "2026-09-14T17:00:00Z"
}
```

**Errors:**
- `400 Bad Request` - Invalid file format
- `413 Payload Too Large` - File exceeds size limit (100MB)
- `422 Unprocessable Entity` - Corrupted file

---

#### GET /datasets
List all datasets for current user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status (PROCESSING, HEALTHY, WARNING, CRITICAL)
- `sort` (optional): Sort field (created_at, name)
- `order` (optional): Sort order (asc, desc)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "retail_sales.csv",
      "source_type": "CSV",
      "status": "HEALTHY",
      "row_count": 10000,
      "column_count": 8,
      "created_at": "2026-09-14T17:00:00Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "total_pages": 3
  }
}
```

---

#### GET /datasets/:id
Get detailed dataset information.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "retail_sales.csv",
  "source_type": "CSV",
  "status": "HEALTHY",
  "file_size": 1048576,
  "s3_bucket": "datasentry-data",
  "s3_key": "raw/retail/uuid/retail_sales.csv",
  "schema": {
    "date": "datetime",
    "product_id": "text",
    "quantity": "numeric",
    "price": "numeric",
    "store_id": "text"
  },
  "row_count": 10000,
  "column_count": 8,
  "version": 1,
  "created_at": "2026-09-14T17:00:00Z",
  "updated_at": "2026-09-14T17:05:00Z"
}
```

**Errors:**
- `404 Not Found` - Dataset does not exist

---

#### DELETE /datasets/:id
Delete a dataset and all associated data.

**Response:** `204 No Content`

**Errors:**
- `404 Not Found` - Dataset does not exist
- `403 Forbidden` - Insufficient permissions

---

### 3. Data Profiling

#### GET /datasets/:id/profile
Get statistical profiling results.

**Response:** `200 OK`
```json
{
  "dataset_id": "uuid",
  "row_count": 10000,
  "column_count": 8,
  "profiles": [
    {
      "column_name": "quantity",
      "data_type": "numeric",
      "missing_count": 250,
      "missing_pct": 2.5,
      "unique_count": 450,
      "duplicate_count": 0,
      "min_value": 1,
      "max_value": 500,
      "mean": 45.6,
      "median": 38.0,
      "std_dev": 23.4,
      "statistics": {
        "q1": 20.0,
        "q3": 65.0,
        "iqr": 45.0,
        "skewness": 0.8,
        "kurtosis": 1.2
      }
    },
    {
      "column_name": "product_id",
      "data_type": "categorical",
      "missing_count": 0,
      "missing_pct": 0,
      "unique_count": 150,
      "cardinality": "medium",
      "top_values": [
        {"value": "PROD_001", "count": 340},
        {"value": "PROD_002", "count": 298}
      ]
    }
  ],
  "created_at": "2026-09-14T17:05:00Z"
}
```

---

### 4. Data Quality

#### POST /datasets/:id/quality/analyze
Trigger quality analysis.

**Response:** `202 Accepted`
```json
{
  "message": "Quality analysis started",
  "job_id": "job-uuid"
}
```

---

#### GET /datasets/:id/quality
Get quality assessment results.

**Response:** `200 OK`
```json
{
  "dataset_id": "uuid",
  "overall_score": 78.5,
  "completeness_score": 92.0,
  "validity_score": 85.0,
  "consistency_score": 70.0,
  "uniqueness_score": 95.0,
  "timeliness_score": 88.0,
  "distribution_score": 62.0,
  "dimension_details": {
    "completeness": {
      "score": 92.0,
      "issues": [
        {
          "column": "quantity",
          "missing_pct": 2.5,
          "severity": "LOW"
        }
      ]
    },
    "validity": {
      "score": 85.0,
      "issues": [
        {
          "column": "price",
          "invalid_count": 45,
          "rule": "must be positive",
          "severity": "MEDIUM"
        }
      ]
    }
  },
  "version": "1.0.0",
  "created_at": "2026-09-14T17:06:00Z"
}
```

---

### 5. Anomaly Detection

#### GET /datasets/:id/anomalies
Get detected anomalies.

**Query Parameters:**
- `severity` (optional): Filter by severity
- `status` (optional): Filter by status (ACTIVE, RESOLVED)
- `column` (optional): Filter by column name

**Response:** `200 OK`
```json
{
  "dataset_id": "uuid",
  "total_anomalies": 45,
  "by_severity": {
    "LOW": 20,
    "MEDIUM": 18,
    "HIGH": 5,
    "CRITICAL": 2
  },
  "anomalies": [
    {
      "id": "anomaly-uuid",
      "column_name": "quantity",
      "anomaly_type": "OUTLIER",
      "severity": "HIGH",
      "affected_count": 12,
      "affected_rows": [45, 892, 1203],
      "method": "IsolationForest",
      "threshold": 0.15,
      "explanation": "12 extreme outlier values detected in 'quantity' column (values > 450)",
      "detected_at": "2026-09-14T17:07:00Z",
      "status": "ACTIVE"
    },
    {
      "id": "anomaly-uuid-2",
      "column_name": "price",
      "anomaly_type": "INVALID",
      "severity": "CRITICAL",
      "affected_count": 2,
      "affected_rows": [156, 789],
      "method": "Rule-based",
      "explanation": "2 negative price values detected (invalid for retail domain)",
      "detected_at": "2026-09-14T17:07:00Z",
      "status": "ACTIVE"
    }
  ]
}
```

---

### 6. Drift Detection

#### GET /datasets/:id/drift
Get drift detection results compared to reference dataset.

**Query Parameters:**
- `reference_id` (required): Reference dataset ID

**Response:** `200 OK`
```json
{
  "dataset_id": "uuid",
  "reference_dataset_id": "ref-uuid",
  "overall_drift": "MEDIUM",
  "drift_results": [
    {
      "column_name": "quantity",
      "drift_type": "NUMERICAL",
      "drift_metric": "PSI",
      "drift_score": 0.18,
      "severity": "MEDIUM",
      "reference_stats": {
        "mean": 45.6,
        "std_dev": 23.4,
        "distribution": [...]
      },
      "current_stats": {
        "mean": 52.3,
        "std_dev": 28.1,
        "distribution": [...]
      },
      "explanation": "Moderate distribution shift detected in 'quantity'. Mean increased by 14.7%.",
      "detected_at": "2026-09-14T17:08:00Z"
    },
    {
      "column_name": "product_id",
      "drift_type": "CATEGORICAL",
      "drift_metric": "ChiSquare",
      "drift_score": 0.05,
      "severity": "LOW",
      "explanation": "Minor categorical distribution change detected.",
      "detected_at": "2026-09-14T17:08:00Z"
    }
  ]
}
```

---

### 7. Data Reliability

#### GET /datasets/:id/reliability
Get composite reliability score.

**Response:** `200 OK`
```json
{
  "dataset_id": "uuid",
  "score": 73.5,
  "quality_score": 78.5,
  "anomaly_score": 65.0,
  "drift_score": 72.0,
  "timeliness_score": 88.0,
  "components": {
    "quality_weight": 0.4,
    "anomaly_weight": 0.3,
    "drift_weight": 0.2,
    "timeliness_weight": 0.1
  },
  "assessment": "WARNING",
  "explanation": "Moderate reliability concerns due to anomalies and distribution drift.",
  "version": "1.0.0",
  "calculated_at": "2026-09-14T17:09:00Z"
}
```

---

### 8. Models

#### GET /models
List all trained models.

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "model-uuid",
      "name": "Retail Demand Forecasting v1",
      "domain_type": "RETAIL",
      "version": "1.0.0",
      "algorithm": "LightGBM",
      "status": "READY",
      "metrics": {
        "mae": 8.2,
        "rmse": 12.5,
        "r2": 0.89
      },
      "trained_at": "2026-09-10T10:00:00Z"
    }
  ]
}
```

---

#### POST /models
Train a new model.

**Request:**
```json
{
  "name": "Retail Demand Forecasting v2",
  "domain_type": "RETAIL",
  "dataset_id": "training-dataset-uuid",
  "algorithm": "LightGBM",
  "hyperparameters": {
    "n_estimators": 100,
    "learning_rate": 0.1,
    "max_depth": 7
  },
  "feature_names": ["quantity", "price", "day_of_week", "month"],
  "target_name": "sales"
}
```

**Response:** `202 Accepted`
```json
{
  "message": "Model training started",
  "job_id": "job-uuid",
  "model_id": "model-uuid"
}
```

---

#### GET /models/:id/performance
Get model performance metrics.

**Response:** `200 OK`
```json
{
  "model_id": "uuid",
  "metrics": {
    "mae": 8.2,
    "rmse": 12.5,
    "wmape": 0.087,
    "r2": 0.89,
    "mape": 9.1
  },
  "feature_importance": [
    {"feature": "quantity", "importance": 0.35},
    {"feature": "price", "importance": 0.28},
    {"feature": "day_of_week", "importance": 0.22},
    {"feature": "month", "importance": 0.15}
  ],
  "validation_split": 0.2,
  "trained_at": "2026-09-10T10:00:00Z"
}
```

---

### 9. Model Impact

#### GET /datasets/:id/model-impact
Analyze model performance impact from data quality issues.

**Query Parameters:**
- `model_id` (required): Model to evaluate

**Response:** `200 OK`
```json
{
  "dataset_id": "uuid",
  "model_id": "model-uuid",
  "clean_performance": {
    "mae": 8.2,
    "rmse": 12.5,
    "wmape": 0.087
  },
  "corrupted_performance": {
    "mae": 16.4,
    "rmse": 24.1,
    "wmape": 0.175
  },
  "degradation": {
    "mae_increase_pct": 100.0,
    "rmse_increase_pct": 92.8,
    "wmape_increase_pct": 101.1
  },
  "feature_impact": [
    {
      "feature": "quantity",
      "quality_issues": ["missing_values", "outliers"],
      "importance": 0.35,
      "exposure": "HIGH",
      "impact_contribution": 0.45
    },
    {
      "feature": "price",
      "quality_issues": ["invalid_values"],
      "importance": 0.28,
      "exposure": "MEDIUM",
      "impact_contribution": 0.30
    }
  ],
  "explanation": "Model performance degraded significantly due to quality issues in high-importance features.",
  "analyzed_at": "2026-09-14T17:10:00Z"
}
```

---

### 10. Decision Impact

#### GET /datasets/:id/decision-impact
Analyze downstream decision impact.

**Query Parameters:**
- `model_id` (required): Model used for decisions

**Response:** `200 OK`
```json
{
  "dataset_id": "uuid",
  "model_id": "model-uuid",
  "risk_level": "HIGH",
  "confidence": 0.87,
  "business_metrics": {
    "stockout_risk": 0.32,
    "overstock_probability": 0.18,
    "estimated_cost_impact": 45000,
    "service_level_degradation": 0.12
  },
  "recommendation": "HUMAN_REVIEW",
  "explanation": "High decision risk detected. Data quality issues in 'quantity' feature (35% importance) led to 100% increase in prediction error. This significantly impacts inventory decisions, with estimated stockout risk of 32% and potential cost impact of $45,000. Recommend human review before executing automated reorder decisions.",
  "alternative_actions": [
    {
      "action": "USE_FALLBACK_MODEL",
      "description": "Switch to simpler baseline model less sensitive to data quality"
    },
    {
      "action": "INCREASE_SAFETY_STOCK",
      "description": "Compensate for prediction uncertainty with higher buffer inventory"
    }
  ],
  "created_at": "2026-09-14T17:11:00Z"
}
```

---

### 11. Alerts

#### GET /alerts
List all alerts.

**Query Parameters:**
- `status` (optional): NEW, ACKNOWLEDGED, RESOLVED
- `severity` (optional): INFO, LOW, MEDIUM, HIGH, CRITICAL
- `category` (optional): QUALITY, ANOMALY, DRIFT, RELIABILITY, MODEL, DECISION
- `page`, `limit`: Pagination

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "alert-uuid",
      "dataset_id": "dataset-uuid",
      "category": "DECISION",
      "severity": "HIGH",
      "title": "High Decision Risk Detected",
      "description": "Data quality degradation has led to unsafe AI decision predictions",
      "explanation": "Quality issues in 'quantity' feature caused 100% prediction error increase",
      "recommended_action": "Review data source and consider human oversight for decisions",
      "status": "NEW",
      "created_at": "2026-09-14T17:11:00Z"
    }
  ],
  "meta": {
    "total": 12,
    "by_status": {
      "NEW": 5,
      "ACKNOWLEDGED": 4,
      "RESOLVED": 3
    },
    "by_severity": {
      "HIGH": 2,
      "MEDIUM": 7,
      "LOW": 3
    }
  }
}
```

---

#### PATCH /alerts/:id
Update alert status.

**Request:**
```json
{
  "status": "ACKNOWLEDGED"
}
```

**Response:** `200 OK`
```json
{
  "id": "alert-uuid",
  "status": "ACKNOWLEDGED",
  "acknowledged_by": "user-uuid",
  "acknowledged_at": "2026-09-14T17:15:00Z"
}
```

---

### 12. Reports

#### POST /reports
Generate a report.

**Request:**
```json
{
  "dataset_id": "uuid",
  "report_type": "COMPREHENSIVE",
  "title": "Retail Dataset - Complete Analysis Report",
  "format": "PDF",
  "include_sections": [
    "dataset_summary",
    "quality_assessment",
    "anomalies",
    "drift_analysis",
    "model_impact",
    "decision_impact",
    "recommendations"
  ]
}
```

**Response:** `202 Accepted`
```json
{
  "message": "Report generation started",
  "report_id": "report-uuid",
  "estimated_time": "30 seconds"
}
```

---

#### GET /reports/:id
Get generated report.

**Response:** `200 OK`
```json
{
  "id": "report-uuid",
  "dataset_id": "dataset-uuid",
  "report_type": "COMPREHENSIVE",
  "title": "Retail Dataset - Complete Analysis Report",
  "format": "PDF",
  "s3_key": "reports/report-uuid/report.pdf",
  "download_url": "https://datasentry-data.s3.amazonaws.com/reports/...",
  "generated_at": "2026-09-14T17:12:00Z"
}
```

---

## ML Service API (Internal)

The ML service exposes internal endpoints called by the backend.

### POST /api/profile
Profile a dataset.

**Request:**
```json
{
  "dataset_id": "uuid",
  "s3_key": "raw/retail/uuid/data.csv"
}
```

**Response:**
```json
{
  "profiles": [...],
  "row_count": 10000,
  "column_count": 8
}
```

---

### POST /api/quality/analyze
Analyze data quality.

**Request:**
```json
{
  "dataset_id": "uuid",
  "s3_key": "raw/retail/uuid/data.csv",
  "schema": {...}
}
```

**Response:**
```json
{
  "overall_score": 78.5,
  "dimensions": {...}
}
```

---

### POST /api/anomaly/detect
Detect anomalies.

**Request:**
```json
{
  "dataset_id": "uuid",
  "s3_key": "raw/retail/uuid/data.csv",
  "methods": ["IsolationForest", "IQR"]
}
```

**Response:**
```json
{
  "anomalies": [...]
}
```

---

## Error Responses

All errors follow this structure:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email must be valid"
    }
  ],
  "timestamp": "2026-09-14T17:00:00Z",
  "path": "/api/auth/register"
}
```

### Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `202 Accepted` - Async operation started
- `204 No Content` - Success with no response body
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `413 Payload Too Large` - File too large
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service temporarily unavailable

---

## Rate Limiting

- **Default:** 100 requests per minute per user
- **Upload:** 10 uploads per hour per user
- **ML Operations:** 20 requests per minute per user

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1726334460
```

---

## Webhooks (Future)

Webhook support for async operations (planned):
- Dataset processing completed
- Quality analysis completed
- Anomaly detected
- High-risk alert generated

---

*Last Updated: 2026-09-14*
