# DataSentry-AI - Complete Corrections & Fixes Guide

**Date:** 2026-10-01  
**Status:** CRITICAL FIXES REQUIRED

---

## 🚨 Critical Issues Identified

### 1. **File Upload System - NOT WORKING**
- **Problem:** Upload endpoint exists but ML service integration incomplete
- **Impact:** Datasets cannot be ingested and processed
- **Root Cause:** Missing file path resolution and ML service communication

### 2. **Notification System - NOT IMPLEMENTED**
- **Problem:** No real-time notification mechanism
- **Impact:** Users don't receive alerts for critical data issues
- **Root Cause:** Missing notification service and WebSocket/SSE implementation

### 3. **Export Report Feature - NOT FUNCTIONAL**
- **Problem:** Report generation exists but no download/export mechanism
- **Impact:** Users cannot export reports as PDF/Excel/CSV
- **Root Cause:** Missing report export controller and file generation logic

---

## 📋 Complete Fix Checklist

### Phase 1: Fix File Upload System
- [x] Identify upload controller issues
- [ ] Fix file path resolution for uploaded files
- [ ] Implement proper ML service file reading
- [ ] Add file format validation (CSV, Excel, JSON)
- [ ] Test upload with sample datasets
- [ ] Add upload progress feedback

### Phase 2: Implement Notification System
- [ ] Create NotificationsModule in backend
- [ ] Add WebSocket gateway for real-time notifications
- [ ] Implement notification service
- [ ] Create notification database schema
- [ ] Add frontend notification component
- [ ] Test real-time notifications

### Phase 3: Fix Export Report Feature
- [ ] Add report export controller endpoints
- [ ] Implement PDF generation (using pdfkit/puppeteer)
- [ ] Implement Excel generation (using exceljs)
- [ ] Implement CSV generation
- [ ] Add download endpoints
- [ ] Test report exports

---

## 🔧 Detailed Fixes

### FIX 1: File Upload System

#### Backend Changes Required:

**File: `backend/src/datasets/datasets.controller.ts`**
```typescript
// Add proper file reading after upload
const filePath = path.join(uploadDir, file.filename);
```

**File: `backend/src/ml-client/ml-client.service.ts`**
```typescript
// Update profileDataset to read local files
async profileDataset(datasetId: string, filePath: string) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('dataset_id', datasetId);
  
  const response = await this.client.post('/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
}
```

**File: `ml-service/app/api/profile.py`**
```python
@router.post("/profile")
async def profile_dataset(
    file: UploadFile = File(...),
    dataset_id: str = Form(...)
):
    # Read uploaded file
    contents = await file.read()
    
    # Parse based on file type
    if file.filename.endswith('.csv'):
        df = pd.read_csv(BytesIO(contents))
    elif file.filename.endswith('.xlsx'):
        df = pd.read_excel(BytesIO(contents))
    elif file.filename.endswith('.json'):
        df = pd.read_json(BytesIO(contents))
    
    # Generate profile
    return generate_profile(df, dataset_id)
```

### FIX 2: Notification System

#### New Files Required:

**File: `backend/src/notifications/notifications.module.ts`**
**File: `backend/src/notifications/notifications.service.ts`**
**File: `backend/src/notifications/notifications.gateway.ts`**
**File: `frontend/src/components/NotificationToast.tsx`**
**File: `frontend/src/hooks/useNotifications.ts`**

#### Database Schema Addition:
```prisma
model Notification {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  message     String
  type        NotificationType
  severity    Severity
  isRead      Boolean  @default(false)
  metadata    Json?
  createdAt   DateTime @default(now())
}

enum NotificationType {
  DATASET_UPLOADED
  QUALITY_ALERT
  ANOMALY_DETECTED
  DRIFT_DETECTED
  REPORT_READY
  SYSTEM_ALERT
}
```

### FIX 3: Export Report Feature

#### Backend Changes:

**File: `backend/src/reports/reports.controller.ts`**
```typescript
@Get(':id/export/pdf')
async exportPDF(@Param('id') id: string, @Request() req, @Res() res) {
  const pdfBuffer = await this.reportsService.generatePDF(id, req.user.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=report-${id}.pdf`);
  res.send(pdfBuffer);
}

