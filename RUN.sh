#!/bin/bash

echo "========================================"
echo "  DataSentry-AI - Project Launcher"
echo "========================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js is installed"
echo ""

echo "========================================"
echo "Step 1: Setting up Backend"
echo "========================================"
cd backend

echo "Installing backend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    exit 1
fi
echo "✓ Backend dependencies installed"
echo ""

echo "Generating Prisma client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to generate Prisma client"
    exit 1
fi
echo "✓ Prisma client generated"
echo ""

echo "Setting up database..."
npx prisma db push
if [ $? -ne 0 ]; then
    echo "WARNING: Database push failed, trying migrate..."
    npx prisma migrate deploy
fi
echo "✓ Database ready"
echo ""

echo "Seeding database..."
npm run prisma:seed
echo "✓ Database seeded"
echo ""

echo "Starting backend server in background..."
npm run start:dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "✓ Backend started (PID: $BACKEND_PID) at http://localhost:3001"
echo ""

sleep 5

cd ..

echo "========================================"
echo "Step 2: Setting up Frontend"
echo "========================================"
cd frontend

echo "Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    exit 1
fi
echo "✓ Frontend dependencies installed"
echo ""

echo "Starting frontend server in background..."
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✓ Frontend started (PID: $FRONTEND_PID) at http://localhost:3000"
echo ""

sleep 3

echo "========================================"
echo "  🎉 DataSentry-AI is running!"
echo "========================================"
echo ""
echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "Login credentials:"
echo "  Email:    admin@datasentry.ai"
echo "  Password: admin123"
echo ""
echo "Logs:"
echo "  Backend:  tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo "To stop the servers:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Opening browser..."

# Try to open browser
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
fi

echo ""
echo "Press Ctrl+C to stop all servers..."

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Servers stopped'; exit 0" INT

wait
