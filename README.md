# TimeTrack Pro

A modern, location-based employee time tracking system that eliminates the need for physical time cards.

## Features

### Employee Features
- **Location-based Clock-in/out**: Automatically detect when you're in the work area
- **One-click Time Tracking**: Simple button interface for starting/ending shifts
- **Vacation Requests**: Request time off directly through the app
- **Shift History**: View your past shifts and time records

### Manager Features
- **Real-time Dashboard**: See who's currently working
- **Employee Management**: Manage team members and their permissions
- **Location Management**: Define work areas and geofences
- **Reports**: Generate time tracking reports and analytics

## Tech Stack

### Backend
- **Python 3.11+**
- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **Pydantic** - Data validation
- **JWT** - Authentication

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Query** - State management
- **Leaflet** - Maps and location services

## Project Structure

```
timetrack-pro/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core configurations
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── requirements.txt
│   └── main.py
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml      # Development environment
└── README.md
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL
- Redis

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Using Docker
```bash
docker-compose up -d
```

## Environment Variables

Create `.env` files in both backend and frontend directories:

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost/timetrack
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License
