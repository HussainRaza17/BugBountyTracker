#!/bin/bash

# Bug Bounty Tracker Startup Script

echo "🚀 Starting Bug Bounty Tracker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env file..."
    cp backend/env.example backend/.env
    echo "✅ Created backend/.env file. Please update the database credentials if needed."
fi

# Start the services
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec backend npx prisma migrate deploy

# Seed the database
echo "🌱 Seeding database..."
docker-compose exec backend npx prisma db seed

echo "✅ Bug Bounty Tracker is now running!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "📊 Database: localhost:5432"
echo ""
echo "👤 Demo Accounts:"
echo "   Admin: admin@bugbountytracker.com / admin123"
echo "   Researcher: researcher@bugbountytracker.com / researcher123"
echo ""
echo "To stop the application, run: docker-compose down"
