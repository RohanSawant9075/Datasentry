# DataSentry-AI - Quick Start Guide

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.10+ ([Download](https://python.org/))
- **Docker** & Docker Compose ([Download](https://docker.com/))
- **PostgreSQL** 14+ (or use Docker)

---

## 📦 Installation

### Option 1: Docker Compose (Recommended)

```bash
# 1. Clone or navigate to project
cd DataSentry-AI

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env file with your settings
# Set DATABASE_URL, JWT_SECRET, AWS credentials, etc.

# 4. Start all services
docker compose up --build

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001/api
# - ML Service: http://localhost:8000/api
# - API Docs: http://localhost:3001/api/docs
```

### Option 2: Manual Setup

#### Backend (NestJS)

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run start:dev

# API will be available at http://localhost:3001/api
# Swagger docs at http://localhost:3001/api/docs
```

#### ML Service (Python/FastAPI)

```bash
cd ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# API will be available at http://localhost:8000/api
# Docs at http://localhost:8000/docs
```

#### Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Application will be available at http://localhost:3000
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Backend
DATABASE_URL=postgresql://datasentry_user:datasentry_password@localhost:5432/datasentry_db
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
PORT=3001

# ML Service
ML_SERVICE_URL=http://localhost:8000

# AWS (Optional for local development)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET_DATASETS=datasentry-datasets-dev

# Frontend
VITE_API_URL=http://localhost:3001/api
```

---

## 🗄️ Database Setup

### Using Docker (Easiest)

```bash
# PostgreSQL is included in docker-compose.yml
docker compose up postgres
```

### Manual PostgreSQL Setup

```bash
# Create database
createdb datasentry_db

# Run Prisma migrations
cd backend
npx prisma migrate dev
```

---

## 📊 Verify Installation

### 1. Check Backend

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "DataSentry-AI Backend",
  "version": "1.0.0"
}
```

### 2. Check ML Service

```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "DataSentry-AI ML Service",
  "version": "1.0.0"
}
```

### 3. Check Frontend

Open browser: http://localhost:3000

You should see the DataSentry-AI login page.

---

## 👤 Demo Account

For testing, you can register a new account or use:

**Email:** `analyst@datasentry.ai`  
**Password:** `demo123` (if you've seeded the database)

---

## 🔧 Development Commands

### Backend

```bash
# Development
npm run start:dev

# Build
npm run build

# Production
npm run start:prod

# Run tests
npm test

# Prisma Studio (Database GUI)
npx prisma studio
```

### ML Service

```bash
# Development
uvicorn app.main:app --reload

# Run tests
pytest

# Type checking
mypy app/

# Format code
black app/
```

### Frontend

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

---

## 🐳 Docker Commands

```bash
# Start all services
docker compose up

# Start in detached mode
docker compose up -d

# Rebuild containers
docker compose up --build

# Stop all services
docker compose down

# View logs
docker compose logs -f backend
docker compose logs -f ml-service
docker compose logs -f frontend

# Execute command in container
docker compose exec backend npm run prisma:studio
```

---

## 📝 Useful Scripts

### Database

```bash
# Create migration
cd backend
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database
npm run prisma:seed
```

### Code Quality

```bash
# Format all code
cd backend && npm run format
cd frontend && npm run lint

# Run all tests
cd backend && npm test
cd ml-service && pytest
```

---

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Find process using port
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

### Database Connection Error

1. Check PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Try: `npx prisma migrate reset`

### Docker Issues

```bash
# Clean up Docker
docker compose down -v
docker system prune -a

# Rebuild from scratch
docker compose up --build --force-recreate
```

### Dependencies Issues

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install

# ML Service
cd ml-service
rm -rf venv
python -m venv venv
pip install -r requirements.txt
```

---

## 📚 Next Steps

1. ✅ **Upload a dataset** via the Dashboard
2. ✅ **View data profiling** statistics
3. ✅ **Check data quality** across 6 dimensions
4. ✅ **Detect anomalies** in your data
5. ✅ **Analyze drift** compared to reference data
6. ✅ **Calculate reliability** scores
7. ✅ **Train ML models** for your domain
8. ✅ **Evaluate model impact** from data issues
9. ✅ **Assess decision risk** and get recommendations

---

## 🔗 Documentation Links

- [Architecture Overview](docs/architecture/OVERVIEW.md)
- [API Documentation](docs/api/README.md)
- [Research Methodology](docs/research/METHODOLOGY.md)
- [AWS Deployment](docs/deployment/AWS_DEPLOYMENT.md)
- [12-Week Roadmap](docs/development/ROADMAP.md)

---

## 🎨 Design System

The application uses the exact brand colors:

- **Deep Background:** `#190019`
- **Secondary Background:** `#2B124C`
- **Primary Purple:** `#522B5B`
- **Muted Purple:** `#854F6C`
- **Soft Pink:** `#DFB6B2`
- **Cream:** `#FBE4D8`

---

## 🤝 Need Help?

- Check the [documentation](docs/)
- Review the [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
- Look at code comments in source files
- Check Docker logs for errors

---

**DataSentry-AI** - Trust Your Data. Confident Decisions. 🛡️
