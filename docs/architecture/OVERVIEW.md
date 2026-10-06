# DataSentry-AI Architecture Overview

## System Architecture

DataSentry-AI is built as a **microservices architecture** with three main services:

1. **Frontend** (React + TypeScript)
2. **Backend** (NestJS + PostgreSQL)
3. **ML Service** (Python + FastAPI)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                    React + TypeScript + Vite                     │
│                                                                   │
│  • Dashboard  • Datasets  • Quality  • Anomalies  • Drift       │
│  • Reliability  • Models  • Impact  • Decisions  • Alerts       │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVICE (NestJS)                    │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Auth Module  │  │Dataset Module│  │Quality Module│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │Anomaly Module│  │ Drift Module │  │ Model Module │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │Impact Module │  │Decision Mod. │  │ Alert Module │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└───────────┬───────────────────────────────────┬─────────────────┘
            │                                   │
            │ Prisma ORM                       │ HTTP/REST
            ▼                                   ▼
    ┌───────────────┐              ┌─────────────────────────────┐
    │   PostgreSQL  │              │   ML SERVICE (FastAPI)      │
    │   (RDS)       │              │                             │
    │               │              │  • Profiling                │
    │ • Users       │              │  • Quality Analysis         │
    │ • Datasets    │              │  • Anomaly Detection        │
    │ • Quality     │              │  • Drift Detection          │
    │ • Anomalies   │              │  • Reliability Scoring      │
    │ • Drift       │              │  • Model Training           │
    │ • Models      │              │  • Model Prediction         │
    │ • Predictions │              │  • Impact Analysis          │
    │ • Alerts      │              │  • Explainability (SHAP)    │
    └───────────────┘              └─────────────────────────────┘
                                              │
                                              │
                                              ▼
                                   ┌──────────────────────┐
                                   │   Amazon S3          │
                                   │                      │
                                   │  • Raw datasets      │
                                   │  • Processed data    │
                                   │  • Corrupted data    │
                                   │  • Trained models    │
                                   │  • Results           │
                                   └──────────────────────┘
```

---

## Core Data Pipeline

```
1. INGESTION
   ├── File Upload (CSV, JSON, Excel)
   ├── Validation
   ├── S3 Storage
   └── Metadata Registration

2. PROFILING
   ├── Schema Discovery
   ├── Type Inference
   ├── Statistical Analysis
   ├── Distribution Analysis
   └── Cardinality Analysis

3. QUALITY ASSESSMENT
   ├── Completeness Check
   ├── Validity Check
   ├── Consistency Check
   ├── Uniqueness Check
   ├── Timeliness Check
   └── Distribution Stability

4. ANOMALY DETECTION
   ├── Statistical Outliers (IQR, Z-score)
   ├── Isolation Forest
   ├── Spike Detection
   └── Categorical Anomalies

5. DRIFT DETECTION
   ├── Numerical Distribution Drift
   ├── Categorical Distribution Drift
   ├── Missing Pattern Drift
   └── Schema Drift

6. RELIABILITY SCORING
   ├── Quality Score
   ├── Anomaly Score
   ├── Drift Score
   ├── Timeliness Score
   └── Composite Reliability

7. MODEL EXPOSURE
   ├── Feature Importance
   ├── Quality-Feature Mapping
   └── Exposure Scoring

8. MODEL IMPACT
   ├── Clean vs Corrupted Performance
   ├── Error Metrics (MAE, RMSE, WMAPE)
   ├── Prediction Deviation
   └── Confidence Degradation

9. DECISION IMPACT
   ├── Domain Decision Mapping
   ├── Business Metric Impact
   ├── Risk Calculation
   └── Risk Classification

10. RECOMMENDATION
    ├── Continue (LOW risk)
    ├── Warning (MEDIUM risk)
    ├── Human Review (HIGH risk)
    └── Block/Fallback (CRITICAL risk)

11. EXPLANATION
    ├── Root Cause Analysis
    ├── SHAP Values
    ├── Feature Attribution
    └── Actionable Insights
```

---

## Domain-Agnostic Design

### Universal Core

The universal core is **domain-independent** and handles:

```python
# Universal components (no domain knowledge)
- DataIngestion
- SchemaDiscovery
- DataProfiling
- QualityEngine
- AnomalyEngine
- DriftEngine
- ReliabilityEngine
- ModelExposureAnalyzer
- ImpactAnalyzer
- ExplanationEngine
- AlertingSystem
```

### Domain Adapters

Domain-specific logic is **isolated in adapters**:

```python
# Domain adapter interface
class DomainAdapter(ABC):
    @abstractmethod
    def train_model(self, data):
        """Train domain-specific model"""
        pass
    
    @abstractmethod
    def predict(self, data):
        """Make domain-specific predictions"""
        pass
    
    @abstractmethod
    def calculate_decision_impact(self, predictions, quality_metrics):
        """Calculate domain-specific decision impact"""
        pass
    
    @abstractmethod
    def get_business_metrics(self):
        """Return domain-specific business metrics"""
        pass
