# 🛡️ Steps to Run DataSentry-AI — Complete Command Guide

This file contains all the exact commands required to run, seed, manage, and verify the **DataSentry-AI** project across different environments and workflows.

---

## 📌 Quick Access & Default Credentials

- **Frontend Web UI:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:3001/api](http://localhost:3001/api)
- **Backend Swagger Docs:** [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **ML Service API:** [http://localhost:8000/api](http://localhost:8000/api)
- **ML Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL Port:** `5433` (Host) -> `5432` (Docker Container)
- **Demo User Email:** `analyst@datasentry.ai`
- **Demo User Password:** `demo123`
- **Database Username:** `datasentry_user`
- **Database Password:** `datasentry_password`
- **Database Name:** `datasentry_db`

---

## 🐳 Method 1: Run with Docker Compose (Recommended & Fastest)

All 4 services (PostgreSQL, ML Service, Frontend, Backend) run in isolated containers with automatic networking.

### 1. Navigate to the project directory
```powershell
cd C:\Users\Rohan\Downloads\projects\Test-omniroute\DataSentry-AI
```

### 2. Start all services in background
```powershell
docker compose up -d
```
*(To build freshly from source, use: `docker compose up -d --build`)*

### 3. Seed demo data into the database
```powershell
docker exec datasentry-backend npm run prisma:seed
```

### 4. Check running containers
```powershell
docker ps --filter "name=datasentry"
```

### 5. View live logs
```powershell
# All containers
docker compose logs -f

# Specific containers
docker logs -f datasentry-backend
docker logs -f datasentry-ml-service
docker logs -f datasentry-frontend
docker logs -f datasentry-postgres
```

### 6. Stop all services
```powershell
docker compose down
```

---

## 💻 Method 2: Run Locally / Natively (Multi-Terminal Development)

Run each service natively on your machine for active local development and hot-reloading.

### Step 1: Start PostgreSQL (Docker)
```powershell
cd C:\Users\Rohan\Downloads\projects\Test-omniroute\DataSentry-AI
docker compose up postgres -d
```

---

### Step 2: Start Backend (NestJS) — [Open Terminal 1]
```powershell
cd C:\Users\Rohan\Downloads\projects\Test-omniroute\DataSentry-AI\backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Synchronize database schema
npx prisma db push

# Seed initial demo analyst & datasets
npm run prisma:seed

# Start backend dev server
npm run start:dev
```

---

### Step 3: Start ML Service (Python / FastAPI) — [Open Terminal 2]
```powershell
cd C:\Users\Rohan\Downloads\projects\Test-omniroute\DataSentry-AI\ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Upgrade pip & install requirements
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

### Step 4: Start Frontend (React + Vite) — [Open Terminal 3]
```powershell
cd C:\Users\Rohan\Downloads\projects\Test-omniroute\DataSentry-AI\frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

---

## 🔍 Verification & Health Check Commands

Run these commands in PowerShell to test and verify that every service is responding:

### 1. Test Backend Health Check API
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/health"
```
**Expected Response:**
```json
{
  "status": "ok",
  "service": "DataSentry-AI Backend",
  "version": "1.0.0"
}
```

### 2. Test ML Service Health Check API
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/health"
```
**Expected Response:**
```json
{
  "status": "ok",
  "service": "DataSentry-AI ML Service",
  "version": "1.0.0"
}
```

### 3. Test Demo User Login API
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"analyst@datasentry.ai","password":"demo123"}'
```
**Expected Response:**
```json
{
  "user": {
    "email": "analyst@datasentry.ai",
    "name": "Demo Analyst",
    "role": "ANALYST"
  },
  "access_token": "eyJhbGciOi..."
}
```

### 4. Test Frontend Web Server
```powershell
Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing | Select-Object StatusCode
```
**Expected Response:** `200`

---

## 🗄️ Database Management Commands

Run from `C:\Users\Rohan\Downloads\projects\Test-omniroute\DataSentry-AI\backend`:

### Launch Prisma Studio (Visual Web Interface for Database)
```powershell
npx prisma studio
```
*Opens visual database browser at [http://localhost:5555](http://localhost:5555)*

### Apply New Migrations
```powershell
npx prisma migrate dev
```

### Reset Database & Reseed
```powershell
npx prisma migrate reset
```

---

## 🧪 Testing & Code Quality Commands

### Run Backend Tests
```powershell
cd C:\Users\Rohan\Downloads\projects\Test-omniroute\DataSentry-AI\backend
npm test
```

### Run ML Service Unit Tests
```powershell
cd C:\Users\Rohan\Downloads\projects\Test-omniroute\DataSentry-AI\ml-service
pytest
```

### Run Frontend Lint & Build Check
```powershell
cd C:\Users\Rohan\Downloads\projects\Test-omniroute\DataSentry-AI\frontend
npm run build
```

---

## ⚠️ Troubleshooting & Port Configurations

- **Port 5432 Already in Use:**  
  The `.env` is configured with `POSTGRES_PORT=5433` so that the docker postgres service maps to port `5433` on your host machine to prevent collisions with any existing local PostgreSQL installations.
- **Docker Compose restart:**
  ```powershell
  docker compose down
  docker compose up -d
  ```
