@echo off
echo ============================================
echo  AI Sales Analyst Dashboard - Setup Script
echo ============================================
echo.

echo Step 1: Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)
echo ✓ Node.js dependencies installed
echo.

echo Step 2: Installing Python dependencies...
cd python-service
if not exist "venv\" (
    echo Creating Python virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
cd ..
echo ✓ Python dependencies installed
echo.

echo Step 3: Checking environment configuration...
if not exist ".env" (
    echo WARNING: .env file not found!
    echo Please create a .env file with the following:
    echo.
    echo DATABASE_URL="postgresql://username:password@localhost:5432/ai_sales_dashboard"
    echo OPENAI_API_KEY="your_openai_api_key_here"
    echo PYTHON_API_URL="http://localhost:8000"
    echo NEXT_PUBLIC_API_URL="http://localhost:3000"
    echo.
    pause
)
echo ✓ Environment configuration checked
echo.

echo Step 4: Generating Prisma client...
call npm run db:generate
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)
echo ✓ Prisma client generated
echo.

echo Step 5: Pushing database schema...
call npm run db:push
if %errorlevel% neq 0 (
    echo ERROR: Failed to push database schema
    echo Make sure PostgreSQL is running and DATABASE_URL is correct in .env
    pause
    exit /b 1
)
echo ✓ Database schema created
echo.

echo Step 6: Seeding database with mock data...
call npm run db:seed
if %errorlevel% neq 0 (
    echo ERROR: Failed to seed database
    pause
    exit /b 1
)
echo ✓ Database seeded successfully
echo.

echo ============================================
echo  Setup Complete! 🎉
echo ============================================
echo.
echo Next steps:
echo 1. Make sure your .env file is configured
echo 2. Run: start-services.bat
echo 3. Open: http://localhost:3000
echo.
pause