```

**Retail Adapter Example:**

```python
class RetailAdapter(DomainAdapter):
    def train_model(self, data):
        # Train demand forecasting model
        return LightGBMRegressor(...)
    
    def predict(self, data):
        # Predict sales/demand
        return model.predict(data)
    
    def calculate_decision_impact(self, predictions, quality_metrics):
        # Calculate inventory decision impact
        # Metrics: stockout_risk, overstock_cost, service_level
        return decision_metrics
    
    def get_business_metrics(self):
        return ['stockout_risk', 'overstock_cost', 'service_level']
```

**Future Manufacturing Adapter:**

```python
class ManufacturingAdapter(DomainAdapter):
    def train_model(self, data):
        # Train predictive maintenance model
        return RandomForestClassifier(...)
    
    def predict(self, data):
        # Predict equipment failure
        return model.predict_proba(data)
    
    def calculate_decision_impact(self, predictions, quality_metrics):
        # Calculate maintenance decision impact
        # Metrics: downtime_risk, maintenance_cost, false_alarm_rate
        return decision_metrics
    
    def get_business_metrics(self):
        return ['downtime_risk', 'maintenance_cost', 'false_alarm_rate']
```

---

## Service Communication

### Frontend ↔ Backend

- **Protocol:** REST API over HTTPS
- **Authentication:** JWT Bearer tokens
- **Data Format:** JSON

```typescript
// API Service Example
class DatasetService {
  async uploadDataset(file: File): Promise<Dataset> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post('/api/datasets/upload', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  }
}
```

### Backend ↔ ML Service

- **Protocol:** REST API over HTTP (internal network)
- **Data Format:** JSON
- **Error Handling:** Retry logic with exponential backoff

```typescript
// Backend calling ML Service
async analyzeQuality(datasetId: string): Promise<QualityResult> {
  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/quality/analyze`,
      { dataset_id: datasetId },
      { timeout: 30000 }
    );
    
    return response.data;
  } catch (error) {
    // Handle ML service unavailability
    throw new ServiceUnavailableException('ML service is unavailable');
  }
}
```

### Backend ↔ Database

- **ORM:** Prisma
- **Connection Pooling:** Enabled
- **Migrations:** Version controlled

```typescript
// Prisma example
const dataset = await prisma.dataset.create({
  data: {
    name: 'retail_sales.csv',
    status: 'PROCESSING',
    user: { connect: { id: userId } }
  }
});
```

### ML Service ↔ S3

- **SDK:** boto3 (Python AWS SDK)
- **Access:** IAM role-based (production), credentials (local)

```python
# S3 operations
import boto3

s3_client = boto3.client('s3')

def upload_to_s3(file_path, bucket, key):
    s3_client.upload_file(file_path, bucket, key)

def download_from_s3(bucket, key, local_path):
    s3_client.download_file(bucket, key, local_path)
```

---

## Database Schema Overview

### Core Entities

```
users
├── id (UUID)
├── email
├── password_hash
├── role (ADMIN, ANALYST, VIEWER)
└── created_at

datasets
├── id (UUID)
├── name
├── user_id (FK)
├── status (PROCESSING, HEALTHY, WARNING, CRITICAL)
├── s3_key
├── schema (JSONB)
├── row_count
├── column_count
└── created_at

data_profiles
├── id (UUID)
├── dataset_id (FK)
├── column_name
├── data_type
├── missing_count
├── unique_count
├── statistics (JSONB)
└── created_at

quality_results
├── id (UUID)
├── dataset_id (FK)
├── overall_score
├── completeness_score
├── validity_score
├── consistency_score
├── uniqueness_score
├── timeliness_score
├── distribution_stability_score
└── created_at

anomalies
├── id (UUID)
├── dataset_id (FK)
├── column_name
├── anomaly_type
├── severity (LOW, MEDIUM, HIGH, CRITICAL)
├── affected_rows (JSONB)
├── explanation
└── detected_at

drift_results
├── id (UUID)
├── dataset_id (FK)
├── reference_dataset_id (FK)
├── column_name
├── drift_metric
├── drift_score
├── severity
└── detected_at

reliability_scores
├── id (UUID)
├── dataset_id (FK)
├── score
├── components (JSONB)
└── calculated_at

models
├── id (UUID)
├── name
├── domain_type (RETAIL, MANUFACTURING, etc.)
├── version
├── s3_model_key
└── created_at

model_impact_results
├── id (UUID)
├── model_id (FK)
├── dataset_id (FK)
├── clean_mae
├── corrupted_mae
├── degradation
├── metrics (JSONB)
└── analyzed_at

decision_results
├── id (UUID)
├── dataset_id (FK)
├── model_id (FK)
├── risk_level (LOW, MEDIUM, HIGH, CRITICAL)
├── decision_metrics (JSONB)
├── recommendation
└── created_at

alerts
├── id (UUID)
├── dataset_id (FK)
├── category
├── severity
├── title
├── description
├── status (NEW, ACKNOWLEDGED, RESOLVED)
└── created_at
```

---

## Security Architecture

### Authentication & Authorization

```
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │ 1. Login (email, password)
       ▼
┌──────────────┐
│   Backend    │──── 2. Validate credentials
│  Auth Module │──── 3. Generate JWT token
└──────┬───────┘
       │ 4. Return JWT
       ▼
┌──────────────┐
│   Frontend   │──── 5. Store token in memory/localStorage
└──────┬───────┘
       │ 6. All subsequent requests include:
       │    Authorization: Bearer <JWT>
       ▼
┌──────────────┐
│   Backend    │──── 7. Validate JWT
│   Guards     │──── 8. Check role permissions
└──────────────┘──── 9. Allow/Deny request
```

### Data Security

**In Transit:**
- HTTPS/TLS for all external communication
- Internal service communication within VPC

**At Rest:**
- Database encryption (RDS encryption)
- S3 bucket encryption (AES-256)
- Secrets Manager for credentials

**Access Control:**
- Role-based access control (RBAC)
- Least privilege principle
- IAM policies for AWS resources

---

## Scalability Considerations

### Horizontal Scaling

**Frontend:**
- Static files served via CloudFront CDN
- S3 bucket replication for high availability

**Backend:**
- Stateless API design
- ECS task auto-scaling based on CPU/memory
- Database connection pooling

**ML Service:**
- Async job processing for long-running tasks
- Task queue (future: SQS) for batch processing
- Model caching to reduce inference time

### Vertical Scaling

**Database:**
- RDS instance sizing based on load
- Read replicas for read-heavy operations (future)

**ML Service:**
- GPU instances for model training (if needed)
- Memory-optimized instances for large datasets

---

## Monitoring & Observability

### Application Monitoring

```
CloudWatch
├── Logs
│   ├── Frontend errors
│   ├── Backend API logs
│   └── ML service logs
├── Metrics
│   ├── API response time
│   ├── Error rates
│   ├── Request counts
│   └── ML processing time
└── Alarms
    ├── High error rate
    ├── Service unavailability
    └── Database connection issues
```

### Business Metrics

- Datasets processed per day
- Average data quality score
- Anomaly detection rate
- Alert generation rate
- Model prediction accuracy
- Decision risk distribution

---

## Deployment Architecture

See [AWS_DEPLOYMENT.md](../deployment/AWS_DEPLOYMENT.md) for detailed deployment architecture.

---

## Design Decisions & Trade-offs

### Why Microservices?

**Pros:**
- Independent scaling of ML service
- Technology flexibility (Python for ML, TypeScript for API)
- Isolated failures
- Clear separation of concerns

**Cons:**
- Increased complexity
- Network latency between services
- Requires container orchestration

**Decision:** Microservices are appropriate for this project due to distinct technology requirements and research flexibility.

### Why PostgreSQL?

**Pros:**
- Mature, reliable
- JSONB support for flexible schemas
- Strong ACID guarantees
- Prisma ORM support

**Cons:**
- Requires management (RDS helps)
- Limited horizontal scalability (not needed for this scale)

**Decision:** PostgreSQL provides the right balance of features and reliability for this project.

### Why REST over GraphQL?

**Pros:**
- Simpler to implement and understand
- Better caching
- Mature ecosystem
- Clear API contracts

**Cons:**
- Potential over-fetching
- Multiple round trips for complex queries

**Decision:** REST is sufficient for this project's requirements. GraphQL adds unnecessary complexity.

### Why ECS + Fargate over Kubernetes?

**Pros:**
- Lower operational overhead
- AWS-native integration
- Simpler for 4-person team
- Adequate for project scale

**Cons:**
- Less portable than Kubernetes
- Fewer advanced orchestration features

**Decision:** ECS + Fargate provides the right balance for a 12-week academic project with cloud deployment requirements.

---

## Future Enhancements

### Short-term (Post-Project)
- WebSocket support for real-time updates
- Advanced caching (Redis)
- Batch processing optimization
- More domain adapters

### Long-term (Research Extensions)
- Automated data repair
- Active learning for quality thresholds
- Multi-model ensembles
- Causal impact analysis
- Federated learning support

---

## References

- [API Documentation](../api/README.md)
- [Research Methodology](../research/METHODOLOGY.md)
- [AWS Deployment](../deployment/AWS_DEPLOYMENT.md)
- [Development Setup](../development/SETUP.md)

---

*Last Updated: 2026-09-14*
