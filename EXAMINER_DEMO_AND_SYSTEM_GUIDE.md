# DataSentry-AI: Complete System Architecture, Dataset Ingestion & Examiner Live Demo Defense Guide

---

## 📋 Executive Overview & Value Proposition

**DataSentry-AI** is an enterprise-grade, full-stack Data Observability and Automated Reliability Engineering platform designed to mitigate the pervasive industry dilemma: **"Garbage In, Garbage Out" in AI and Decision Systems.**

In modern data-driven enterprises, machine learning models, executive dashboards, and automated downstream workflows fail silently due to unmonitored anomalies, distribution drift, corrupted schemas, and schema violations. Traditional data tests are static, brittle, and manually configured. 

**DataSentry-AI provides:**
1. **Automated Multi-Dimensional Profiling:** Instant statistical characterization of datasets across 6 rigorous quality pillars.
2. **Hybrid Anomaly Detection:** Combining unsupervised machine learning (Isolation Forest) with classical robust statistical algorithms (IQR, Z-Score, Spike Detection).
3. **Distribution Drift Quantification:** Mathematical baseline-versus-production distribution tracking using Population Stability Index (PSI), Kolmogorov-Smirnov (KS) tests, and Chi-Square goodness-of-fit.
4. **Data Reliability Index (DRI):** A unified 0–100 composite enterprise trust metric synthesizing quality, anomalies, drift, and pipeline timeliness.
5. **Downstream Decision Impact Simulation:** A "What-If" simulation engine that translates raw data corruption into quantified business revenue loss and ML model degradation ($\Delta \text{MAE}, \Delta \text{RMSE}$).

---

## 🏗️ Architectural Overview & Service Purpose

DataSentry-AI is built on a decoupled, microservices-oriented multi-tier architecture designed for horizontal scalability, high concurrency, and modular maintenance.

```
                                  ┌─────────────────────────────────────────┐
                                  │           Client Browser (SPA)          │
                                  │   React 18 + Vite + TailwindCSS + Lucide │
                                  │         http://localhost:3000           │
                                  └────────────────────┬────────────────────┘
                                                       │
                                            HTTP / REST / JWT Bearer
                                                       │
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │        NestJS API Gateway Backend       │
                                  │       TypeScript + Passport + Multer    │
                                  │         http://localhost:3001           │
                                  └───┬─────────────────────────────────┬───┘
                                      │                                 │
                     Prisma ORM Client│                                 │ Internal HTTP / JSON
                                      ▼                                 ▼
         ┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
         │       PostgreSQL Database Layer      │     │      Python ML Computation Engine    │
         │     Docker Container (Port 5433)     │     │      FastAPI + Scikit-Learn + SciPy  │
         │  Relational Storage, Metrics, Alerts │     │         http://localhost:8000        │
         └──────────────────────────────────────┘     └──────────────────────────────────────┘
```

---

### Detailed Service Breakdown

#### 1. Frontend Client Tier (React 18 + Vite + TypeScript)
- **Port / Location:** `http://localhost:3000` (`/frontend`)
- **Core Technologies:** React 18, Vite, TailwindCSS, Framer Motion, Recharts, Lucide Icons, Axios.
- **Primary Purpose:**
  - Delivers a low-latency, modern dark-mode glassmorphic user interface.
  - Interactive radar charts for the 6 quality dimensions.
  - Interactive histogram overlays for baseline vs. target drift visualization.
  - Granular anomaly triage tables with interactive resolution workflows.
  - What-if sliders and visualizers for Downstream Decision Impact modeling.

#### 2. Backend API Gateway & Business Logic Tier (NestJS)
- **Port / Location:** `http://localhost:3001` (`/backend`)
- **Core Technologies:** NestJS 10, TypeScript, Prisma ORM, Passport.js (JWT & Local Auth), Multer (Multipart Ingestion), Throttler (Rate Limiting), Swagger OpenAPI.
- **Primary Purpose:**
  - Serves as the central API gateway and orchestrator.
  - Manages secure user authentication, password hashing (bcrypt), and role-based access control (`ANALYST`, `ADMIN`).
  - Handles multipart file uploads up to 100MB, local disk staging, and S3-compatible cloud storage connectors.
  - Dispatches asynchronous compute tasks to the Python ML microservice upon dataset creation.
  - Aggregates metrics, triggers alerting thresholds, and generates executive compliance audit reports.

