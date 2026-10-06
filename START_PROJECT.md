# 🚀 DataSentry-AI - Quick Start Guide

## ✅ All Issues Fixed

This project now has **fully functional**:
1. ✅ **Data Upload** - Upload CSV/JSON/Excel files with real-time progress
2. ✅ **Notifications** - Complete notification system with dropdown and badges
3. ✅ **Export Reports** - Download reports as JSON with one click

---

## 📋 Prerequisites

- **Node.js** v18+ and npm
- **PostgreSQL** v14+ (or use SQLite for development)
- **Python** 3.9+ (for ML service, optional)

---

## 🎯 Quick Start (3 Steps)

### Step 1: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Setup database (choose one):

# Option A: PostgreSQL (recommended for production)
npx prisma migrate deploy

# Option B: SQLite (quick development setup)
npx prisma db push

# Seed database with sample data
npm run prisma:seed

# Start backend server
npm run start:dev
```

✅ Backend running on: **http://localhost:3001**

---

### Step 2: Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend running on: **http://localhost:3000**

---

### Step 3: Login & Test

1. Open browser: **http://localhost:3000**
2. Login with default credentials:
   - Email: `admin@datasentry.ai`
   - Password: `admin123`

3. **Test the fixes:**
   - ✅ Upload a dataset (Datasets page → Upload Dataset button)
   - ✅ Check notifications (Bell icon in header)
   - ✅ Export a report (Reports page → Export button)

---

## 🧪 Testing Checklist

### ✅ Data Upload
- [ ] Navigate to **Datasets** page
- [ ] Click **"Upload Dataset"** button
- [ ] Select or drag-drop a CSV/JSON/Excel file (< 100MB)
- [ ] Watch upload progress bar
- [ ] See success notification in header bell icon
- [ ] Dataset appears in list with "PROCESSING" status
- [ ] Notification badge shows unread count

### ✅ Notifications System
- [ ] Click **bell icon** in header
- [ ] Dropdown shows all notifications
- [ ] Unread count badge visible
- [ ] Click notification to mark as read
- [ ] Click **"Mark all read"** to clear all
- [ ] Click **X** to remove individual notification
- [ ] Notifications show proper colors (green=success, red=error, yellow=warning, blue=info)

### ✅ Report Export
- [ ] Navigate to **Reports** page
- [ ] Click **"Export"** on any report
- [ ] JSON file downloads automatically
- [ ] Success notification appears
- [ ] Or open report details and click **"Download JSON Report"**

---

## 🔧 Configuration

### Backend Environment Variables

File: `backend/.env`

```env
# Database
DATABASE_URL=postgresql://datasentry_user:datasentry_password@localhost:5433/datasentry_db?schema=public

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# ML Service
ML_SERVICE_URL=http://localhost:8000

# Server
PORT=3001
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=104857600  # 100MB

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

### Frontend Environment Variables

File: `frontend/.env`

```env
VITE_API_URL=http://localhost:3001/api
VITE_ML_SERVICE_URL=http://localhost:8000/api
```

---

## 📁 Project Structure

```
DataSentry-AI/
├── backend/                    # NestJS Backend API
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── datasets/          # ✅ Dataset upload & management
│   │   ├── reports/           # ✅ Report generation & export
│   │   ├── alerts/            # ✅ Alerts & notifications
│   │   ├── quality/           # Data quality analysis
│   │   ├── anomalies/         # Anomaly detection
│   │   └── drift/             # Data drift detection
│   ├── prisma/                # Database schema & migrations
│   └── uploads/               # ✅ Uploaded dataset files
│
├── frontend/                   # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/        # ✅ Header with notifications
│   │   ├── pages/             # ✅ Datasets, Reports pages
│   │   ├── stores/            # ✅ State management (Zustand)
│   │   │   ├── authStore.ts
│   │   │   └── notificationStore.ts  # ✅ NEW
│   │   └── services/          # API client
│   └── public/
│
└── ml-service/                 # Python/FastAPI ML Service (optional)
    ├── main.py
    └── requirements.txt
```

---

## 🎨 New Features Implemented

### 1. Notification System (`notificationStore.ts`)

**State Management:**
- Global notification state with Zustand
- Type-safe notification interface
- Automatic unread count tracking
- Persistent across page navigation

**Notification Types:**
- 🟢 **Success** - Green indicator
- 🔴 **Error** - Red indicator
- 🟡 **Warning** - Yellow indicator
- 🔵 **Info** - Blue indicator

