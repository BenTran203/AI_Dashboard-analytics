@echo off
echo ============================================
echo  AI Sales Analyst Dashboard - Quick Start
echo ============================================
echo.

echo Checking if dependencies are installed...
if not exist "node_modules\" (
    echo Installing Node.js dependencies...
    call npm install
)

if not exist "python-service\venv\" (
    echo Creating Python virtual environment...
    cd python-service
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
    cd ..
)

echo.
echo Starting services...
echo.

echo [1/2] Starting Python FastAPI service on port 8000...
start "Python FastAPI" cmd /k "cd python-service && python main.py"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Next.js application on port 3000...
start "Next.js App" cmd /k "npm run dev"

echo.
echo ============================================
echo  Services Started Successfully!
echo ============================================
echo.
echo  Dashboard:    http://localhost:3000
echo  Python API:   http://localhost:8000
echo  API Docs:     http://localhost:8000/docs
echo.
echo  Press any key to stop all services...
pause >nul

echo.
echo Stopping services...
taskkill /FI "WindowTitle eq Python FastAPI*" /T /F
taskkill /FI "WindowTitle eq Next.js App*" /T /F
echo Services stopped.

