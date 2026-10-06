# DataSentry-AI

**A Domain-Agnostic Data Reliability and Decision Impact Framework for Trustworthy AI**

[![License](https://img.shields.io/badge/License-Academic-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-In%20Development-yellow.svg)](https://github.com)

---

## 🎯 Project Vision

**DataSentry-AI** is a research-oriented, production-style, cloud-deployable platform that accepts heterogeneous datasets, evaluates their data quality and reliability, detects anomalies and drift, determines how data degradation affects downstream ML predictions, estimates decision impact/risk, explains the reasoning, and recommends appropriate actions.

### Central Research Question

> **"Don't just ask whether the data is bad.  
> Ask whether the data is bad enough to make the downstream AI decision unsafe."**

---

## 🔬 Research Contribution

Most data quality systems stop at:
- ✅ "Data quality score: 72%"

**DataSentry-AI continues to:**
- ✅ Data quality issue detected
- ✅ This feature is important to the model
- ✅ Prediction error increased by X%
- ✅ Downstream decision risk is HIGH
- ✅ **Recommended action: Human review**

### Innovation

The main research contribution is connecting:

```
DATA QUALITY
    ↓
DATA RELIABILITY
    ↓
MODEL IMPACT
    ↓
DECISION IMPACT
```

---

## 🏗️ System Architecture

```
                    ANY DATA SOURCE
                          │
         ┌────────────────┼────────────────┐
         │                │                │
        CSV             JSON            Excel
         │                │                │
         └────────────────┼────────────────┘
                          ↓
                   INGESTION LAYER
                          ↓
                  SCHEMA DISCOVERY
                          ↓
                   DATA PROFILING
                          ↓
                DATA QUALITY ENGINE
                          ↓
             ┌────────────┴─────────────┐
             ↓                          ↓
      ANOMALY DETECTION            DRIFT DETECTION
             │                          │
             └────────────┬─────────────┘
                          ↓
                 DATA RELIABILITY
                          ↓
                 MODEL EXPOSURE
                          ↓
                  MODEL IMPACT
                          ↓
                 DECISION IMPACT
                          ↓
                RISK CLASSIFICATION
                          ↓
                  RECOMMENDATION
                          ↓
                   EXPLANATION
                          ↓
                     DASHBOARD
```

---

## 🎓 Domain-Agnostic Design

DataSentry-AI is designed as a **domain-agnostic framework** with domain-specific adapters:

### Universal Core
- Data ingestion
- Schema discovery
- Profiling
- Quality assessment
- Anomaly detection
- Drift detection
- Reliability scoring
- Model exposure analysis
- Impact analysis
- Observability
- Explainability

### Domain Adapters
- **Retail** (Primary case study)
- Manufacturing (Future)
- Finance (Future)
- Logistics (Future)
- Healthcare (Future)
- IoT/Sensor Analytics (Future)

**Note:** This is NOT a multi-industry platform yet. Retail is our primary implementation to validate the research framework.

---

## 🛠️ Technology Stack

### Frontend
- **React** with TypeScript
- **Vite** (Build tool)
- **Tailwind CSS** (Styling)
- **ECharts** (Visualization)
- **Framer Motion** (Animations)
- **Lucide React** (Icons)
- **Axios** (HTTP client)
- **React Router** (Navigation)

### Backend
- **NestJS** with TypeScript
- **REST API**
- **Prisma ORM**
- **PostgreSQL**

### ML/Data Service
- **Python**
- **FastAPI**
- **pandas** & NumPy
- **scikit-learn**
- **LightGBM**
- **SHAP** (Explainability)
- **Isolation Forest** (Anomaly detection)

### Cloud Infrastructure (AWS)
- **Amazon S3** (Data storage)
- **Amazon RDS PostgreSQL** (Database)
- **Amazon ECR** (Container registry)
- **Amazon ECS + Fargate** (Container orchestration)
- **Application Load Balancer**
- **Amazon CloudWatch** (Monitoring)
- **AWS Secrets Manager** (Security)
- **Amazon VPC** (Network)
- **Amazon CloudFront** (CDN)

### DevOps
- **Docker** & Docker Compose
- **GitHub Actions** (CI/CD)

---

## 📊 Core Features

### 1. Data Ingestion
- Multi-format support (CSV, JSON, Excel)
- Schema auto-discovery
- Version tracking
- S3 storage integration

### 2. Data Profiling
- Statistical summaries
- Type inference
- Distribution analysis
- Missing value detection
- Cardinality analysis

### 3. Data Quality Engine
- **Completeness** - Missing value analysis
- **Validity** - Type and range validation
- **Consistency** - Cross-field validation
- **Uniqueness** - Duplicate detection
- **Timeliness** - Freshness checks
- **Distribution Stability** - Statistical consistency

### 4. Anomaly Detection
- Statistical outlier detection (IQR, robust methods)
- Isolation Forest
- Extreme value detection
- Spike detection
- Categorical anomalies

### 5. Drift Detection
- Numerical distribution drift
- Categorical distribution drift
- Missing pattern drift
- Schema drift
- PSI (Population Stability Index)

### 6. Data Reliability Scoring
- Composite reliability metric
- Component-wise scoring
- Configurable thresholds
- Temporal tracking

### 7. Model Exposure Analysis
- Feature importance mapping
- Quality-to-model impact linkage
- Exposure scoring

### 8. Model Impact Assessment
- Clean vs corrupted performance comparison
- MAE, RMSE, WMAPE metrics
- Prediction deviation analysis
- Confidence degradation

### 9. Decision Impact Analysis
- Domain-specific decision mapping
- Risk classification (LOW/MEDIUM/HIGH/CRITICAL)
- Business metric impact
- Decision recommendation

### 10. Explainability
- SHAP values
- Feature importance
- Root cause analysis
- Actionable recommendations

### 11. Alerting System
- Real-time alerts
- Severity classification
- Status tracking
- Alert history

### 12. Reporting
- Comprehensive reports
- Export capabilities
- Scheduled reports

---

## 🎨 Design System

### Color Palette

```css
Primary Colors:
- Deep Background: #190019
- Secondary Background: #2B124C
- Primary Purple: #522B5B
- Muted Purple: #854F6C
- Soft Pink: #DFB6B2
- Cream: #FBE4D8
```

### Design Principles
- Premium dark SaaS interface
- Glassmorphism effects
- Subtle gradients
- Elegant typography
- Spacious layouts
- Strong information hierarchy
- Smooth micro-interactions
- Accessible contrast ratios

---

## 📁 Project Structure

```
DataSentry-AI/
│
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── features/           # Feature modules
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── hooks/              # Custom hooks
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Utilities
│   └── Dockerfile
│
├── backend/                     # NestJS backend
│   ├── src/
│   │   ├── auth/
│   │   ├── datasets/
│   │   ├── quality/
│   │   ├── anomalies/
│   │   ├── drift/
│   │   ├── reliability/
│   │   ├── models/
│   │   ├── impact/
│   │   ├── decisions/
│   │   └── alerts/
│   ├── prisma/
│   └── Dockerfile
│
├── ml-service/                  # Python ML service
│   ├── app/
│   │   ├── api/
│   │   ├── profiling/
│   │   ├── quality/
│   │   ├── anomaly/
│   │   ├── drift/
│   │   ├── reliability/
│   │   ├── models/
│   │   ├── impact/
│   │   └── explainability/
│   ├── trained_models/
│   └── Dockerfile
│
├── datasets/                    # Sample datasets
│   ├── raw/
│   ├── processed/
│   └── corrupted/
│
├── experiments/                 # Research experiments
│   ├── corruption/
│   ├── results/
│   └── notebooks/
│
├── infrastructure/              # Infrastructure code
│   ├── docker/
│   ├── aws/
│   └── github-actions/
│
├── docs/                        # Documentation
│   ├── architecture/
│   ├── api/
│   └── research/
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
- PostgreSQL 14+
- AWS Account (for cloud deployment)

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd DataSentry-AI
```

2. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start with Docker Compose**
```bash
docker compose up --build
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- ML Service: http://localhost:8000

---

## 🔬 Research Experiments

### Controlled Corruption Framework

DataSentry-AI includes a research-grade corruption framework for validation:

1. **Clean baseline**
2. **10% degradation**
3. **25% degradation**
4. **50% degradation**

**Corruption types:**
- Missing values
- Invalid values
- Outliers
- Duplicates
- Distribution shift
- Schema changes

### Experimental Configurations

**Baseline:** Data → Model → Decision

**Quality-Aware:** Data → Quality Check → Model → Decision

**DataSentry:** Data → Quality → Reliability → Model Impact → Decision Impact → Action

---

## ☁️ AWS Deployment

### Architecture

```
                    INTERNET
                       │
                       ▼
                 CloudFront (CDN)
                       │
                       ▼
                 React (S3)
                       │
                       ▼
             Application Load Balancer
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
        NestJS (ECS)        FastAPI (ECS)
             │                   │
             └─────────┬─────────┘
                       ▼
              RDS PostgreSQL
                       
         S3 (Dataset Storage)
```

### Deployment Steps

See [docs/deployment/AWS_DEPLOYMENT.md](docs/deployment/AWS_DEPLOYMENT.md) for detailed instructions.

---

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

# ML service tests
cd ml-service
pytest
```

---

## 📊 Primary Use Case: Retail

The first complete implementation uses **retail sales forecasting** as the primary case study:

```
Sales Data
    ↓
Data Quality Assessment
    ↓
Demand Prediction Model
    ↓
Prediction Impact Analysis
    ↓
Inventory/Reorder Decision
    ↓
Decision Risk Classification
```

**Business Metrics:**
- Stockout risk
- Overstock cost
- Service level
- Inventory cost
- Decision error rate

---

## 🎯 12-Week Development Roadmap

| Phase | Weeks | Focus |
|-------|-------|-------|
| 1 | 1-2 | Architecture, database, foundations |
| 2 | 3-4 | Ingestion, storage, profiling, quality |
| 3 | 5-6 | Anomaly, drift, reliability |
| 4 | 7-9 | ML, model impact, decision impact |
| 5 | 10 | Recommendations, alerts, integration |
| 6 | 11 | AWS deployment, cloud infrastructure |
| 7 | 12 | Experiments, evaluation, documentation |

---

## ⚠️ Important Notes

### Research Framework

The impact scoring mechanism connecting data quality → model impact → decision impact is our **proposed research framework** and requires experimental validation. This is NOT a scientifically established standard.

### Domain Scope

While designed as domain-agnostic, the current implementation focuses on **retail** as the primary validated case study. Claims about other industries are architectural capabilities, not validated implementations.

### Demo vs Production

Clearly distinguish between:
- Demo/sample data (labeled as such)
- Actual experimental results
- Production capabilities

Never fabricate research metrics or performance improvements.

---

## 📖 Documentation

- [Architecture Overview](docs/architecture/OVERVIEW.md)
- [API Documentation](docs/api/README.md)
- [Research Methodology](docs/research/METHODOLOGY.md)
- [AWS Deployment Guide](docs/deployment/AWS_DEPLOYMENT.md)
- [Local Development Setup](docs/development/SETUP.md)

---

## 🤝 Team Roles

- **Software Architect & Full-Stack Engineer**: Architecture, integration, deployment
- **Data Engineer**: Ingestion, profiling, quality, anomaly, drift, reliability
- **ML Engineer**: Model training, prediction, impact analysis, explainability
- **Frontend Developer**: UI/UX, dashboard, visualization

---

## 🎓 Academic Context

**Project Type:** Final Year Engineering Project  
**Domain:** AI & Data Science  
**Duration:** 12 weeks  
**Team Size:** 4 members  
**Year:** 2026

---

## 📝 License

This is a final-year engineering research project for academic purposes.

---

## 🙏 Acknowledgments

This project represents our research contribution to the field of data reliability and trustworthy AI systems.

---

## 📧 Contact

For questions about this research project, please refer to the documentation and codebase.

---

**DataSentry-AI** - Trust Your Data. Confident Decisions.
