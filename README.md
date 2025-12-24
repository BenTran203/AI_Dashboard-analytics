# AI Sales Analyst Dashboard

A full-stack sales analytics dashboard with AI-powered insights.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS
- **Backend**: Node.js, Next.js API Routes
- **AI Service**: Python FastAPI microservice
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI GPT for insights generation

## Features

- 📊 Real-time sales metrics (Revenue, Orders, AOV, Top Products)
- 📈 Sales funnel visualization
- 🤖 AI-generated daily and weekly insights
- 💬 "Ask Your Data" panel with predefined analysis buttons
- 🌐 Multi-language support (English/Vietnamese)
- 📅 Adjustable date range (30-day window)

## Prerequisites

- Node.js 18+ installed
- Python 3.9+ installed
- PostgreSQL database (pgAdmin4)
- OpenAI API key

## Setup Instructions

### 1. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your credentials:
# - DATABASE_URL (PostgreSQL connection string)
# - OPENAI_API_KEY (Your OpenAI API key)
```

### 2. Install Dependencies

**Node.js dependencies:**
```bash
npm install
```

**Python dependencies:**
```bash
cd python-service
pip install -r requirements.txt
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with mock data
npm run db:seed
```

### 4. Run the Application

**Terminal 1 - Next.js App:**
```bash
npm run dev
```

**Terminal 2 - Python FastAPI Service:**
```bash
cd python-service
python main.py
```

### 5. Access the Dashboard

- **Dashboard**: http://localhost:3000
- **Python API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Architecture

```
┌─────────────────┐
│   Next.js UI    │
│   (Port 3000)   │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
┌────────▼────────┐  ┌────▼──────────────┐
│  Node.js API    │  │  Python FastAPI   │
│  (Metrics)      │◄─┤  (AI Insights)    │
└────────┬────────┘  └───────────────────┘
         │
┌────────▼────────┐
│   PostgreSQL    │
│   + Prisma      │
└─────────────────┘
```

## Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # React components
│   └── page.tsx           # Main dashboard
├── prisma/                # Database schema & seed
│   ├── schema.prisma
│   └── seed.ts
├── python-service/        # FastAPI microservice
│   ├── main.py
│   ├── services/
│   └── requirements.txt
└── lib/                   # Shared utilities
```

## Usage

### Ask Your Data Panel

Use the predefined analysis buttons:
- **Weekly Analysis**: Get insights for the past 7 days
- **Monthly Analysis**: Get insights for the past 30 days

Each analysis includes:
- Summary of performance
- Key drivers (what's working)
- Risks (what needs attention)
- Recommended actions (max 3)

### Language Toggle

Switch between English and Vietnamese for all AI-generated insights.

### Date Range

Adjust the viewing period within a 30-day window to focus on specific timeframes.

## License

MIT