**User Actions:**
- Mark individual notification as read
- Mark all notifications as read
- Remove individual notification
- Auto-timestamp formatting
- Click notification to navigate to relevant page

### 2. Enhanced Header Component

**Features:**
- Real-time notification dropdown
- Unread count badge (shows "9+" for 10+)
- Smooth animations with Framer Motion
- Responsive design (mobile & desktop)
- Auto-close on outside click
- Empty state messaging

### 3. Dataset Upload Improvements

**Features:**
- Real-time progress tracking
- Success/error notifications
- Drag & drop support
- File validation (type & size)
- Auto-refresh dataset list after upload
- Error handling with user feedback

### 4. Report Export Functionality

**Features:**
- One-click JSON export
- Proper file naming
- Success/error notifications
- Works from list view and detail modal
- Browser-native download
- No backend dependency for export

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Datasets
- `POST /api/datasets/upload` - ✅ Upload dataset
- `GET /api/datasets` - List datasets
- `GET /api/datasets/:id` - Get dataset details
- `DELETE /api/datasets/:id` - ✅ Delete dataset

### Reports
- `POST /api/reports/generate` - Generate report
- `GET /api/reports` - List reports
- `GET /api/reports/:id` - Get report details
- `GET /api/reports/:id/export` - ✅ Export report (NEW)

### Alerts
- `GET /api/alerts` - List alerts
- `GET /api/alerts/stats` - Alert statistics
- `PATCH /api/alerts/:id/acknowledge` - Acknowledge alert
- `PATCH /api/alerts/mark-all-read` - Mark all as read

---

## 🐛 Troubleshooting

### Issue: Upload fails with "No file uploaded"
**Solution:**
1. Check file size is < 100MB
2. Verify file extension: `.csv`, `.json`, `.xlsx`, or `.xls`
3. Check backend `uploads/` directory exists
4. Check backend logs for detailed error

### Issue: Notifications don't appear
**Solution:**
1. Clear browser cache and reload
2. Check browser console for errors
3. Verify `notificationStore.ts` is properly imported
4. Check that actions are calling `addNotification()`

### Issue: Export button doesn't work
**Solution:**
1. Check browser's download settings
2. Disable pop-up blocker
3. Try incognito/private window
4. Check browser console for errors

### Issue: Backend won't start
**Solution:**
1. Check PostgreSQL is running
2. Verify database credentials in `.env`
3. Run `npx prisma generate`
4. Run `npx prisma db push`
5. Check port 3001 is not in use

### Issue: Frontend won't start
**Solution:**
1. Delete `node_modules` and run `npm install`
2. Check `.env` file exists in frontend
3. Verify `VITE_API_URL` points to correct backend
4. Check port 3000 is not in use

---

## 📊 Default Users (After Seeding)

| Email | Password | Role |
|-------|----------|------|
| admin@datasentry.ai | admin123 | Admin |
| analyst@datasentry.ai | analyst123 | Data Analyst |

---

## 🚀 Production Deployment

### Backend
1. Set production environment variables
2. Use PostgreSQL (not SQLite)
3. Run migrations: `npx prisma migrate deploy`
4. Build: `npm run build`
5. Start: `npm run start:prod`

### Frontend
1. Update `VITE_API_URL` to production backend
2. Build: `npm run build`
3. Deploy `dist/` folder to CDN/hosting

---

## 📝 Development Tips

### Hot Reload
- Backend: Auto-reloads on file changes
- Frontend: Auto-reloads on file changes

### Debugging
- Backend logs appear in terminal
- Frontend logs appear in browser console
- Check Network tab for API calls

### Testing New Uploads
Sample files you can test with:
- CSV: Any valid CSV file
- JSON: Any valid JSON array of objects
- Excel: `.xlsx` or `.xls` files

---

## 🎉 Success!

Your DataSentry-AI project is now fully functional with:
- ✅ Working data upload with progress tracking
- ✅ Complete notification system with UI
- ✅ Working report export functionality
- ✅ All backend modules properly configured
- ✅ Beautiful, responsive UI

**Need help?** Check the logs or re-read this guide!

---

## 📚 Additional Resources

- **NestJS**: https://nestjs.com/
- **React**: https://react.dev/
- **Prisma**: https://www.prisma.io/
- **Zustand**: https://zustand-demo.pmnd.rs/

---

**Built with ❤️ by the DataSentry Team**
