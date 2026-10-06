# Database Schema Design

## Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ password_hash   │
│ name            │
│ role            │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│    datasets     │
├─────────────────┤       ┌──────────────────┐
│ id (PK)         │───────│  data_profiles   │
│ user_id (FK)    │  1:N  ├──────────────────┤
│ name            │       │ id (PK)          │
│ source_type     │       │ dataset_id (FK)  │
│ status          │       │ column_name      │
│ s3_bucket       │       │ data_type        │
│ s3_key          │       │ missing_count    │
│ file_size       │       │ missing_pct      │
│ schema          │       │ unique_count     │
│ row_count       │       │ duplicate_count  │
│ column_count    │       │ min_value        │
│ version         │       │ max_value        │
│ created_at      │       │ mean             │
│ updated_at      │       │ median           │
└────────┬────────┘       │ std_dev          │
         │                │ statistics       │
         │                │ created_at       │
         │                └──────────────────┘
         │
         ├─── 1:N ───────────────────────────────┐
         │                                        │
         ▼                                        ▼
┌─────────────────┐                    ┌──────────────────┐
│quality_results  │                    │    anomalies     │
├─────────────────┤                    ├──────────────────┤
│ id (PK)         │                    │ id (PK)          │
│ dataset_id (FK) │                    │ dataset_id (FK)  │
│ overall_score   │                    │ column_name      │
│ completeness    │                    │ anomaly_type     │
│ validity        │                    │ severity         │
│ consistency     │                    │ affected_count   │
│ uniqueness      │                    │ affected_rows    │
│ timeliness      │                    │ method           │
│ distribution    │                    │ threshold        │
│ issues          │                    │ explanation      │
│ version         │                    │ detected_at      │
│ created_at      │                    │ resolved_at      │
└─────────────────┘                    │ status           │
                                       └──────────────────┘
         │
         ├─── 1:N ──────────────────┐
         │                           │
         ▼                           ▼
┌─────────────────┐        ┌──────────────────┐
│  drift_results  │        │reliability_scores│
├─────────────────┤        ├──────────────────┤
│ id (PK)         │        │ id (PK)          │
│ dataset_id (FK) │        │ dataset_id (FK)  │
│ reference_id(FK)│        │ score            │
│ column_name     │        │ quality_score    │
│ drift_type      │        │ anomaly_score    │
│ drift_metric    │        │ drift_score      │
│ drift_score     │        │ timeliness_score │
│ severity        │        │ components       │
│ reference_stats │        │ version          │
│ current_stats   │        │ calculated_at    │
│ detected_at     │        └──────────────────┘
└─────────────────┘

         │
         ├─── N:M (through model_datasets) ───┐
         │                                      │
         ▼                                      ▼
┌─────────────────┐                    ┌──────────────────┐
│     models      │                    │model_predictions │
├─────────────────┤                    ├──────────────────┤
│ id (PK)         │────────────────────│ id (PK)          │
│ name            │              1:N   │ model_id (FK)    │
│ domain_type     │                    │ dataset_id (FK)  │
│ description     │                    │ prediction_data  │
│ version         │                    │ confidence       │
│ algorithm       │                    │ created_at       │
│ hyperparameters │                    └──────────────────┘
│ s3_model_key    │
│ feature_names   │
│ target_name     │
│ metrics         │
│ status          │
│ trained_at      │
│ created_at      │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│ model_impact    │
├─────────────────┤
│ id (PK)         │
│ model_id (FK)   │
│ dataset_id (FK) │
│ clean_mae       │
│ corrupted_mae   │
│ clean_rmse      │
│ corrupted_rmse  │
│ degradation_pct │
│ feature_impact  │
│ metrics         │
│ analyzed_at     │
└─────────────────┘

         │
         ├─── 1:N ────────────────┐
         │                         │
         ▼                         ▼
