#!/bin/bash

echo "============================================"
echo " AI Sales Analyst Dashboard - Setup Script"
echo "============================================"
echo ""

# Install Node.js dependencies
echo "Step 1: Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install Node.js dependencies"
    exit 1
fi
echo "✓ Node.js dependencies installed"
echo ""

# Install Python dependencies
echo "Step 2: Installing Python dependencies..."
cd python-service
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install Python dependencies"
    exit 1
fi
cd ..
echo "✓ Python dependencies installed"
echo ""

# Check environment configuration
echo "Step 3: Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "WARNING: .env file not found!"
    echo "Please create a .env file with the following:"
    echo ""
    echo 'DATABASE_URL="postgresql://username:password@localhost:5432/ai_sales_dashboard"'
    echo 'OPENAI_API_KEY="your_openai_api_key_here"'
    echo 'PYTHON_API_URL="http://localhost:8000"'
    echo 'NEXT_PUBLIC_API_URL="http://localhost:3000"'
    echo ""
    read -p "Press enter to continue..."
fi
echo "✓ Environment configuration checked"
echo ""

# Generate Prisma client
echo "Step 4: Generating Prisma client..."
npm run db:generate
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to generate Prisma client"
    exit 1
fi
echo "✓ Prisma client generated"
echo ""

# Push database schema
echo "Step 5: Pushing database schema..."
npm run db:push
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to push database schema"
    echo "Make sure PostgreSQL is running and DATABASE_URL is correct in .env"
    exit 1
fi
echo "✓ Database schema created"
echo ""

# Seed database
echo "Step 6: Seeding database with mock data..."
npm run db:seed
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to seed database"
    exit 1
fi
echo "✓ Database seeded successfully"
echo ""

echo "============================================"
echo " Setup Complete! 🎉"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Make sure your .env file is configured"
echo "2. Run: ./start-services.sh"
echo "3. Open: http://localhost:3000"
echo ""

