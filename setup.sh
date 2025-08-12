#!/bin/bash

echo "🚀 Setting up TimeTrack Pro..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create .env files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cat > backend/.env << EOF
DATABASE_URL=postgresql://timetrack_user:timetrack_password@localhost/timetrack
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_HOSTS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173
EOF
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend .env file..."
    cat > frontend/.env << EOF
VITE_API_URL=http://localhost:8000/api/v1
EOF
fi

echo "✅ Environment files created"

# Start the services
echo "🐳 Removing past volumes"
docker volume rm amir_postgres_data

# Start the services
echo "🐳 Starting services with Docker Compose..."
docker compose up -d postgres redis

echo "⏳ Waiting for database to be ready..."
sleep 5

# Start the backend
echo "🔧 Starting backend..."
docker compose up -d backend --build

echo "⏳ Waiting for backend to be ready..."
sleep 5

# Initialize the database
echo "🗄️  Initializing database..."
docker compose exec backend python init_db.py

echo "✅ Database initialized with sample data"

# Start the frontend
echo "🎨 Starting frontend..."
docker compose up -d frontend --build

echo ""
echo "🎉 TimeTrack Pro is now running!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "👥 Sample Users:"
echo "   Admin: admin@timetrack.com / admin123"
echo "   Manager: manager@timetrack.com / manager123"
echo "   Employee: employee@timetrack.com / employee123"
echo ""
echo "🛑 To stop the services, run: docker compose down"
echo "📊 To view logs, run: docker compose logs -f"