#### 3. ML & Statistical Computation Engine (FastAPI)
- **Port / Location:** `http://localhost:8000` (`/ml-service`)
- **Core Technologies:** Python 3.10+, FastAPI, Uvicorn, Pandas, NumPy, Scikit-Learn, SciPy, LightGBM, Joblib.
- **Primary Purpose:**
  - High-performance statistical and machine learning processing engine.
  - **Dataset Profiler:** Ingests raw tabular buffers and computes summary moments ($\mu, \sigma, \text{median}, \text{min}, \text{max}$, missing counts, distinct counts, data types).
  - **Quality Analyzer:** Computes the 6-dimensional data quality score.
  - **Anomaly Engine:** Runs unsupervised Isolation Forest, Z-score analysis, and IQR filtering on continuous and categorical data.
  - **Drift Analyzer:** Calculates PSI, KS-test statistics, and Jensen-Shannon distance between baseline and current data batches.
  - **Reliability Scorer:** Evaluates the composite weighted Data Reliability Index (DRI).
  - **Model Trainer & Impact Simulator:** Trains LightGBM regression models for retail forecasting and benchmarks prediction degradation under simulated data corruption.

#### 4. Relational Persistence Tier (PostgreSQL + Prisma)
- **Port / Location:** `localhost:5433` (Docker Container `datasentry-postgres`)
- **Primary Purpose:**
  - ACID-compliant relational storage for system entities: `User`, `Dataset`, `QualityMetric`, `Anomaly`, `DriftMetric`, `ReliabilityScore`, `Alert`, `Report`, `Model`, `ModelImpact`.
  - Maintains temporal historical records enabling trend analysis over multiple ingestion batches.

---

## 📥 How to Add / Ingest Datasets

DataSentry-AI supports tabular data formats including **CSV (`.csv`)**, **Excel (`.xlsx`, `.xls`)**, and **JSON (`.json`)**.

### Method 1: Upload via the Web Interface (Recommended for Live Demo)
1. Navigate to the web application: **`http://localhost:3000`**.
2. Log in using the analyst credentials:
   - **Email:** `analyst@datasentry.ai`
   - **Password:** `datasentry123`
3. Click on **"Datasets"** in the left sidebar navigation (`/datasets`).
4. Click the purple **"Upload Dataset"** button at the top right.
5. In the upload modal:
   - Drag and drop your `.csv` file or click **"Browse Files"**.
   - Provide a human-readable **Dataset Name** (e.g., `retail_q4_transactions.csv`).
   - Select the **Source Type** (CSV, Excel, or JSON).
   - *(Optional)* Specify a **Target Column** if you plan to run automated ML training (e.g., `sales_amount` or `demand`).
6. Click **"Upload & Run Analysis"**.
7. The system immediately uploads the file, stores it, and triggers background asynchronous execution of profiling, quality inspection, anomaly detection, and reliability scoring.

---

### Method 2: Ingest via REST API / cURL (Command Line or Automated Pipelines)

To simulate an automated ingestion pipeline (such as Airflow, Prefect, or Kafka batch consumers), use the REST endpoint `POST /api/datasets/upload`.

#### Step 1: Authenticate and obtain JWT Token
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"analyst@datasentry.ai","password":"datasentry123"}'
```
*Response returns:* `{"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...", "user": {...}}`

#### Step 2: Upload Dataset File with Token
```bash
curl -X POST http://localhost:3001/api/datasets/upload \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
  -F "file=@./sample_data/retail_sales_q3_2026.csv" \
  -F "name=retail_sales_q3_2026.csv" \
  -F "sourceType=CSV" \
  -F "description=Q3 Retail Sales Ingestion Batch"