@Get(':id/export/excel')
async exportExcel(@Param('id') id: string, @Request() req, @Res() res) {
  const excelBuffer = await this.reportsService.generateExcel(id, req.user.id);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=report-${id}.xlsx`);
  res.send(excelBuffer);
}
```

**File: `backend/src/reports/reports.service.ts`**
```typescript
async generatePDF(reportId: string, userId: string): Promise<Buffer> {
  const report = await this.findOne(reportId, userId);
  
  // Use puppeteer or pdfkit to generate PDF
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Generate HTML content
  const html = this.generateReportHTML(report);
  await page.setContent(html);
  
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();
  
  return pdfBuffer;
}

async generateExcel(reportId: string, userId: string): Promise<Buffer> {
  const report = await this.findOne(reportId, userId);
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');
  
  // Add report data to worksheet
  this.populateExcelWorksheet(worksheet, report);
  
  return await workbook.xlsx.writeBuffer();
}
```

#### Frontend Changes:

**File: `frontend/src/pages/Reports.tsx`**
```typescript
const handleExport = async (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
  try {
    const response = await api.get(`/reports/${reportId}/export/${format}`, {
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${reportId}.${format === 'excel' ? 'xlsx' : format}`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
  }
};
```

---

## 🧪 Testing Procedures

### Test 1: Upload Functionality
1. Start all services (Postgres, Backend, ML Service, Frontend)
2. Navigate to `/datasets`
3. Click "Upload Dataset"
4. Select a CSV file from `sample_datasets/`
5. Verify upload progress shows
6. Verify dataset appears in list with "PROCESSING" status
7. Wait for status to change to "HEALTHY"
8. Check dataset details page for profiles

### Test 2: Notifications
1. Upload a dataset with anomalies
2. Verify notification appears in top-right corner
3. Click notification to view details
4. Verify notification is marked as read
5. Check notifications page for history

### Test 3: Report Export
1. Navigate to a dataset detail page
2. Click "Generate Report"
3. Once report is generated, click "Export as PDF"
4. Verify PDF downloads with correct content
5. Try "Export as Excel" and verify
6. Try "Export as CSV" and verify

---

## 📦 Required Dependencies

### Backend (package.json):
```json
{
  "puppeteer": "^21.5.0",
  "exceljs": "^4.3.0",
  "pdfkit": "^0.13.0",
  "@nestjs/websockets": "^10.0.0",
  "@nestjs/platform-socket.io": "^10.0.0",
  "socket.io": "^4.6.0"
}
```

### Frontend (package.json):
```json
{
  "socket.io-client": "^4.6.0"
}
```

### ML Service (requirements.txt):
```
openpyxl==3.1.2
xlrd==2.0.1
python-multipart==0.0.6
```

---

## 🚀 Deployment Steps

1. **Stop all running services**
   ```bash
   docker compose down
   ```

2. **Install new dependencies**
   ```bash
   cd backend && npm install
   cd ../ml-service && pip install -r requirements.txt
   cd ../frontend && npm install
   ```

3. **Run database migrations**
   ```bash
   cd backend && npx prisma migrate dev
   ```

4. **Restart services**
   ```bash
   docker compose up --build
   ```

5. **Verify all health endpoints**
   - Backend: http://localhost:3001/api/health
   - ML Service: http://localhost:8000/api/health
   - Frontend: http://localhost:3000

---

## 📝 Priority Order

1. **HIGHEST:** Fix file upload (blocks all other functionality)
2. **HIGH:** Implement notifications (critical for user experience)
3. **MEDIUM:** Add report export (useful but not blocking)

---

## ⚠️ Known Limitations

1. File upload currently limited to 100MB
2. Notifications require WebSocket connection
3. PDF generation requires puppeteer (heavy dependency)
4. Excel export limited to 1M rows

---

## 🔗 Related Files

- Backend Controllers: `backend/src/{datasets,reports,alerts}/*.controller.ts`
- Backend Services: `backend/src/{datasets,reports,alerts}/*.service.ts`
- ML Service APIs: `ml-service/app/api/*.py`
- Frontend Pages: `frontend/src/pages/*.tsx`
- Frontend Services: `frontend/src/services/api.ts`

---

**END OF CORRECTIONS GUIDE**
