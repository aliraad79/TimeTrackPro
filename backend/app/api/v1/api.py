from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, time_entries, locations, vacation_requests

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(time_entries.router, prefix="/time-entries", tags=["time-entries"])
api_router.include_router(locations.router, prefix="/locations", tags=["locations"])
api_router.include_router(vacation_requests.router, prefix="/vacation-requests", tags=["vacation-requests"])