```

#### Step 3: Trigger On-Demand Quality Analysis
```bash
curl -X POST http://localhost:3001/api/quality/analyze/<DATASET_ID> \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

---

### Method 3: Automated Python Ingestion Script
You can present this script to examiners to demonstrate enterprise pipeline compatibility:

```python
import requests

API_URL = "http://localhost:3001/api"

# 1. Login
auth_res = requests.post(f"{API_URL}/auth/login", json={
    "email": "analyst@datasentry.ai",
    "password": "datasentry123"
}).json()

token = auth_res["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. Upload Tabular Dataset
with open("retail_transactions.csv", "rb") as f:
    files = {"file": ("retail_transactions.csv", f, "text/csv")}
    data = {"name": "retail_transactions.csv", "sourceType": "CSV"}
    res = requests.post(f"{API_URL}/datasets/upload", headers=headers, files=files, data=data)
    dataset = res.json()
    print(f"Uploaded Dataset ID: {dataset['id']} | Status: {dataset['status']}")
```

---

## 🧠 Scientific & Mathematical Deep-Dive: Algorithms & Metrics

When defending the project, examiners often ask: *"What math or machine learning are you actually using?"* Use this section for rigorous technical justification.

### 1. Data Quality Analysis (6 Core Dimensions)
The overall Data Quality Score $Q \in [0, 100]$ is computed as a weighted combination:

$$Q = 0.20 \cdot S_{\text{completeness}} + 0.20 \cdot S_{\text{validity}} + 0.15 \cdot S_{\text{consistency}} + 0.15 \cdot S_{\text{uniqueness}} + 0.15 \cdot S_{\text{timeliness}} + 0.15 \cdot S_{\text{distribution}}$$

| Dimension | Weight | Mathematical / Algorithmic Formulation | Description |
| :--- | :---: | :--- | :--- |
| **Completeness** | 20% | $S_{\text{comp}} = \left(1 - \frac{\sum \text{Null Cells}}{\text{Total Cells}}\right) \times 100$ | Evaluates missing data across all columns. Flags high severity if a column has $>50\%$ missing values. |
| **Validity** | 20% | $S_{\text{val}} = \left(1 - \frac{\sum \text{Type or Range Violations}}{\text{Total Validated Cells}}\right) \times 100$ | Verifies data type conformance and boundary ranges (e.g., negative age, non-standard emails). |
| **Consistency** | 15% | $S_{\text{cons}} = \left(1 - \frac{\text{Violations}}{\text{Cross-field Rules}}\right) \times 100$ | Verifies inter-column relational logic (e.g., $\text{End Date} \ge \text{Start Date}$, $\text{Total} = \text{Price} \times \text{Quantity}$). |
| **Uniqueness** | 15% | $S_{\text{uniq}} = \left(1 - \frac{\text{Duplicate Rows}}{\text{Total Rows}}\right) \times 100$ | Identifies full-row and key-column duplicates. |
| **Timeliness** | 15% | $S_{\text{time}} = \max\left(0, 100 - \frac{\Delta t_{\text{hours}}}{\text{Threshold}} \times 20\right)$ | Measures data latency: time elapsed since the latest record timestamp relative to SLA. |
| **Distribution** | 15% | $S_{\text{dist}} = 100 - (\text{Skewness Penalty} + \text{Kurtosis Penalty})$ | Evaluates statistical distribution sanity and unexpected variance collapse. |

---

### 2. Multivariate Anomaly Detection Engine

DataSentry-AI uses an ensemble of unsupervised machine learning and robust statistics:

#### A. Isolation Forest (Multivariate Machine Learning)
- **Algorithm:** Scikit-Learn `IsolationForest(n_estimators=100, contamination=0.10, random_state=42)`.
- **Mechanism:** Isolates observations by randomly selecting a feature and randomly selecting a split value between the maximum and minimum values. Anomalous points require significantly fewer partitions (shorter tree depth) to isolate than normal points.
- **Score:** Anomalies are flagged where path length $h(x) < \mathbb{E}(h(x))$.

