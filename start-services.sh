#!/bin/bash

echo "============================================"
echo " AI Sales Analyst Dashboard - Quick Start"
echo "============================================"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

if [ ! -d "python-service/venv" ]; then
    echo "Creating Python virtual environment..."
    cd python-service
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

echo ""
echo "Starting services..."
echo ""

# Start Python service in background
echo "[1/2] Starting Python FastAPI service on port 8000..."
cd python-service
python3 main.py &
PYTHON_PID=$!
cd ..

# Wait a bit for Python service to start
sleep 3

# Start Next.js in background
echo "[2/2] Starting Next.js application on port 3000..."
npm run dev &
NEXTJS_PID=$!

echo ""
echo "============================================"
echo " Services Started Successfully!"
echo "============================================"
echo ""
echo "  Dashboard:    http://localhost:3000"
echo "  Python API:   http://localhost:8000"
echo "  API Docs:     http://localhost:8000/docs"
echo ""
echo "  Press Ctrl+C to stop all services..."
echo ""

# Wait for Ctrl+C
trap "echo ''; echo 'Stopping services...'; kill $PYTHON_PID $NEXTJS_PID; exit" INT
wait