┌─────────────────┐      ┌──────────────────┐
│decision_results │      │     alerts       │
├─────────────────┤      ├──────────────────┤
│ id (PK)         │      │ id (PK)          │
│ dataset_id (FK) │      │ dataset_id (FK)  │
│ model_id (FK)   │      │ category         │
│ risk_level      │      │ severity         │
│ confidence      │      │ title            │
│ business_metrics│      │ description      │
│ recommendation  │      │ explanation      │
│ explanation     │      │ recommended_act  │
│ created_at      │      │ status           │
└─────────────────┘      │ acknowledged_by  │
                         │ acknowledged_at  │
                         │ resolved_by      │
                         │ resolved_at      │
                         │ created_at       │
                         └──────────────────┘

         │
         └─── 1:N ──────────────────┐
                                     │
                                     ▼
                            ┌──────────────────┐
                            │     reports      │
                            ├──────────────────┤
                            │ id (PK)          │
                            │ dataset_id (FK)  │
                            │ user_id (FK)     │
                            │ report_type      │
                            │ title            │
                            │ content          │
                            │ s3_key           │
                            │ format           │
                            │ generated_at     │
                            └──────────────────┘

                            ┌──────────────────┐
                            │   audit_logs     │
                            ├──────────────────┤
                            │ id (PK)          │
                            │ user_id (FK)     │
                            │ action           │
                            │ entity_type      │
                            │ entity_id        │
                            │ changes          │
                            │ ip_address       │
                            │ user_agent       │
                            │ created_at       │
                            └──────────────────┘