#### B. Interquartile Range (IQR) Outlier Detection
- **Mechanism:** For continuous feature $X$, computes $Q_1$ (25th percentile) and $Q_3$ (75th percentile).
- **Interquartile Range:** $\text{IQR} = Q_3 - Q_1$
- **Lower Bound:** $L = Q_1 - 1.5 \cdot \text{IQR}$
- **Upper Bound:** $U = Q_3 + 1.5 \cdot \text{IQR}$
- **Flagged when:** $x_i < L \lor x_i > U$.

#### C. Z-Score (Standardized Outliers)
- **Mechanism:** Standardizes observations: $z_i = \frac{x_i - \mu}{\sigma}$.
- **Threshold:** Points with $|z_i| > 3.0$ ($>3$ standard deviations from mean) are flagged as severe anomalies.

---

### 3. Data & Concept Drift Quantification

To detect silent data pipeline failures (where data conforms to schema but its underlying probabilistic distribution has shifted), DataSentry-AI computes two complementary metrics:

#### A. Population Stability Index (PSI)
Used for continuous numerical distributions between baseline ($B$) and current ($C$) partitions across $K=10$ quantile bins:

$$\text{PSI} = \sum_{k=1}^{K} \left( \text{Actual}_k - \text{Expected}_k \right) \times \ln\left( \frac{\text{Actual}_k + \epsilon}{\text{Expected}_k + \epsilon} \right)$$

- $\text{PSI} < 0.10$: **No Significant Shift** (Green / Healthy)
- $0.10 \le \text{PSI} < 0.20$: **Moderate Shift** (Yellow / Warning - Retraining Recommended)
- $\text{PSI} \ge 0.20$: **Severe Distribution Drift** (Red / Critical - Pipeline / Model Action Required)

#### B. Two-Sample Kolmogorov-Smirnov (KS) Test
A non-parametric test comparing continuous empirical cumulative distribution functions $F_B(x)$ and $F_C(x)$:

$$D = \sup_{x} |F_B(x) - F_C(x)|$$

- If $p\text{-value} < 0.05$ and $D > \text{critical threshold}$, we reject the null hypothesis and confirm statistical drift.

---

### 4. Data Reliability Index (DRI) Formulation

The **Data Reliability Index (DRI)** is a single composite metric (0 to 100) representing overall data health for enterprise stakeholders:

$$\text{DRI} = 0.35 \cdot S_{\text{quality}} + 0.25 \cdot S_{\text{anomaly}} + 0.25 \cdot S_{\text{drift}} + 0.15 \cdot S_{\text{timeliness}}$$

Where:
- $S_{\text{quality}} = \text{Composite Quality Score} \in [0, 100]$
- $S_{\text{anomaly}} = \left(1 - \min\left(\frac{N_{\text{anomalies}}}{N_{\text{rows}}}, 1.0\right)\right) \times 100$
- $S_{\text{drift}} = \left(1 - \min\left(\frac{N_{\text{drifting\_cols}}}{\max(10, N_{\text{rows}} \times 0.001)}, 1.0\right)\right) \times 100$
- $S_{\text{timeliness}} = \text{Freshness Score} \in [0, 100]$

**Categorical Health Status:**
- **$\ge 90$:** `EXCELLENT` (Low Risk - Safe for Production AI & BI)
- **$75 - 89$:** `GOOD` (Low Risk)
- **$60 - 74$:** `FAIR` (Medium Risk - Warning Alert Dispatched)
- **$40 - 59$:** `POOR` (High Risk)
- **$< 40$:** `CRITICAL` (Immediate Action Required)

---

### 5. Downstream Decision Impact Simulation

Examiners are consistently impressed by the translation of technical anomalies into business metrics. DataSentry-AI uses a trained **LightGBM Regressor** to model:

1. **Baseline Model Performance:** Evaluates clean test partition: $\text{MAE}_{\text{clean}}, \text{RMSE}_{\text{clean}}$.
2. **Corrupted Model Performance:** Injects simulated data anomalies (null spikes, drift scaling, categorical noise): $\text{MAE}_{\text{corrupt}}, \text{RMSE}_{\text{corrupt}}$.
3. **Performance Degradation Percentage:**

$$\Delta \text{MAE} (\%) = \left( \frac{\text{MAE}_{\text{corrupt}} - \text{MAE}_{\text{clean}}}{\text{MAE}_{\text{clean}}} \right) \times 100$$

4. **Financial Revenue Impact Formula:**

$$\text{Estimated Revenue At Risk} = \text{Total Inventory Value} \times \left( \frac{\Delta \text{MAE}}{100} \right) \times \text{Over/Under-stocking Penalty Factor}$$

---

## 🎬 Step-by-Step Live Demo Script for the Examiner

Follow this exact chronological script during your live defense to guarantee a polished, professional, and convincing demonstration.

---

### Step 0: Pre-Flight Checklist (Do this 5 minutes before demo)
Ensure all services are running:
1. **PostgreSQL Container:** `docker ps` shows `datasentry-postgres` healthy on port `5433`.
2. **ML Service:** `http://localhost:8000/api/health` returns `{"status":"ok"}`.
3. **Backend API:** `http://localhost:3001/api/health` returns `{"status":"ok"}`.
4. **Frontend UI:** Open `http://localhost:3000` in Google Chrome or Edge.

---

### Step 1: Introduction & High-Level Narrative (Time: 1 - 2 mins)
*What to say to the Examiner:*
> *"Good morning / afternoon. Today I am presenting **DataSentry-AI**, an end-to-end Data Observability and Automated Reliability Engineering platform.*
> 
> *In production machine learning and enterprise analytics, teams often spend 80% of their time debugging silent data issues—corrupted values, schema shifts, or distribution drift that degrade business decisions without throwing standard database errors.*
> 
> *DataSentry-AI automatically monitors data pipelines, scores dataset trustworthiness via a Data Reliability Index (DRI), pinpoints anomalies using machine learning, and calculates the exact downstream financial risk caused by corrupted data."*

---

### Step 2: Authentication & Role-Based Access Control (Time: 1 min)
*Action:*
- Open `http://localhost:3000/login`.
- Enter:
  - **Email:** `analyst@datasentry.ai`
  - **Password:** `datasentry123`
- Click **"Sign In"**.

*Talking Points:*
- *"The platform enforces stateless JWT Bearer token authentication secured with bcrypt password hashing."*
- *"We implement Role-Based Access Control (RBAC) supporting Analyst and Admin roles to isolate dataset management and system configuration."*

---

### Step 3: Executive Dashboard Overview (Time: 2 mins)
*Action:*
- You are now on the `/dashboard` page.
- Point out the **Metric Scorecards**, **Data Reliability Score Gauge**, **Recent Alerts**, and **Quality Trend Chart**.

*Talking Points:*
- *"Here on the central Executive Dashboard, leadership and engineers immediately see high-level KPIs: Total Datasets Monitored (24), Active Anomalies (12), Drift Incidents (3), and the aggregate Reliability Score."*
- *"Notice the color-coded health badges (`HEALTHY`, `WARNING`, `CRITICAL`). If an ingestion batch fails our reliability thresholds, the system flags it in real time."*

---

### Step 4: Datasets Management & Ingestion (Time: 2 mins)
*Action:*
- Navigate to `/datasets` via the sidebar.
- Show the table listing datasets: `retail_sales_q3_2026.csv`, `inventory_snapshot.xlsx`, `product_catalog.json`.
- Point out the quick filters for status (`Healthy`, `Warning`, `Critical`) and the search bar.
- Click on `retail_sales_q3_2026.csv` to open its detail view (`/datasets/1`).

