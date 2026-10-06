# 🛡️ DataSentry-AI — Complete Step-by-Step Execution Guide

This document contains the exact setup, configuration, and launch instructions for the **DataSentry-AI** 4-tier autonomous data quality and telemetry platform.

---

## 🏗️ Architecture & Port Mapping

| Tier | Service | Technology Stack | Port | Health / Status Endpoint |
|---|---|---|---|---|
| **Database** | PostgreSQL 14 + TimescaleDB | Docker / Alpine | `5433:5432` | `localhost:5433` |
| **Backend** | API Gateway & Orchestrator | NestJS 10, Prisma ORM, Multer | `3001` | `http://localhost:3001/api/health` |
| **ML Engine** | Statistical & Anomaly Service | Python 3.10+, FastAPI, Scikit-Learn | `8000` | `http://localhost:8000/health` |
| **Frontend** | Interactive SPA & Dashboards | React 18, Vite, Framer Motion, ECharts | `3000` | `http://localhost:3000` |

---

## 🚀 Quick Launch (Single Command)

We have provided an automated PowerShell script that tests prerequisites, starts Docker PostgreSQL on port 5433, checks Prisma database schema, starts the Python FastAPI ML service, launches the NestJS API gateway, and opens the React UI in separate dedicated terminal windows:

```powershell
# Open PowerShell in the project root directory
cd C:\Users\Rohan\Downloads\projects\Test-omniroute\DataSentry-AI
.\run_datasentry.ps1
```

---

## 🛠️ Manual Step-by-Step Execution

### Step 1: Start PostgreSQL via Docker Compose

```powershell
cd C:\Users\Rohan\Downloads\projects\Test-omniroute\DataSentry-AI

# Start Postgres on host port 5433 (mapping to container port 5432)
docker compose up -d postgres
```

Verify container status:
```powershell
docker compose ps
```

---

### Step 2: Configure & Start NestJS Backend API Gateway

1. Navigate to the backend directory:
   ```powershell
   cd C:\Users\Rohan\Downloads\projects\Test-omniroute\DataSentry-AI\backend
   ```

2. Verify environment configuration (`backend/.env`):
   ```env
   PORT=3001
   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/datasentry?schema=public"
   JWT_SECRET="super-secret-jwt-token-datasentry-ai-2026"
   ML_SERVICE_URL="http://localhost:8000"
   UPLOAD_DIR="./uploads"
   ```

3. Generate Prisma client & apply database migrations:
   ```powershell
   npx prisma generate
   npx prisma db push
   ```

4. Build and start the backend service:
   ```powershell
   npm run start:dev
   ```
   *The backend will boot on `http://localhost:3001` and expose Swagger documentation at `http://localhost:3001/api`.*

---

### Step 3: Setup & Start Python FastAPI ML Engine

1. Open a new terminal and navigate to the ML service directory:
   ```powershell
   cd C:\Users\Rohan\Downloads\projects\Test-omniroute\DataSentry-AI\ml-service
   ```

2. Activate the Python virtual environment:
   ```powershell
   # If using venv:
   .\venv\Scripts\Activate.ps1
   # Or directly install dependencies:
   pip install -r requirements.txt
   ```

3. Launch the FastAPI server via Uvicorn:
   ```powershell
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   *Interactive Swagger docs will be available at `http://localhost:8000/docs`.*

---

### Step 4: Launch React 18 Frontend Application

1. Open a third terminal and navigate to the frontend directory:
   ```powershell
   cd C:\Users\Rohan\Downloads\projects\Test-omniroute\DataSentry-AI\frontend
   ```

2. Verify frontend environment settings (`frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

3. Start Vite development server:
   ```powershell
   npm run dev
   ```
   *Access the web UI at `http://localhost:3000`.*

---

## 📊 Live Testing & Dataset Verification

### 1. Ingesting Sample Datasets
In the web UI at `http://localhost:3000`:
- Click **"Upload Dataset"** on the **Dashboard** or **Datasets** page.
- Select or drag-and-drop sample datasets provided in the repository:
  - `sample_datasets/retail_sales_clean.csv` (High quality baseline)
  - `sample_datasets/sensor_readings_with_anomalies.csv` (Thermal spikes, voltage drops)
  - `sample_datasets/retail_sales_q3_2026.csv` (Drift and quantity anomalies)

### 2. Live Quality & Telemetry Verification
- **Datasets View (`/datasets`):** View status badges (`PROCESSING` ➔ `HEALTHY` / `WARNING` / `CRITICAL`).
- **Dataset Inspector (`/datasets/:id`):** 6D Quality Radar charts, column schemas, distribution histograms.
- **6D Quality Audit (`/quality`):** Completeness, Validity, Consistency, Uniqueness, Timeliness, Distribution.
- **Anomaly Radar (`/anomalies`):** Isolation Forest, Z-Score ($|z| > 3.0$), and IQR ($1.5 \times \text{IQR}$) filters.
- **Statistical Drift (`/drift`):** Population Stability Index (PSI) and Kolmogorov-Smirnov (KS) tests.
- **Reliability Engine (`/reliability`):** Real-time calculation of the composite trust index:
  $$\text{Reliability} = (0.30 \times \text{Quality}) + (0.25 \times \text{AnomalyFree}) + (0.25 \times \text{DriftStability}) + (0.20 \times \text{Completeness})$$
- **Incident Dispatcher (`/alerts`):** Acknowledge, triage, and resolve telemetry anomalies.
