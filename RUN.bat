@echo off
echo ========================================
echo   DataSentry-AI - Project Launcher
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed
echo.

echo ========================================
echo Step 1: Setting up Backend
echo ========================================
cd backend

echo Installing backend dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✓ Backend dependencies installed
echo.

echo Generating Prisma client...
call npx prisma generate
if errorlevel 1 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)
echo ✓ Prisma client generated
echo.

echo Setting up database...
call npx prisma db push
if errorlevel 1 (
    echo WARNING: Database push failed, trying migrate...
    call npx prisma migrate deploy
)
echo ✓ Database ready
echo.

echo Seeding database...
call npm run prisma:seed
echo ✓ Database seeded
echo.

echo Starting backend server...
start "DataSentry Backend" cmd /k "npm run start:dev"
echo ✓ Backend started at http://localhost:3001
echo.

timeout /t 5 /nobreak >nul

cd ..

echo ========================================
echo Step 2: Setting up Frontend
echo ========================================
cd frontend

echo Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed
echo.

echo Starting frontend server...
start "DataSentry Frontend" cmd /k "npm run dev"
echo ✓ Frontend started at http://localhost:3000
echo.

timeout /t 3 /nobreak >nul

echo ========================================
echo   🎉 DataSentry-AI is running!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Login credentials:
echo   Email:    admin@datasentry.ai
echo   Password: admin123
echo.
echo Press any key to open the application in your browser...
pause >nul

start http://localhost:3000

echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