*Talking Points:*
- *"The Datasets module provides centralized metadata management—tracking row counts, column types, file sizes, and historical quality scores."*
- *"When a dataset is uploaded via our drag-and-drop modal or REST API, the backend stages the file and asynchronously dispatches it to our Python ML engine for multi-stage statistical profiling."*

---

### Step 5: The 6 Dimensions of Data Quality (Time: 3 mins)
*Action:*
- Click on **"Data Quality"** in the sidebar (`/quality`) or view the quality tab in Dataset Details.
- Highlight the **Radar Chart** displaying Completeness, Validity, Consistency, Uniqueness, Timeliness, and Distribution.
- Scroll down to the **Column-Level Quality Table**.

*Talking Points:*
- *"Data quality cannot be reduced to a single binary check. DataSentry-AI evaluates data across six rigorous dimensions."*
- *"For example, in Completeness, we measure null density per feature. In Validity, we test type conformance. In Consistency, we validate relational integrity between columns."*
- *"In this dataset, notice that `discount_percent` triggered a warning because 8.5% of records violated the standard bounded range [0.0, 1.0]."*

---

### Step 6: Multivariate Machine Learning Anomaly Detection (Time: 3 mins)
*Action:*
- Click on **"Anomalies"** in the sidebar (`/anomalies`).
- Point out the summary cards (Total Anomalies, Critical, High, Resolved).
- Expand an anomaly card (e.g., *IsolationForest outlier on sales_amount* or *Z-Score spike*).
- Click the **"Resolve"** or **"Acknowledge"** button to demonstrate interactive triage.

*Talking Points:*
- *"Standard threshold alerts fail when multiple variables together create an anomaly. For this reason, we employ an **Isolation Forest** unsupervised machine learning model."*
- *"Isolation Forest builds 100 decision trees to isolate rare data points with short tree depths."*
- *"We complement this with **Interquartile Range (IQR)** and **Z-score** methods for univariate outliers, providing clear explanations for why a data point was flagged."*

---

### Step 7: Data & Concept Drift Analysis (Time: 3 mins)
*Action:*
- Click on **"Drift Analysis"** in the sidebar (`/drift`).
- Point out the baseline vs. current comparison selector.
- Show the **Distribution Histogram Comparison Chart** for features like `unit_price` or `customer_age`.
- Point out the calculated **PSI (Population Stability Index)** and **KS-Test p-value**.

*Talking Points:*
- *"Data drift occurs when the statistical properties of production input data change over time, degrading model accuracy even if no software bug exists."*
- *"We calculate the **Population Stability Index (PSI)** across 10 quantile bins. A PSI greater than 0.20 indicates severe distribution shift."*
- *"We also run the **Two-Sample Kolmogorov-Smirnov (KS) test** to provide a rigorous $p$-value indicating whether the baseline and current distributions are statistically identical."*

---

### Step 8: Data Reliability Index (DRI) & Governance (Time: 2 mins)
*Action:*
- Click on **"Data Reliability"** in the sidebar (`/reliability`).
- Show the composite score breakdown: Quality (35%), Anomaly Density (25%), Distribution Drift (25%), and Timeliness (15%).

*Talking Points:*
- *"The Data Reliability Index (DRI) is our single source of truth for pipeline governance. Instead of inspecting dozens of charts, data leaders have an automated 0–100 reliability score."*
- *"This score feeds automated gating rules: if DRI drops below 75, downstream automated model deployments can be automatically paused."*

---

### Step 9: Downstream Decision Impact Simulation (The "Killer Feature") (Time: 3 mins)
*Action:*
- Click on **"Decision Impact"** or **"Model Impact"** in the sidebar (`/decision-impact` or `/model-impact`).
- Show the **LightGBM Demand Forecasting Model** benchmark.
- Adjust the **Simulated Data Corruption Slider** (e.g., inject 10% missing values or 20% price drift).
- Observe the real-time recalculated metrics:
  - Baseline MAE vs. Degraded MAE
  - Error Increase ($\Delta \text{MAE} +34.2\%$)
  - Projected Revenue at Risk (\$142,500)