```

---

## Schema Details

### 1. users

User accounts and authentication.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique email address |
| password_hash | VARCHAR(255) | Bcrypt hashed password |
| name | VARCHAR(255) | User's full name |
| role | ENUM | ADMIN, ANALYST, VIEWER |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

**Indexes:**
- Primary: `id`
- Unique: `email`

---

### 2. datasets

Uploaded datasets and metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| name | VARCHAR(255) | Dataset filename |
| source_type | ENUM | CSV, JSON, EXCEL, API |
| status | ENUM | PROCESSING, HEALTHY, WARNING, CRITICAL |
| s3_bucket | VARCHAR(255) | S3 bucket name |
| s3_key | VARCHAR(500) | S3 object key |
| file_size | BIGINT | File size in bytes |
| schema | JSONB | Column names and types |
| row_count | INTEGER | Number of rows |
| column_count | INTEGER | Number of columns |
| version | INTEGER | Dataset version number |
| created_at | TIMESTAMP | Upload time |
| updated_at | TIMESTAMP | Last update time |

**Indexes:**
- Primary: `id`
- Foreign: `user_id`
- Composite: `(user_id, created_at)`

---

### 3. data_profiles

Statistical profiling results per column.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| dataset_id | UUID | Foreign key to datasets |
| column_name | VARCHAR(255) | Name of the column |
| data_type | VARCHAR(50) | Inferred type (numeric, categorical, datetime, text) |
| missing_count | INTEGER | Number of missing values |
| missing_pct | DECIMAL(5,2) | Percentage missing |
| unique_count | INTEGER | Number of unique values |
| duplicate_count | INTEGER | Number of duplicates |
| min_value | VARCHAR(255) | Minimum value (as string) |
| max_value | VARCHAR(255) | Maximum value (as string) |
| mean | DECIMAL(20,6) | Mean (numeric columns) |
| median | DECIMAL(20,6) | Median (numeric columns) |
| std_dev | DECIMAL(20,6) | Standard deviation |
| statistics | JSONB | Additional stats (quartiles, mode, skewness, etc.) |
| created_at | TIMESTAMP | Profiling time |

**Indexes:**
- Primary: `id`
- Foreign: `dataset_id`
- Composite: `(dataset_id, column_name)`

---

### 4. quality_results

Data quality assessment results.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| dataset_id | UUID | Foreign key to datasets |
| overall_score | DECIMAL(5,2) | Overall quality score (0-100) |
| completeness_score | DECIMAL(5,2) | Completeness dimension (0-100) |
| validity_score | DECIMAL(5,2) | Validity dimension (0-100) |
| consistency_score | DECIMAL(5,2) | Consistency dimension (0-100) |
| uniqueness_score | DECIMAL(5,2) | Uniqueness dimension (0-100) |
| timeliness_score | DECIMAL(5,2) | Timeliness dimension (0-100) |
| distribution_score | DECIMAL(5,2) | Distribution stability (0-100) |
| issues | JSONB | Array of detected issues |
| version | VARCHAR(50) | Quality engine version |
| created_at | TIMESTAMP | Analysis time |

**Indexes:**
- Primary: `id`
- Foreign: `dataset_id`
- Index: `overall_score`

---

### 5. anomalies

Detected anomalies in data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| dataset_id | UUID | Foreign key to datasets |
| column_name | VARCHAR(255) | Affected column |
| anomaly_type | VARCHAR(100) | OUTLIER, SPIKE, INVALID, MISSING_SPIKE, CATEGORICAL |
| severity | ENUM | LOW, MEDIUM, HIGH, CRITICAL |
| affected_count | INTEGER | Number of affected rows |
| affected_rows | JSONB | Array of row indices |
| method | VARCHAR(100) | Detection method (IQR, IsolationForest, etc.) |
| threshold | DECIMAL(20,6) | Detection threshold used |
| explanation | TEXT | Human-readable explanation |
| detected_at | TIMESTAMP | Detection time |
| resolved_at | TIMESTAMP | Resolution time (nullable) |
| status | ENUM | ACTIVE, RESOLVED, IGNORED |

**Indexes:**
- Primary: `id`
- Foreign: `dataset_id`
- Composite: `(dataset_id, severity, status)`

---

### 6. drift_results

Data drift detection results.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| dataset_id | UUID | Foreign key to datasets (current) |
| reference_dataset_id | UUID | Foreign key to datasets (reference) |
| column_name | VARCHAR(255) | Affected column |
| drift_type | VARCHAR(100) | NUMERICAL, CATEGORICAL, MISSING, SCHEMA |
| drift_metric | VARCHAR(50) | PSI, KS, ChiSquare, etc. |
| drift_score | DECIMAL(10,6) | Drift metric value |
| severity | ENUM | LOW, MEDIUM, HIGH, CRITICAL |
| reference_stats | JSONB | Reference distribution stats |
| current_stats | JSONB | Current distribution stats |
| detected_at | TIMESTAMP | Detection time |

**Indexes:**
- Primary: `id`
- Foreign: `dataset_id`, `reference_dataset_id`
- Composite: `(dataset_id, severity)`

---

### 7. reliability_scores

Composite reliability scoring.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| dataset_id | UUID | Foreign key to datasets |
| score | DECIMAL(5,2) | Overall reliability score (0-100) |
| quality_score | DECIMAL(5,2) | Quality component |
| anomaly_score | DECIMAL(5,2) | Anomaly component |
| drift_score | DECIMAL(5,2) | Drift component |
| timeliness_score | DECIMAL(5,2) | Timeliness component |
| components | JSONB | Detailed component breakdown |
| version | VARCHAR(50) | Scoring algorithm version |
| calculated_at | TIMESTAMP | Calculation time |

**Indexes:**
- Primary: `id`
- Foreign: `dataset_id`
- Index: `score`

---

### 8. models

Machine learning models.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Model name |
| domain_type | VARCHAR(100) | RETAIL, MANUFACTURING, FINANCE, etc. |
| description | TEXT | Model description |
| version | VARCHAR(50) | Model version |
| algorithm | VARCHAR(100) | LightGBM, RandomForest, etc. |
| hyperparameters | JSONB | Model configuration |
| s3_model_key | VARCHAR(500) | S3 path to serialized model |
| feature_names | JSONB | Array of feature names |
| target_name | VARCHAR(255) | Target variable name |
| metrics | JSONB | Training metrics |
| status | ENUM | TRAINING, READY, FAILED, DEPRECATED |
| trained_at | TIMESTAMP | Training completion time |
| created_at | TIMESTAMP | Creation time |

**Indexes:**
- Primary: `id`
- Index: `domain_type`, `status`

---

### 9. model_predictions

Model prediction outputs.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| model_id | UUID | Foreign key to models |
| dataset_id | UUID | Foreign key to datasets |
| prediction_data | JSONB | Array of predictions |
| confidence | JSONB | Confidence/uncertainty metrics |
| created_at | TIMESTAMP | Prediction time |

**Indexes:**
- Primary: `id`
- Foreign: `model_id`, `dataset_id`

---

### 10. model_impact

Model performance impact analysis.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| model_id | UUID | Foreign key to models |
| dataset_id | UUID | Foreign key to datasets (corrupted) |
| clean_mae | DECIMAL(20,6) | MAE on clean data |
| corrupted_mae | DECIMAL(20,6) | MAE on corrupted data |
| clean_rmse | DECIMAL(20,6) | RMSE on clean data |
| corrupted_rmse | DECIMAL(20,6) | RMSE on corrupted data |
| degradation_pct | DECIMAL(5,2) | Performance degradation % |
| feature_impact | JSONB | Per-feature impact analysis |
| metrics | JSONB | Additional metrics (WMAPE, R2, etc.) |
| analyzed_at | TIMESTAMP | Analysis time |

**Indexes:**
- Primary: `id`
- Foreign: `model_id`, `dataset_id`

---

### 11. decision_results

Decision impact analysis results.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| dataset_id | UUID | Foreign key to datasets |
| model_id | UUID | Foreign key to models |
| risk_level | ENUM | LOW, MEDIUM, HIGH, CRITICAL |
| confidence | DECIMAL(5,2) | Confidence in risk assessment |
| business_metrics | JSONB | Domain-specific metrics |
| recommendation | TEXT | Recommended action |
| explanation | TEXT | Explanation of risk |
| created_at | TIMESTAMP | Analysis time |

**Indexes:**
- Primary: `id`
- Foreign: `dataset_id`, `model_id`
- Index: `risk_level`

---

### 12. alerts

System alerts and notifications.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| dataset_id | UUID | Foreign key to datasets (nullable) |
| category | VARCHAR(100) | QUALITY, ANOMALY, DRIFT, RELIABILITY, MODEL, DECISION |
| severity | ENUM | INFO, LOW, MEDIUM, HIGH, CRITICAL |
| title | VARCHAR(255) | Alert title |
| description | TEXT | Detailed description |
| explanation | TEXT | Root cause explanation |
| recommended_action | TEXT | What to do |
| status | ENUM | NEW, ACKNOWLEDGED, RESOLVED |
| acknowledged_by | UUID | Foreign key to users (nullable) |
| acknowledged_at | TIMESTAMP | Acknowledgment time (nullable) |
| resolved_by | UUID | Foreign key to users (nullable) |
| resolved_at | TIMESTAMP | Resolution time (nullable) |
| created_at | TIMESTAMP | Alert creation time |

**Indexes:**
- Primary: `id`
- Foreign: `dataset_id`
- Composite: `(status, severity, created_at)`

---

### 13. reports

Generated reports.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| dataset_id | UUID | Foreign key to datasets (nullable) |
| user_id | UUID | Foreign key to users |
| report_type | VARCHAR(100) | DATASET_SUMMARY, QUALITY, IMPACT, COMPREHENSIVE |
| title | VARCHAR(255) | Report title |
| content | JSONB | Report data |
| s3_key | VARCHAR(500) | S3 path to generated PDF/HTML (nullable) |
| format | VARCHAR(50) | PDF, HTML, JSON |
| generated_at | TIMESTAMP | Generation time |

**Indexes:**
- Primary: `id`
- Foreign: `dataset_id`, `user_id`

---

### 14. audit_logs

Audit trail for security and compliance.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users (nullable) |
| action | VARCHAR(100) | LOGIN, UPLOAD, DELETE, UPDATE, etc. |
| entity_type | VARCHAR(100) | DATASET, MODEL, USER, etc. |
| entity_id | UUID | ID of affected entity (nullable) |
| changes | JSONB | Before/after values |
| ip_address | VARCHAR(45) | Client IP |
| user_agent | VARCHAR(255) | Client user agent |
| created_at | TIMESTAMP | Action time |

**Indexes:**
- Primary: `id`
- Foreign: `user_id`
- Composite: `(user_id, created_at)`
- Index: `(entity_type, entity_id)`

---

## Prisma Schema

See `backend/prisma/schema.prisma` for the complete Prisma schema definition.

---

## Migration Strategy

### Development
```bash
# Create migration
npx prisma migrate dev --name <migration_name>

# Apply migrations
npx prisma migrate deploy
```

### Production
```bash
# Generate Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate deploy
```

---

## Data Retention Policy

| Entity | Retention |
|--------|-----------|
| datasets | 90 days (configurable) |
| quality_results | 90 days |
| anomalies | 90 days |
| drift_results | 90 days |
| model_impact | 180 days |
| decision_results | 180 days |
| alerts | 30 days (resolved), 90 days (all) |
| reports | 365 days |
| audit_logs | 365 days (compliance) |

---

## Backup Strategy

- **Automated backups:** Daily (RDS automated backups)
- **Point-in-time recovery:** 7 days
- **Manual snapshots:** Before major releases
- **S3 versioning:** Enabled for dataset storage

---

*Last Updated: 2026-09-14*
