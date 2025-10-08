@echo off
echo 🚀 Starting Bug Bounty Tracker...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist backend\.env (
    echo 📝 Creating backend\.env file...
    copy backend\env.example backend\.env
    echo ✅ Created backend\.env file. Please update the database credentials if needed.
)

REM Start the services
echo 🐳 Starting Docker containers...
docker-compose up -d

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Run database migrations
echo 🗄️ Running database migrations...
docker-compose exec backend npx prisma migrate deploy

REM Seed the database
echo 🌱 Seeding database...
docker-compose exec backend npx prisma db seed

echo.
echo ✅ Bug Bounty Tracker is now running!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:5000
echo 📊 Database: localhost:5432
echo.
echo 👤 Demo Accounts:
echo    Admin: admin@bugbountytracker.com / admin123
echo    Researcher: researcher@bugbountytracker.com / researcher123
echo.
echo To stop the application, run: docker-compose down
pause