*Talking Points:*
- *"This is our Decision Impact Simulator—bridging the gap between raw data engineering and business ROI."*
- *"We trained a LightGBM regression model on clean data. Using this simulator, we can inject synthetic anomalies and immediately observe how model error escalates and what that translates to in estimated revenue loss."*
- *"This allows data teams to justify data quality investments in clear financial terms."*

---

### Step 10: Automated Alerts, Reports & Conclusion (Time: 1 - 2 mins)
*Action:*
- Click on **"Alerts"** (`/alerts`) and **"Reports"** (`/reports`).
- Show the active alert channels (Slack / Email / Webhook simulation) and click **"Generate PDF / Summary Report"**.

*Talking Points:*
- *"Finally, when thresholds are breached, alerts are automatically dispatched with full root-cause diagnostic payloads."*
- *"In conclusion, DataSentry-AI transforms passive data warehouses into active, self-observing, and reliable data platforms. Thank you, and I am now ready for your questions."*

---

## 🛡️ Examiner Defense Q&A: Master Cheat-Sheet

Here are 15 tough technical and theoretical questions examiners frequently ask, along with comprehensive model answers.

---

### Q1: Why did you choose a microservices architecture instead of putting everything in a single Python monolith or NestJS monolith?
**Answer:**
> *"We separated the concerns based on computational paradigms:*
> 1. *Python is the industry gold standard for numerical computing, vectorized linear algebra, and machine learning (NumPy, Pandas, Scikit-Learn, LightGBM, SciPy).*
> 2. *NestJS (Node.js) provides an enterprise-grade, strongly typed, asynchronous I/O API gateway optimized for concurrent client requests, WebSocket streaming, JWT authentication, and structured dependency injection.*
> 3. *This decoupling allows the ML computation engine to scale independently on GPU/high-memory compute nodes, while the NestJS API gateway scales on lightweight I/O nodes without blocking."*

---

### Q2: Why use Isolation Forest over traditional clustering (like DBSCAN or K-Means) for anomaly detection?
**Answer:**
> *"Clustering algorithms like K-Means or DBSCAN have computational complexity of $O(n^2)$ or require distance metric calculations across high-dimensional feature spaces, suffering from the curse of dimensionality.*
> *Isolation Forest has linear time complexity $O(t \cdot \psi \log \psi)$ where $t$ is number of trees and $\psi$ is subsample size. It does not calculate pairwise distances; instead, it exploits the mathematical reality that anomalies are 'few and different' and thus isolated close to the root of random decision trees."*

---

### Q3: How do you handle missing values or non-numeric data when computing PSI and KS tests?
**Answer:**
> *"For numeric columns, missing values are isolated into a dedicated missingness bin or imputed with the baseline median during continuous density estimation. For categorical features, we do not use the KS-test (which requires continuous ordered variables); instead, we compute the **Chi-Square Goodness of Fit test** and **Categorical PSI** over discrete frequency distributions."*

---

### Q4: How is the Data Reliability Index (DRI) weighted, and can organizations customize these weights?
**Answer:**
> *"The default DRI formula allocates 35% to Data Quality, 25% to Anomalies, 25% to Drift, and 15% to Timeliness based on empirical reliability engineering benchmarks.*
> *However, our `ReliabilityScorer` in the ML service and NestJS configuration accept a customizable weights dictionary, allowing high-frequency algorithmic trading teams to weight Timeliness and Drift higher, while healthcare records teams weight Completeness and Validity higher."*

---

### Q5: How do you prevent large dataset uploads from blocking the server?
**Answer:**
> *"We use a three-tier protection approach:*
> 1. *Multer streams files directly to disk or temporary block storage without loading the full buffer into Node.js V8 heap memory.*
> 2. *The NestJS controller returns an immediate `202 Accepted` response with the created dataset record.*
> 3. *The dataset processing is executed asynchronously in the background via non-blocking promises and can be backed by a BullMQ / Redis worker queue for distributed worker pools."*

---

### Q6: What is the difference between Data Drift and Concept Drift?
**Answer:**
> *"**Data Drift (Covariate Shift)** occurs when the input distribution $P(X)$ changes over time while the conditional ground-truth relationship $P(Y \mid X)$ remains unchanged (e.g., customer demographics change).*
> * **Concept Drift** occurs when the statistical relationship between input features and target labels $P(Y \mid X)$ changes, even if $P(X)$ remains identical (e.g., macroeconomic inflation changes purchasing power for the same income brackets).*
> *DataSentry-AI monitors Data Drift via PSI/KS tests and Concept Drift via Model Impact Performance Degradation ($\Delta \text{MAE}$).*"*

---

### Q7: What security protections are implemented in DataSentry-AI?
**Answer:**
> *"1. **Authentication & Session:** Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256 and expiration timeouts.*
> *2. **Password Security:** Salted one-way password hashing using bcrypt with 10 salt rounds.*
> *3. **Rate Limiting:** NestJS Throttler guards protecting authentication and computation endpoints against brute-force and DoS attacks.*
> *4. **SQL Injection Prevention:** Prisma ORM parameterized queries completely prevent raw SQL string concatenation.*
> *5. **CORS Isolation:** Strict Origin policies restricting API access exclusively to trusted frontend domains."*

---

### Q8: What database indices are used to ensure query performance as metrics grow?
**Answer:**
> *"Our PostgreSQL Prisma schema defines composite indices on foreign keys and temporal fields, including `@@index([datasetId])`, `@@index([createdAt])`, and unique constraints on `user.email`. This ensures that timeseries lookups for quality history execute in $O(\log n)$ index scans rather than $O(n)$ table scans."*

---

### Q9: Why use LightGBM for the downstream decision impact model instead of a simple Linear Regression or Deep Neural Network?
**Answer:**
> *"LightGBM (Gradient Boosted Decision Trees) uses leaf-wise tree growth with Histogram-based splitting, providing state-of-the-art accuracy on tabular structured data with fast training times. Unlike linear regression, it captures complex non-linear feature interactions and threshold effects; unlike deep neural networks, it requires no extensive hyperparameter tuning and provides native feature importance metrics."*

---

### Q10: How would you scale this system to handle terabyte-scale streaming data (e.g., Apache Spark or Kafka)?
**Answer:**
> *"For streaming terabyte-scale architectures:*
> 1. *Replace single-node Pandas processing with **Apache PySpark / Databricks** or **DuckDB** for distributed out-of-core profiling.*
> 2. *Implement approximate streaming algorithms, such as **HyperLogLog** for distinct cardinality and **t-digest / Q-digest** for quantile and percentiles.*
> 3. *Attach Kafka consumer groups to the ingestion layer to process micro-batches against sliding time windows."*

---

## 📑 Service Port & Endpoint Reference Table

| Service | Protocol | Host / Port | Key Endpoints | Documentation URL |
| :--- | :---: | :---: | :--- | :--- |
| **Frontend UI** | HTTP | `http://localhost:3000` | `/dashboard`, `/datasets`, `/quality`, `/anomalies`, `/drift`, `/reliability`, `/decision-impact` | N/A |
| **Backend API** | HTTP / REST | `http://localhost:3001` | `/api/auth/login`, `/api/datasets/upload`, `/api/quality/analyze/:id`, `/api/drift/analyze` | `http://localhost:3001/api/docs` (Swagger) |
| **ML Engine** | HTTP / REST | `http://localhost:8000` | `/api/profile`, `/api/quality`, `/api/anomaly`, `/api/drift`, `/api/reliability`, `/api/models/train` | `http://localhost:8000/docs` (FastAPI Swagger) |
| **PostgreSQL** | TCP | `localhost:5433` | Database: `datasentry_db` (User: `datasentry_user`) | Docker Container |

---

*DataSentry-AI — Built for Trustworthy Data, Confident AI, and Resilient Engineering.*
